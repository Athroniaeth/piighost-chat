"""Database helpers for thread lifecycle management.

LangGraph's PostgresSaver uses three tables — ``checkpoints``,
``checkpoint_blobs`` and ``checkpoint_writes`` — keyed by ``thread_id``.
``checkpoint_id`` is a UUIDv6 whose 60-bit timestamp (in 100-ns intervals
since the Gregorian epoch, 1582-10-15) occupies the first two fields
plus the low 12 bits of the third, so the string form compares
lexicographically in chronological order. We exploit that to find stale
threads without adding a dedicated timestamp column.
"""

from __future__ import annotations

import time

import psycopg

GREGORIAN_EPOCH_100NS = 0x01B21DD213814000


async def delete_thread_data(
    conn: psycopg.AsyncConnection, thread_id: str
) -> None:
    """Delete every LangGraph checkpoint row for a given thread."""
    await conn.execute(
        "DELETE FROM checkpoint_blobs WHERE thread_id = %s", (thread_id,)
    )
    await conn.execute(
        "DELETE FROM checkpoint_writes WHERE thread_id = %s", (thread_id,)
    )
    await conn.execute(
        "DELETE FROM checkpoints WHERE thread_id = %s", (thread_id,)
    )


def _uuid6_cutoff(ttl_hours: float) -> str:
    """Build the smallest valid UUIDv6 string at ``now - ttl_hours``."""
    cutoff_ms = int(time.time() * 1000) - int(ttl_hours * 3_600_000)
    ts_100ns = max(cutoff_ms, 0) * 10_000 + GREGORIAN_EPOCH_100NS
    ts_high = (ts_100ns >> 12) & 0xFFFFFFFFFFFF
    ts_low = ts_100ns & 0xFFF
    hi = f"{ts_high:012x}"
    return f"{hi[:8]}-{hi[8:]}-6{ts_low:03x}-8000-000000000000"


async def list_stale_thread_ids(
    conn: psycopg.AsyncConnection, ttl_hours: float
) -> list[str]:
    """Return thread_ids whose latest checkpoint is older than ``ttl_hours``."""
    cutoff = _uuid6_cutoff(ttl_hours)
    cursor = await conn.execute(
        "SELECT thread_id FROM checkpoints "
        "GROUP BY thread_id HAVING MAX(checkpoint_id) < %s",
        (cutoff,),
    )
    return [row[0] for row in await cursor.fetchall()]
