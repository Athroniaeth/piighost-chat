"""Litestar application for piighost-chat."""

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

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
from piighost.client import PIIGhostClient
from piighost.exceptions import CacheMissError
from piighost.middleware import PIIAnonymizationMiddleware
from piighost.models import Detection, Span

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

SYSTEM_PROMPT = """\
You are a helpful assistant. Some inputs may contain anonymized placeholders (e.g. <<PERSON_1>>, <<CITY_1>>) that replace real values for privacy reasons.

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
    logging.info("[EMAIL SENT] To: %s | Subject: %s\n%s", to, subject, body)
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

    pii_client = PIIGhostClient(piighost_url, api_key=piighost_key)
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
        await pii_client.close()

    # ------------------------------------------------------------------
    # Routes
    # ------------------------------------------------------------------

    @post("/api/anonymize")
    async def anonymize(data: AnonymizeRequest) -> AnonymizeResponse:
        anonymized_text, entities = await pii_client.anonymize(
            data.message, thread_id=data.thread_id
        )
        return AnonymizeResponse(
            anonymized_text=anonymized_text,
            entities=[
                EntitySchema(
                    label=e.label,
                    original_text=e.detections[0].text,
                )
                for e in entities
            ],
        )

    @post("/api/detect")
    async def detect(data: AnonymizeRequest) -> DetectResponse:
        entities = await pii_client.detect(data.message, thread_id=data.thread_id)
        detections = [
            DetectionSchema(
                text=d.text,
                label=d.label,
                start_pos=d.position.start_pos,
                end_pos=d.position.end_pos,
                confidence=d.confidence,
            )
            for e in entities
            for d in e.detections
        ]
        return DetectResponse(detections=detections)

    @put("/api/detect")
    async def override_detect(data: OverrideDetectRequest) -> None:
        detections = [
            Detection(
                text=d.text,
                label=d.label,
                position=Span(d.start_pos, d.end_pos),
                confidence=d.confidence,
            )
            for d in data.detections
        ]
        await pii_client.override_detections(
            data.message, detections, thread_id=data.thread_id
        )

    @get("/api/labels")
    async def get_labels() -> LabelsResponse:
        config = await pii_client.get_config()
        return LabelsResponse(labels=config.get("labels") or [])

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
                if isinstance(chunk, AIMessageChunk) and chunk.content:
                    yield ServerSentEventMessage(data=chunk.content)

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
            try:
                content, _ = await pii_client.deanonymize(content, thread_id=thread_id)
            except CacheMissError:
                content = await pii_client.deanonymize_with_ent(
                    content, thread_id=thread_id
                )
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
        try:
            await pii_client.forget_thread(thread_id)
        except Exception:
            logger.warning(
                "piighost forget failed for thread %s (mappings expire via TTL)",
                thread_id,
                exc_info=True,
            )

    @get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    def handle_exception(request: Request, exc: Exception) -> Response:
        status = (
            exc.status_code
            if isinstance(exc, HTTPException)
            else HTTP_500_INTERNAL_SERVER_ERROR
        )
        logger.exception(
            "Unhandled error on %s %s -> %s: %s",
            request.method,
            request.url.path,
            type(exc).__name__,
            exc,
        )
        return Response(
            media_type="application/json",
            status_code=status,
            content={
                "status_code": status,
                "detail": str(exc) or type(exc).__name__,
                "exception": type(exc).__name__,
            },
        )

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
            allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
        ),
        openapi_config=OpenAPIConfig(
            title="piighost-chat",
            version="0.1.0",
            description="Chat API with PII anonymization.",
        ),
        exception_handlers={Exception: handle_exception},
    )
