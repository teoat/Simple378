"""
FastAPI Application Entry Point with Production Hardening

Implements:
- GZip compression
- Rate limiting (via existing infrastructure)
- Prometheus metrics
- CORS
- Security headers
- Health checks
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import time
from datetime import datetime
import structlog

# Core imports
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.logging import setup_logging

# Setup logging
setup_logging()
logger = structlog.get_logger()

# Prometheus Metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

# Create FastAPI app
app = FastAPI(
    title="Simple378 API",
    description="Privacy-First Financial Forensics Platform",
    version="1.0.0",
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
)

# ============================================================================
# MIDDLEWARE - Order matters!
# ============================================================================

# 1. GZip Compression (First - compress all responses)
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,  # Only compress responses > 1KB
    compresslevel=6,    # Balance between speed and compression
)

# 2. CORS (Security)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# 3. Prometheus Metrics Middleware
@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    """Track HTTP request metrics for Prometheus"""
    start_time = time.time()
    
    # Process request
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        logger.error("Request failed", error=str(e), path=request.url.path)
        status_code = 500
        raise
    finally:
        # Calculate duration
        duration = time.time() - start_time
        
        # Simplify endpoint path (remove IDs)
        endpoint = request.url.path
        for segment in endpoint.split('/'):
            if segment.isdigit() or len(segment) == 36:  # UUID
                endpoint = endpoint.replace(segment, '{id}')
        
        # Record metrics
        http_requests_total.labels(
            method=request.method,
            endpoint=endpoint,
            status=status_code
        ).inc()
        
        http_request_duration_seconds.labels(
            method=request.method,
            endpoint=endpoint
        ).observe(duration)
        
        # Add timing header
        if 'response' in locals():
            response.headers["X-Process-Time"] = f"{duration:.4f}"
    
    return response

# 4. Security Headers
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    return response

# ============================================================================
# STARTUP / SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Simple378 API", environment=settings.ENVIRONMENT)
    
    # Initialize Redis cache
    try:
        from app.services.cache_service import cache
        await cache.connect()
        logger.info("Redis cache connected")
    except Exception as e:
        logger.warning("Redis cache initialization failed", error=str(e))
    
    # Additional startup tasks
    logger.info("API startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Simple378 API")
    
    # Close Redis connection
    try:
        from app.services.cache_service import cache
        if cache.redis_client:
            await cache.redis_client.close()
    except:
        pass

# ============================================================================
# ROUTES
# ============================================================================

# Health check endpoints
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
    # Check critical dependencies
    checks = {
        "database": "healthy",  # TODO: Add actual DB check
        "redis": "healthy",     # TODO: Add actual Redis check
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

# Prometheus metrics endpoint
@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )

# API routes
app.include_router(api_router, prefix="/api/v1")

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """API root endpoint"""
    return {
        "name": "Simple378 API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/api/docs" if settings.ENVIRONMENT != "production" else None
    }

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    """Handle 500 errors"""
    logger.error(
        "Internal server error",
        path=request.url.path,
        error=str(exc),
        exc_type=type(exc).__name__
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ============================================================================
# MAIN (for uvicorn)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
