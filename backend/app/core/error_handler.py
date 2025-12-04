"""
Comprehensive error handler middleware for FastAPI.
Provides structured error logging with correlation IDs and enhanced debugging.
"""
import json
import structlog
from typing import Callable
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import traceback

from app.core.correlation_id import get_correlation_id, get_request_id

logger = structlog.get_logger(__name__)


class ErrorResponseSchema:
    """Standardized error response format."""

    @staticmethod
    def create(
        status_code: int,
        detail: str,
        error_code: str,
        correlation_id: str,
        request_id: str,
        timestamp: str,
        path: str = "",
    ) -> dict:
        return {
            "error": {
                "status_code": status_code,
                "detail": detail,
                "code": error_code,
                "correlation_id": correlation_id,
                "request_id": request_id,
                "timestamp": timestamp,
                "path": path,
            }
        }


async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Handle pydantic validation errors with detailed info."""
    correlation_id = get_correlation_id(request)
    request_id = get_request_id(request)
    
    logger.warning(
        "Validation error",
        correlation_id=correlation_id,
        request_id=request_id,
        path=request.url.path,
        method=request.method,
        errors=exc.errors(),
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponseSchema.create(
            status_code=422,
            detail="Request validation failed",
            error_code="VALIDATION_ERROR",
            correlation_id=correlation_id,
            request_id=request_id,
            timestamp=__import__('datetime').datetime.utcnow().isoformat(),
            path=request.url.path,
        ),
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions with proper logging and response."""
    correlation_id = get_correlation_id(request)
    request_id = get_request_id(request)
    
    error_type = type(exc).__name__
    error_message = str(exc)
    
    # Determine appropriate status code
    if isinstance(exc, ValueError):
        status_code = status.HTTP_400_BAD_REQUEST
        error_code = "BAD_REQUEST"
    elif isinstance(exc, PermissionError):
        status_code = status.HTTP_403_FORBIDDEN
        error_code = "PERMISSION_DENIED"
    elif isinstance(exc, FileNotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
        error_code = "NOT_FOUND"
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_code = "INTERNAL_ERROR"
    
    # Log with full context
    logger.error(
        "Unhandled exception",
        correlation_id=correlation_id,
        request_id=request_id,
        path=request.url.path,
        method=request.method,
        error_type=error_type,
        error_message=error_message,
        status_code=status_code,
        traceback=traceback.format_exc(),
    )
    
    # Send error response
    return JSONResponse(
        status_code=status_code,
        content=ErrorResponseSchema.create(
            status_code=status_code,
            detail=error_message if status_code >= 400 and status_code < 500 else "Internal server error",
            error_code=error_code,
            correlation_id=correlation_id,
            request_id=request_id,
            timestamp=__import__('datetime').datetime.utcnow().isoformat(),
            path=request.url.path,
        ),
    )


class HTTPExceptionHandler:
    """Handle FastAPI HTTPExceptions with correlation ID."""

    @staticmethod
    async def handler(request: Request, exc) -> JSONResponse:
        correlation_id = get_correlation_id(request)
        request_id = get_request_id(request)
        
        logger.warning(
            "HTTP exception",
            correlation_id=correlation_id,
            request_id=request_id,
            status_code=exc.status_code,
            detail=exc.detail,
            path=request.url.path,
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponseSchema.create(
                status_code=exc.status_code,
                detail=exc.detail,
                error_code=f"HTTP_{exc.status_code}",
                correlation_id=correlation_id,
                request_id=request_id,
                timestamp=__import__('datetime').datetime.utcnow().isoformat(),
                path=request.url.path,
            ),
            headers=exc.headers or {},
        )
