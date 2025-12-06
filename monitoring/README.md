# Monitoring & Alerting Configuration

This directory contains monitoring and alerting configurations for the Mens Rea platform.

## Structure

```
monitoring/
├── prometheus/          # Prometheus configuration
│   ├── prometheus.yml  # Main Prometheus config
│   ├── alerts.yml      # Alert rules
│   └── rules.yml       # Recording rules
├── grafana/            # Grafana dashboards
│   ├── dashboards/     # JSON dashboard definitions
│   └── datasources/    # Datasource configurations
├── alertmanager/       # Alert routing configuration
│   └── config.yml
└── exporters/          # Custom metric exporters
    ├── backend_exporter.py
    └── database_exporter.py
```

## Prometheus Metrics

### Application Metrics

**Backend (FastAPI)**:
- `http_requests_total` - Total HTTP requests by method, path, status
- `http_request_duration_seconds` - Request duration histogram
- `adjudication_decisions_total` - Total decisions by type
- `websocket_connections_active` - Active WebSocket connections
- `database_query_duration_seconds` - Database query latency
- `event_sourcing_events_total` - Total events by type

**Frontend**:
- `page_load_time_seconds` - Page load duration
- `api_call_duration_seconds` - API call latency
- `api_errors_total` - API errors by endpoint
- `websocket_reconnects_total` - WebSocket reconnection attempts

### Infrastructure Metrics

- `cpu_usage_percent` - CPU utilization
- `memory_usage_bytes` - Memory consumption
- `disk_usage_percent` -Disk utilization
- `network_io_bytes` - Network traffic

### Database Metrics

- `postgres_connections_active` - Active database connections
- `postgres_query_duration_seconds` - Query execution time
- `postgres_transactions_total` - Total transactions
- `postgres_deadlocks_total` - Deadlock occurrences

## Alert Rules

### Critical Alerts (PagerDuty)

1. **Service Down**
   - Condition: `up{job="backend"} == 0`
   - Duration: 1 minute
   - Action: Page on-call engineer

2. **High Error Rate**
   - Condition: `rate(http_requests_total{status=~"5.."}[5m]) > 0.05`
   - Duration: 5 minutes
   - Action: Page on-call engineer

3. **Database Connection Pool Exhausted**
   - Condition: `postgres_connections_active / postgres_connections_max > 0.9`
   - Duration: 2 minutes
   - Action: Page DBA and backend team

### Warning Alerts (Slack)

1. **Elevated Latency**
   - Condition: `histogram_quantile(0.95, http_request_duration_seconds) > 1.0`
   - Duration: 10 minutes
   - Action: Notify #alerts channel

2. **Memory Usage High**
   - Condition: `memory_usage_percent > 85`
   - Duration: 5 minutes
   - Action: Notify #infrastructure

3. **Disk Space Low**
   - Condition: `disk_usage_percent > 80`
   - Duration: 30 minutes
   - Action: Notify #infrastructure

## Grafana Dashboards

### 1. System Overview
- Request rate, error rate, latency (RED metrics)
- Resource utilization (CPU, memory, disk)
- Service health status

### 2. Application Performance
- Endpoint-level latency breakdown
- Database query performance
- WebSocket connection status
- Queue depths (adjudication, processing)

### 3. Business Metrics
- Adjudication throughput (decisions/hour)
- Average decision time
- Alert distribution by risk level
- User activity patterns

### 4. Database Performance
- Query latency by query type
- Connection pool status
- Transaction rate
- Slow query log

## Setup Instructions

### 1. Start Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Configure Alert Routing

Edit `alertmanager/config.yml`:

```yaml
receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '<YOUR_PAGERDUTY_SERVICE_KEY>'
        
  - name: 'slack'
    slack_configs:
      - api_url: '<YOUR_SLACK_WEBHOOK_URL>'
        channel: '#alerts'
```

### 3. Import Grafana Dashboards

1. Access Grafana at `http://localhost:3000`
2. Login with `admin/admin`
3. Go to Dashboards → Import
4. Upload JSON files from `grafana/dashboards/`

### 4. Verify Metrics Collection

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Query sample metric
curl 'http://localhost:9090/api/v1/query?query=up'
```

## Custom Exporters

### Backend Exporter

Exposes application-specific metrics:

```python
# backend/app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge

http_requests = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

decision_duration = Histogram(
    'adjudication_decision_duration_seconds',
    'Time to make adjudication decision',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
)
```

### Database Exporter

Exports PostgreSQL metrics:
- Query execution plans
- Index usage statistics
- Table bloat metrics

## Maintenance

### Daily
- Review alert notifications
- Check dashboard for anomalies

### Weekly
- Review slow query log
- Optimize underperforming queries
- Clean up obsolete metrics

### Monthly
- Archive old Prometheus data
- Update alert thresholds based on trends
- Review and update dashboards

## Troubleshooting

### Metrics Not Appearing

1. Check Prometheus targets: `http://localhost:9090/targets`
2. Verify scrape interval in `prometheus.yml`
3. Check application logs for exporter errors

### Alerts Not Firing

1. Verify alert rules in Prometheus UI
2. Check Alertmanager configuration
3. Test webhook endpoints manually

### High Cardinality Issues

If Prometheus is slow:
1. Identify high-cardinality labels
2. Use recording rules to pre-aggregate
3. Reduce retention period if necessary

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Alert Manager Guide](https://prometheus.io/docs/alerting/latest/alertmanager/)
