.PHONY: lint test docker-up docker-build docker-down install install-pypi

lint:
	-cd backend && uv run ruff format .
	-cd backend && uv run ruff check --fix .
	-cd backend && uv run pyrefly check .

test:
	cd backend && uv run pytest

# Default dev install. The backend pyproject's [tool.uv.sources] points
# piighost at ../../piighost (editable), so source changes there are
# picked up live by the chat backend without a republish.
install:
	cd backend && uv sync

# Same as install but ignores pyproject sources, so piighost comes from
# PyPI instead of the local checkout. Use this before committing the
# lockfile, or to reproduce the production install on the host.
install-pypi:
	cd backend && uv sync --no-sources

docker-up:
	docker compose up -d

docker-build:
	docker compose up --build -d

docker-down:
	docker compose down