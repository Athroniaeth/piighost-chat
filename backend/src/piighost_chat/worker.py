"""Taskiq broker, scheduler and scheduled background tasks.

Shared between the ``worker`` and ``scheduler`` Docker services: both
import this module so the broker instance and task registry are in sync.
Redis (shared with piighost-api, isolated on DB 1) backs both the task
queue and the schedule source.
"""

from __future__ import annotations

import logging
import os

import psycopg
from taskiq import TaskiqScheduler
from taskiq.schedule_sources import LabelScheduleSource
from taskiq_redis import ListQueueBroker

from piighost_chat.utils import delete_thread_data, list_stale_thread_ids

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("TASKIQ_REDIS_URL", "redis://redis:6379/1")
THREAD_TTL_SECONDS = float(os.getenv("THREAD_TTL_SECONDS", "3600"))

broker = ListQueueBroker(url=REDIS_URL)
scheduler = TaskiqScheduler(
    broker=broker,
    sources=[LabelScheduleSource(broker)],
)


def _env_truthy(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


def _cron_every(seconds: float) -> str:
    """Pick the finest cron expression that runs at most every ``seconds``.

    cron granularity is one minute, so any TTL below 60s runs every minute.
    Multi-hour TTLs step through hours; anything beyond a day caps at daily.
    """
    minutes = max(1, int(seconds // 60))
    if minutes < 60:
        return f"*/{minutes} * * * *"
    hours = max(1, minutes // 60)
    if hours < 24:
        return f"0 */{hours} * * *"
    return "0 0 * * *"


@broker.task(schedule=[{"cron": _cron_every(THREAD_TTL_SECONDS)}])
async def cleanup_stale_threads() -> None:
    """Delete LangGraph threads whose latest checkpoint exceeds the TTL.

    Configured via:
    - ``THREAD_TTL_SECONDS`` (float, default ``3600``): max age before deletion
      AND the interval between cleanup runs (derived to a cron expression at
      import time).
    - ``CLEANUP_DRY_RUN`` (bool, default ``false``): log but do not delete.
    - ``DATABASE_URL``: Postgres URL holding the LangGraph tables.
    """
    ttl_seconds = THREAD_TTL_SECONDS
    dry_run = _env_truthy("CLEANUP_DRY_RUN")
    pg_url = os.getenv(
        "DATABASE_URL",
        "postgresql://piighost:piighost@postgres:5432/piighost_chat",
    )

    async with await psycopg.AsyncConnection.connect(pg_url) as conn:
        stale_ids = await list_stale_thread_ids(conn, ttl_seconds)
        logger.info(
            "cleanup_stale_threads: %d stale thread(s) "
            "(ttl=%ss, dry_run=%s)",
            len(stale_ids),
            ttl_seconds,
            dry_run,
        )
        if dry_run or not stale_ids:
            return
        for tid in stale_ids:
            await delete_thread_data(conn, tid)
        logger.info("cleanup_stale_threads: deleted %d thread(s)", len(stale_ids))
