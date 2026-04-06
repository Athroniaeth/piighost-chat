"""Litestar application for piighost-chat."""

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import psycopg
from langchain.agents import create_agent
from langchain_core.messages import AIMessageChunk, HumanMessage
from langchain_core.tools import tool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from litestar import Litestar, delete, get, post
from litestar.config.cors import CORSConfig
from litestar.openapi import OpenAPIConfig
from litestar.response import ServerSentEvent, ServerSentEventMessage
from piighost.client import PIIGhostClient
from piighost.middleware import PIIAnonymizationMiddleware

from piighost_chat.schemas import (
    AnonymizeRequest,
    AnonymizeResponse,
    ChatRequest,
    EntitySchema,
    MessageSchema,
    MessagesResponse,
    ThreadSchema,
    ThreadsResponse,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are a helpful assistant. Some inputs may contain anonymized placeholders that replace real values for privacy reasons.

Rules:
1. Treat every placeholder as if it were the real value, never comment on its format, never say it is a token, never ask the user to reveal it.
2. Placeholders can be passed directly to tools use them as-is as input arguments. This preserves the user's privacy while \
still allowing tools to operate.
3. If the user asks for a specific detail about a token (e.g. "what is the first letter?"), reply briefly: "I cannot answer that question as the data has been anonymized, so I cannot provide that information."
Another example is if the user asks "Dans quel pays ce trouve la ville de {city} ?", you can answer "Je suis désolé, mais je ne peux pas répondre à cette question car les données ont été anonymisées, je ne peux donc pas répondre à votre question"
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
# Application factory
# ------------------------------------------------------------------


def create_app() -> Litestar:
    """Create and configure the Litestar application."""
    piighost_url = os.getenv("PIIGHOST_API_URL", "http://piighost-api:8000")
    piighost_key = os.getenv("PIIGHOST_API_KEY", "")
    llm_model = os.getenv("LLM_MODEL", "openai:gpt-5.4-mini")
    pg_url = os.getenv(
        "DATABASE_URL",
        "postgresql://piighost:piighost@postgres:5432/piighost_chat",
    )

    pii_client = PIIGhostClient(piighost_url, api_key=piighost_key)
    middleware = PIIAnonymizationMiddleware(pipeline=pii_client)

    graph = None

    @asynccontextmanager
    async def lifespan(app: Litestar) -> AsyncGenerator[None]:
        nonlocal graph
        logger.info("piighost-chat starting — piighost-api at %s", piighost_url)

        async with AsyncPostgresSaver.from_conn_string(pg_url) as checkpointer:
            await checkpointer.setup()

            graph = create_agent(
                model=llm_model,
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

    @post("/api/chat")
    async def chat(data: ChatRequest) -> ServerSentEvent:
        config = {"configurable": {"thread_id": data.thread_id}}

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
        return MessagesResponse(
            messages=[
                MessageSchema(role=m.type, content=m.content)
                for m in msgs
                if hasattr(m, "content")
            ]
        )

    @get("/api/threads")
    async def list_threads() -> ThreadsResponse:
        async with await psycopg.AsyncConnection.connect(pg_url) as conn:
            cursor = await conn.execute(
                "SELECT thread_id FROM checkpoints WHERE checkpoint_ns = '' "
                "GROUP BY thread_id ORDER BY MIN(checkpoint_id)"
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
            await conn.execute(
                "DELETE FROM checkpoint_blobs WHERE thread_id = %s", (thread_id,)
            )
            await conn.execute(
                "DELETE FROM checkpoint_writes WHERE thread_id = %s", (thread_id,)
            )
            await conn.execute(
                "DELETE FROM checkpoints WHERE thread_id = %s", (thread_id,)
            )
        return

    @get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return Litestar(
        route_handlers=[
            anonymize,
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
    )
