"""
Cache control utilities for HTTP response headers
Provides functions to set proper Cache-Control, ETag, and related headers

Part of Phase 2 Integration Improvements
"""
from typing import Optional, Any
from fastapi import Response
import hashlib
import json


def set_cache_headers(
    response: Response,
    max_age: int = 300,  # seconds
    is_public: bool = False,
    must_revalidate: bool = False,
    private: bool = True,
    no_store: bool = False,
) -> Response:
    """
    Set appropriate cache headers on response
    
    Args:
        response: FastAPI Response object
        max_age: How long to cache (seconds)
        is_public: If True, can be cached by proxies
        must_revalidate: If True, must validate before using stale copy
        private: If True, only browser can cache (not proxies)
        no_store: If True, response should never be stored
    
    Returns:
        The response object with cache headers set
    """
    if no_store:
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        return response
    
    directives = []
    
    if is_public:
        directives.append("public")
    elif private:
        directives.append("private")
    
    directives.append(f"max-age={max_age}")
    
    if must_revalidate:
        directives.append("must-revalidate")
    
    response.headers["Cache-Control"] = ", ".join(directives)
    return response


def generate_etag(data: Any) -> str:
    """
    Generate ETag for response body
    
    Args:
        data: The data to generate ETag for (dict, str, or any serializable object)
    
    Returns:
        ETag string in quoted format
    """
    if isinstance(data, dict):
        data = json.dumps(data, sort_keys=True, default=str)
    elif not isinstance(data, str):
        data = str(data)
    
    return f'"{hashlib.md5(data.encode()).hexdigest()}"'


def add_etag(response: Response, data: Any) -> Response:
    """
    Add ETag header to response
    
    Args:
        response: FastAPI Response object
        data: The response data to generate ETag from
    
    Returns:
        The response object with ETag header set
    """
    etag = generate_etag(data)
    response.headers["ETag"] = etag
    return response


def check_etag_match(request_etag: Optional[str], data: Any) -> bool:
    """
    Check if the request ETag matches the data ETag
    
    Args:
        request_etag: ETag from If-None-Match header
        data: The data to compare against
    
    Returns:
        True if ETags match (304 can be returned), False otherwise
    """
    if not request_etag:
        return False
    
    # Handle weak ETags (W/"...")
    request_etag = request_etag.strip()
    if request_etag.startswith('W/'):
        request_etag = request_etag[2:]
    
    current_etag = generate_etag(data)
    return request_etag == current_etag


def set_no_cache(response: Response) -> Response:
    """
    Set headers to prevent caching entirely
    
    Args:
        response: FastAPI Response object
    
    Returns:
        The response object with no-cache headers set
    """
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


def set_immutable_cache(response: Response, max_age: int = 31536000) -> Response:
    """
    Set headers for immutable resource (1 year default)
    Use for versioned static assets
    
    Args:
        response: FastAPI Response object
        max_age: Cache duration in seconds (default 1 year)
    
    Returns:
        The response object with immutable cache headers set
    """
    response.headers["Cache-Control"] = f"public, max-age={max_age}, immutable"
    return response


# Cache duration presets for different resource types
CACHE_PRESETS = {
    "health": {"max_age": 30, "is_public": False},
    "dashboard": {"max_age": 60, "is_public": False},
    "case_list": {"max_age": 120, "is_public": False, "must_revalidate": True},
    "case_detail": {"max_age": 300, "is_public": False},
    "static": {"max_age": 86400, "is_public": True},
    "immutable": {"max_age": 31536000, "is_public": True},
    "no_cache": {"no_store": True},
}


def apply_cache_preset(response: Response, preset: str, data: Any = None) -> Response:
    """
    Apply a predefined cache configuration
    
    Args:
        response: FastAPI Response object
        preset: Name of the preset (health, dashboard, case_list, etc.)
        data: Optional data for ETag generation
    
    Returns:
        The response object with cache headers set
    """
    if preset not in CACHE_PRESETS:
        raise ValueError(f"Unknown cache preset: {preset}")
    
    config = CACHE_PRESETS[preset]
    set_cache_headers(response, **config)
    
    if data is not None and preset != "no_cache":
        add_etag(response, data)
    
    return response
