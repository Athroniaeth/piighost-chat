"""LLM chunk content must be normalized to text before SSE emission."""

from piighost_chat.app import _chunk_text


def test_string_content_passthrough():
    assert _chunk_text("hello") == "hello"


def test_block_list_content_is_joined():
    blocks = [{"type": "text", "text": "hel"}, {"type": "text", "text": "lo"}]
    assert _chunk_text(blocks) == "hello"


def test_non_text_blocks_are_skipped():
    blocks = [{"type": "tool_use", "id": "x"}, {"type": "text", "text": "ok"}]
    assert _chunk_text(blocks) == "ok"


def test_empty_or_unknown_content_is_empty_string():
    assert _chunk_text(None) == ""
    assert _chunk_text(123) == ""
    assert _chunk_text([]) == ""
