# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

piighost-chat is a chat interface with PII anonymization, powered by [piighost-api](https://github.com/Athroniaeth/piighost-api) and LangChain. Users type messages, see what PII was detected, then send the message to an LLM that only sees anonymized text. Responses are deanonymized transparently via piighost middleware.

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