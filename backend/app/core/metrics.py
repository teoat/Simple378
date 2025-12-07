"""
Application metrics and performance monitoring.

Instruments FastAPI application with Prometheus metrics for:
- Request rate, latency, and errors (RED metrics)
- Business metrics (adjudication, alerts, processing)
- Resource utilization
"""

from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
)
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from time import time
from typing import Callable
import psutil
import os

# ============================================
# HTTP Metrics (RED)
# ============================================

http_requests_total = Counter(
    "http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)

http_request_size_bytes = Histogram(
    "http_request_size_bytes", "HTTP request size in bytes", ["method", "endpoint"]
)

http_response_size_bytes = Histogram(
    "http_response_size_bytes", "HTTP response size in bytes", ["method", "endpoint"]
)

# ============================================
# Business Metrics
# ============================================

adjudication_decisions_total = Counter(
    "adjudication_decisions_total",
    "Total adjudication decisions",
    ["decision_type", "analyst_id"],
)

adjudication_decision_duration_seconds = Histogram(
    "adjudication_decision_duration_seconds",
    "Time from alert creation to decision",
    buckets=[60, 300, 600, 1800, 3600, 7200, 14400],  # 1min to 4hrs
)

adjudication_queue_depth = Gauge(
    "adjudication_queue_depth", "Number of alerts pending adjudication"
)

alerts_created_total = Counter(
    "alerts_created_total", "Total alerts created", ["risk_level", "alert_type"]
)

document_analysis_total = Counter(
    "document_analysis_total", "Total documents analyzed", ["status"]
)

document_analysis_duration_seconds = Histogram(
    "document_analysis_duration_seconds",
    "Document forensic analysis duration",
    buckets=[1, 5, 10, 30, 60, 120, 300],
)

entity_resolution_total = Counter(
    "entity_resolution_total", "Total entity resolutions performed"
)

# ============================================
# Database Metrics
# ============================================

database_query_duration_seconds = Histogram(
    "database_query_duration_seconds",
    "Database query execution time",
    ["query_type"],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0],
)

database_connections_active = Gauge(
    "database_connections_active", "Active database connections"
)

# ============================================
# WebSocket Metrics
# ============================================

websocket_connections_active = Gauge(
    "websocket_connections_active", "Active WebSocket connections"
)

websocket_messages_sent_total = Counter(
    "websocket_messages_sent_total", "Total WebSocket messages sent", ["message_type"]
)

# ============================================
# Event Sourcing Metrics
# ============================================

events_created_total = Counter(
    "events_created_total", "Total events created", ["event_type", "aggregate_type"]
)

# ============================================
# System Metrics
# ============================================

process_cpu_usage_percent = Gauge(
    "process_cpu_usage_percent", "Process CPU usage percentage"
)

process_memory_bytes = Gauge("process_memory_bytes", "Process memory usage in bytes")

process_open_fds = Gauge("process_open_fds", "Number of open file descriptors")

# ============================================
# Metrics Middleware
# ============================================


class PrometheusMiddleware(BaseHTTPMiddleware):
    """
    Middleware to instrument FastAPI with Prometheus metrics.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip metrics endpoint to avoid recursion
        if request.url.path == "/metrics":
            return await call_next(request)

        method = request.method
        endpoint = request.url.path

        # Normalize endpoint path (remove UUIDs)
        endpoint = self._normalize_endpoint(endpoint)

        # Track request size
        content_length = request.headers.get("content-length", 0)
        http_request_size_bytes.labels(method=method, endpoint=endpoint).observe(
            int(content_length)
        )

        # Time the request
        start_time = time()

        try:
            response = await call_next(request)
            status = response.status_code

            # Track response size
            if hasattr(response, "body"):
                http_response_size_bytes.labels(
                    method=method, endpoint=endpoint
                ).observe(len(response.body))

        except Exception:
            status = 500
            raise
        finally:
            # Record metrics
            duration = time() - start_time

            http_requests_total.labels(
                method=method, endpoint=endpoint, status=status
            ).inc()

            http_request_duration_seconds.labels(
                method=method, endpoint=endpoint
            ).observe(duration)

        return response

    @staticmethod
    def _normalize_endpoint(path: str) -> str:
        """Normalize endpoint path by replacing UUIDs with placeholders."""
        import re

        # Replace UUID patterns
        path = re.sub(
            r"/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
            "/{id}",
            path,
        )
        # Replace numeric IDs
        path = re.sub(r"/\d+", "/{id}", path)
        return path


# ============================================
# System Metrics Collector
# ============================================


def collect_system_metrics():
    """Collect system-level metrics."""
    process = psutil.Process(os.getpid())

    # CPU usage
    cpu_percent = process.cpu_percent(interval=0.1)
    process_cpu_usage_percent.set(cpu_percent)

    # Memory usage
    memory_info = process.memory_info()
    process_memory_bytes.set(memory_info.rss)

    # Open file descriptors (Unix only)
    try:
        process_open_fds.set(process.num_fds())
    except AttributeError:
        pass  # Windows doesn't have num_fds


# ============================================
# Metrics Endpoint Handler
# ============================================


async def metrics_handler() -> Response:
    """
    Prometheus metrics endpoint handler.

    Returns:
        Response with Prometheus-formatted metrics
    """
    # Collect latest system metrics
    collect_system_metrics()

    # Generate Prometheus response
    metrics = generate_latest()

    return Response(content=metrics, media_type=CONTENT_TYPE_LATEST)


# ============================================
# Helper Functions for Business Metrics
# ============================================


def track_adjudication_decision(
    decision_type: str, analyst_id: str, duration_seconds: float
):
    """Track adjudication decision metrics."""
    adjudication_decisions_total.labels(
        decision_type=decision_type, analyst_id=analyst_id
    ).inc()

    adjudication_decision_duration_seconds.observe(duration_seconds)


def update_queue_depth(count: int):
    """Update adjudication queue depth gauge."""
    adjudication_queue_depth.set(count)


def track_alert_creation(risk_level: str, alert_type: str):
    """Track alert creation."""
    alerts_created_total.labels(risk_level=risk_level, alert_type=alert_type).inc()


def track_document_analysis(status: str, duration_seconds: float):
    """Track document analysis."""
    document_analysis_total.labels(status=status).inc()
    document_analysis_duration_seconds.observe(duration_seconds)


def track_database_query(query_type: str, duration_seconds: float):
    """Track database query performance."""
    database_query_duration_seconds.labels(query_type=query_type).observe(
        duration_seconds
    )


def track_event_creation(event_type: str, aggregate_type: str):
    """Track event sourcing event creation."""
    events_created_total.labels(
        event_type=event_type, aggregate_type=aggregate_type
    ).inc()
