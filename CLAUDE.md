# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

piighost-chat is a chat interface with PII anonymization, powered by [piighost-api](https://github.com/Athroniaeth/piighost-api) and LangChain. Users type messages, see what PII was detected, then send the message to an LLM that only sees anonymized text. Responses are deanonymized transparently via piighost middleware.

## Install workflow

Unlike `piighost-api`, this repo's backend keeps `[tool.uv.sources] piighost = { path = "../../piighost", editable = true }` as the default in `backend/pyproject.toml`. Reason: the chat is a closed-loop dev tool, not a published package — there are no external consumers to surprise, and the friction of an explicit dev-local opt-in is not worth it here.

Practical consequence:

- `make install` (chat root Makefile) runs `cd backend && uv sync`, which installs `piighost` editable from `../../piighost` directly. No extra step needed; source changes in the sibling lib propagate live.
- `make install-pypi` runs `uv sync --no-sources` to drop the editable and resolve `piighost` from PyPI. Useful before committing the lockfile or to mirror the production install.
- The `prek` hook (installed via `make hooks`) blocks any commit whose lockfile records `piighost` as a `file://` editable source. So even though dev mode is the default, the committed lockfile stays PyPI-flavoured.

Docker stack:

- `make docker-up` boots the full stack with the published `ghcr.io/athroniaeth/piighost-api:latest` image. piighost in that image is the latest PyPI release.
- `make docker-up-local` adds the `compose.dev.yml` overlay that mounts `../piighost` into the piighost-api container and `uv pip install -e`'s it at boot. Use this when you need the sibling lib's unreleased changes to be exercised end-to-end via the running stack.

There is no need to `cz bump` and publish piighost to PyPI just to test changes via the chat. The default install is already editable, and the Docker overlay covers the in-stack case.

## Architecture

### Monorepo Structure

- `backend/` — Litestar API (Python), LangChain agent with PII middleware
- `frontend/` — SvelteKit chat UI with Tailwind CSS

### Backend (`backend/src/piighost_chat/`)

**`app.py`** — Litestar app factory with `create_agent` (LangChain):
- `POST /api/anonymize` — proxy to piighost-api via `PIIGhostClient`, returns entities for display
- `POST /api/chat` — streams LLM response via SSE, uses `PIIAnonymizationMiddleware` for transparent anonymization/deanonymization
- `GET /api/messages` — reads conversation state from LangGraph PostgreSQL checkpointer
- `GET /health`

**`schemas.py`** — msgspec Structs for request/response models

**`cli.py`** — `piighost-chat` CLI command (uvicorn wrapper)

### Frontend (`frontend/src/`)

**`routes/+page.svelte`** — Main chat page with 4 states: idle → anonymizing → reviewing → streaming

**Components:**
- `ChatMessage.svelte` — message bubble (user/assistant)
- `EntityHighlight.svelte` — highlights detected PII entities with label-colored badges
- `ChatInput.svelte` — input with "Analyser" / "Envoyer au LLM" / "Annuler" buttons

**`lib/api.ts`** — fetch functions for backend endpoints + SSE stream reader

### User Flow

1. User types message → frontend calls `/api/anonymize` → shows entity highlighting
2. User validates → frontend calls `/api/chat` (SSE streaming)
3. Middleware anonymizes before LLM, deanonymizes after
4. After streaming, frontend refreshes messages via `/api/messages`

### Docker Compose Services

- `frontend` — SvelteKit dev server (:5173)
- `backend` — Litestar API (:8001)
- `piighost-api` — PII anonymization API from ghcr.io (:8000)
- `redis` — cache for piighost-api
- `postgres` — LangGraph conversation checkpointer

## Development Commands

```bash
make lint            # Format (ruff), lint (ruff), type-check (pyrefly) — backend only
make test            # Run backend tests
make docker-up       # Start all services
make docker-down     # Stop all services
```

## Conventions

- **Commits**: Conventional Commits via Commitizen (`feat:`, `fix:`, `refactor:`, etc.)
- **Type checking**: PyReFly (not mypy)
- **Formatting/linting**: Ruff
- **Package manager**: uv (backend), npm (frontend)
- **Python**: 3.12+
- **Request/response models**: msgspec Struct (not pydantic)
- **Frontend**: SvelteKit 5, Tailwind CSS, TypeScript