"""
Redis Caching Service for Simple378

Provides:
- Async Redis connection management
- Caching decorator for functions
- TTL-based cache invalidation
- Graceful degradation if Redis unavailable
"""

import redis.asyncio as redis
from functools import wraps
import json
from typing import Optional, Any, Callable
import structlog
from app.core.config import settings

logger = structlog.get_logger()


class CacheService:
    """Redis-based caching service with async support"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self._connected = False
    
    async def connect(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = await redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            # Test connection
            await self.redis_client.ping()
            self._connected = True
            logger.info("Redis cache connected", url=settings.REDIS_URL)
        except Exception as e:
            logger.warning("Redis connection failed, caching disabled", error=str(e))
            self.redis_client = None
            self._connected = False
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/error
        """
        if not self._connected or not self.redis_client:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except json.JSONDecodeError:
            logger.error("Cache JSON decode error", key=key)
            return None
        except Exception as e:
            logger.error("Cache get error", key=key, error=str(e))
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 300):
        """
        Set value in cache with TTL
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default 5 minutes)
        """
        if not self._connected or not self.redis_client:
            return
        
        try:
            serialized = json.dumps(value, default=str)
            await self.redis_client.setex(key, ttl, serialized)
        except Exception as e:
            logger.error("Cache set error", key=key, error=str(e))
    
    async def delete(self, key: str):
        """Delete key from cache"""
        if not self._connected or not self.redis_client:
            return
        
        try:
            await self.redis_client.delete(key)
        except Exception as e:
            logger.error("Cache delete error", key=key, error=str(e))
    
    async def delete_pattern(self, pattern: str):
        """
        Delete all keys matching pattern
        
        Args:
            pattern: Redis key pattern (e.g., "viz:*")
        """
        if not self._connected or not self.redis_client:
            return
        
        try:
            async for key in self.redis_client.scan_iter(match=pattern):
                await self.redis_client.delete(key)
        except Exception as e:
            logger.error("Cache pattern delete error", pattern=pattern, error=str(e))
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
            self._connected = False
            logger.info("Redis cache disconnected")


# Global cache instance
cache = CacheService()


def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator for caching async function results
    
    Args:
        ttl: Cache TTL in seconds (default 5 minutes)
        key_prefix: Prefix for cache keys (recommended for organization)
    
    Example:
        @cached(ttl=60, key_prefix="viz")
        async def get_dashboard_metrics(db: AsyncSession):
            # Expensive query
            return await db.execute(...)
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and args
            # Note: Only use hashable args for key generation
            try:
                args_str = json.dumps([str(a) for a in args], sort_keys=True)
                kwargs_str = json.dumps({k: str(v) for k, v in kwargs.items()}, sort_keys=True)
                cache_key = f"{key_prefix}:{func.__name__}:{args_str}:{kwargs_str}"
            except Exception:
                # If key generation fails, execute without caching
                logger.warning("Cache key generation failed, executing without cache", func=func.__name__)
                return await func(*args, **kwargs)
            
            # Try to get from cache
            cached_value = await cache.get(cache_key)
            if cached_value is not None:
                logger.debug("Cache hit", key=cache_key, func=func.__name__)
                return cached_value
            
            # Cache miss - execute function
            logger.debug("Cache miss", key=cache_key, func=func.__name__)
            result = await func(*args, **kwargs)
            
            # Cache the result
            await cache.set(cache_key, result, ttl)
            
            return result
        
        # Add cache management methods to the wrapper
        wrapper.cache_key_prefix = f"{key_prefix}:{func.__name__}"
        
        async def invalidate_cache():
            """Invalidate all cached values for this function"""
            await cache.delete_pattern(f"{wrapper.cache_key_prefix}:*")
        
        wrapper.invalidate_cache = invalidate_cache
        
        return wrapper
    return decorator


# Convenience function for manual caching
async def get_or_set(
    key: str,
    factory: Callable,
    ttl: int = 300
) -> Any:
    """
    Get from cache or compute and cache
    
    Args:
        key: Cache key
        factory: Async function to compute value if not cached
        ttl: Cache TTL in seconds
    
    Returns:
        Cached or computed value
    """
    # Try cache first
    cached_value = await cache.get(key)
    if cached_value is not None:
        return cached_value
    
    # Compute value
    value = await factory()
    
    # Cache it
    await cache.set(key, value, ttl)
    
    return value
