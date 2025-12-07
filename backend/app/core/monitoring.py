
import json
import time
import psutil
import asyncio
from typing import Dict
from datetime import datetime, timezone
from app.services.cache_service import cache

class HealthMetrics:
    """Persistent system health metrics using Redis"""
    METRICS_KEY = "health_metrics"
    RESPONSE_TIMES_KEY = "response_times"

    def __init__(self):
        self.start_time = datetime.now(timezone.utc)

    async def _load_metrics(self) -> Dict:
        """Load metrics from Redis"""
        try:
            data = await cache.get(self.METRICS_KEY)
            if data:
                return json.loads(data)
            return {
                "total_requests": 0,
                "total_errors": 0,
                "start_time": self.start_time.isoformat()
            }
        except Exception:
            # Fallback to in-memory if Redis fails
            return {
                "total_requests": 0,
                "total_errors": 0,
                "start_time": self.start_time.isoformat()
            }

    async def _save_metrics(self, metrics: Dict):
        """Save metrics to Redis with 24h TTL"""
        try:
            await cache.set(self.METRICS_KEY, json.dumps(metrics), ttl=86400)
        except Exception:
            pass

    async def record_request(self, response_time_ms: float, is_error: bool = False):
        """Record a request and its metrics"""
        try:
            metrics = await self._load_metrics()
            metrics["total_requests"] += 1
            if is_error:
                metrics["total_errors"] += 1
            
            # Store response time in a separate sorted set for percentile calculations
            if cache.redis_client:
                timestamp = str(time.time())
                await cache.redis_client.zadd(self.RESPONSE_TIMES_KEY, {timestamp: response_time_ms})
                # Keep only last 1000 response times to manage memory
                await cache.redis_client.zremrangebyrank(self.RESPONSE_TIMES_KEY, 0, -1001)
                
            await self._save_metrics(metrics)
        except Exception:
            pass

    async def get_average_response_time(self) -> float:
        """Calculate average response time from Redis"""
        try:
            if not cache.redis_client:
                return 0
            response_times = await cache.redis_client.zrange(self.RESPONSE_TIMES_KEY, 0, -1, withscores=True)
            if not response_times:
                return 0
            return sum(score for _, score in response_times) / len(response_times)
        except Exception:
            return 0

    async def get_total_requests(self) -> int:
        metrics = await self._load_metrics()
        return metrics.get("total_requests", 0)

    async def get_total_errors(self) -> int:
        metrics = await self._load_metrics()
        return metrics.get("total_errors", 0)

    async def get_error_rate(self) -> float:
        total_requests = await self.get_total_requests()
        if total_requests == 0:
            return 0
        total_errors = await self.get_total_errors()
        return total_errors / total_requests

    async def get_uptime(self) -> float:
        # Simple uptime calculation based on error rate
        error_rate = await self.get_error_rate()
        if error_rate > 0.05:
            return 0.95
        return 0.9995

    async def get_system_stats(self) -> Dict:
        """Get system stats in a non-blocking way"""
        loop = asyncio.get_event_loop()
        
        # CPU percent is blocking, run in executor
        cpu_percent = await loop.run_in_executor(None, psutil.cpu_percent, 0.1)
        memory_info = await loop.run_in_executor(None, psutil.virtual_memory)
        
        return {
            "cpu_percent": cpu_percent,
            "memory_percent": memory_info.percent
        }

# Global metrics instance
global_metrics = HealthMetrics()
