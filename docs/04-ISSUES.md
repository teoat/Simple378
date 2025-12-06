# ⚠️ Known Issues & Pre-Production Fixes

**Last Updated:** 2025-12-06

---

## Priority Legend

| Level | Description | Action |
|-------|-------------|--------|
| **P0** | Blocking production | Fix before launch |
| **P1** | High impact | Fix this week |
| **P2** | Medium impact | Fix next week |
| **P3** | Low impact | Fix later |

---

## P0: Critical Blocking Issues

### SEC-1: WebSocket Authentication Broken

**Severity:** CRITICAL  
**Impact:** Unauthenticated or trivially spoofable real-time connections

**Problem:**
- Frontend doesn't append JWT token to WebSocket URL
- Backend uses simplified `user_id = token` instead of proper JWT decode
- Anyone can connect to adjudication queue without credentials

**Files Involved:**
- `frontend/src/hooks/useWebSocket.ts`
- `backend/app/api/websocket.py`

**Fix (2 hours):**

**Frontend:**
```typescript
// useWebSocket.ts - Add token to URL
const token = localStorage.getItem('token');
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//localhost:8000/ws?token=${token}`);

// Add connection verification
ws.addEventListener('open', () => {
  console.log('✅ WebSocket connected with auth');
});

ws.addEventListener('error', (e) => {
  if (e.code === 1008) {
    console.error('🔒 Authentication failed');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
});
```

**Backend:**
```python
# websocket.py - Verify JWT token
from fastapi import WebSocket, status
import jwt

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Get token from query param
    token = websocket.query_params.get("token")
    
    # Verify token
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except jwt.InvalidTokenError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    await websocket.accept()
    # ... rest of handler
```

**Verify:**
```bash
# Test with token
wscat -c "ws://localhost:8000/ws?token=<valid_jwt>"
# Should connect

# Test without token
wscat -c "ws://localhost:8000/ws"
# Should close with 1008 status
```

---

## P1: High Priority Issues

### PER-1: HTTP Compression Not Enabled

**Severity:** HIGH  
**Impact:** 30-40% response bloat

**Problem:** GZip middleware not added to FastAPI

**Fix (30 minutes):**

```python
# backend/app/main.py
from fastapi.middleware.gzip import GZIPMiddleware

app = FastAPI()

# Add GZip compression for responses > 1000 bytes
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# Must be added before other middleware
```

**Verify:**
```bash
curl -i -H "Accept-Encoding: gzip" http://localhost:8000/api/cases
# Response should include: Content-Encoding: gzip
```

---

### OBS-1: Prometheus Metrics Incomplete

**Severity:** HIGH  
**Impact:** Limited observability

**Problem:** Only base metrics; HTTP request metrics missing

**Fix (1 hour):**

```python
# backend/app/core/prometheus.py
from prometheus_client import Counter, Histogram
import time

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

# Add middleware in main.py
from fastapi.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response

app.add_middleware(MetricsMiddleware)
```

**Verify:**
```bash
curl http://localhost:8000/metrics
# Should show: http_requests_total, http_request_duration_seconds
```

---

### PERF-1: Redis Caching Not Implemented

**Severity:** HIGH  
**Impact:** 10-30% slower for repeated queries

**Problem:** Cache service exists but not used; expensive queries not cached

**Fix (1 hour):**

```python
# backend/app/services/cache_service.py
from redis import asyncio as aioredis
import json
import functools

class CacheService:
    def __init__(self, redis_url: str):
        self.redis = None
        self.redis_url = redis_url
    
    async def connect(self):
        self.redis = await aioredis.from_url(self.redis_url)
    
    async def get(self, key: str):
        data = await self.redis.get(key)
        return json.loads(data) if data else None
    
    async def set(self, key: str, value: dict, ttl: int = 3600):
        await self.redis.setex(key, ttl, json.dumps(value))
    
    async def delete(self, key: str):
        await self.redis.delete(key)

def cache_endpoint(ttl: int = 3600):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{args}:{kwargs}"
            
            # Check cache
            cached = await cache_service.get(cache_key)
            if cached:
                return cached
            
            # Execute and cache
            result = await func(*args, **kwargs)
            await cache_service.set(cache_key, result, ttl)
            return result
        
        return wrapper
    return decorator

# Usage in endpoints
@router.get("/api/v1/metrics/dashboard")
@cache_endpoint(ttl=300)  # 5 min cache
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    # Expensive query
    return await calculate_metrics(db)
```

**Verify:**
```bash
# First call - from DB
time curl http://localhost:8000/api/v1/metrics/dashboard
# ~500ms

# Second call - from cache
time curl http://localhost:8000/api/v1/metrics/dashboard
# ~50ms (10x faster)
```

---

### DEVOPS-1: Production SSL/Nginx Not Finalized

**Severity:** HIGH  
**Impact:** Can't deploy to production

**Problem:** `docker-compose.prod.yml`, nginx config, SSL only drafted

**Fix (1 hour):**
See `03-DEPLOYMENT.md` → Production Deployment section

---

## P2: Medium Priority Issues

### TEST-1: Test Suite Not Executed

**Severity:** MEDIUM  
**Impact:** Unknown coverage, untested edge cases

**Fix (2 hours):**

```bash
# Frontend tests
cd frontend
npm run test
npm run test:e2e

# Backend tests
cd backend
pytest
pytest --cov=app tests/

# All together
npm run test:all
```

---

### PERF-2: Performance Metrics Unverified

**Severity:** MEDIUM  
**Impact:** Claims of 800KB bundle, 85 Lighthouse unvalidated

**Fix (1 hour):**

```bash
# Build & measure
cd frontend
npm run build
npm run build:analyze

# Lighthouse
npm run lighthouse
# Record results in docs/PERFORMANCE.md
```

---

### SEC-2: Rate Limiting Not Configured

**Severity:** MEDIUM  
**Impact:** Vulnerable to brute force, DoS

**Fix (1 hour):**

```python
# backend/core/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# In main.py
app.state.limiter = limiter
app.include_router(router)

# On endpoints
@router.post("/auth/login")
@limiter.limit("5/minute")
async def login(credentials: LoginSchema):
    # Max 5 login attempts per minute per IP
    ...
```

---

## P3: Low Priority Issues

### UX-1: Loading States Not Implemented

**Severity:** LOW  
**Impact:** Poor UX during slow operations

**Fix:** Add loading spinners on all async operations

### UX-2: Mobile Responsive Issues

**Severity:** LOW  
**Impact:** Mobile users see broken layout

**Fix:** Add mobile breakpoints to Tailwind config

---

## Validation Checklist

After fixes, verify:

```bash
# WebSocket Auth
✅ Token required for WS connection
✅ Invalid token closes connection with 1008

# HTTP Compression
✅ curl -H "Accept-Encoding: gzip" shows compressed response
✅ Check with DevTools Network tab

# Prometheus
✅ curl http://localhost:8000/metrics shows request metrics
✅ http_requests_total counter increments
✅ http_request_duration_seconds histogram tracks time

# Redis Cache
✅ First call to /metrics/dashboard takes ~500ms
✅ Second call takes ~50ms (10x faster)
✅ Cache invalidates on data changes

# Tests
✅ Frontend: npm run test passes
✅ Backend: pytest passes
✅ E2E: All critical user flows pass

# Deployment
✅ docker-compose.prod.yml valid
✅ nginx.conf includes all needed proxies
✅ SSL certificates obtainable
✅ Health checks pass
```

---

## Implementation Timeline

**Recommended Order:**

1. **Today (P0):** WebSocket auth (2 hours) → test in app
2. **This Week (P1):**
   - GZip compression (30 min)
   - Prometheus metrics (1 hour)
   - Redis caching (1 hour)
   - Production stack (1 hour)
   - **Total: 4.5 hours**

3. **Next Week (P2):**
   - Test suite (2 hours)
   - Performance verification (1 hour)
   - Rate limiting (1 hour)
   - **Total: 4 hours**

**Critical Path:** 2 hours (P0) + 4.5 hours (P1) = 6.5 hours before production-ready

---

**Status:** ✅ All fixes documented with code examples  
**Next Step:** Pick P0 and start with WebSocket authentication fix
