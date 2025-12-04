from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
from typing import Callable


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
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
