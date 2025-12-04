from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from typing import Callable
import structlog

from app.core.config import settings

logger = structlog.get_logger()


class FileSizeLimitMiddleware(BaseHTTPMiddleware):
    """Enforce file size limits on uploads to prevent DoS attacks."""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Check if this is a file upload request
        if request.method == "POST" and "multipart/form-data" in request.headers.get("content-type", ""):
            content_length = request.headers.get("content-length")
            
            if content_length:
                file_size_mb = int(content_length) / (1024 * 1024)
                max_size_mb = settings.MAX_UPLOAD_FILE_SIZE_MB
                
                if file_size_mb > max_size_mb:
                    logger.warning(
                        "File upload rejected - size limit exceeded",
                        file_size_mb=file_size_mb,
                        max_size_mb=max_size_mb,
                        path=request.url.path
                    )
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File size ({file_size_mb:.2f} MB) exceeds maximum allowed size ({max_size_mb} MB)"
                    )
        
        response = await call_next(request)
        return response
