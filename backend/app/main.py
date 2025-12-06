from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.logging import setup_logging
from app.core.exceptions import global_exception_handler
from app.core.middleware import SecurityHeadersMiddleware, RateLimitHeadersMiddleware
from app.core.rate_limit import limiter
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import structlog

# Setup logging
setup_logging()

# Import tracing after app creation to avoid circular imports
from app.core.tracing import setup_tracing  # noqa: E402

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# Register global exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Setup OpenTelemetry tracing
import os  # noqa: E402
if os.getenv("ENABLE_OTEL", "true").lower() == "true":
    try:
        setup_tracing(app, service_name=settings.PROJECT_NAME)
    except Exception as e:
        # Tracing is optional - log error but continue
        logger = structlog.get_logger()
        logger.error("Failed to setup tracing", error=str(e))

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitHeadersMiddleware)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    # Health check endpoint
    return {"status": "healthy"}
