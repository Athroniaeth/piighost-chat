## Unreleased

Migrate to piighost 1.0 (the v2 rewrite).

### BREAKING CHANGE

- Requires a piighost whose ``PIIGhostClient`` exposes ``detect`` and ``labels``
  (added after 1.0.0), and a piighost-api >= 1.0 server.
- ``pipeline.toml`` moves to the v2 config schema: a single composite
  ``[detector]`` with ``[[detector.detectors]]`` children, explicit ``[linker]``
  and ``[anonymizer.placeholder]``, and a now-mandatory ``[memory]`` section. The
  Redis memory is encrypted (AES-GCM values, Argon2id keys), so piighost-api now
  requires ``PIIGHOST_HASH_PEPPER`` and ``PIIGHOST_CIPHER_KEY`` in its
  environment. Its ``EXTRA_PACKAGES`` gains ``redis,crypto,argon2`` and drops the
  removed ``langfuse`` piighost extra.

### Changed

- The backend talks to piighost-api exclusively through the ``PIIGhostClient``,
  which serves the middleware as a remote thread pipeline and also drives the
  detect/labels previews and corrections. The injected ``httpx.AsyncClient`` only
  carries the bearer token; ``PIIGhostClient`` no longer takes an ``api_key``
  argument.
- ``/api/detect`` uses ``PIIGhostClient.detect`` and the correction PUT uses
  ``PIIGhostClient.anonymize_corrected``. A human correction is written into the
  thread's memory, so the chat turn re-anonymizes the same message with the
  corrected spans (the piighost cache-miss fallback is gone).
- ``/api/labels`` returns the detector's label vocabulary via
  ``PIIGhostClient.labels``.
- Drop the unused ``aiocache`` dependency.

## 0.1.0 (2026-03-30)

### Feat

- SvelteKit frontend with Tailwind CSS chat interface and entity highlighting
- Litestar backend with LangChain agent, PII middleware, and streaming SSE
- LangGraph PostgreSQL checkpointer for conversation memory
- piighost-api integration via PIIGhostClient for anonymization display
- Docker Compose orchestrating frontend, backend, piighost-api, Redis, and Postgres
- Tools: send_email, get_weather