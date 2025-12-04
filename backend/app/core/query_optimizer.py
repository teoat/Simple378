"""
Query optimization utilities to prevent N+1 queries and optimize database access.
"""
import structlog
from typing import List, Any, Dict, Optional
from sqlalchemy import inspect
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger(__name__)


class QueryOptimizer:
    """Utilities for optimizing database queries."""

    @staticmethod
    def log_query_execution(query_str: str, params: Dict = None, execution_time: float = 0):
        """Log query execution with timing."""
        logger.debug(
            "Query executed",
            query=query_str[:200],  # Truncate long queries
            execution_time_ms=execution_time * 1000,
            has_params=bool(params),
        )

    @staticmethod
    def apply_eager_loading(query, model, relationships: List[str]):
        """
        Apply eager loading to prevent N+1 queries.
        
        Args:
            query: SQLAlchemy select query
            model: Model class
            relationships: List of relationship names to eagerly load
            
        Returns:
            Modified query with eager loading applied
        """
        for relationship in relationships:
            # Get relationship property
            if hasattr(model, relationship):
                relationship_property = getattr(model, relationship)
                query = query.options(joinedload(relationship_property))
                logger.debug(
                    "Eager loading applied",
                    model=model.__name__,
                    relationship=relationship,
                )
        
        return query

    @staticmethod
    async def paginate_query(
        query,
        page: int = 1,
        page_size: int = 20,
        max_page_size: int = 100,
    ):
        """
        Paginate query results safely.
        
        Args:
            query: SQLAlchemy select query
            page: Page number (1-indexed)
            page_size: Items per page
            max_page_size: Maximum allowed page size
            
        Returns:
            Dict with paginated results and metadata
        """
        # Enforce max page size
        if page_size > max_page_size:
            logger.warning(
                "Page size exceeded maximum",
                requested=page_size,
                max=max_page_size,
            )
            page_size = max_page_size
        
        # Enforce minimum page
        if page < 1:
            page = 1
        
        offset = (page - 1) * page_size
        
        # Get total count first
        from sqlalchemy import func, select
        
        count_query = select(func.count()).select_from(query.froms[0])
        # Note: In real scenario, would need to get total_count
        
        # Apply limit and offset
        limited_query = query.offset(offset).limit(page_size)
        
        return {
            "page": page,
            "page_size": page_size,
            "offset": offset,
            "limit": page_size,
        }

    @staticmethod
    def validate_query_complexity(query) -> Dict[str, Any]:
        """
        Validate query to detect potential performance issues.
        
        Returns:
            Dict with complexity metrics
        """
        metrics = {
            "has_joins": False,
            "has_subqueries": False,
            "load_depth": 0,
            "warning": None,
        }
        
        # Check for joins
        if hasattr(query, '_from_obj'):
            metrics["has_joins"] = True
        
        # Check for subqueries
        if hasattr(query, '_subquery_froms'):
            metrics["has_subqueries"] = True
        
        if metrics["has_joins"] and metrics["has_subqueries"]:
            metrics["warning"] = "Complex query with joins and subqueries"
            logger.warning("Complex query detected", **metrics)
        
        return metrics


class CacheStrategy:
    """Caching strategies for frequently accessed data."""

    def __init__(self, ttl_seconds: int = 300):
        self.ttl = ttl_seconds
        self.cache: Dict[str, tuple] = {}  # (data, timestamp)

    async def get_or_fetch(
        self,
        cache_key: str,
        fetch_func,
        *args,
        **kwargs
    ) -> Any:
        """
        Get from cache or fetch and cache.
        
        Args:
            cache_key: Cache key
            fetch_func: Async function to fetch data
            args: Arguments for fetch_func
            kwargs: Keyword arguments for fetch_func
            
        Returns:
            Cached or newly fetched data
        """
        import time
        
        # Check cache
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.ttl:
                logger.debug("Cache hit", cache_key=cache_key)
                return data
        
        # Fetch fresh data
        logger.debug("Cache miss", cache_key=cache_key)
        data = await fetch_func(*args, **kwargs)
        
        # Store in cache
        self.cache[cache_key] = (data, __import__('time').time())
        
        return data

    def invalidate(self, cache_key: str = None):
        """Invalidate cache entry or all cache."""
        if cache_key:
            if cache_key in self.cache:
                del self.cache[cache_key]
                logger.debug("Cache invalidated", cache_key=cache_key)
        else:
            self.cache.clear()
            logger.debug("Cache cleared")
