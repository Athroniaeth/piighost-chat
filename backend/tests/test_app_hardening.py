"""Prompt format, error-response redaction and CORS configuration."""

from unittest.mock import MagicMock

from piighost_chat.app import SYSTEM_PROMPT, _cors_origins, handle_exception


def test_system_prompt_uses_real_placeholder_format():
    assert "<<PERSON:1>>" in SYSTEM_PROMPT
    assert "<<PERSON_1>>" not in SYSTEM_PROMPT
    assert "<<CITY_1>>" not in SYSTEM_PROMPT


def test_cors_origins_from_env(monkeypatch):
    monkeypatch.setenv("CORS_ALLOW_ORIGINS", "https://a.example, https://b.example")
    assert _cors_origins() == ["https://a.example", "https://b.example"]
    monkeypatch.delenv("CORS_ALLOW_ORIGINS", raising=False)
    assert _cors_origins() == ["*"]


def test_internal_errors_are_not_echoed_to_the_client():
    request = MagicMock()
    request.method = "GET"
    request.url.path = "/x"
    resp = handle_exception(request, RuntimeError("secret connection string"))
    assert resp.status_code == 500
    assert resp.content["detail"] == "Internal Server Error"
    assert "secret" not in str(resp.content)


def test_http_exceptions_keep_their_detail():
    from litestar.exceptions import NotFoundException

    request = MagicMock()
    request.method = "GET"
    request.url.path = "/x"
    resp = handle_exception(request, NotFoundException("thread missing"))
    assert resp.status_code == 404
