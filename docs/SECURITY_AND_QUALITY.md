# Security & Quality Assurance Guide

This document outlines security practices, quality standards, and operational procedures for the Fraud Detection System.

## Table of Contents

- [Security](#security)
- [Quality Assurance](#quality-assurance)
- [Incident Response](#incident-response)
- [Monitoring](#monitoring)
- [Performance Optimization](#performance-optimization)

---

## Security

### 🔐 Security Hardening Checklist

#### Application Security

- [ ] **Authentication**
  - [ ] Strong password policy enforced (min 12 chars, complexity)
  - [ ] Multi-factor authentication available
  - [ ] Session timeout configured (30 minutes)
  - [ ] JWT tokens with expiration
  - [ ] Refresh token rotation

- [ ] **Authorization**
  - [ ] Role-based access control (RBAC) implemented
  - [ ] Principle of least privilege applied
  - [ ] API endpoint authorization checks
  - [ ] Resource-level permissions

- [ ] **Data Protection**
  - [ ] All passwords hashed with bcrypt (cost factor ≥ 12)
  - [ ] Sensitive data encrypted at rest (AES-256)
  - [ ] TLS 1.3 for data in transit
  - [ ] PII handling complies with GDPR
  - [ ] Data retention policies enforced

#### Infrastructure Security

- [ ] **Network**
  - [ ] Firewall rules configured
  - [ ] HTTPS only (HSTS enabled)
  - [ ] CORS properly configured
  - [ ] Rate limiting enabled
  - [ ] DDoS protection

- [ ] **Container Security**
  - [ ] Non-root user in Docker containers
  - [ ] Minimal base images (Alpine)
  - [ ] No secrets in images
  - [ ] Regular image scanning

- [ ] **Database**
  - [ ] Parameterized queries (SQLAlchemy ORM)
  - [ ] Least privilege DB user
  - [ ] Regular backups
  - [ ] Backup encryption

### 🛡️ Vulnerability Management

#### Automated Scanning

**1. Dependency Scanning**

Backend (Python):
```bash
# Safety check
poetry run safety check

# Bandit security linter
poetry run bandit -r app/

# pip-audit
pip-audit
```

Frontend (Node.js):
```bash
# npm audit
npm audit

# Snyk
snyk test
snyk monitor

# Retire.js (for outdated libraries)
retire --path ./
```

**2. Container Scanning**

```bash
# Trivy
trivy image fraud-detection-backend:latest
trivy image fraud-detection-frontend:latest

# Docker Scout
docker scout cves fraud-detection-backend:latest
```

**3. SAST (Static Application Security Testing)**

```bash
# Semgrep
semgrep --config auto backend/
semgrep --config auto frontend/

# CodeQL (GitHub Advanced Security)
# Runs automatically on push
```

#### Vulnerability Response Process

1. **Detection**: Automated scans, security advisories, bug reports
2. **Assessment**: Severity (Critical/High/Medium/Low), exploitability
3. **Prioritization**: Critical = 24h, High = 7d, Medium = 30d, Low = 90d
4. **Remediation**: Patch, update, mitigate, or accept risk
5. **Verification**: Re-scan, test, validate fix
6. **Documentation**: Update changelog, notify stakeholders

### 🔑 Secrets Management

#### Best Practices

- **Never commit secrets** to Git
- Use **environment variables** for all credentials
- Rotate secrets **quarterly** (minimum)
- Use **secret scanning** (git-secrets, truffleHog)
- Encrypt secrets at rest

#### Secret Storage

**Development**:
- `.env` files (gitignored)
- Local environment variables

**Production**:
- **Docker Secrets** (Docker Swarm/Kubernetes)
- **AWS Secrets Manager** / **Azure Key Vault**
- **HashiCorp Vault**

**Example - Docker Secrets**:
```bash
# Create secret
echo "db_password_value" | docker secret create db_password -

# Use in docker-compose.yml
services:
  backend:
    secrets:
      - db_password
secrets:
  db_password:
    external: true
```

#### Secrets Rotation

```bash
# Automate secret rotation
# Example: Rotate database password
./scripts/rotate-db-password.sh

# Update all services
docker service update --secret-rm db_password_old \
                      --secret-add db_password_new \
                      backend
```

### 🔍 Security Audits

#### Regular Audit Schedule

| Audit Type | Frequency | Responsible |
|-----------|-----------|-------------|
| Dependency scan | Daily (automated) | CI/CD |
| Container scan | Weekly | DevOps |
| Code review | Per PR | Developers |
| Penetration test | Quarterly | Security team |
| Access review | Monthly | Admin |
| Compliance check | Quarterly | Compliance officer |

#### Audit Checklist

**Quarterly Security Review**:
- [ ] Review all user permissions and roles
- [ ] Audit authentication logs for anomalies
- [ ] Check for exposed secrets in Git history
- [ ] Verify encryption settings
- [ ] Review CORS and CSP policies
- [ ] Test backup and recovery procedures
- [ ] Review incident response plan
- [ ] Update security documentation

### 🚨 Common Vulnerabilities & Mitigations

#### SQL Injection
- **Risk**: High
- **Mitigation**: Use SQLAlchemy ORM (parameterized queries)
- **Verification**: Automated SAST scans

#### XSS (Cross-Site Scripting)
- **Risk**: Medium
- **Mitigation**: React's automatic escaping, sanitize user input
- **Verification**: Manual testing, automated scanners

#### CSRF (Cross-Site Request Forgery)
- **Risk**: Medium
- **Mitigation**: CSRF tokens, SameSite cookies
- **Verification**: Manual testing

#### Authentication Bypass
- **Risk**: Critical
- **Mitigation**: Centralized auth middleware, JWT validation
- **Verification**: Penetration testing

#### Insecure Direct Object References (IDOR)
- **Risk**: High
- **Mitigation**: Authorization checks on all resources
- **Verification**: Manual testing, code review

---

## Quality Assurance

### 📊 Test Coverage Standards

#### Coverage Requirements

| Component | Minimum Coverage | Critical Path Coverage |
|-----------|------------------|------------------------|
| Backend   | 80%             | 100%                   |
| Frontend  | 80%             | 100%                   |
| Services  | 85%             | 100%                   |
| API Endpoints | 90%         | 100%                   |
| Utilities | 95%             | N/A                    |

#### Critical Paths

Must have 100% coverage:
- User authentication and authorization
- Payment processing
- Data mutations (create/update/delete)
- Event sourcing and audit logging
- Encryption/decryption operations

### 🧪 Testing Strategy

#### 1. Unit Tests

**Backend (pytest)**:
```bash
# Run all unit tests
cd backend
poetry run pytest tests/unit/ -v

# Coverage report
poetry run pytest --cov=app --cov-report=html --cov-report=term
```

**Frontend (Vitest)**:
```bash
# Run all unit tests
cd frontend
npm test -- --coverage

# Watch mode
npm test -- --watch
```

**Coverage reporting to Codecov**:
```yaml
# .github/workflows/ci.yml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: frontend
```

#### 2. Integration Tests

Test API endpoints and service interactions:

```bash
# Backend
poetry run pytest tests/integration/ -v

# Frontend (with API mocking)
npm run test:integration
```

#### 3. E2E Tests

**Playwright** for critical user flows:

```bash
cd frontend
npm run test:e2e

# Specific test
npm run test:e2e -- tests/auth.spec.ts

# Generate test report
npm run test:e2e -- --reporter=html
```

**Critical E2E scenarios**:
- [ ] User registration and login
- [ ] Case creation and management
- [ ] Transaction ingestion (CSV upload)
- [ ] Report generation
- [ ] Offline sync
- [ ] Multi-tab concurrent edits

#### 4. Migration Testing

**Automated migration tests**:

```python
# tests/test_migrations.py
import pytest
from alembic import command
from alembic.config import Config

def test_upgrade_downgrade():
    """Test migration up and down."""
    config = Config("alembic.ini")
    
    # Upgrade to head
    command.upgrade(config, "head")
    
    # Downgrade one step
    command.downgrade(config, "-1")
    
    # Upgrade again
    command.upgrade(config, "head")

def test_migration_data_integrity():
    """Ensure migrations preserve data."""
    # Insert test data
    # Run migration
    # Verify data intact
    pass
```

**Migration checklist**:
- [ ] Test on fresh database
- [ ] Test upgrade from previous version
- [ ] Test downgrade and re-upgrade
- [ ] Verify data integrity
- [ ] Check for orphaned records
- [ ] Performance test on large dataset

### 📈 Automated Code Quality

#### Continuous Integration

**GitHub Actions** (`.github/workflows/quality.yml`):

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Backend
      - name: Python linting
        run: |
          cd backend
          poetry install
          poetry run black --check .
          poetry run ruff check .
          poetry run mypy app
      
      # Frontend
      - name: Frontend linting
        run: |
          cd frontend
          npm ci
          npm run lint
          npm run type-check
      
      # Security scans
      - name: Security scan
        run: |
          cd backend && poetry run safety check
          cd ../frontend && npm audit
      
      # Test coverage
      - name: Test coverage
        run: |
          cd backend && poetry run pytest --cov --cov-fail-under=80
          cd ../frontend && npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
```

#### Code Review Checklist

**Automated checks**:
- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Coverage meets threshold
- [ ] Security scan clean
- [ ] No merge conflicts

**Manual review**:
- [ ] Code follows style guide
- [ ] Tests are comprehensive
- [ ] Documentation updated
- [ ] No commented-out code
- [ ] Error handling appropriate
- [ ] Performance considerations addressed
- [ ] Security implications reviewed

---

## Incident Response

### 🚨 Incident Response Plan

#### Incident Classification

| Severity | Description | Response Time | Escalation |
|----------|-------------|---------------|------------|
| P0 (Critical) | Data breach, service down | 15 minutes | Immediate |
| P1 (High) | Degraded performance, partial outage | 1 hour | Within 2 hours |
| P2 (Medium) | Non-critical bug, slow response | 4 hours | Next day |
| P3 (Low) | Minor issue, cosmetic bug | 24 hours | As needed |

#### Response Procedures

**1. Detection**
- Automated monitoring alerts
- User reports
- Security scans
- Anomaly detection

**2. Triage**
- Assess severity and impact
- Classify incident type
- Assign incident commander
- Document initial findings

**3. Containment**
- Isolate affected systems
- Implement temporary fixes
- Prevent further damage
- Preserve evidence

**4. Investigation**
- Root cause analysis
- Review logs and metrics
- Check recent deployments
- Identify attack vector (if security)

**5. Recovery**
- Deploy permanent fix
- Verify fix effectiveness
- Restore normal operations
- Monitor for recurrence

**6. Post-Mortem**
- Document timeline
- Identify improvements
- Update runbooks
- Implement preventive measures

#### Security Incident Response

**Data Breach Protocol**:

1. **Immediate Actions** (0-15 min):
   - Isolate affected systems
   - Revoke compromised credentials
   - Enable detailed logging
   - Notify incident commander

2. **Assessment** (15 min - 1 hour):
   - Identify data accessed
   - Determine breach timeline
   - Assess number of affected users
   - Preserve evidence

3. **Containment** (1-4 hours):
   - Patch vulnerability
   - Force password resets
   - Rotate all secrets
   - Block malicious IPs

4. **Notification** (within 72 hours):
   - Notify affected users (GDPR requirement)
   - Report to regulatory authorities
   - Public disclosure (if required)
   - Internal stakeholder update

5. **Recovery** (1-7 days):
   - Restore from clean backups
   - Re-deploy after hardening
   - Enhanced monitoring
   - Forensic analysis

6. **Prevention** (ongoing):
   - Implement security improvements
   - Staff training
   - Update policies
   - Third-party audit

#### Contact Information

**Incident Response Team**:
- Incident Commander: [email]
- Security Lead: [email]
- Technical Lead: [email]
- Legal/Compliance: [email]

**External Contacts**:
- Hosting Provider: [contact]
- Security Firm: [contact]
- Legal Counsel: [contact]

---

## Monitoring

### 📊 Metrics and Observability

#### Prometheus Metrics

**Backend metrics** (`/api/v1/monitoring/metrics`):

```python
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
request_count = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration')

# Business metrics
active_cases = Gauge('active_cases_total', 'Number of active cases')
transaction_ingestion_rate = Counter('transactions_ingested_total', 'Transactions ingested')
```

**Key metrics to monitor**:
- Request rate (requests/second)
- Error rate (4xx/5xx errors)
- Response latency (p50, p95, p99)
- Database query time
- Cache hit ratio
- Queue depth
- Active WebSocket connections
- CPU/Memory usage

#### Grafana Dashboards

**System Overview Dashboard**:
- Request rate and error rate
- Response time percentiles
- Database connection pool
- Redis cache metrics
- Service health status

**Business Metrics Dashboard**:
- Active cases count
- Transactions processed
- Report generation rate
- User activity
- API usage by endpoint

#### Alerting Rules

**Prometheus alerts** (`prometheus/alerts.yml`):

```yaml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value}} req/s"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        for: 5m
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value}}s"
      
      - alert: DatabaseConnectionPoolExhausted
        expr: database_connections_active / database_connections_max > 0.9
        for: 2m
        annotations:
          summary: "Database connection pool near capacity"
```

### 🔍 Logging

**Structured logging** with `structlog`:

```python
import structlog

logger = structlog.get_logger()

# Log with context
logger.info(
    "transaction_created",
    transaction_id=transaction.id,
    subject_id=subject.id,
    amount=transaction.amount,
    user_id=current_user.id
)
```

**Log levels**:
- **DEBUG**: Detailed diagnostic information
- **INFO**: General informational messages
- **WARNING**: Warning messages for potentially harmful situations
- **ERROR**: Error events that might still allow the app to continue
- **CRITICAL**: Severe error events that might cause the app to abort

**Log aggregation**:
- Local development: Console
- Production: ELK Stack (Elasticsearch, Logstash, Kibana) or Loki

---

## Performance Optimization

### 🚀 Backend Optimization

#### Database Optimization

**1. Query Optimization**:
```python
# ❌ N+1 queries
users = await db.execute(select(User))
for user in users:
    cases = await db.execute(select(Case).where(Case.user_id == user.id))

# ✅ Eager loading
users = await db.execute(
    select(User).options(selectinload(User.cases))
)
```

**2. Indexes**:
```python
# Add indexes for frequently queried columns
class Transaction(Base):
    __tablename__ = "transactions"
    
    subject_id = Column(UUID, ForeignKey("subjects.id"), index=True)
    date = Column(DateTime, index=True)
    amount = Column(Numeric, index=True)
```

**3. Connection Pooling**:
```python
# Adjust pool size based on load
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True
)
```

#### Caching Strategy

**1. Redis caching**:
```python
from app.services.cache_service import cache

# Cache expensive queries
@cache.cached(ttl=3600, key_prefix="user:")
async def get_user_by_id(user_id: str):
    return await db.get(User, user_id)
```

**2. HTTP caching**:
```python
from app.core.cache import apply_cache_preset

@router.get("/subjects/")
async def get_subjects(response: Response):
    apply_cache_preset(response, "short")  # 5 minutes
    return subjects
```

#### Async Optimization

**Best practices**:
- Use `async`/`await` for all I/O operations
- Use `asyncio.gather()` for concurrent operations
- Avoid blocking calls (use `run_in_executor` if needed)

```python
# ❌ Sequential
result1 = await service1.call()
result2 = await service2.call()

# ✅ Concurrent
result1, result2 = await asyncio.gather(
    service1.call(),
    service2.call()
)
```

### ⚡ Frontend Optimization

#### Bundle Optimization

**1. Code splitting**:
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
```

**2. Tree shaking**:
```typescript
// ❌ Import entire library
import _ from 'lodash';

// ✅ Import specific functions
import debounce from 'lodash/debounce';
```

**3. Image optimization**:
```typescript
// Use WebP format
<img src="image.webp" alt="Description" loading="lazy" />

// Lazy load images
import { LazyLoadImage } from 'react-lazy-load-image-component';
```

#### React Performance

**1. Memoization**:
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = React.memo(MyComponent);
```

**2. Virtual scrolling**:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => <Item data={items[index]} style={style} />}
</FixedSizeList>
```

#### API Optimization

**1. React Query optimization**:
```typescript
// Prefetch data
queryClient.prefetchQuery(['cases'], fetchCases);

// Optimistic updates
const mutation = useMutation(updateCase, {
  onMutate: async (newCase) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['cases', newCase.id]);
    
    // Snapshot previous value
    const previousCase = queryClient.getQueryData(['cases', newCase.id]);
    
    // Optimistically update
    queryClient.setQueryData(['cases', newCase.id], newCase);
    
    return { previousCase };
  },
  onError: (err, newCase, context) => {
    // Rollback on error
    queryClient.setQueryData(['cases', newCase.id], context.previousCase);
  },
});
```

### 🐳 Docker Optimization

#### Multi-stage Builds

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Image Size Optimization

- Use **Alpine** base images
- Remove development dependencies
- Combine `RUN` commands to reduce layers
- Use `.dockerignore` to exclude unnecessary files

```
# .dockerignore
node_modules
.git
.env
*.md
tests
coverage
```

### 📊 Performance Monitoring

**Lighthouse CI** for frontend:
```bash
# Run Lighthouse
npm install -g @lhci/cli

lhci autorun --config=lighthouserc.json
```

**Performance budgets** (`lighthouserc.json`):
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "interactive": ["error", {"maxNumericValue": 3500}],
        "total-blocking-time": ["warn", {"maxNumericValue": 300}]
      }
    }
  }
}
```

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Docker Benchmarks](https://www.cisecurity.org/benchmark/docker)
- [GDPR Compliance Checklist](https://gdpr.eu/checklist/)

## 🔗 Related Documentation

- [CONTRIBUTING.md](/CONTRIBUTING.md)
- [Backend README](/backend/README.md)
- [Frontend README](/frontend/README.md)
- [CI/CD Documentation](/docs/CI_CD_QUICK_START.md)
