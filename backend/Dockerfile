FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock* README.md* ./
RUN uv sync --frozen --no-dev --no-progress || uv sync --no-dev --no-progress

COPY src src

ENV PIIGHOST_API_URL=http://piighost-api:8000
ENV LLM_MODEL=gpt-5.4-mini
ENV DATABASE_URL=postgresql://piighost:piighost@postgres:5432/piighost_chat

EXPOSE 8001

CMD ["uv", "run", "piighost-chat", "--host", "0.0.0.0", "--port", "8001"]
