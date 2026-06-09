"""
Application configuration management.
"""
import os
from pydantic import field_validator
from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env")

    # App
    app_name: str = "Workflow Engine API"
    app_version: str = "0.1.0"
    debug: bool = bool(os.getenv("DEBUG", "false").lower() == "true")

    # Database
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/workflow_engine",
    )
    cors_origins: str = os.getenv("CORS_ORIGINS", "*")

    # API
    api_prefix: str = "/api/v1"

    # Workflow config
    workflow_config_path: str = os.getenv("WORKFLOW_CONFIG_PATH") or os.path.join(
        os.path.dirname(__file__),
        "..",
        "workflow",
        "config",
        "workflows.json"
    )
    workflow_rules_path: str = os.getenv("WORKFLOW_RULES_PATH") or os.path.join(
        os.path.dirname(__file__),
        "..",
        "workflow",
        "config",
        "workflow_rules.json"
    )

    @field_validator("database_url")
    @classmethod
    def require_postgresql(cls, value: str) -> str:
        if not value.startswith(("postgresql://", "postgresql+")):
            raise ValueError("DATABASE_URL must use PostgreSQL")
        return value


settings = Settings()
