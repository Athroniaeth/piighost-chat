"""Request/response schemas for piighost-chat API."""

import msgspec


class AnonymizeRequest(msgspec.Struct):
    message: str
    thread_id: str = "default"


class DetectionSchema(msgspec.Struct):
    text: str
    label: str
    start_pos: int
    end_pos: int
    confidence: float


class EntitySchema(msgspec.Struct):
    label: str
    original_text: str


class AnonymizeResponse(msgspec.Struct):
    anonymized_text: str
    entities: list[EntitySchema]


class DetectResponse(msgspec.Struct):
    detections: list[DetectionSchema]


class OverrideDetectRequest(msgspec.Struct):
    message: str
    thread_id: str = "default"
    detections: list[DetectionSchema]


class LabelsResponse(msgspec.Struct):
    labels: list[str]


class ChatRequest(msgspec.Struct):
    message: str
    thread_id: str = "default"


class MessageSchema(msgspec.Struct):
    role: str
    content: str


class MessagesResponse(msgspec.Struct):
    messages: list[MessageSchema]


class ThreadSchema(msgspec.Struct):
    id: str
    title: str


class ThreadsResponse(msgspec.Struct):
    threads: list[ThreadSchema]
