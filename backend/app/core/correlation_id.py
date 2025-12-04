"""
Correlation ID and request tracking middleware.
Enables distributed tracing and better error debugging.
"""
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

logger = structlog.get_logger(__name__)

CORRELATION_ID_HEADER = "X-Correlation-ID"
REQUEST_ID_HEADER = "X-Request-ID"


class CorrelationIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware that ensures every request has a correlation ID for tracing.
    Propagates correlation ID through all downstream operations.
    """

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        # Get or create correlation ID
        correlation_id = request.headers.get(CORRELATION_ID_HEADER)
        if not correlation_id:
            correlation_id = str(uuid.uuid4())
        
        # Get or create request ID (unique per request)
        request_id = str(uuid.uuid4())
        
        # Store in request state for access in handlers
        request.state.correlation_id = correlation_id
        request.state.request_id = request_id
        
        # Log request
        logger.info(
            "Request started",
            method=request.method,
            path=request.url.path,
            correlation_id=correlation_id,
            request_id=request_id,
            client=request.client.host if request.client else "unknown",
        )
        
        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(
                "Request failed with exception",
                correlation_id=correlation_id,
                request_id=request_id,
                error=str(e),
                error_type=type(e).__name__,
            )
            raise
        
        # Add correlation ID to response headers
        response.headers[CORRELATION_ID_HEADER] = correlation_id
        response.headers[REQUEST_ID_HEADER] = request_id
        
        # Log response
        logger.info(
            "Request completed",
            correlation_id=correlation_id,
            request_id=request_id,
            status_code=response.status_code,
            method=request.method,
            path=request.url.path,
        )
        
        return response


def get_correlation_id(request: Request) -> str:
    """Extract correlation ID from request."""
    return getattr(request.state, "correlation_id", str(uuid.uuid4()))


def get_request_id(request: Request) -> str:
    """Extract request ID from request."""
    return getattr(request.state, "request_id", str(uuid.uuid4()))
