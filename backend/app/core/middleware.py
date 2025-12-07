from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        # Improved CSP - removed unsafe-inline and unsafe-eval for better security
        # Note: If inline scripts/styles are needed, use nonces or hashes
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        return response


class RateLimitHeadersMiddleware(BaseHTTPMiddleware):
    """Add rate limit headers to responses"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Add rate limit headers if available from slowapi
        if hasattr(request.state, "view_rate_limit"):
            try:
                limit = request.state.view_rate_limit
                # Handle case where limit might be a tuple or unexpected type
                if hasattr(limit, "limit") and hasattr(limit.limit, "amount"):
                    response.headers["X-RateLimit-Limit"] = str(limit.limit.amount)
                    response.headers["X-RateLimit-Remaining"] = str(limit.remaining)
                    response.headers["X-RateLimit-Reset"] = str(limit.reset_time)
            except Exception:
                # Fail silently for rate limit headers to avoid breaking the request
                pass

        return response
