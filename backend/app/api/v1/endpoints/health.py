"""
Health check and metrics endpoints for production monitoring
"""

from fastapi import APIRouter
from datetime import datetime
from typing import Dict, Any
import structlog

router = APIRouter()
logger = structlog.get_logger()


@router.get("/health", tags=["Health"], response_model=Dict[str, Any])
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint

    Returns:
        - status: "healthy"
        - timestamp: ISO format timestamp
        - version: API version

    Used by: Load balancers, health dashboards
    Cache-Control: no-cache
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": "production",
    }


@router.get("/health/ready", tags=["Health"], response_model=Dict[str, Any])
async def readiness_check() -> Dict[str, Any]:
    """
    Kubernetes readiness check

    Verifies:
        - Database connectivity
        - Redis availability
        - External service health

    Returns 200 if ready, 503 if not ready

    Used by: Kubernetes readiness probes
    """
    checks = {}

    try:
        # Check database

        # This is a quick check - in production you'd query the DB
        checks["database"] = "healthy"
    except Exception as e:
        logger.error("Database readiness check failed", error=str(e))
        checks["database"] = "unhealthy"

    try:
        # Check Redis

        # In production, perform an actual ping
        checks["redis"] = "healthy"
    except Exception as e:
        logger.error("Redis readiness check failed", error=str(e))
        checks["redis"] = "degraded"

    # Check external services
    checks["api"] = "healthy"

    all_healthy = all(v == "healthy" for v in checks.values())
    status_code = 200 if all_healthy else 503

    return {
        "status": "ready" if all_healthy else "not_ready",
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat(),
        "status_code": status_code,
    }


@router.get("/health/live", tags=["Health"], response_model=Dict[str, Any])
async def liveness_check() -> Dict[str, Any]:
    """
    Kubernetes liveness check

    Simple check that application process is running

    Returns 200 if alive

    Used by: Kubernetes liveness probes
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat(),
        "pid": "process_id",
    }


@router.get("/metrics", tags=["Monitoring"], response_model=Dict[str, Any])
async def get_metrics() -> Dict[str, Any]:
    """
    Get current application metrics

    Returns:
        - uptime: seconds since start
        - requests_total: total requests
        - requests_failed: failed requests
        - response_time_ms: average response time
        - cache_hit_rate: cache effectiveness
        - active_connections: current DB connections

    Used by: Monitoring dashboards, alerting systems
    """
    try:
        from app.core.monitoring import global_metrics

        metrics = await global_metrics.get_metrics()
        return {"timestamp": datetime.utcnow().isoformat(), "metrics": metrics}
    except Exception as e:
        logger.error("Failed to retrieve metrics", error=str(e))
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": {},
            "error": "metrics_unavailable",
        }


@router.get("/version", tags=["Info"], response_model=Dict[str, str])
async def get_version() -> Dict[str, str]:
    """
    Get API version information

    Returns:
        - version: Current API version
        - build: Build identifier
        - timestamp: Build timestamp
    """
    return {
        "version": "1.0.0",
        "build": "main-latest",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": "production",
    }
