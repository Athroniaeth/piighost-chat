"""Request/response schemas for piighost-chat API."""

import msgspec


class AnonymizeRequest(msgspec.Struct):
    message: str
    thread_id: str = "default"


class EntitySchema(msgspec.Struct):
    label: str
    original_text: str


class AnonymizeResponse(msgspec.Struct):
    anonymized_text: str
    entities: list[EntitySchema]


class ChatRequest(msgspec.Struct):
    anonymized_text: str
    thread_id: str = "default"


class MessageSchema(msgspec.Struct):
    role: str
    content: str


class MessagesResponse(msgspec.Struct):
    messages: list[MessageSchema]
