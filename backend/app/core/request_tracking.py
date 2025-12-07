"""
Request ID middleware for request tracking and correlation
Implements X-Request-ID header injection for full request lifecycle visibility
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
from uuid import uuid4
import structlog

logger = structlog.get_logger()


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add request ID to all requests and responses

    Benefits:
    - Request tracking across services
    - Log correlation
    - Error tracing
    - Performance monitoring per request
    """

    async def dispatch(self, request: Request, call_next: Callable):
        # Get request ID from header or generate new one
        request_id = request.headers.get("x-request-id", str(uuid4()))

        # Store in request state for use in handlers
        request.state.request_id = request_id

        # Add to request context for logging
        import contextvars

        request_context = contextvars.ContextVar("request_id")
        request_context.set(request_id)

        # Process request
        response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for enhanced error handling and logging

    Features:
    - Exception catching with request context
    - Structured error logging
    - Consistent error response format
    - Error metrics collection
    """

    async def dispatch(self, request: Request, call_next: Callable):
        try:
            response = await call_next(request)

            # Log successful requests with slow threshold
            if hasattr(request.state, "request_time"):
                duration = request.state.request_time
                if duration > 1.0:  # Log if > 1 second
                    logger.warning(
                        "slow_request",
                        path=request.url.path,
                        method=request.method,
                        duration_ms=duration * 1000,
                        request_id=getattr(request.state, "request_id", "unknown"),
                    )

            return response

        except Exception as e:
            logger.error(
                "request_exception",
                path=request.url.path,
                method=request.method,
                exception=str(e),
                request_id=getattr(request.state, "request_id", "unknown"),
                exc_info=True,
            )
            raise
