from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.api.health import router as health_router
from app.core.logging import setup_logging
from app.core.exceptions import global_exception_handler
from app.core.middleware import SecurityHeadersMiddleware, RateLimitHeadersMiddleware
from app.core.file_limits import FileSizeLimitMiddleware
from app.core.rate_limit import limiter
from app.core.env_validator import startup_validation
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import structlog
from datetime import datetime

from app.core.correlation_id import CorrelationIDMiddleware
from app.core.error_handler import validation_error_handler, general_exception_handler, HTTPExceptionHandler
from fastapi.exceptions import RequestValidationError
from app.core.correlation_id import CorrelationIDMiddleware
from app.core.error_handler import validation_error_handler, general_exception_handler, HTTPExceptionHandler
from fastapi.exceptions import RequestValidationError
# Setup logging
setup_logging()
# Core infrastructure modules
from app.core.monitoring import MetricsCollector, AlertingRules, HealthCheckCollector, track_request_metrics
from app.core.rate_limiting import TokenBucketRateLimiter, QuotaManager, DynamicThrottling
from app.core.validation import DataSanitizer, InputValidator, SecurityRuleValidator
from app.core.scaling_config import RedisSessionStore, ConnectionPoolConfig, AutoScalingPolicy
from app.core.deployment import (
    DeploymentValidator, BlueGreenDeployment, CanaryDeployment,
    RollingDeployment, DeploymentRollbackManager
)

# Initialize monitoring and infrastructure
metrics_collector = MetricsCollector()
health_collector = HealthCheckCollector()

# Initialize rate limiting (requires REDIS_URL)
try:
    rate_limiter = TokenBucketRateLimiter(
        redis_url=settings.REDIS_URL,
        rate_limit=100,
        window_seconds=60
    )
except Exception as e:
    logger.warning(f"Rate limiter initialization failed: {e}")
    rate_limiter = None

# Initialize deployment managers
deployment_validator = DeploymentValidator()
blue_green_deployment = BlueGreenDeployment()
canary_deployment = CanaryDeployment()
rollback_manager = DeploymentRollbackManager()

@app.get("/health")
async def health():
    """Basic health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/health/detailed")
async def health_detailed():
    """Detailed health check with component status."""
    return health_collector.get_overall_status()

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return metrics_collector.get_prometheus_metrics()

@app.middleware("http")
async def validation_middleware(request, call_next):
    """Middleware to validate requests for security issues."""
    
    # Check for SQL injection in query params
    for key, value in request.query_params.items():
        if isinstance(value, str) and DataSanitizer.check_sql_injection(value):
            logger.warning(f"SQL injection attempt detected in {key}", extra={"request_id": request.headers.get("X-Request-ID")})
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid request parameters"}
            )
    
    response = await call_next(request)
    return response

@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    """Apply rate limiting based on client identifier."""
    if rate_limiter:
        client_id = request.client.host if request.client else "unknown"
        allowed, info = await rate_limiter.is_allowed(client_id)
        
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"},
                headers={
                    "X-RateLimit-Limit": str(info["limit"]),
                    "X-RateLimit-Remaining": str(info["remaining"]),
                    "X-RateLimit-Reset": str(info["reset_at"]),
                }
            )
        
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(info["reset_at"])
        return response
    
    return await call_next(request)
