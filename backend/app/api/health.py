"""
Health Check Endpoints for Staging Environment
Provides comprehensive health status for all system components
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.redis_client import redis_client
import httpx
from datetime import datetime
from typing import Dict, Any

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint
    Returns 200 if the service is running
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "simple378-api"
    }


@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Readiness check - verify service can handle requests
    Checks database and Redis connectivity
    """
    checks = {}
    overall_status = "ready"
    
    # Check database
    try:
        await db.execute("SELECT 1")
        checks["database"] = {"status": "healthy", "message": "Connected"}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "not_ready"
    
    # Check Redis  
    try:
        await redis_client.ping()
        checks["redis"] = {"status": "healthy", "message": "Connected"}
    except Exception as e:
        checks["redis"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "not_ready"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "checks": checks
    }


@router.get("/live")
async def liveness_check() -> Dict[str, Any]:
    """
    Liveness check - verify the process is alive
    Simple check that doesn't depend on external services
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed health check with all component statuses
    """
    checks = {}
    
    # Database check
    try:
        result = await db.execute("SELECT version()")
        version = result.scalar_one()
        checks["database"] = {
            "status": "healthy",
            "version": version,
            "message": "Connected"
        }
    except Exception as e:
        checks["database"] = {
            "status": "unhealthy",
            "message": str(e)
        }
    
    # Redis check
    try:
        info = await redis_client.info()
        checks["redis"] = {
            "status": "healthy",
            "version": info.get("redis_version", "unknown"),
            "used_memory": info.get("used_memory_human", "unknown"),
            "message": "Connected"
        }
    except Exception as e:
        checks["redis"] = {
            "status": "unhealthy",
            "message": str(e)
        }
    
    # Qdrant check (if configured)
    try:
        import os
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{qdrant_url}/health", timeout=5.0)
            if response.status_code == 200:
                checks["qdrant"] = {
                    "status": "healthy",
                    "message": "Connected"
                }
            else:
                checks["qdrant"] = {
                    "status": "unhealthy",
                    "message": f"HTTP {response.status_code}"
                }
    except Exception as e:
        checks["qdrant"] = {
            "status": "unhealthy",
            "message": str(e)
        }
    
    # Overall status
    overall_status = "healthy" if all(
        check["status"] == "healthy" 
        for check in checks.values()
    ) else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "checks": checks
    }
