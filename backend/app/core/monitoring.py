"""
Monitoring, metrics, and alerting configuration.
Integrates with OpenTelemetry, Prometheus, and Jaeger for comprehensive observability.
"""
import time
import structlog
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime
from functools import wraps
import json

logger = structlog.get_logger(__name__)


class MetricsCollector:
    """
    Collects application metrics for monitoring.
    Designed for Prometheus scraping.
    """

    def __init__(self):
        self.metrics = {
            "http_requests_total": {},
            "http_request_duration_seconds": {},
            "database_query_duration_seconds": {},
            "cache_hits": 0,
            "cache_misses": 0,
            "errors_total": {},
            "active_connections": 0,
        }

    def record_http_request(
        self,
        method: str,
        endpoint: str,
        status_code: int,
        duration_seconds: float,
        correlation_id: str,
    ) -> None:
        """Record HTTP request metrics."""
        metric_key = f"{method}_{endpoint}_{status_code}"
        
        if metric_key not in self.metrics["http_requests_total"]:
            self.metrics["http_requests_total"][metric_key] = 0
        
        self.metrics["http_requests_total"][metric_key] += 1
        
        # Record duration (percentiles could be calculated here)
        if metric_key not in self.metrics["http_request_duration_seconds"]:
            self.metrics["http_request_duration_seconds"][metric_key] = []
        
        self.metrics["http_request_duration_seconds"][metric_key].append(duration_seconds)
        
        logger.info(
            "HTTP request recorded",
            method=method,
            endpoint=endpoint,
            status_code=status_code,
            duration_seconds=duration_seconds,
            correlation_id=correlation_id,
        )

    def record_database_query(
        self,
        query_type: str,
        duration_seconds: float,
        error: Optional[str] = None,
    ) -> None:
        """Record database query metrics."""
        metric_key = f"{query_type}{'_error' if error else ''}"
        
        if metric_key not in self.metrics["database_query_duration_seconds"]:
            self.metrics["database_query_duration_seconds"][metric_key] = []
        
        self.metrics["database_query_duration_seconds"][metric_key].append(duration_seconds)
        
        if error:
            logger.warning(
                "Database query error recorded",
                query_type=query_type,
                duration_seconds=duration_seconds,
                error=error,
            )

    def record_cache_hit(self) -> None:
        """Increment cache hit counter."""
        self.metrics["cache_hits"] += 1

    def record_cache_miss(self) -> None:
        """Increment cache miss counter."""
        self.metrics["cache_misses"] += 1

    def get_cache_hit_rate(self) -> float:
        """Calculate cache hit rate."""
        total = self.metrics["cache_hits"] + self.metrics["cache_misses"]
        if total == 0:
            return 0.0
        return self.metrics["cache_hits"] / total

    def record_error(self, error_type: str, endpoint: str) -> None:
        """Record error metrics."""
        metric_key = f"{error_type}_{endpoint}"
        
        if metric_key not in self.metrics["errors_total"]:
            self.metrics["errors_total"][metric_key] = 0
        
        self.metrics["errors_total"][metric_key] += 1

    def get_prometheus_metrics(self) -> str:
        """Generate Prometheus-format metrics."""
        lines = []
        
        # HTTP requests
        for metric_key, count in self.metrics["http_requests_total"].items():
            lines.append(f'http_requests_total{{endpoint="{metric_key}"}} {count}')
        
        # HTTP request durations (p95)
        for metric_key, durations in self.metrics["http_request_duration_seconds"].items():
            if durations:
                p95 = sorted(durations)[int(len(durations) * 0.95)]
                lines.append(f'http_request_duration_seconds{{quantile="0.95",endpoint="{metric_key}"}} {p95}')
        
        # Cache metrics
        lines.append(f'cache_hits_total {self.metrics["cache_hits"]}')
        lines.append(f'cache_misses_total {self.metrics["cache_misses"]}')
        lines.append(f'cache_hit_rate {self.get_cache_hit_rate()}')
        
        # Errors
        for metric_key, count in self.metrics["errors_total"].items():
            lines.append(f'errors_total{{error_type="{metric_key}"}} {count}')
        
        return "\n".join(lines)


class AlertingRules:
    """
    Alerting rules for monitoring system health.
    Can be exported to Prometheus AlertManager format.
    """

    ALERT_THRESHOLDS = {
        "high_error_rate": {
            "threshold": 0.05,  # 5%
            "window_minutes": 5,
            "severity": "warning",
        },
        "high_latency": {
            "threshold": 1.0,  # 1 second p95
            "window_minutes": 10,
            "severity": "warning",
        },
        "database_connection_pool_exhaustion": {
            "threshold": 0.9,  # 90% utilization
            "window_minutes": 2,
            "severity": "critical",
        },
        "cache_hit_rate_low": {
            "threshold": 0.6,  # 60%
            "window_minutes": 15,
            "severity": "info",
        },
        "unhandled_exceptions": {
            "threshold": 10,  # Per 5 minutes
            "window_minutes": 5,
            "severity": "critical",
        },
        "slow_database_queries": {
            "threshold": 2.0,  # 2 seconds
            "window_minutes": 10,
            "severity": "warning",
        },
    }

    @staticmethod
    def get_prometheus_rules() -> Dict[str, Any]:
        """Generate Prometheus alert rules."""
        return {
            "groups": [
                {
                    "name": "fraud_detection_alerts",
                    "interval": "30s",
                    "rules": [
                        {
                            "alert": "HighErrorRate",
                            "expr": 'rate(errors_total[5m]) > 0.05',
                            "for": "5m",
                            "labels": {"severity": "warning"},
                            "annotations": {
                                "summary": "High error rate detected",
                                "description": "Error rate is {{ $value | humanizePercentage }}",
                            },
                        },
                        {
                            "alert": "HighLatency",
                            "expr": 'histogram_quantile(0.95, http_request_duration_seconds) > 1.0',
                            "for": "10m",
                            "labels": {"severity": "warning"},
                            "annotations": {
                                "summary": "High latency detected",
                                "description": "P95 latency is {{ $value }}s",
                            },
                        },
                        {
                            "alert": "DatabasePoolExhaustion",
                            "expr": 'db_connection_pool_used / db_connection_pool_size > 0.9',
                            "for": "2m",
                            "labels": {"severity": "critical"},
                            "annotations": {
                                "summary": "Database connection pool nearly exhausted",
                                "description": "Pool utilization is {{ $value | humanizePercentage }}",
                            },
                        },
                        {
                            "alert": "LowCacheHitRate",
                            "expr": 'cache_hit_rate < 0.6',
                            "for": "15m",
                            "labels": {"severity": "info"},
                            "annotations": {
                                "summary": "Cache hit rate is low",
                                "description": "Hit rate is {{ $value | humanizePercentage }}",
                            },
                        },
                    ],
                }
            ]
        }

    @staticmethod
    def get_alertmanager_config() -> Dict[str, Any]:
        """Generate AlertManager configuration."""
        return {
            "global": {
                "resolve_timeout": "5m",
            },
            "route": {
                "receiver": "default",
                "group_by": ["alertname", "cluster"],
                "group_wait": "30s",
                "group_interval": "5m",
                "repeat_interval": "12h",
                "routes": [
                    {
                        "match": {"severity": "critical"},
                        "receiver": "pagerduty",
                        "group_wait": "10s",
                        "repeat_interval": "1h",
                    },
                    {
                        "match": {"severity": "warning"},
                        "receiver": "slack",
                        "group_wait": "1m",
                        "repeat_interval": "4h",
                    },
                ],
            },
            "receivers": [
                {
                    "name": "default",
                    "slack_configs": [
                        {
                            "api_url": "${SLACK_WEBHOOK_URL}",
                            "channel": "#alerts",
                        }
                    ],
                },
                {
                    "name": "pagerduty",
                    "pagerduty_configs": [
                        {
                            "service_key": "${PAGERDUTY_SERVICE_KEY}",
                        }
                    ],
                },
                {
                    "name": "slack",
                    "slack_configs": [
                        {
                            "api_url": "${SLACK_WEBHOOK_URL}",
                            "channel": "#warnings",
                        }
                    ],
                },
            ],
        }


class HealthCheckCollector:
    """Collects health check results for system status."""

    def __init__(self):
        self.checks = {
            "database": None,
            "redis": None,
            "external_services": {},
            "last_check": None,
        }

    def record_check(self, component: str, healthy: bool, details: Optional[Dict] = None) -> None:
        """Record health check result."""
        self.checks[component] = {
            "healthy": healthy,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {},
        }
        
        self.checks["last_check"] = datetime.utcnow().isoformat()
        
        logger.info(
            "Health check recorded",
            component=component,
            healthy=healthy,
            details=details,
        )

    def get_overall_status(self) -> Dict[str, Any]:
        """Get overall system health status."""
        all_healthy = all(
            check.get("healthy", False)
            for key, check in self.checks.items()
            if key != "last_check" and isinstance(check, dict)
        )
        
        return {
            "healthy": all_healthy,
            "timestamp": self.checks["last_check"],
            "components": {
                k: v for k, v in self.checks.items() if isinstance(v, dict)
            },
        }


def track_request_metrics(
    collector: MetricsCollector,
) -> Callable:
    """Decorator to track request metrics."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, request=None, correlation_id: str = None, **kwargs) -> Any:
            start_time = time.time()
            status_code = 500
            
            try:
                result = await func(*args, **kwargs)
                status_code = getattr(result, "status_code", 200)
                return result
            except Exception as e:
                logger.error(
                    "Request failed",
                    correlation_id=correlation_id,
                    error=str(e),
                )
                raise
            finally:
                duration = time.time() - start_time
                method = getattr(request, "method", "UNKNOWN") if request else "UNKNOWN"
                endpoint = getattr(request, "url", {}).path if request else "unknown"
                
                collector.record_http_request(
                    method,
                    endpoint,
                    status_code,
                    duration,
                    correlation_id or "unknown",
                )
        
        return wrapper
    return decorator
