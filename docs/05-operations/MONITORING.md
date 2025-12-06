# 📊 Monitoring Guide

> Health monitoring and alerting for Simple378

---

## Monitoring Stack

| Tool | Purpose |
|------|---------|
| **Prometheus** | Metrics collection |
| **Grafana** | Visualization |
| **Loki** | Log aggregation |
| **Alertmanager** | Alert routing |

---

## Access Points

| Service | URL |
|---------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |
| API Health | http://localhost:8000/health |

---

## Health Endpoints

### Backend Health
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": "2d 14h 32m"
}
```

### Detailed Health
```bash
curl http://localhost:8000/health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "components": {
    "database": {
      "status": "connected",
      "latency_ms": 2.5,
      "pool_size": 10,
      "active_connections": 3
    },
    "redis": {
      "status": "connected",
      "latency_ms": 0.5,
      "memory_used_mb": 128
    },
    "qdrant": {
      "status": "connected",
      "collections": 5
    }
  }
}
```

---

## Key Metrics

### Application Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `http_requests_total` | Total HTTP requests | - |
| `http_request_duration_seconds` | Request latency | p95 > 1s |
| `http_requests_in_progress` | Active requests | > 100 |
| `failed_requests_total` | Failed requests | > 10/min |

### System Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `process_cpu_seconds_total` | CPU usage | > 80% |
| `process_resident_memory_bytes` | Memory usage | > 80% |
| `process_open_fds` | Open file descriptors | > 80% of limit |

### Database Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `db_connections_active` | Active connections | > 80% of pool |
| `db_query_duration_seconds` | Query latency | p95 > 500ms |
| `db_errors_total` | Database errors | > 5/min |

---

## Alerting Rules

### Critical Alerts

```yaml
# prometheus/rules/critical.yml
groups:
  - name: critical
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
      
      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
```

### Warning Alerts

```yaml
# prometheus/rules/warning.yml
groups:
  - name: warning
    rules:
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 / 1024 > 3
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage above 3GB"
      
      - alert: SlowQueries
        expr: histogram_quantile(0.95, db_query_duration_seconds) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database queries are slow"
```

---

## Grafana Dashboards

### Application Dashboard
- Request rate
- Error rate
- Latency percentiles
- Active users

### System Dashboard
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

### Database Dashboard
- Connection pool
- Query latency
- Table sizes
- Replication lag

---

## Log Monitoring

### Log Levels

| Level | Description |
|-------|-------------|
| ERROR | Errors requiring attention |
| WARN | Potential issues |
| INFO | Normal operations |
| DEBUG | Detailed debugging |

### Log Queries (Loki)

```promql
# Errors in last hour
{job="simple378-backend"} |= "ERROR" | json

# Slow requests
{job="simple378-backend"} | json | duration > 1s

# Authentication failures
{job="simple378-backend"} |= "authentication failed"
```

---

## Notification Channels

### Slack Integration

```yaml
# alertmanager.yml
receivers:
  - name: slack
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#alerts'
        send_resolved: true
```

### Email Integration

```yaml
receivers:
  - name: email
    email_configs:
      - to: 'ops@simple378.io'
        from: 'alerts@simple378.io'
```

---

## Runbooks

### Service Down

1. Check container status: `docker ps -a`
2. Check logs: `docker logs simple378-backend`
3. Restart service: `docker-compose restart backend`
4. If persists, check resources and dependencies

### High Memory

1. Check for memory leaks in logs
2. Review recent deployments
3. Increase container memory limit
4. Consider horizontal scaling

### Database Issues

1. Check connection pool: `SELECT * FROM pg_stat_activity`
2. Kill long-running queries
3. Check disk space
4. Review slow query log

---

## Related

- [Deployment](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
