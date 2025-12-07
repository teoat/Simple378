from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    PROJECT_NAME: str = "Fraud Detection System"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str
    REDIS_URL: str
    QDRANT_URL: str
    DB_ECHO: bool = False

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    LOG_LEVEL: str = "INFO"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://localhost:4317"
    ENVIRONMENT: str = "development"

    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    MEILISEARCH_URL: str = "http://localhost:7700"
    MEILISEARCH_API_KEY: Optional[str] = None

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    MAX_UPLOAD_FILE_SIZE_MB: int = 5  # Default to 5 MB

    @field_validator("ANTHROPIC_API_KEY")
    @classmethod
    def validate_anthropic_key(cls, v: Optional[str]) -> Optional[str]:
        """Validate Anthropic API key format if provided"""
        if v is not None and v != "" and not v.startswith("sk-ant-"):
            # Allow test keys for testing
            if not v.startswith("test-"):
                raise ValueError(
                    "Invalid Anthropic API key format. Must start with 'sk-ant-'"
                )
        return v

    @field_validator("OPENAI_API_KEY")
    @classmethod
    def validate_openai_key(cls, v: Optional[str]) -> Optional[str]:
        """Validate OpenAI API key format if provided"""
        if v is not None and v != "" and not v.startswith("sk-"):
            # Allow test keys for testing
            if not v.startswith("test-"):
                raise ValueError("Invalid OpenAI API key format. Must start with 'sk-'")
        return v

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Validate SECRET_KEY is not using default/example value"""
        if v in [
            "change_this_secret_key_in_production",
            "test_secret_key_for_testing_purposes_only_not_for_production",
        ]:
            # Allow test key only in test environment
            import os

            if os.getenv("TESTING") != "true":
                raise ValueError(
                    "SECRET_KEY must be changed from default value in production"
                )
        if len(v) < 32 and not v.startswith("test-"):
            # Allow test keys
            pass
        return v


settings = Settings()
