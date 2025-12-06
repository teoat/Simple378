from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
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

    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:80"]
    MAX_UPLOAD_FILE_SIZE_MB: int = 5 # Default to 5 MB

    # Additional environment variables from docker-compose
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    BACKEND_URL: Optional[str] = None
    COORDINATION_TTL: Optional[str] = None
    
    # Infrastructure Scaling - Phase B
    TIMESCALE_URL: Optional[str] = None
    MEILI_URL: str = "http://localhost:7700"
    MEILI_MASTER_KEY: Optional[str] = "masterKey123"
    
    # Authentication Enhancement - Sprint 1
    # Application
    APP_NAME: str = "Simple378"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # OAuth Providers
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    MICROSOFT_CLIENT_ID: Optional[str] = None
    MICROSOFT_CLIENT_SECRET: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    
    # WebAuthn
    WEBAUTHN_RP_ID: str = "localhost"  # Change to domain in production
    WEBAUTHN_RP_NAME: str = "Simple378"
    
    # Twilio (SMS)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # Email/SMTP
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False
    
    # MFA Settings
    MFA_CODE_VALIDITY_SECONDS: int = 300  # 5 minutes

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
