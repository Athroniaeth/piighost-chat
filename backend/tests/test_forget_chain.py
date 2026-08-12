"""Thread deletion must purge PII mappings in piighost-api, not just checkpoints."""

from unittest.mock import AsyncMock

from piighost_chat import worker


async def test_cleanup_calls_forget_for_each_stale_thread(monkeypatch):
    fake_client = AsyncMock()
    fake_http = AsyncMock()
    monkeypatch.setattr(worker, "_build_http_client", lambda: fake_http)
    monkeypatch.setattr(worker, "PIIGhostClient", lambda http: fake_client)
    monkeypatch.setattr(
        worker, "list_stale_thread_ids", AsyncMock(return_value=["a", "b"])
    )
    monkeypatch.setattr(worker, "delete_thread_data", AsyncMock())
    monkeypatch.setenv("CLEANUP_DRY_RUN", "false")

    class FakeConn:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

    async def fake_connect(url):
        return FakeConn()

    monkeypatch.setattr(worker.psycopg.AsyncConnection, "connect", fake_connect)

    await worker.cleanup_stale_threads()

    assert fake_client.forget_thread.await_count == 2
    fake_client.forget_thread.assert_any_await("a")
    fake_client.forget_thread.assert_any_await("b")
    fake_http.aclose.assert_awaited()


async def test_cleanup_forget_failure_does_not_abort_db_cleanup(monkeypatch):
    fake_client = AsyncMock()
    fake_client.forget_thread.side_effect = RuntimeError("api down")
    fake_http = AsyncMock()
    monkeypatch.setattr(worker, "_build_http_client", lambda: fake_http)
    monkeypatch.setattr(worker, "PIIGhostClient", lambda http: fake_client)
    monkeypatch.setattr(worker, "list_stale_thread_ids", AsyncMock(return_value=["a"]))
    deleted = AsyncMock()
    monkeypatch.setattr(worker, "delete_thread_data", deleted)
    monkeypatch.setenv("CLEANUP_DRY_RUN", "false")

    class FakeConn:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

    async def fake_connect(url):
        return FakeConn()

    monkeypatch.setattr(worker.psycopg.AsyncConnection, "connect", fake_connect)

    # Must not raise despite forget_thread failing.
    await worker.cleanup_stale_threads()
    deleted.assert_awaited_once()
    fake_http.aclose.assert_awaited()


async def test_forget_thread_quietly_swallows_failure():
    from piighost_chat.app import _forget_thread_quietly

    client = AsyncMock()
    client.forget_thread.side_effect = RuntimeError("api down")
    await _forget_thread_quietly(client, "t1")  # must not raise
    client.forget_thread.assert_awaited_once_with("t1")


async def test_forget_thread_quietly_calls_client():
    from piighost_chat.app import _forget_thread_quietly

    client = AsyncMock()
    await _forget_thread_quietly(client, "t1")
    client.forget_thread.assert_awaited_once_with("t1")
