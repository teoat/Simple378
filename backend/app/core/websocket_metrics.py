"""
WebSocket metrics for Prometheus monitoring.

Tracks WebSocket connection metrics including:
- Total connections
- Active connections by user
- Connection errors
- Authentication failures
- Message throughput
"""
from prometheus_client import Counter, Gauge, Histogram
import time
from functools import wraps
from typing import Callable, Any


# Connection metrics
websocket_connections_total = Counter(
    'websocket_connections_total',
    'Total number of WebSocket connection attempts',
    ['status']  # 'success', 'auth_failed', 'invalid_token', 'user_not_found'
)

websocket_active_connections = Gauge(
    'websocket_active_connections',
    'Number of currently active WebSocket connections',
    ['user_id']
)

websocket_connection_duration = Histogram(
    'websocket_connection_duration_seconds',
    'Duration of WebSocket connections',
    buckets=[60, 300, 900, 1800, 3600, 7200, 14400]  # 1m, 5m, 15m, 30m, 1h, 2h, 4h
)

# Authentication metrics
websocket_auth_failures = Counter(
    'websocket_auth_failures_total',
    'Total number of WebSocket authentication failures',
    ['reason']  # 'no_token', 'blacklisted', 'invalid', 'expired', 'user_not_found'
)

websocket_auth_latency = Histogram(
    'websocket_auth_latency_seconds',
    'Time taken to authenticate WebSocket connection',
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]
)

# Message metrics
websocket_messages_sent = Counter(
    'websocket_messages_sent_total',
    'Total number of messages sent via WebSocket',
    ['message_type']
)

websocket_messages_received = Counter(
    'websocket_messages_received_total',
    'Total number of messages received via WebSocket'
)

# Error metrics
websocket_errors_total = Counter(
    'websocket_errors_total',
    'Total number of WebSocket errors',
    ['error_type']
)


class WebSocketMetrics:
    """Context manager for tracking WebSocket connection metrics."""
    
    def __init__(self, user_id: str = None):
        self.user_id = user_id
        self.start_time = None
        self.auth_start_time = None
    
    def start_auth(self):
        """Start tracking authentication time."""
        self.auth_start_time = time.time()
    
    def end_auth_success(self):
        """Record successful authentication."""
        if self.auth_start_time:
            latency = time.time() - self.auth_start_time
            websocket_auth_latency.observe(latency)
    
    def record_auth_failure(self, reason: str):
        """Record authentication failure."""
        websocket_auth_failures.labels(reason=reason).inc()
        websocket_connections_total.labels(status='auth_failed').inc()
    
    def __enter__(self):
        """Start connection tracking."""
        self.start_time = time.time()
        if self.user_id:
            websocket_active_connections.labels(user_id=self.user_id).inc()
            websocket_connections_total.labels(status='success').inc()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """End connection tracking."""
        if self.start_time and self.user_id:
            duration = time.time() - self.start_time
            websocket_connection_duration.observe(duration)
            websocket_active_connections.labels(user_id=self.user_id).dec()
        return False


def track_message(message_type: str):
    """Decorator to track WebSocket message sending."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            result = await func(*args, **kwargs)
            websocket_messages_sent.labels(message_type=message_type).inc()
            return result
        return wrapper
    return decorator


def track_error(error_type: str):
    """Record a WebSocket error."""
    websocket_errors_total.labels(error_type=error_type).inc()
