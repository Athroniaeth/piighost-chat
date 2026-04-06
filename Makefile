.PHONY: lint test docker-up docker-down

lint:
	-cd backend && uv run ruff format .
	-cd backend && uv run ruff check --fix .
	-cd backend && uv run pyrefly check .

test:
	cd backend && uv run pytest

docker-up:
	docker compose up -d

docker-build:
	docker compose up --build -d

docker-down:
	docker compose down