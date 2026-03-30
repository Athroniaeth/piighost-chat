"""Litestar application for piighost-chat."""

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import psycopg
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_postgres import PostgresChatMessageHistory
from litestar import Litestar, get, post
from litestar.config.cors import CORSConfig
from litestar.openapi import OpenAPIConfig
from litestar.response import ServerSentEvent, ServerSentEventMessage
from piighost.client import PIIGhostClient

from piighost_chat.schemas import (
    AnonymizeRequest,
    AnonymizeResponse,
    ChatRequest,
    EntitySchema,
    MessageSchema,
    MessagesResponse,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a helpful assistant. The user's message has been anonymized — "
    "personal information has been replaced with placeholders like <<PERSON_1>> or <<LOCATION_1>>. "
    "Use these placeholders naturally in your response. Never try to guess the real values."
)


def create_app() -> Litestar:
    """Create and configure the Litestar application."""
    piighost_url = os.getenv("PIIGHOST_API_URL", "http://piighost-api:8000")
    piighost_key = os.getenv("PIIGHOST_API_KEY", "")
    llm_model = os.getenv("LLM_MODEL", "gpt-5.4-mini")
    pg_url = os.getenv(
        "DATABASE_URL",
        "postgresql://piighost:piighost@postgres:5432/piighost_chat",
    )

    client = PIIGhostClient(piighost_url, api_key=piighost_key)
    llm = ChatOpenAI(model=llm_model, streaming=True)
    pg_conn: psycopg.AsyncConnection | None = None

    @asynccontextmanager
    async def lifespan(app: Litestar) -> AsyncGenerator[None]:
        nonlocal pg_conn
        logger.info("piighost-chat starting — piighost-api at %s", piighost_url)
        pg_conn = await psycopg.AsyncConnection.connect(pg_url, autocommit=True)
        # Create the chat history table if it doesn't exist
        await PostgresChatMessageHistory.acreate_tables(pg_conn, "chat_history")
        yield
        await pg_conn.close()
        await client.close()

    @post("/api/anonymize")
    async def anonymize(data: AnonymizeRequest) -> AnonymizeResponse:
        anonymized_text, entities = await client.anonymize(
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
        history = PostgresChatMessageHistory(
            "chat_history",
            data.thread_id,
            async_connection=pg_conn,
        )
        past_messages = await history.aget_messages()

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            *past_messages,
            HumanMessage(content=data.anonymized_text),
        ]

        async def generate() -> AsyncGenerator[ServerSentEventMessage]:
            full_response = ""
            async for chunk in llm.astream(messages):
                if chunk.content:
                    full_response += chunk.content
                    yield ServerSentEventMessage(data=chunk.content)

            await history.aadd_messages(
                [
                    HumanMessage(content=data.anonymized_text),
                    AIMessage(content=full_response),
                ]
            )

        return ServerSentEvent(content=generate())

    @get("/api/messages")
    async def get_messages(thread_id: str = "default") -> MessagesResponse:
        history = PostgresChatMessageHistory(
            "chat_history",
            thread_id,
            async_connection=pg_conn,
        )
        msgs = await history.aget_messages()
        return MessagesResponse(
            messages=[
                MessageSchema(role=m.type, content=m.content)
                for m in msgs
            ]
        )

    @get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return Litestar(
        route_handlers=[anonymize, chat, get_messages, health],
        lifespan=[lifespan],
        cors_config=CORSConfig(allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]),
        openapi_config=OpenAPIConfig(
            title="piighost-chat",
            version="0.1.0",
            description="Chat API with PII anonymization.",
        ),
    )
