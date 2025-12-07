import structlog
import time
from prometheus_client import Counter, Histogram, Gauge
from contextlib import contextmanager

logger = structlog.get_logger()

# --- Metrics ---

# HTTP Metrics
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status"],
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
)

HTTP_REQUESTS_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "Number of HTTP requests currently in progress",
    ["method", "endpoint"],
)

# Database Metrics
DB_CONNECTION_POOL_SIZE = Gauge(
    "db_connection_pool_size", "Number of database connections in pool"
)

DB_QUERY_DURATION_SECONDS = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["operation", "table"],
)

# Cache Metrics
CACHE_HITS_TOTAL = Counter(
    "cache_hits_total", "Total number of cache hits", ["cache_type"]
)

CACHE_MISSES_TOTAL = Counter(
    "cache_misses_total", "Total number of cache misses", ["cache_type"]
)

# ML/AI Metrics
AI_PREDICTION_DURATION_SECONDS = Histogram(
    "ai_prediction_duration_seconds", "AI prediction duration", ["model", "task"]
)

AI_TOKEN_USAGE_TOTAL = Counter(
    "ai_token_usage_total",
    "Total AI tokens used",
    ["model", "type"],  # type: input, output
)

# --- Sentry ---


def setup_sentry(dsn: str, environment: str = "production"):
    """Initialize Sentry SDK with integrations"""
    if not dsn:
        logger.warning("Sentry DSN not provided, skipping initialization")
        return

    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        from sentry_sdk.integrations.redis import RedisIntegration

        sentry_sdk.init(
            dsn=dsn,
            environment=environment,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
                RedisIntegration(),
            ],
            traces_sample_rate=0.1 if environment == "production" else 1.0,
            profiles_sample_rate=0.1 if environment == "production" else 1.0,
        )
        logger.info("Sentry initialized successfully")
    except ImportError:
        logger.error("Sentry SDK not installed")
    except Exception as e:
        logger.error("Failed to initialize Sentry", error=str(e))


# --- Helpers ---


@contextmanager
def track_time(histogram: Histogram, **labels):
    """Context manager to track duration in a Prometheus histogram"""
    start_time = time.time()
    try:
        yield
    finally:
        duration = time.time() - start_time
        histogram.labels(**labels).observe(duration)
