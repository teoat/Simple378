from slowapi import Limiter
from slowapi.util import get_remote_address

# Create rate limiter instance
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

def get_limiter():
    """Get the rate limiter instance"""
    return limiter
