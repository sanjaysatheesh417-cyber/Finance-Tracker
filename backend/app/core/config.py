from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url
from pydantic import field_validator, model_validator
from typing import Literal
from sqlalchemy.engine import URL

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    DATABASE_URL: str | None = None
    POSTGRES_USER: str | None = None
    POSTGRES_PASSWORD: str | None = None
    POSTGRES_SERVER: str | None = None
    POSTGRES_PORT: str | None = None
    POSTGRES_DB: str | None = None

    SECRET_KEY: str
    JWT_ALGORITHM: Literal["HS256"] = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    ENVIRONMENT: Literal["development","production"] = "development"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    RATE_LIMIT_LOGIN_ATTEMPTS: int = 10
    RATE_LIMIT_REGISTER_ATTEMPTS: int = 5

    LOG_LEVEL: str = "INFO"
    LOG_JSON_FORMAT: bool = False

    