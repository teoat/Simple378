# Backend main.py Merge Analysis

## Current Version Features (64 lines)
- ✅ SlowAPI rate limiting with `limiter` state
- ✅ Prometheus-fastapi-instrumentator (automatic instrumentation)
- ✅ OpenTelemetry tracing (`setup_tracing`)
- ✅ Global exception handler (`global_exception_handler`)
- ✅ SecurityHeadersMiddleware (from core.middleware)
- ✅ RateLimitHeadersMiddleware (from core.middleware)
- ✅ Basic health check endpoint
- ✅ API router inclusion with settings.API_V1_STR

## Commit Version Features (263 lines)
- ✅ GZip compression middleware
- ✅ Manual Prometheus metrics (Counter, Histogram)
- ✅ Custom prometheus_middleware with timing
- ✅ Inline security headers middleware
- ✅ Cache service initialization (startup/shutdown events)
- ✅ Enhanced health endpoints (/health, /health/ready, /health/live)
- ✅ Manual /metrics endpoint
- ✅ Root endpoint with API info
- ✅ 500 error handler
- ✅ Uvicorn main block
- ✅ Production-aware docs URLs

## Analysis

### Lost Features in Commit Version
1. **SlowAPI rate limiting** - Current uses slowapi limiter, commit version doesn't
2. **Prometheus-fastapi-instrumentator** - Current uses auto-instrumentation, commit has manual
3. **OpenTelemetry tracing** - Current has full tracing, commit doesn't
4. **Core middleware classes** - Current imports SecurityHeadersMiddleware, commit has inline

### New Features in Commit Version
1. **GZip compression** - Improves response size
2. **Cache service lifecycle** - Connects/disconnects Redis cache
3. **Enhanced health checks** - Kubernetes-ready endpoints
4. **Manual metrics** - More control over Prometheus metrics
5. **Production documentation hiding** - Docs disabled in production

## Merge Strategy: Hybrid Approach

### Keep from Current Version
- SlowAPI rate limiting infrastructure
- OpenTelemetry tracing setup
- Global exception handler from core.exceptions
- Prometheus-fastapi-instrumentator (it already handles metrics)
- Core middleware imports (they may have additional logic)

### Add from Commit Version
- GZip compression middleware
- Cache service startup/shutdown events
- Enhanced health check endpoints (/health/ready, /health/live)
- Production-aware documentation URLs
- Root endpoint
- Uvicorn main block

### Skip from Commit Version
- Manual Prometheus metrics (duplicate of instrumentator)
- Inline security headers (we have SecurityHeadersMiddleware)
- Manual /metrics endpoint (instrumentator already adds it)

## Recommended Merged Version

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import structlog

# Core imports
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.logging import setup_logging
from app.core.exceptions import global_exception_handler
from app.core.middleware import SecurityHeadersMiddleware, RateLimitHeadersMiddleware
from app.core.rate_limit import limiter
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Setup logging
setup_logging()

# Import tracing after app creation to avoid circular imports
from app.core.tracing import setup_tracing  # noqa: E402

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Register global exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup Prometheus metrics (auto-instrumentation)
Instrumentator().instrument(app).expose(app)

# Setup OpenTelemetry tracing
import os  # noqa: E402
if os.getenv("ENABLE_OTEL", "true").lower() == "true":
    try:
        setup_tracing(app, service_name=settings.PROJECT_NAME)
    except Exception as e:
        logger = structlog.get_logger()
        logger.error("Failed to setup tracing", error=str(e))

# ============================================================================
# MIDDLEWARE - Order matters!
# ============================================================================

# 1. GZip Compression (NEW - from commit)
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,
    compresslevel=6,
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
# STARTUP / SHUTDOWN EVENTS (NEW - from commit)
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

# Enhanced health check endpoints (NEW - from commit)
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health/ready", tags=["Health"])
async def readiness_check():
    """Readiness check (for Kubernetes)"""
    # TODO: Add actual health checks for dependencies
    checks = {
        "database": "healthy",
        "redis": "healthy",
    }
    
    all_healthy = all(v == "healthy" for v in checks.values())
    status_code = 200 if all_healthy else 503
    
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if all_healthy else "not_ready",
            "checks": checks,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.get("/health/live", tags=["Health"])
async def liveness_check():
    """Liveness check (for Kubernetes)"""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }

# Root endpoint (NEW - from commit)
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

# Uvicorn main block (NEW - from commit)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
```

## Summary

This hybrid approach:
1. **Preserves** existing rate limiting, tracing, and exception handling
2. **Adds** GZip compression for better performance
3. **Adds** cache service lifecycle management
4. **Enhances** health check endpoints for Kubernetes
5. **Improves** production security (docs disabled)
6. **Maintains** existing middleware architecture

**Lines:** ~150 (balanced between 64 and 263)
**Risk:** Low - additive changes, no functionality removed
