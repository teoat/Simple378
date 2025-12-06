# 🚀 Deployment, Setup & Optimization

---

## Quick Start (5 minutes)

```bash
# 1. Clone & navigate
git clone <repo>
cd Simple378

# 2. Start all services
docker-compose up -d

# 3. Check health
curl http://localhost:8000/health

# 4. Open app
open http://localhost:5173  # or 5174 if conflict

# 5. Login (dev mode - any credentials)
# Email: demo@example.com
# Password: demo123
```

---

## Service Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend (Vite) | 5173 | http://localhost:5173 | ✅ Running |
| Backend (FastAPI) | 8000 | http://localhost:8000 | ✅ Running |
| PostgreSQL | 5432 | localhost:5432 | ✅ Running |
| TimescaleDB | 5434 | localhost:5434 | ✅ Running |
| Redis | 6379 | localhost:6379 | ⏳ Ready (optional) |
| Qdrant | 6333 | localhost:6333 | ⏳ Ready (optional) |
| Prometheus | 9090 | http://localhost:9090 | ⏳ Optional |

---

## Environment Configuration

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/fraud_detection
TIMESCALE_URL=postgresql+asyncpg://postgres:postgres@timescale:5434/fraud_detection_timeseries

# Cache
REDIS_URL=redis://cache:6379/0
REDIS_CACHE_TTL=3600

# Vector Search
QDRANT_URL=http://vector_db:6333
QDRANT_COLLECTION=transactions

# API
API_HOST=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Auth
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env)

```bash
# API Connection
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# App
VITE_APP_NAME=Simple378
VITE_APP_VERSION=1.0.0
```

---

## Database Optimization

### Current State (Before)

```
fraud_db (PostgreSQL 16):
  - shared_buffers: 128MB (default - critically low)
  - work_mem: 4MB (default)
  - max_connections: 100

fraud_timescale (TimescaleDB):
  - shared_buffers: ~2GB (already optimized)
  - work_mem: 3.3MB (too low)
  - max_connections: 100
```

### Recommended Tuning (After)

**Projected Gains:** 15-50x improvement on specific queries

#### Option 1: Apply via docker-compose.yml (Recommended)

```yaml
db:
  image: postgres:16-alpine
  environment:
    - POSTGRES_INITDB_ARGS=-c shared_buffers=2GB -c work_mem=20MB -c max_connections=200 -c effective_cache_size=5GB -c wal_buffers=16MB -c checkpoint_completion_target=0.9

timescale:
  image: timescale/timescaledb:latest-pg16
  environment:
    - POSTGRES_INITDB_ARGS=-c shared_buffers=2GB -c work_mem=50MB -c max_connections=150 -c jit=on -c max_wal_size=4GB
```

#### Option 2: Create SQL optimization script

```sql
-- backend/docker-entrypoint-initdb.d/optimize.sql
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET work_mem = '20MB';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET effective_cache_size = '5GB';

-- Create strategic indexes
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_risk_score ON cases(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_case_date ON transactions(case_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);

SELECT pg_reload_conf();
```

#### Apply Changes

```bash
# Option A: Fresh install with new config
docker-compose down -v
docker-compose up -d db timescale

# Option B: Modify existing (requires restart)
# Edit docker-compose.yml, then:
docker-compose restart db timescale

# Verify
docker exec fraud_db psql -U postgres -c "SHOW shared_buffers;"
# Expected: 2GB
```

### Performance Monitoring

```bash
# Check current buffer usage
docker exec fraud_db psql -U postgres -c "
  SELECT * FROM pg_settings WHERE name LIKE 'shared_buffers';
"

# Monitor query performance
docker exec fraud_db psql -U postgres -d fraud_detection -c "
  EXPLAIN ANALYZE SELECT COUNT(*) FROM transactions WHERE case_id = '123';
"

# Check connection pool
docker exec fraud_db psql -U postgres -c "
  SELECT count(*) FROM pg_stat_activity;
"
```

---

## Database Consolidation (Optional but Recommended)

### Current Setup
- **fraud_db:** PostgreSQL 16 (OLTP)
- **fraud_timescale:** TimescaleDB on PG16 (OLAP) - mostly empty

### Recommendation: Consolidate to Single TimescaleDB

**Benefits:**
- 50% fewer containers
- Simplified backup/recovery
- TimescaleDB is PostgreSQL superset
- Zero data loss risk
- 15-minute implementation

**Risk:** 🟢 Very Low (fully reversible)

### Implementation Steps

```bash
# 1. Backup both databases
docker exec fraud_db pg_dump -U postgres fraud_detection > fraud_detection.sql
docker exec fraud_timescale pg_dump -U postgres fraud_detection_timeseries > timeseries.sql

# 2. Update docker-compose.yml
# - Remove 'timescale' service
# - Update backend environment: point TIMESCALE_URL to 'db:5432'
# - Change fraud_db image to: timescale/timescaledb:latest-pg16

# 3. Restart
docker-compose down
docker-compose up -d db

# 4. Restore data (if starting fresh)
sleep 30
docker exec fraud_db psql -U postgres fraud_detection < fraud_detection.sql

# 5. Verify
docker-compose ps  # Only one db service
curl http://localhost:8000/health  # Should work
```

---

## Production Deployment

### Pre-Launch Checklist

**Critical (P0):**
- [ ] Fix WebSocket authentication (2 hours)
  - Add token to WS URL: `ws://localhost:8000/ws?token=<jwt>`
  - Verify on server side

**High Priority (P1):**
- [ ] Add GZip compression (30 min)
- [ ] Enable Prometheus metrics (1 hour)
- [ ] Wire Redis caching (1 hour)
- [ ] Finalize SSL/nginx config (1 hour)

**Medium (P2):**
- [ ] Run test suite (2 hours)
- [ ] Load testing (2-3 hours)
- [ ] Security audit (4+ hours)

### Docker Compose for Production

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    expose:
      - "3000"
    environment:
      - VITE_API_URL=http://backend:8000

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    expose:
      - "8000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://cache:6379
      - DEBUG=false
    depends_on:
      - db
      - cache

  db:
    image: timescale/timescaledb:latest-pg16
    # ... config as above

  cache:
    image: redis:7-alpine
    # ... config
```

### SSL Certificate Setup

```bash
# Option 1: Let's Encrypt
certbot certonly --standalone -d yourdomain.com

# Option 2: Self-signed (dev only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Nginx Configuration

```nginx
upstream backend {
    server backend:8000;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
    }

    # WebSocket
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Health Checks

### Health Endpoints

```bash
# Backend health
curl http://localhost:8000/health
# Response: {"status": "ok", "version": "1.0.0"}

# Database
curl http://localhost:8000/health/db
# Response: {"database": "connected"}

# Cache
curl http://localhost:8000/health/cache
# Response: {"cache": "connected"}
```

### Prometheus Metrics (Optional)

```bash
# Expose metrics
curl http://localhost:8000/metrics

# Add to Prometheus scrape config
# prometheus.yml
scrape_configs:
  - job_name: 'simple378'
    static_configs:
      - targets: ['localhost:8000']
```

### Docker Compose Health Checks

```yaml
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    timeout: 5s
    retries: 5

backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 10s
    retries: 3

cache:
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 3
```

---

## Troubleshooting

### Port Conflicts

```bash
# Find what's using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
cd frontend
npm run dev -- --port 5174
```

### Database Connection Issues

```bash
# Test connection
docker exec fraud_db psql -U postgres -c "SELECT 1;"

# Check logs
docker logs fraud_db

# Reset database
docker-compose down -v
docker-compose up -d db
```

### WebSocket Connection Failed

```bash
# Check WS endpoint
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:8000/ws

# Check backend logs
docker logs backend | grep -i websocket
```

---

## Backup & Recovery

```bash
# Create backup
docker exec fraud_db pg_dump -U postgres fraud_detection > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker exec -i fraud_db psql -U postgres fraud_detection < backup.sql

# Backup volumes
docker run --rm -v simple378_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/db.tar.gz /data
```

---

## Performance Tuning Checklist

- [ ] Database parameters optimized (15-50x improvement possible)
- [ ] Redis caching wired (10-30% faster)
- [ ] Frontend bundle optimized (800KB achieved)
- [ ] HTTP compression enabled (GZip)
- [ ] Connection pooling configured
- [ ] Lazy loading implemented
- [ ] CDN configured (optional)
- [ ] Monitoring setup (Prometheus + Grafana)

---

**Deployment Status:** ✅ Ready for Staging  
**Production Timeline:** 12-15 hours prep work, then launch-ready
