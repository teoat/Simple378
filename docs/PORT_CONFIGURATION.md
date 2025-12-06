# Port Standardization & Configuration Guide

**Last Updated:** 2025-12-06  
**Status:** ✅ Standardized

---

## 📋 Standard Port Allocation

### Development Environment

| Service | Port | Protocol | Access | Config File |
|---------|------|----------|--------|-------------|
| **Frontend (Vite)** | 5173 | HTTP | localhost | `frontend/vite.config.ts` |
| **Backend (FastAPI)** | 8000 | HTTP | localhost | `backend/app/main.py` |
| **PostgreSQL** | 5432 | TCP | internal | `docker-compose.yml` |
| **Redis** | 6379 | TCP | internal | `docker-compose.yml` |
| **Qdrant (Vector DB)** | 6333 | HTTP | internal | `docker-compose.yml` |
| **Prometheus** | 9090 | HTTP | localhost | `docker-compose.yml` |

---

## 🔧 Configuration Files

### Frontend: `frontend/vite.config.ts`

```typescript
export default defineConfig({
  server: {
    host: true,
    port: 5173,  // ✅ Standard port
    strictPort: true,  // ❗ Fail if port is occupied
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### Backend: `backend/app/main.py`

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,  # ✅ Standard port
        reload=True,
    )
```

### Docker Compose: `docker-compose.yml`

```yaml
services:
  frontend:
    ports:
      - "5173:5173"  # ✅ Host:Container

  backend:
    ports:
      - "8000:8000"

  postgres:
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"

  qdrant:
    ports:
      - "6333:6333"
```

---

## 🚨 Troubleshooting Port Conflicts

### Check What's Using a Port

```bash
# macOS/Linux
lsof -i :5173
lsof -i :8000
lsof -i :5432

# Windows
netstat -ano | findstr :5173
```

### Kill Process on Port

```bash
# Find PID
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use one-liner
kill -9 $(lsof -t -i:5173)
```

### Common Culprits
- **Port 5173:** Stale Vite dev server
- **Port 8000:** Previous FastAPI instance
- **Port 5432:** Local PostgreSQL installation

---

## 🔐 Security Best Practices

### Development
- ✅ All services on `localhost`
- ✅ Database ports not exposed externally
- ✅ CORS configured for `localhost:5173` only

### Production
```nginx
# Never expose database ports
# Use reverse proxy for frontend & backend

server {
    listen 443 ssl;
    server_name app.simple378.com;

    location / {
        proxy_pass http://frontend:80;
    }

    location /api {
        proxy_pass http://backend:8000;
    }
}
```

---

## 🔄 Environment Variables

### `.env` Files

**Backend: `backend/.env`**
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/simple378
REDIS_URL=redis://localhost:6379

# Ports
PORT=8000
HOST=0.0.0.0

# CORS
CORS_ORIGINS=http://localhost:5173

# Vector DB
QDRANT_URL=http://localhost:6333
```

**Frontend: `frontend/.env`**
```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Development Port
VITE_PORT=5173
```

---

## 📊 Port Monitoring

### Health Check Endpoints

```bash
# Frontend (should return HTML)
curl http://localhost:5173

# Backend Health
curl http://localhost:8000/health

# PostgreSQL
pg_isready -h localhost -p 5432

# Redis
redis-cli -p 6379 ping

# Qdrant
curl http://localhost:6333/health
```

### Automated Health Check Script

```bash
#!/bin/bash
# scripts/check-ports.sh

PORTS=(5173 8000 5432 6379 6333)
NAMES=("Frontend" "Backend" "PostgreSQL" "Redis" "Qdrant")

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${NAMES[$i]}
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ $NAME running on port $PORT"
    else
        echo "❌ $NAME NOT running on port $PORT"
    fi
done
```

---

## 🚀 Quick Start Commands

### Start All Services

```bash
# Option 1: Docker Compose (Recommended)
docker-compose up -d

# Option 2: Manual (Development)
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend  
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 3 - Database (if not using Docker)
docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
```

### Stop All Services

```bash
# Docker
docker-compose down

# Kill all Node processes (includes Vite)
pkill -f node

# Kill Python processes (includes FastAPI)
pkill -f uvicorn
```

---

## 📱 Port Forwarding for Mobile Testing

### ngrok (Expose localhost)

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from ngrok.com

# Expose frontend
ngrok http 5173

# Expose backend
ngrok http 8000
```

### Update CORS for Mobile Testing

```python
# backend/app/core/config.py
CORS_ORIGINS = [
    "http://localhost:5173",
    "https://your-ngrok-url.ngrok.io",  # Add ngrok URL
]
```

---

## 🔧 Optimization Recommendations

### 1. Use Environment-Specific Ports

```typescript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    port: process.env.VITE_PORT 
      ? parseInt(process.env.VITE_PORT) 
      : 5173,
  },
})
```

### 2. Port Range Allocation

Reserve port ranges for different environments:
- **5173-5179:** Frontend (dev/test/staging)
- **8000-8009:** Backend (dev/test/staging)
- **5432:** PostgreSQL (always)
- **6379:** Redis (always)

### 3. Docker Network Isolation

```yaml
# docker-compose.yml
networks:
 frontend:
    driver: bridge
  backend:
    driver: bridge
  
services:
  frontend:
    networks:
      - frontend
  
  backend:
    networks:
      - frontend
      - backend
  
  postgres:
    networks:
      - backend  # Not accessible from frontend
```

---

## ✅ Validation Checklist

- [ ] All services start without port conflicts
- [ ] Frontend can reach backend API
- [ ] Backend can connect to database
- [ ] WebSocket connections work
- [ ] Health checks pass for all services
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Docker networking configured

---

## 📚 Related Documentation

- [Docker Compose Configuration](../docker-compose.yml)
- [Frontend Configuration](../frontend/vite.config.ts)
- [Backend Configuration](../backend/app/main.py)
- [Environment Variables](../.env.example)

---

**Maintained by:** Development Team  
**Review Schedule:** Quarterly or when adding new services
