"""
Cache control utilities for HTTP response headers
"""

from typing import Any, Dict
from fastapi import Response, Request, HTTPException, status
import hashlib
import json

CACHE_PRESETS: Dict[str, Dict[str, Any]] = {
    "no_store": {"max_age": 0, "must_revalidate": True},
    "zero": {"max_age": 0, "must_revalidate": True},
    "short": {"max_age": 60, "must_revalidate": True},
    "default": {"max_age": 300, "must_revalidate": False},
    "long": {"max_age": 3600, "must_revalidate": False},
    "case_list": {"max_age": 30, "must_revalidate": True},
}


def set_cache_headers(
    response: Response,
    max_age: int = 300,  # seconds
    is_public: bool = False,
    must_revalidate: bool = False,
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


def set_no_cache(response: Response) -> None:
    """Set headers to prevent caching"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"


def apply_cache_preset(response: Response, preset_name: str) -> None:
    """Apply a predefined cache preset"""
    preset = CACHE_PRESETS.get(preset_name, CACHE_PRESETS["default"])
    set_cache_headers(response, **preset)


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


def check_etag_match(request: Request, data: Any) -> None:
    """
    Check if If-None-Match header matches current ETag.
    If match, raise 304 Not Modified.
    """
    if_none_match = request.headers.get("if-none-match")
    if not if_none_match:
        return

    current_etag = generate_etag(data)
    if if_none_match == current_etag:
        raise HTTPException(
            status_code=status.HTTP_304_NOT_MODIFIED, detail="Not Modified"
        )
