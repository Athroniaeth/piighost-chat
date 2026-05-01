FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock* README.md* ./
# Install from the committed lockfile. The prek hook in
# .pre-commit-config.yaml blocks editable-source lockfiles from landing
# on master, so --frozen alone already pulls piighost from PyPI inside
# the image. The fallback re-resolves from indexes when the lockfile is
# missing or out of sync, using --no-sources to bypass the local
# ../../piighost path override declared in pyproject.toml. uv rejects
# --frozen with --no-sources, so the two flags only coexist on the
# fallback branch.
RUN uv sync --frozen --no-dev --no-progress || uv sync --no-dev --no-progress --no-sources

COPY src src
RUN uv sync --frozen --no-dev --no-progress

ENV PIIGHOST_API_URL=http://piighost-api:8000
ENV LLM_MODEL=gpt-5.4-mini
ENV DATABASE_URL=postgresql://piighost:piighost@postgres:5432/piighost_chat

EXPOSE 8001

CMD ["/app/.venv/bin/piighost-chat", "--host", "0.0.0.0", "--port", "8001"]
