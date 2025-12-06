from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Any, Dict, Optional

class AppException(Exception):
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
    ):
        self.status_code = status_code
        self.detail = detail
        self.headers = headers

class NotFoundException(AppException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class PermissionDeniedException(AppException):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=exc.headers,
        )
    
    # Log unknown exceptions here (logging setup will handle this)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"},
    )
