from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import structlog
import traceback
import logging
from uuid import uuid4

# Core imports
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.logging import setup_logging
from app.core.exceptions import global_exception_handler, AppException
from app.core.middleware import SecurityHeadersMiddleware, RateLimitHeadersMiddleware
from app.core.security_headers import SecurityHeadersMiddleware as SecurityHeadersMiddlewareV2
from app.core.rate_limit import limiter
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Setup logging
setup_logging()

# Import tracing after app creation to avoid circular imports
from app.core.tracing import setup_tracing  # noqa: E402

# Create FastAPI app with production-aware documentation
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Register global exception handler
# app.add_exception_handler(Exception, global_exception_handler)

from contextvars import ContextVar

# Error monitoring context using ContextVars for async safety
class RequestContext:
    """Store request context using ContextVars for async safety"""
    _request_id: ContextVar[str] = ContextVar("request_id", default=None)
    _user_id: ContextVar[str] = ContextVar("user_id", default=None)
    _method: ContextVar[str] = ContextVar("method", default=None)
    _path: ContextVar[str] = ContextVar("path", default=None)
    _timestamp: ContextVar[datetime] = ContextVar("timestamp", default=None)

    @property
    def request_id(self) -> str:
        return self._request_id.get()
    
    @request_id.setter
    def request_id(self, value: str):
        self._request_id.set(value)

    @property
    def method(self) -> str:
        return self._method.get()
    
    @method.setter
    def method(self, value: str):
        self._method.set(value)

    @property
    def path(self) -> str:
        return self._path.get()
    
    @path.setter
    def path(self, value: str):
        self._path.set(value)

    @property
    def timestamp(self) -> datetime:
        return self._timestamp.get()
    
    @timestamp.setter
    def timestamp(self, value: datetime):
        self._timestamp.set(value)

request_context = RequestContext()

@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    """
    Middleware to handle exceptions and log all requests
    """
    # Generate request ID
    request_id = str(uuid4())
    request_context.request_id = request_id
    request_context.method = request.method
    request_context.path = request.url.path
    request_context.timestamp = datetime.utcnow()
    
    start_time = datetime.utcnow()
    logger = structlog.get_logger()
    
    try:
        response = await call_next(request)
        
        # Log successful response
        duration = (datetime.utcnow() - start_time).total_seconds()
        logger.info(
            "request_completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration=process_time
        )
        
        # Record metrics
        try:
            from app.core.monitoring import global_metrics
            # Determine if it was an error based on status code
            is_error = response.status_code >= 400
            await global_metrics.record_request(
                response_time_ms=process_time * 1000,
                is_error=is_error
            )
        except Exception:
            pass
            
        return response
        
    except Exception as e:
        # Log error with full context
        process_time = (datetime.utcnow() - start_time).total_seconds()
        logger.error(
            "request_failed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            duration=process_time,
            error=str(e),
            traceback=traceback.format_exc()
        )
        
        # Record error metrics
        try:
            from app.core.monitoring import global_metrics
            await global_metrics.record_request(
                response_time_ms=process_time * 1000,
                is_error=True
            )
        except Exception:
            pass
            
        # Return consistent error response
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "internal_server_error",
                "message": "An unexpected error occurred. Please try again.",
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle validation errors specifically"""
    logger = structlog.get_logger()
    logger.warning("validation_error", error=str(exc))
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "validation_error",
            "message": str(exc),
            "request_id": request_context.request_id
        }
    )

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle application-specific exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers,
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Fallback handler for all exceptions"""
    logger = structlog.get_logger()
    logger.error("unhandled_exception", error=str(exc), traceback=traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred",
            "request_id": request_context.request_id
        }
    )

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

# ============================================================================
# MIDDLEWARE - Order matters!
# ============================================================================

# 1. GZip Compression
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,  # Only compress responses > 1KB
    compresslevel=6,    # Balance between speed and compression
)

# 2. Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitHeadersMiddleware)

# 3. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
)

# ============================================================================
# STARTUP / SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger = structlog.get_logger()
    logger.info("Starting application", environment=settings.ENVIRONMENT)
    
    # Initialize Redis cache
    try:
        from app.services.cache_service import cache
        await cache.connect()
        logger.info("Redis cache connected")
    except Exception as e:
        logger.warning("Redis cache initialization failed", error=str(e))

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger = structlog.get_logger()
    logger.info("Shutting down application")
    
    # Close Redis connection
    try:
        from app.services.cache_service import cache
        await cache.close()
    except Exception as e:
        logger.warning("Error closing cache", error=str(e))

# ============================================================================
# ROUTES
# ============================================================================

# ... imports
from app.core.cache import set_cache_headers, set_no_cache, CACHE_PRESETS

# ... (existing imports)

# Enhanced health check endpoints
@app.get("/health", tags=["Health"])
async def health_check(response: JSONResponse):
    """Basic health check"""
    # Prevent caching of health status
    set_no_cache(response)
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health/ready", tags=["Health"])
async def readiness_check(response: JSONResponse):
    """Readiness check (for Kubernetes)"""
    # Prevent caching of readiness status
    set_no_cache(response)
    
    checks = {
        "database": "unknown",
        "redis": "unknown",
    }
    
    # ... (existing check logic)
    
    all_healthy = all(v == "healthy" for v in checks.values())
    status_code = 200 if all_healthy else 503
    
    # Create response with proper status code
    json_response = JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if all_healthy else "not_ready",
            "checks": checks,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    
    # Apply headers to the JSONResponse object
    set_no_cache(json_response)
    
    return json_response

@app.get("/health/live", tags=["Health"])
async def liveness_check(response: JSONResponse):
    """Liveness check (for Kubernetes)"""
    set_no_cache(response)
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """API root endpoint"""
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "operational",
        "docs": f"{settings.API_V1_STR}/docs" if settings.ENVIRONMENT != "production" else None
    }

# API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health and metrics endpoints
try:
    from app.api.v1.endpoints.health import router as health_router
    app.include_router(health_router, tags=["Health"])
    logger = structlog.get_logger()
    logger.info("Health endpoints enabled")
except ImportError as e:
    import structlog
    logger = structlog.get_logger()
    logger.warning("Health endpoints not available", error=str(e))

# GraphQL Integration
try:
    from strawberry.fastapi import GraphQLRouter
    from app.graphql.schema import schema
    
    # Enable GraphiQL playground for development
    graphql_router = GraphQLRouter(schema, graphiql=True)
    app.include_router(graphql_router, prefix="/graphql")
    
    logger = structlog.get_logger()
    logger.info("GraphQL endpoint enabled at /graphql")
except ImportError:
    import structlog
    logger = structlog.get_logger()
    logger.warning("strawberry-graphql not installed, skipping GraphQL route")

# Uvicorn main block
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
