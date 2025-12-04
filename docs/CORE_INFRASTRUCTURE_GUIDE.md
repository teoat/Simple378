# Core Infrastructure Modules - Complete Implementation Guide

## Overview

This document describes the comprehensive set of core infrastructure modules added to the Simple378 fraud detection system. These modules address production-scale requirements: monitoring, scaling, rate limiting, validation, and deployment strategies.

## Modules Created

### 1. **monitoring.py** - Observability & Metrics
**Location:** `backend/app/core/monitoring.py`

**Purpose:** Comprehensive monitoring, metrics collection, and alerting infrastructure.

**Key Classes:**
- `MetricsCollector`: Collects application metrics in Prometheus format
  - HTTP request tracking (method, endpoint, status, duration)
  - Database query metrics (type, duration, errors)
  - Cache hit rate calculation
  - Error counting and categorization

- `AlertingRules`: Pre-configured alerting rules for system health
  - High error rate (>5%)
  - High latency (p95 > 1s)
  - Database connection pool exhaustion (>90%)
  - Low cache hit rate (<60%)
  - Unhandled exceptions (>10 per 5 min)
  - Slow database queries (>2s)

- `HealthCheckCollector`: Tracks component health status
  - Database connectivity
  - Redis connectivity
  - External service status
  - Overall system health aggregation

**Usage:**
```python
from app.core.monitoring import MetricsCollector

collector = MetricsCollector()

# Record metrics
collector.record_http_request(
    method="GET",
    endpoint="/reconcile",
    status_code=200,
    duration_seconds=0.15,
    correlation_id="req-123"
)

# Get Prometheus metrics
metrics_text = collector.get_prometheus_metrics()
```

**Integration Points:**
- GET `/metrics` endpoint returns Prometheus-format metrics
- Can be scraped by Prometheus every 30 seconds
- Alerts route to Slack/PagerDuty via AlertManager

---

### 2. **rate_limiting.py** - Request Throttling & Quotas
**Location:** `backend/app/core/rate_limiting.py`

**Purpose:** Distributed rate limiting and quota management for API protection.

**Key Classes:**
- `TokenBucketRateLimiter`: Token bucket algorithm with Redis backend
  - Distributed across multiple instances
  - Configurable rate limits (default: 100 req/min)
  - Returns remaining quota and reset time
  
- `QuotaManager`: Feature-level quotas with daily/monthly reset
  - Per-user feature quotas (e.g., "api_calls", "reports_per_day")
  - Automatic period reset (daily or monthly)
  - Track used vs remaining quota

- `DynamicThrottling`: Adaptive rate limits based on system load
  - Reduces limits under high load (>80% CPU/memory)
  - Gradually restores limits as load decreases
  - Per-client adjustment

- `BurstAllowance`: Temporary burst capacity for legitimate traffic spikes
  - Grant temporary additional capacity
  - Auto-expires after duration
  - Tracks remaining burst tokens

**Usage:**
```python
from app.core.rate_limiting import TokenBucketRateLimiter, QuotaManager

# Initialize
limiter = TokenBucketRateLimiter(
    redis_url="redis://localhost",
    rate_limit=100,
    window_seconds=60
)

# Check rate limit
allowed, info = await limiter.is_allowed("user123")
if not allowed:
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

# Get current info
info = await limiter.get_limit_info("user123")
# Returns: {remaining: 85, limit: 100, reset_at: 1234567890}

# Feature quotas
quota_manager = QuotaManager("redis://localhost")
quota_info = await quota_manager.allocate_quota("user123", "api_calls", quota_limit=1000)
success, new_quota = await quota_manager.consume_quota("user123", "api_calls", amount=10)
```

**Integration Points:**
- Middleware applies to all requests
- Response headers include X-RateLimit-* headers
- Redis keys: `rate_limit:{identifier}`, `quota:{user_id}:{feature}:{period}`

---

### 3. **validation.py** - Input Security & Data Validation
**Location:** `backend/app/core/validation.py`

**Purpose:** Comprehensive input validation and security filtering.

**Key Classes:**
- `DataSanitizer`: Sanitizes and validates user input
  - SQL injection detection (regex patterns)
  - XSS attack detection (script tags, event handlers)
  - Email, URL, phone number validation
  - HTML escaping and null byte removal
  
- `InputValidator`: Business logic validation
  - Pagination parameter validation
  - Decimal range validation
  - Date range validation (max 90 days by default)
  - JSON payload size validation (max 1MB)

- `SecurityRuleValidator`: Security policy enforcement
  - Blocked domain checking (localhost, 127.0.0.1, etc.)
  - File upload validation (size, MIME type)
  - Batch request size limits (max 1000 items)

- `ModelValidator`: Pydantic model validators
  - Risk score: 0-1 range
  - Confidence level: 0-1 range
  - Currency amount: positive, max 999,999,999.99
  - User ID: alphanumeric + underscore/dash
  - Entity relationship validation

**Usage:**
```python
from app.core.validation import DataSanitizer, InputValidator, SecurityRuleValidator

# Detect attacks
if DataSanitizer.check_sql_injection(user_input):
    raise ValueError("Potential SQL injection detected")

if DataSanitizer.check_xss_attack(user_input):
    raise ValueError("Potential XSS detected")

# Validate data
email = DataSanitizer.sanitize_string(email_input)
is_valid_email = DataSanitizer.validate_email(email)

# Validate pagination
page, size = InputValidator.validate_pagination(page_param, page_size_param)
# Returns clamped values: page >= 1, size between 1-100

# Validate dates
valid = InputValidator.validate_date_range(start_date, end_date, max_range_days=90)

# File uploads
valid = SecurityRuleValidator.validate_file_upload(
    filename="report.csv",
    file_size_bytes=5000000,
    allowed_types=["csv", "xlsx"]
)
```

**Integration Points:**
- Middleware applies to all incoming requests
- Used in endpoint parameter validation
- Pydantic validators ensure database consistency

---

### 4. **scaling_config.py** - Distributed Scaling Configuration
**Location:** `backend/app/core/scaling_config.py`

**Purpose:** Configuration for horizontal scaling and load distribution.

**Key Classes:**
- `RedisSessionStore`: Distributed session management
  - Store WebSocket connection sessions in Redis
  - Share sessions across multiple backend instances
  - 24-hour TTL (configurable)
  - Track user's active sessions
  
- `ConnectionPoolConfig`: Dynamic database pool sizing
  - Environment-aware sizing (dev: 5, staging: 10, prod: 20)
  - Load-based adjustment multiplier
  - Calculate overflow pool size
  
- `AutoScalingPolicy`: Kubernetes HPA configuration
  - Min/max replica counts by environment
  - CPU/memory utilization targets
  - Scale up/down window durations
  - Pod Disruption Budget for high availability

- `LoadBalancingConfig`: Load balancing strategy
  - Session affinity/sticky sessions (3-hour timeout)
  - Nginx upstream configuration generator
  - Least-connections algorithm

**Usage:**
```python
from app.core.scaling_config import (
    RedisSessionStore, ConnectionPoolConfig, AutoScalingPolicy
)

# Session management
session_store = RedisSessionStore("redis://localhost", ttl_hours=24)
await session_store.create_session(
    user_id="user123",
    connection_id="conn-456",
    metadata={"ip": "192.168.1.1"}
)

# Get user's active sessions
sessions = await session_store.get_user_sessions("user123")

# Connection pool sizing
pool_size = ConnectionPoolConfig.get_pool_size(
    environment="production",
    load_estimate=1.5  # 50% higher load
)

# Auto-scaling config
hpa_config = AutoScalingPolicy.get_hpa_config("production")
# Returns: minReplicas=3, maxReplicas=10, targetCPU=60%, etc.

# Pod Disruption Budget
pdb_config = AutoScalingPolicy.get_pdb_config(min_available=1)
```

**Integration Points:**
- Redis stores session data across instances
- Database pool configured at app startup
- HPA config used by Kubernetes for auto-scaling
- Nginx configuration generated for load balancing

---

### 5. **deployment.py** - Deployment Strategies & Rollback
**Location:** `backend/app/core/deployment.py`

**Purpose:** Safe deployment patterns for zero-downtime updates.

**Key Classes:**
- `DeploymentValidator`: Pre-deployment checks
  - Validate pending database migrations
  - Check dependency version compatibility
  - Verify critical configuration exists
  
- `BlueGreenDeployment`: Blue-green deployment strategy
  - Maintain two production environments
  - Switch traffic between environments
  - Rollback capability within 3 hours
  - Health check validation before switch
  
- `CanaryDeployment`: Gradual rollout strategy
  - Start with 5% traffic to new version
  - Gradually increase percentage (5% → 10% → 50% → 100%)
  - Compare metrics (error rate, latency)
  - Automatic rollback if metrics degrade
  
- `RollingDeployment`: Instance-by-instance update
  - Update replicas in configurable batch sizes
  - Health check between batches
  - Maintains minimum availability
  
- `DeploymentRollbackManager`: Rollback execution
  - Create system state snapshots
  - Validate rollback targets
  - Execute rollback with safety checks
  - Retain snapshots for 72 hours

**Usage:**
```python
from app.core.deployment import (
    BlueGreenDeployment, CanaryDeployment, DeploymentValidator
)

# Blue-green deployment
bg_deployment = BlueGreenDeployment()

# Prepare new environment
await bg_deployment.prepare_new_environment("v2.0.0", target_env="green")

# Run health checks
health_results = await bg_deployment.run_health_checks("green", max_retries=5)
if all(r.passed for r in health_results):
    # Switch traffic
    await bg_deployment.switch_traffic("blue", "green")

# Canary deployment
canary = CanaryDeployment()
await canary.start_canary_deployment("v2.0.0", initial_percentage=5)

# Gradually increase traffic
await canary.increase_canary_percentage(10)
await canary.increase_canary_percentage(50)

# Check metrics
metrics = await canary.check_canary_metrics(
    error_threshold=0.05,
    latency_threshold_ms=500
)
if metrics["healthy"]:
    await canary.complete_canary_deployment()  # 100% rollout
else:
    # Metrics not healthy, keep at current percentage
    pass
```

**Integration Points:**
- GitHub Actions calls deployment validators before deployment
- Kubernetes operator watches deployment status
- Rollback snapshots stored in S3 for durability
- Metrics compared against baseline version

---

## Integration with Main Application

### New Endpoints

1. **GET `/health`**: Basic health check
   - Returns: `{status: "healthy", timestamp: "2024-..."}`

2. **GET `/health/detailed`**: Detailed component status
   - Returns: Overall health + individual component status
   - Components: database, redis, external_services

3. **GET `/metrics`**: Prometheus metrics
   - Returns: Prometheus-format metrics for scraping
   - Updated every request

### New Middleware

1. **ValidationMiddleware**: Detects SQL injection and XSS in query parameters
2. **RateLimitMiddleware**: Applies token bucket rate limiting
3. **CorrelationIDMiddleware**: (Existing) Tracks requests with correlation IDs

### Configuration Variables

Add to `.env` files:

```bash
# Monitoring
PROMETHEUS_METRICS_ENABLED=true

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_SECONDS=60

# Connection Pool
DATABASE_POOL_SIZE=20
DATABASE_POOL_OVERFLOW=10

# Auto-scaling
K8S_MIN_REPLICAS=3
K8S_MAX_REPLICAS=10
K8S_TARGET_CPU_PERCENT=60
```

---

## Running Integration

1. **Run integration script:**
   ```bash
   python backend/scripts/integrate_core_modules.py
   ```

2. **Install dependencies:**
   ```bash
   pip install prometheus-client redis
   ```

3. **Run tests:**
   ```bash
   pytest backend/tests/test_core_integration.py -v
   ```

4. **Start application:**
   ```bash
   cd backend && uvicorn app.main:app --reload
   ```

5. **Verify endpoints:**
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8000/metrics
   curl http://localhost:8000/health/detailed
   ```

---

## Monitoring & Metrics

### Key Metrics to Monitor

1. **HTTP Requests**: `http_requests_total`, `http_request_duration_seconds`
2. **Database Queries**: `database_query_duration_seconds` (query type breakdown)
3. **Cache Performance**: `cache_hit_rate`, `cache_hits_total`, `cache_misses_total`
4. **Errors**: `errors_total` (by error type and endpoint)
5. **Rate Limiting**: `rate_limit_exceeded_total`
6. **Active Connections**: `active_connections`

### Alert Examples

- Error rate > 5% for 5 minutes → Warning
- P95 latency > 1s for 10 minutes → Warning
- DB pool > 90% for 2 minutes → Critical
- Cache hit rate < 60% for 15 minutes → Info

---

## Performance Considerations

1. **Rate Limiting**: Redis incurs ~1ms latency per request
2. **Validation**: Input sanitization adds ~0.5ms per request
3. **Metrics Collection**: Minimal overhead (~0.1ms per request)
4. **Deployment Validation**: ~2-5 seconds for migration checks

All overhead is acceptable for production environments and can be optimized with:
- Redis connection pooling
- Batch metric collection
- Cached validation results

---

## Next Steps

1. **Test locally** with `pytest` suite
2. **Deploy to staging** with canary deployment (5%)
3. **Monitor metrics** for 24 hours
4. **Increase canary** to 50%, then 100%
5. **Deploy to production** with blue-green strategy
6. **Monitor alerts** in Slack/PagerDuty

---

## Troubleshooting

### Rate Limiting Not Working
- Check Redis connection: `redis-cli ping`
- Verify REDIS_URL in environment
- Check Redis logs for AUTH errors

### Metrics Not Appearing
- Verify `/metrics` endpoint returns data
- Check Prometheus scrape config
- Look for errors in application logs

### Deployment Validation Failures
- Check pending migrations: `alembic current`
- Verify all dependencies listed in requirements.txt
- Ensure critical config variables set in environment

---

## References

- Prometheus: https://prometheus.io/docs/
- FastAPI: https://fastapi.tiangolo.com/
- Redis: https://redis.io/documentation
- Kubernetes HPA: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
- Blue-Green Deployments: https://martinfowler.com/bliki/BlueGreenDeployment.html
