"""
Cache control utilities for HTTP response headers
"""
from typing import Any
from fastapi import Response
import hashlib
import json

def set_cache_headers(
    response: Response,
    max_age: int = 300,  # seconds
    is_public: bool = False,
    must_revalidate: bool = False
) -> Response:
    """
    Set appropriate cache headers on response
    
    Args:
        response: FastAPI Response object
        max_age: How long to cache (seconds)
        is_public: If True, can be cached by proxies
        must_revalidate: If True, must validate before using stale copy
    """
    cache_control = f"max-age={max_age}"
    
    if is_public:
        cache_control = f"public, {cache_control}"
    else:
        cache_control = f"private, {cache_control}"
    
    if must_revalidate:
        cache_control += ", must-revalidate"
    
    response.headers["Cache-Control"] = cache_control
    return response

def generate_etag(data: Any) -> str:
    """
    Generate ETag for response body
    """
    if isinstance(data, dict):
        data = json.dumps(data, sort_keys=True, default=str)
    elif not isinstance(data, str):
        data = str(data)
    
    return f'"{hashlib.md5(data.encode()).hexdigest()}"'

def add_etag(response: Response, data: Any) -> Response:
    """
    Add ETag header to response
    """
    etag = generate_etag(data)
    response.headers["ETag"] = etag
    return response
