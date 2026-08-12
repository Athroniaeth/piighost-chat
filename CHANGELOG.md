## Unreleased

Migrate to piighost 1.0 (the v2 rewrite).

### BREAKING CHANGE

- Requires piighost >= 1.0 and a piighost-api >= 1.0 server.
- ``pipeline.toml`` moves to the v2 config schema: a single composite
  ``[detector]`` with ``[[detector.detectors]]`` children, explicit ``[linker]``
  and ``[anonymizer.placeholder]``, and a now-mandatory ``[memory]`` section. The
  Redis memory is encrypted (AES-GCM values, Argon2id keys), so piighost-api now
  requires ``PIIGHOST_HASH_PEPPER`` and ``PIIGHOST_CIPHER_KEY`` in its
  environment. Its ``EXTRA_PACKAGES`` gains ``redis,crypto,argon2`` and drops the
  removed ``langfuse`` piighost extra.

### Changed

- The backend shares one authenticated ``httpx.AsyncClient`` between the
  ``PIIGhostClient`` (middleware, deanonymize, forget) and direct calls to the
  server's richer detection surface. ``PIIGhostClient`` no longer takes an
  ``api_key`` argument; auth rides on the injected client's headers.
- ``/api/detect`` and ``/api/detect`` (PUT, correction) now call the server's
  ``POST /v1/detect`` and ``POST /v1/anonymize/corrected``. A human correction is
  written into the thread's memory, so the chat turn re-anonymizes the same
  message with the corrected spans (the piighost cache-miss fallback is gone).
- ``/api/labels`` reads the detector's label vocabulary from the server's
  ``GET /v1/labels``.
- Drop the unused ``aiocache`` dependency.

## 0.1.0 (2026-03-30)

### Feat

- SvelteKit frontend with Tailwind CSS chat interface and entity highlighting
- Litestar backend with LangChain agent, PII middleware, and streaming SSE
- LangGraph PostgreSQL checkpointer for conversation memory
- piighost-api integration via PIIGhostClient for anonymization display
- Docker Compose orchestrating frontend, backend, piighost-api, Redis, and Postgres
- Tools: send_email, get_weather