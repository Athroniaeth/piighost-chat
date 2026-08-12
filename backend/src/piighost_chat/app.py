"""Litestar application for piighost-chat."""

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import httpx
import psycopg
from langchain.agents import create_agent
from langchain_core.messages import AIMessageChunk, HumanMessage
from langchain_core.tools import tool
from langchain_litellm import ChatLiteLLM
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from litestar import Litestar, Request, delete, get, post, put
from litestar.config.cors import CORSConfig
from litestar.openapi import OpenAPIConfig
from litestar.response import ServerSentEvent, ServerSentEventMessage
from litestar.exceptions import HTTPException
from litestar.response import Response
from litestar.status_codes import HTTP_500_INTERNAL_SERVER_ERROR
from piighost.integrations.client import PIIGhostClient
from piighost.integrations.middleware import PIIAnonymizationMiddleware

from langchain_core.callbacks import BaseCallbackHandler

from piighost_chat.utils import delete_thread_data
from piighost_chat.schemas import (
    AnonymizeRequest,
    AnonymizeResponse,
    ChatRequest,
    DetectResponse,
    DetectionSchema,
    EntitySchema,
    LabelsResponse,
    MessageSchema,
    MessagesResponse,
    OverrideDetectRequest,
    ThreadSchema,
    ThreadsResponse,
)

logger = logging.getLogger(__name__)


async def _forget_thread_quietly(client, thread_id: str) -> None:
    """Best-effort PII purge: a failure must not break thread deletion."""
    try:
        await client.forget_thread(thread_id)
    except Exception:
        logger.warning(
            "piighost forget failed for thread %s (mappings expire via TTL)",
            thread_id,
            exc_info=True,
        )


def _chunk_text(content: object) -> str:
    """Normalize an AIMessageChunk content to plain text.

    LangChain chunk content is either a string or a list of content
    blocks; only text blocks carry displayable output.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(
            block.get("text", "")
            for block in content
            if isinstance(block, dict) and block.get("type") == "text"
        )
    return ""


SYSTEM_PROMPT = """\
You are a helpful assistant. Some inputs may contain anonymized placeholders (e.g. <<PERSON:1>>, <<LOCATION:1>>) that replace real values for privacy reasons.

Rules:
1. Treat every placeholder as if it were the real value. Never comment on its format, never say it is a token, never ask the user to reveal it.
2. Always preserve placeholders exactly as-is in your responses, including the << and >> delimiters. Never strip, rename, or rephrase them. A downstream system will transparently restore the original values.
3. Pass placeholders directly to tool arguments as-is.
4. Never include raw tool output in your response. Summarize tool results in your own words, keeping any placeholders intact.
5. If the user asks for a specific detail about a placeholder (e.g. "what is the first letter?"), reply: "I cannot answer that question as the data has been anonymized, so I cannot provide that information."
"""


# ------------------------------------------------------------------
# Tools
# ------------------------------------------------------------------


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email to a given address.

    Args:
        to: Recipient email address.
        subject: Email subject line.
        body: Email body text.

    Returns:
        Confirmation string.
    """
    logging.info(
        "[EMAIL SENT] to=<redacted> subject_len=%d body_len=%d",
        len(subject),
        len(body),
    )
    return f"Email successfully sent to {to}."


@tool
def get_weather(country_or_city: str) -> str:
    """Get the current weather for a given country or city.

    Args:
        country_or_city: Name of the location to query.

    Returns:
        A weather summary string.
    """
    return f"The weather in {country_or_city} is 22°C and sunny."


# ------------------------------------------------------------------
# Observation
# ------------------------------------------------------------------


def _create_langfuse_handler() -> BaseCallbackHandler | None:
    """Build a Langfuse LangChain handler when credentials are present.

    Returns ``None`` (so the agent runs without tracing) unless
    ``LANGFUSE_PUBLIC_KEY`` is set in the environment. The Langfuse SDK
    reads its own ``LANGFUSE_SECRET_KEY`` / ``LANGFUSE_BASE_URL`` env
    vars so the credential triplet stays standard.
    """
    if not os.getenv("LANGFUSE_PUBLIC_KEY"):
        return None

    from langfuse.langchain import CallbackHandler

    return CallbackHandler()


# ------------------------------------------------------------------
# Error handling and CORS
# ------------------------------------------------------------------


def handle_exception(request: Request, exc: Exception) -> Response:
    """Log the full exception server-side; never echo internals to the client."""
    if isinstance(exc, HTTPException):
        status, detail = exc.status_code, exc.detail
    else:
        status, detail = HTTP_500_INTERNAL_SERVER_ERROR, "Internal Server Error"
    logger.exception(
        "Unhandled error on %s %s -> %s",
        request.method,
        request.url.path,
        type(exc).__name__,
    )
    return Response(
        media_type="application/json",
        status_code=status,
        content={"status_code": status, "detail": detail},
    )


def _cors_origins() -> list[str]:
    """Comma-separated CORS_ALLOW_ORIGINS, defaulting to * for local dev."""
    raw = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
    if not raw:
        return ["*"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


# ------------------------------------------------------------------
# Application factory
# ------------------------------------------------------------------


def create_app() -> Litestar:
    """Create and configure the Litestar application."""
    piighost_url = os.getenv("PIIGHOST_API_URL", "http://piighost-api:8000")
    piighost_key = os.getenv("PIIGHOST_API_KEY", "")
    llm_model = os.getenv("LLM_MODEL", "openai/gpt-5.4-mini")
    llm_api_base = os.getenv("LLM_API_BASE") or None
    llm_api_key = os.getenv("LLM_API_KEY") or None
    pg_url = os.getenv(
        "DATABASE_URL",
        "postgresql://piighost:piighost@postgres:5432/piighost_chat",
    )

    # One authenticated HTTP client, shared two ways: the PIIGhostClient drives
    # it as a remote thread pipeline (for the middleware, deanonymize, and
    # forget), and the inspection routes below call the same client directly for
    # the richer /v1/detect and /v1/anonymize/corrected surface the pipeline
    # client does not expose. PIIGhostClient does not own an injected client, so
    # the lifespan closes http_client itself.
    auth_headers = {"Authorization": f"Bearer {piighost_key}"} if piighost_key else {}
    http_client = httpx.AsyncClient(base_url=piighost_url, headers=auth_headers)
    pii_client = PIIGhostClient(http_client)
    middleware = PIIAnonymizationMiddleware(pipeline=pii_client)

    langfuse_handler = _create_langfuse_handler()
    if langfuse_handler is not None:
        logger.info("Langfuse tracing enabled for the LangChain agent")

    graph = None

    @asynccontextmanager
    async def lifespan(app: Litestar) -> AsyncGenerator[None]:
        nonlocal graph
        logger.info("piighost-chat starting — piighost-api at %s", piighost_url)

        async with AsyncPostgresSaver.from_conn_string(pg_url) as checkpointer:
            await checkpointer.setup()

            graph = create_agent(
                model=ChatLiteLLM(
                    model=llm_model,
                    api_base=llm_api_base,
                    api_key=llm_api_key,
                ),
                system_prompt=SYSTEM_PROMPT,
                tools=[send_email, get_weather],
                middleware=[middleware],
                checkpointer=checkpointer,
            )

            yield
        await http_client.aclose()

    # ------------------------------------------------------------------
    # Routes
    # ------------------------------------------------------------------

    @post("/api/anonymize")
    async def anonymize(data: AnonymizeRequest) -> AnonymizeResponse:
        response = await http_client.post(
            "/v1/anonymize",
            json={"text": data.message, "thread_id": data.thread_id},
        )
        response.raise_for_status()
        body = response.json()
        return AnonymizeResponse(
            anonymized_text=body["anonymized_text"],
            entities=[
                EntitySchema(
                    label=entity["label"],
                    original_text=entity["detections"][0]["text"],
                )
                for entity in body["entities"]
                if entity["detections"]
            ],
        )

    @post("/api/detect")
    async def detect(data: AnonymizeRequest) -> DetectResponse:
        response = await http_client.post(
            "/v1/detect",
            json={"text": data.message, "thread_id": data.thread_id},
        )
        response.raise_for_status()
        body = response.json()
        detections = [
            DetectionSchema(
                text=d["text"],
                label=d["label"],
                start_pos=d["start_pos"],
                end_pos=d["end_pos"],
                confidence=d["confidence"],
            )
            for entity in body["entities"]
            for d in entity["detections"]
        ]
        return DetectResponse(detections=detections)

    @put("/api/detect")
    async def override_detect(data: OverrideDetectRequest) -> None:
        # The server's /v1/anonymize/corrected takes Detection.to_dict() shape
        # (start/end), while the frontend wire uses start_pos/end_pos. Correcting
        # here writes the human-authoritative set into the thread's memory, so
        # the chat turn re-anonymizes the same message with these very spans.
        corrected = [
            {
                "text": d.text,
                "label": d.label,
                "start": d.start_pos,
                "end": d.end_pos,
                "confidence": d.confidence,
            }
            for d in data.detections
        ]
        response = await http_client.post(
            "/v1/anonymize/corrected",
            json={
                "text": data.message,
                "thread_id": data.thread_id,
                "detections": corrected,
            },
        )
        response.raise_for_status()

    @get("/api/labels")
    async def get_labels() -> LabelsResponse:
        response = await http_client.get("/v1/labels")
        response.raise_for_status()
        body = response.json()
        return LabelsResponse(labels=body.get("labels") or [])

    @post("/api/chat")
    async def chat(data: ChatRequest) -> ServerSentEvent:
        config: dict = {"configurable": {"thread_id": data.thread_id}}
        if langfuse_handler is not None:
            config["callbacks"] = [langfuse_handler]

        async def generate() -> AsyncGenerator[ServerSentEventMessage]:
            async for chunk, metadata in graph.astream(
                {"messages": [HumanMessage(content=data.message)]},
                config=config,
                stream_mode="messages",
            ):
                if isinstance(chunk, AIMessageChunk):
                    text = _chunk_text(chunk.content)
                    if text:
                        yield ServerSentEventMessage(data=text)

        return ServerSentEvent(content=generate())

    @get("/api/messages")
    async def get_messages(thread_id: str = "default") -> MessagesResponse:
        config = {"configurable": {"thread_id": thread_id}}
        state = await graph.aget_state(config)
        msgs = state.values.get("messages", [])
        messages: list[MessageSchema] = []
        for m in msgs:
            if not (hasattr(m, "type") and m.type in ("human", "ai")):
                continue
            content = getattr(m, "content", "")
            if not content:
                continue
            content = await pii_client.deanonymize(content, thread_id=thread_id)
            messages.append(MessageSchema(role=m.type, content=content))
        return MessagesResponse(messages=messages)

    @get("/api/threads")
    async def list_threads() -> ThreadsResponse:
        async with await psycopg.AsyncConnection.connect(pg_url) as conn:
            cursor = await conn.execute(
                "SELECT thread_id FROM checkpoints WHERE checkpoint_ns = '' "
                "GROUP BY thread_id ORDER BY MIN(checkpoint_id) DESC"
            )
            thread_ids = [row[0] for row in await cursor.fetchall()]

        threads = []
        for tid in thread_ids:
            config = {"configurable": {"thread_id": tid}}
            state = await graph.aget_state(config)
            msgs = state.values.get("messages", [])
            first_human = next(
                (m for m in msgs if hasattr(m, "type") and m.type == "human"),
                None,
            )
            title = first_human.content[:50] if first_human else "Conversation"
            threads.append(ThreadSchema(id=tid, title=title))

        return ThreadsResponse(threads=threads)

    @delete("/api/threads/{thread_id:str}")
    async def delete_thread(thread_id: str) -> None:
        async with await psycopg.AsyncConnection.connect(pg_url) as conn:
            await delete_thread_data(conn, thread_id)
        await _forget_thread_quietly(pii_client, thread_id)

    @get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return Litestar(
        route_handlers=[
            anonymize,
            detect,
            override_detect,
            get_labels,
            chat,
            get_messages,
            list_threads,
            delete_thread,
            health,
        ],
        lifespan=[lifespan],
        cors_config=CORSConfig(
            allow_origins=_cors_origins(),
            allow_methods=["*"],
            allow_headers=["*"],
        ),
        openapi_config=OpenAPIConfig(
            title="piighost-chat",
            version="0.1.0",
            description="Chat API with PII anonymization.",
        ),
        exception_handlers={Exception: handle_exception},
    )
