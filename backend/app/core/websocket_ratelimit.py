"""
Rate limiting for WebSocket connections.

Prevents abuse by limiting connection attempts per user/IP.
"""
import time
from typing import Dict, Tuple
from datetime import datetime, timedelta
import structlog

logger = structlog.get_logger()


class RateLimiter:
    """
    Token bucket rate limiter for WebSocket connections.
    
    Tracks connection attempts per user_id and per IP address.
    """
    
    def __init__(
        self,
        max_connections_per_user: int = 5,
        max_attempts_per_ip: int = 10,
        window_seconds: int = 60
    ):
        """
        Initialize rate limiter.
        
        Args:
            max_connections_per_user: Maximum simultaneous connections per user
            max_attempts_per_ip: Maximum connection attempts per IP in window
            window_seconds: Time window for rate limiting
        """
        self.max_connections_per_user = max_connections_per_user
        self.max_attempts_per_ip = max_attempts_per_ip
        self.window_seconds = window_seconds
        
        # Track: user_id -> (connection_count, last_reset)
        self.user_connections: Dict[str, int] = {}
        
        # Track: ip_address -> [(timestamp1, timestamp2, ...)]
        self.ip_attempts: Dict[str, list] = {}
    
    def check_user_limit(self, user_id: str) -> Tuple[bool, str]:
        """
        Check if user has reached connection limit.
        
        Returns:
            (allowed: bool, reason: str)
        """
        current_count = self.user_connections.get(user_id, 0)
        
        if current_count >= self.max_connections_per_user:
            logger.warning(
                "WebSocket connection rejected: user connection limit reached",
                user_id=user_id,
                current_count=current_count,
                limit=self.max_connections_per_user
            )
            return False, f"Connection limit reached ({current_count}/{self.max_connections_per_user})"
        
        return True, ""
    
    def check_ip_limit(self, ip_address: str) -> Tuple[bool, str]:
        """
        Check if IP has exceeded connection attempt rate.
        
        Returns:
            (allowed: bool, reason: str)
        """
        now = time.time()
        window_start = now - self.window_seconds
        
        # Get recent attempts for this IP
        if ip_address not in self.ip_attempts:
            self.ip_attempts[ip_address] = []
        
        # Remove old attempts outside the window
        self.ip_attempts[ip_address] = [
            ts for ts in self.ip_attempts[ip_address]
            if ts > window_start
        ]
        
        attempt_count = len(self.ip_attempts[ip_address])
        
        if attempt_count >= self.max_attempts_per_ip:
            logger.warning(
                "WebSocket connection rejected: IP rate limit exceeded",
                ip_address=ip_address,
                attempts=attempt_count,
                limit=self.max_attempts_per_ip,
                window_seconds=self.window_seconds
            )
            return False, f"Rate limit exceeded ({attempt_count}/{self.max_attempts_per_ip} in {self.window_seconds}s)"
        
        # Record this attempt
        self.ip_attempts[ip_address].append(now)
        
        return True, ""
    
    def increment_user_connections(self, user_id: str):
        """Increment connection count for user."""
        self.user_connections[user_id] = self.user_connections.get(user_id, 0) + 1
        logger.debug(
            "User connection count incremented",
            user_id=user_id,
            count=self.user_connections[user_id]
        )
    
    def decrement_user_connections(self, user_id: str):
        """Decrement connection count for user."""
        if user_id in self.user_connections:
            self.user_connections[user_id] -= 1
            if self.user_connections[user_id] <= 0:
                del self.user_connections[user_id]
            logger.debug(
                "User connection count decremented",
                user_id=user_id,
                count=self.user_connections.get(user_id, 0)
            )
    
    def get_stats(self) -> Dict:
        """Get current rate limiter statistics."""
        return {
            "total_users_connected": len(self.user_connections),
            "total_ips_tracked": len(self.ip_attempts),
            "max_connections_per_user": self.max_connections_per_user,
            "max_attempts_per_ip": self.max_attempts_per_ip,
            "window_seconds": self.window_seconds
        }


# Global rate limiter instance
rate_limiter = RateLimiter(
    max_connections_per_user=5,
    max_attempts_per_ip=20,
    window_seconds=60
)
