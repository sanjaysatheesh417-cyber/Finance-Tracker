FROM python:3.14-slim

COPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project

COPY app ./app

EXPOSE 8007

CMD [ "uv", "run", "fastapi", "dev", "app/main.py", "--host", "0.0.0.0", "--port", "8007"]