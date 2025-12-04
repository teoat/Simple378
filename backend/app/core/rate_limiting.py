"""
Rate limiting, request throttling, and quota management.
Implements token bucket algorithm with Redis backend for distributed systems.
"""
import time
import structlog
from typing import Dict, Optional, Tuple
import redis
from datetime import datetime, timedelta
import json

logger = structlog.get_logger(__name__)


class TokenBucketRateLimiter:
    """
    Token bucket rate limiter with Redis backend for distributed rate limiting.
    Allows burst traffic while maintaining average rate limits.
    """

    def __init__(
        self,
        redis_url: str,
        rate_limit: int = 100,  # requests
        window_seconds: int = 60,  # per minute
    ):
        """
        Initialize rate limiter.
        
        Args:
            redis_url: Redis connection URL
            rate_limit: Number of requests allowed
            window_seconds: Time window in seconds
        """
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.rate_limit = rate_limit
        self.window_seconds = window_seconds
        self.tokens_per_second = rate_limit / window_seconds

    async def is_allowed(
        self,
        identifier: str,
        tokens_requested: int = 1,
    ) -> Tuple[bool, Dict[str, int]]:
        """
        Check if request is allowed under rate limit.
        
        Args:
            identifier: User/client identifier
            tokens_requested: Number of tokens to consume
            
        Returns:
            (allowed: bool, info: dict with remaining, reset_at)
        """
        bucket_key = f"rate_limit:{identifier}"
        current_time = time.time()
        
        bucket_data = self.redis_client.get(bucket_key)
        
        if bucket_data:
            data = json.loads(bucket_data)
            last_refill = data.get("last_refill", current_time)
            tokens = data.get("tokens", self.rate_limit)
            
            # Calculate tokens to add since last refill
            time_passed = current_time - last_refill
            tokens_to_add = time_passed * self.tokens_per_second
            tokens = min(self.rate_limit, tokens + tokens_to_add)
        else:
            tokens = self.rate_limit
            last_refill = current_time
        
        # Check if request can be allowed
        allowed = tokens >= tokens_requested
        
        if allowed:
            tokens -= tokens_requested
        
        # Update bucket
        bucket_data = {
            "tokens": tokens,
            "last_refill": current_time,
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        self.redis_client.setex(
            bucket_key,
            self.window_seconds * 2,  # Keep data for 2x window
            json.dumps(bucket_data),
        )
        
        reset_at = int(current_time + self.window_seconds)
        
        info = {
            "allowed": allowed,
            "remaining": int(tokens),
            "reset_at": reset_at,
            "limit": self.rate_limit,
        }
        
        if not allowed:
            logger.warning(
                "Rate limit exceeded",
                identifier=identifier,
                tokens_requested=tokens_requested,
                remaining=int(tokens),
            )
        
        return allowed, info

    async def get_limit_info(self, identifier: str) -> Dict[str, int]:
        """Get current rate limit info without consuming tokens."""
        bucket_key = f"rate_limit:{identifier}"
        current_time = time.time()
        
        bucket_data = self.redis_client.get(bucket_key)
        
        if bucket_data:
            data = json.loads(bucket_data)
            last_refill = data.get("last_refill", current_time)
            tokens = data.get("tokens", self.rate_limit)
            
            time_passed = current_time - last_refill
            tokens_to_add = time_passed * self.tokens_per_second
            tokens = min(self.rate_limit, tokens + tokens_to_add)
        else:
            tokens = self.rate_limit
        
        reset_at = int(current_time + self.window_seconds)
        
        return {
            "remaining": int(tokens),
            "limit": self.rate_limit,
            "reset_at": reset_at,
        }


class QuotaManager:
    """
    Manages usage quotas for features (e.g., API calls, storage).
    Tracks quota usage with daily/monthly reset options.
    """

    def __init__(self, redis_url: str):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)

    async def allocate_quota(
        self,
        user_id: str,
        feature: str,
        quota_limit: int,
        reset_period: str = "daily",  # daily, monthly
    ) -> Dict[str, int]:
        """
        Allocate quota for user/feature.
        
        Args:
            user_id: User ID
            feature: Feature name
            quota_limit: Total quota available
            reset_period: When quota resets
            
        Returns:
            Quota info with remaining and reset time
        """
        quota_key = f"quota:{user_id}:{feature}:{reset_period}"
        
        # Calculate TTL based on reset period
        now = datetime.utcnow()
        if reset_period == "daily":
            next_reset = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0)
            ttl = int((next_reset - now).total_seconds())
        elif reset_period == "monthly":
            if now.month == 12:
                next_reset = now.replace(year=now.year + 1, month=1, day=1)
            else:
                next_reset = now.replace(month=now.month + 1, day=1)
            next_reset = next_reset.replace(hour=0, minute=0, second=0)
            ttl = int((next_reset - now).total_seconds())
        else:
            ttl = 3600
        
        # Initialize or retrieve quota
        quota_data = self.redis_client.get(quota_key)
        
        if quota_data:
            data = json.loads(quota_data)
            used = data.get("used", 0)
        else:
            used = 0
            self.redis_client.setex(
                quota_key,
                ttl,
                json.dumps({
                    "used": 0,
                    "limit": quota_limit,
                    "reset_period": reset_period,
                    "allocated_at": datetime.utcnow().isoformat(),
                }),
            )
        
        return {
            "used": used,
            "limit": quota_limit,
            "remaining": quota_limit - used,
            "reset_period": reset_period,
        }

    async def consume_quota(
        self,
        user_id: str,
        feature: str,
        amount: int = 1,
        reset_period: str = "daily",
    ) -> Tuple[bool, Dict[str, int]]:
        """
        Consume quota for user/feature.
        
        Args:
            user_id: User ID
            feature: Feature name
            amount: Amount to consume
            reset_period: Reset period
            
        Returns:
            (success: bool, quota_info: dict)
        """
        quota_key = f"quota:{user_id}:{feature}:{reset_period}"
        quota_data = self.redis_client.get(quota_key)
        
        if not quota_data:
            logger.warning(
                "Quota not found",
                user_id=user_id,
                feature=feature,
            )
            return False, {}
        
        data = json.loads(quota_data)
        used = data.get("used", 0)
        limit = data.get("limit", 0)
        
        if used + amount > limit:
            logger.warning(
                "Quota exceeded",
                user_id=user_id,
                feature=feature,
                requested=amount,
                remaining=limit - used,
            )
            return False, {
                "used": used,
                "limit": limit,
                "remaining": limit - used,
            }
        
        # Update quota
        data["used"] = used + amount
        ttl = self.redis_client.ttl(quota_key)
        
        self.redis_client.setex(
            quota_key,
            max(ttl, 60),  # Preserve TTL
            json.dumps(data),
        )
        
        return True, {
            "used": used + amount,
            "limit": limit,
            "remaining": limit - (used + amount),
        }


class DynamicThrottling:
    """
    Dynamically adjusts throttling based on system load.
    Implements adaptive rate limiting.
    """

    def __init__(self, redis_url: str):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.base_rate_limit = 100

    async def get_adaptive_rate_limit(
        self,
        identifier: str,
        system_load: float = 0.5,  # 0.0-1.0
    ) -> int:
        """
        Get rate limit adjusted by system load.
        
        Args:
            identifier: Client identifier
            system_load: Current system load (0.0-1.0)
            
        Returns:
            Adjusted rate limit
        """
        # Under high load (0.8+), reduce limits
        if system_load >= 0.8:
            reduction_factor = 0.5
        elif system_load >= 0.6:
            reduction_factor = 0.75
        else:
            reduction_factor = 1.0
        
        adjusted_limit = int(self.base_rate_limit * reduction_factor)
        
        logger.info(
            "Adaptive rate limit calculated",
            identifier=identifier,
            system_load=system_load,
            base_limit=self.base_rate_limit,
            adjusted_limit=adjusted_limit,
        )
        
        return adjusted_limit

    async def record_system_load(self, load: float) -> None:
        """Record current system load."""
        load_key = "system:load:current"
        self.redis_client.setex(
            load_key,
            60,  # Keep for 60 seconds
            json.dumps({
                "load": load,
                "recorded_at": datetime.utcnow().isoformat(),
            }),
        )

    async def get_system_load(self) -> float:
        """Get current recorded system load."""
        load_key = "system:load:current"
        data = self.redis_client.get(load_key)
        
        if data:
            return json.loads(data).get("load", 0.5)
        
        return 0.5


class BurstAllowance:
    """
    Allows controlled bursts above normal rate limits.
    Useful for handling traffic spikes from legitimate sources.
    """

    def __init__(self, redis_url: str):
        self.redis_client = redis.from_url(redis_url, decode_responses=True)

    async def grant_burst_allowance(
        self,
        identifier: str,
        burst_amount: int,
        duration_seconds: int = 300,  # 5 minutes
    ) -> Dict[str, int]:
        """
        Grant temporary burst allowance to identifier.
        
        Args:
            identifier: Client identifier
            burst_amount: Number of additional requests allowed
            duration_seconds: Duration of burst allowance
            
        Returns:
            Burst info
        """
        burst_key = f"burst:{identifier}"
        
        burst_data = {
            "amount": burst_amount,
            "granted_at": datetime.utcnow().isoformat(),
        }
        
        self.redis_client.setex(
            burst_key,
            duration_seconds,
            json.dumps(burst_data),
        )
        
        logger.info(
            "Burst allowance granted",
            identifier=identifier,
            burst_amount=burst_amount,
            duration_seconds=duration_seconds,
        )
        
        return burst_data

    async def consume_burst(
        self,
        identifier: str,
        amount: int = 1,
    ) -> Tuple[bool, int]:
        """
        Consume from burst allowance if available.
        
        Returns:
            (burst_available: bool, remaining_burst: int)
        """
        burst_key = f"burst:{identifier}"
        burst_data = self.redis_client.get(burst_key)
        
        if not burst_data:
            return False, 0
        
        data = json.loads(burst_data)
        remaining = data.get("amount", 0) - amount
        
        if remaining > 0:
            data["amount"] = remaining
            ttl = self.redis_client.ttl(burst_key)
            self.redis_client.setex(
                burst_key,
                max(ttl, 1),
                json.dumps(data),
            )
            return True, remaining
        else:
            self.redis_client.delete(burst_key)
            return False, 0
