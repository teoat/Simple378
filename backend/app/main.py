from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.logging import setup_logging
from app.core.exceptions import global_exception_handler
from prometheus_fastapi_instrumentator import Instrumentator

# Setup logging
setup_logging()

# Import tracing after app creation to avoid circular imports
from app.core.tracing import setup_tracing

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# Register global exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Setup Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Setup OpenTelemetry tracing
try:
    setup_tracing(app, service_name=settings.PROJECT_NAME)
except Exception as e:
    # Tracing is optional - log error but continue
    print(f"Warning: Failed to setup tracing: {e}")

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    # Health check endpoint
    return {"status": "healthy"}
