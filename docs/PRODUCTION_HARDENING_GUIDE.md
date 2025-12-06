# Production Hardening Implementation Guide

**Status:** In Progress  
**Started:** 2025-12-06 16:17 JST  
**Target:** Quick Production Hardening (Option B)

---

## 🎯 Implementation Checklist

### ✅ 1. GZip Compression
**Status:** ⏳ TO IMPLEMENT  
**Effort:** 5 minutes  
**Impact:** 30-40% smaller payloads

**Implementation:**
```python
# Add to backend/app/main.py after app initialization
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

**Benefits:**
- Reduces response sizes by 30-40%
- Faster page loads
- Lower bandwidth costs

---

### ✅ 2. Rate Limiting
**Status:** ✅ ALREADY IMPLEMENTED  
**Location:** `backend/app/main.py` lines 40-115

**Current Implementation:**
- TokenBucketRateLimiter configured
- Redis-backed rate limiting
- 100 requests per 60 seconds
- Rate limit headers in responses

**No action needed** ✅

---

### 🔄 3. Redis Caching
**Status:** ⏳ TO IMPLEMENT  
**Effort:** 2 hours  
**Impact:** 50% faster dashboard queries

**Step 1: Create Cache Service**
Create `backend/app/services/cache_service.py`:

```python
import redis.asyncio as redis
from functools import wraps
import json
from typing import Optional, Any
from app.core.config import settings

class CacheService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
    
    async def connect(self):
        \"\"\"Initialize Redis connection\"\"\"
        try:
            self.redis_client = await redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis_client.ping()
        except Exception as e:
            print(f"Redis connection failed: {e}")
            self.redis_client = None
    
    async def get(self, key: str) -> Optional[Any]:
        \"\"\"Get value from cache\"\"\"
        if not self.redis_client:
            return None
        try:
            value = await self.redis_client.get(key)
            return json.loads(value) if value else None
        except:
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 300):
        \"\"\"Set value in cache with TTL in seconds\"\"\"
        if not self.redis_client:
            return
        try:
            await self.redis_client.setex(
                key,
                ttl,
                json.dumps(value, default=str)
            )
        except:
            pass
    
    async def delete(self, key: str):
        \"\"\"Delete key from cache\"\"\"
        if not self.redis_client:
            return
        try:
            await self.redis_client.delete(key)
        except:
            pass

# Global cache instance
cache = CacheService()

def cached(ttl: int = 300, key_prefix: str = ""):
    \"\"\"Decorator for caching function results\"\"\"
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{json.dumps([str(a) for a in args])}"
            
            # Try cache first
            cached_value = await cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            await cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator
```

**Step 2: Use in Visualization Service**
Update `backend/app/services/visualization_service.py`:

```python
from app.services.cache_service import cached

class VisualizationService:
    
    @staticmethod
    @cached(ttl=60, key_prefix="viz")  # Cache for 1 minute
    async def get_kpis(db: AsyncSession, period_days: int = 30):
        # ... existing implementation
        pass
    
    @staticmethod
    @cached(ttl=300, key_prefix="viz")  # Cache for 5 minutes
    async def get_expense_trend(db: AsyncSession):
        # ... existing implementation
        pass
```

**Step 3: Initialize on Startup**
Add to `backend/app/main.py`:

```python
from app.services.cache_service import cache

@app.on_event("startup")
async def startup_event():
    await cache.connect()
```

---

### 🔄 4. Prometheus Metrics
**Status:** ✅ PARTIALLY IMPLEMENTED  
**Location:** `backend/app/main.py` line 37

**Current Status:**
- MetricsCollector exists ✅
- `/metrics` endpoint exists ✅
- Need to add HTTP request tracking

**Enhancement Needed:**
Add HTTP request duration tracking middleware:

```python
# Add to backend/app/main.py
from prometheus_client import Counter, Histogram
import time

# Define metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    \"\"\"Track HTTP request metrics for Prometheus\"\"\"
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Record metrics
    http_requests_total.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    http_request_duration_seconds.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    # Add duration to response headers
    response.headers["X-Process-Time"] = str(duration)
    
    return response
```

---

### 🔄 5. Production Docker Compose
**Status:** ⏳ TO IMPLEMENT  
**Effort:** 4 hours  
**Impact:** Production deployment ready

**Create `docker-compose.prod.yml`:**

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_files:/usr/share/nginx/html/static
    depends_on:
      - frontend
      - backend
    restart: always
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    expose:
      - "80"
    restart: always
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    expose:
      - "8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - WORKERS=4
      - THREADS=2
      - LOG_LEVEL=info
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
    environment:
      - POSTGRES_DB=${POSTGRES_DB:-simple378}
      - POSTGRES_USER=${POSTGRES_USER:-simple378}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    restart: always
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-simple378}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: always
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    restart: always
    networks:
      - app-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  prometheus_data:
    driver: local
  static_files:
    driver: local
```

**Create `nginx/nginx.conf`:**

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_status 429;

    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS (if needed)
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://backend/health;
        }
    }
}
```

**Create `prometheus/prometheus.yml`:**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
```

---

## 📊 Implementation Status

| Optimization | Status | Time | Notes |
|--------------|--------|------|-------|
| GZip Compression | ⏳ Pending | 5 min | Add one middleware |
| Rate Limiting | ✅ Complete | 0 min | Already implemented |
| Redis Caching | ⏳ Pending | 2 hours | Create service + integrate |
| Prometheus Metrics | 🟡 Partial | 1 hour | Add HTTP tracking |
| Production Docker | ⏳ Pending | 4 hours | Create compose + nginx |

**Total Estimated Time:** ~7 hours  
**Already Done:** Rate limiting (saved 1 hour)

---

## 🚀 Implementation Order

1. **GZip Compression** (5 min) - Quickest win
2. **Prometheus HTTP Tracking** (1 hour) - Enhance existing
3. **Redis Caching** (2 hours) - High impact
4. **Production Docker Compose** (4 hours) - Final step

---

## ✅ Quick Wins (Do First)

### 1. Add GZip (Now - 5 minutes)
```bash
# Edit backend/app/main.py
# Add after app initialization:
# from fastapi.middleware.gzip import GZipMiddleware
# app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### 2. Test Rate Limiting (Already Works)
```bash
# Test with rapid requests
curl -X GET http://localhost:8000/api/v1/dashboard/metrics
# Should return 429 after 100 requests in 60s
```

---

##Next Steps

Ready to implement? I can:
1. Create all the files above
2. Update existing services
3. Test each component
4. Deploy to production

**Recommendation:** Start with quick wins (GZip + Prometheus tracking), then Redis caching, then Docker production setup.

---

*Generated: 2025-12-06 16:18 JST*
