# Service Optimization Quick Reference

## Quick Start

### Development
```bash
# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build

# View logs
docker compose logs -f backend
```

### Production
```bash
# Copy and configure production environment
cp .env.production.example .env.production
# Edit .env.production with actual credentials

# Start production services
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## Key Optimizations Applied

### Resource Limits (Docker Compose)

| Service    | Dev CPU | Dev Memory | Prod CPU | Prod Memory |
|------------|---------|------------|----------|-------------|
| Backend    | 2 cores | 1GB        | 4 cores  | 2GB         |
| Frontend   | 1 core  | 1GB        | 1 core   | 512MB       |
| MCP Server | 1 core  | 512MB      | 2 cores  | 1GB         |
| PostgreSQL | 2 cores | 2GB        | 4 cores  | 4GB         |
| Redis      | 1 core  | 768MB      | 2 cores  | 1.5GB       |
| Qdrant     | 2 cores | 1GB        | 4 cores  | 2GB         |
| Jaeger     | 1 core  | 512MB      | 2 cores  | 1GB         |

### Database Performance Settings

#### PostgreSQL (Development)
- `shared_buffers`: 256MB
- `effective_cache_size`: 1GB
- `work_mem`: 16MB
- `max_connections`: 100

#### PostgreSQL (Production)
- `shared_buffers`: 512MB
- `effective_cache_size`: 2GB
- `work_mem`: 32MB
- `max_connections`: 200

#### Redis (Development)
- `maxmemory`: 512MB
- `maxmemory-policy`: allkeys-lru
- Persistence: AOF + RDB snapshots

#### Redis (Production)
- `maxmemory`: 1GB
- `maxmemory-policy`: allkeys-lru
- Authentication: Password required
- Persistence: AOF + multiple RDB snapshots

### Nginx Optimizations

- **Gzip compression**: Enabled (level 6)
- **Worker connections**: 2048 (2x default)
- **Static asset caching**: 7 days
- **Proxy buffering**: Enabled
- **Keepalive**: 65 seconds, 100 requests

### Kubernetes Autoscaling

#### Backend HPA
- Min replicas: 2
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

#### Frontend HPA
- Min replicas: 2
- Max replicas: 6
- CPU threshold: 70%
- Memory threshold: 75%

## Performance Expectations

| Metric              | Before | After | Improvement |
|---------------------|--------|-------|-------------|
| API Response Time   | 100ms  | 70ms  | 30% faster  |
| Concurrent Requests | 100    | 400   | 4x increase |
| Image Size (Backend)| 800MB  | 500MB | 37% smaller |
| Image Size (MCP)    | 400MB  | 200MB | 50% smaller |
| Static Asset Size   | 5MB    | 1.5MB | 70% smaller |

## Health Check Endpoints

- **Backend**: `http://localhost:8000/health`
- **Frontend**: `http://localhost:8080/`
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

## Monitoring Commands

### Docker Compose
```bash
# View resource usage
docker stats

# View logs
docker compose logs -f [service]

# Check service health
docker compose ps
```

### Kubernetes
```bash
# View pod status
kubectl get pods -n fraud-detection

# View HPA status
kubectl get hpa -n fraud-detection

# View resource usage
kubectl top pods -n fraud-detection

# View logs
kubectl logs -f deployment/backend -n fraud-detection
```

## Common Issues & Solutions

### Issue: Service won't start
**Check:**
1. Health check endpoint responding?
2. Dependencies started first?
3. Environment variables set correctly?

**Solution:**
```bash
docker compose logs [service]
docker compose restart [service]
```

### Issue: High memory usage
**Check:**
1. Are limits set appropriately?
2. Is there a memory leak?

**Solution:**
```bash
# Adjust limits in docker-compose.yml
# Restart service
docker compose restart [service]
```

### Issue: Slow response times
**Check:**
1. Database connection pool size
2. Redis cache hit rate
3. Number of workers

**Solution:**
- Increase uvicorn workers (backend)
- Tune PostgreSQL settings
- Review Redis maxmemory policy

### Issue: HPA not scaling
**Check:**
1. Metrics server installed?
2. Resource requests set?
3. Metrics available?

**Solution:**
```bash
kubectl get hpa -n fraud-detection
kubectl describe hpa backend-hpa -n fraud-detection
kubectl top pods -n fraud-detection
```

## Rollback Instructions

### Docker Compose
```bash
# Stop services
docker compose down

# Checkout previous version
git checkout <previous-commit>

# Restart services
docker compose up -d
```

### Kubernetes
```bash
# Rollback deployment
kubectl rollout undo deployment/backend -n fraud-detection
kubectl rollout undo deployment/frontend -n fraud-detection

# Check rollback status
kubectl rollout status deployment/backend -n fraud-detection
```

## Configuration Files

- **Development**: `docker-compose.yml`
- **Production**: `docker-compose.prod.yml`
- **Kubernetes Deployment**: `k8s/deployment.yaml`
- **Kubernetes HPA**: `k8s/hpa.yaml`
- **Kubernetes PDB**: `k8s/pdb.yaml`
- **Nginx**: `nginx/nginx.conf`
- **Frontend Nginx**: `frontend/nginx.conf`

## Environment Variables

See:
- `.env.example` for development
- `.env.production.example` for production

**Critical Variables:**
- `POSTGRES_PASSWORD`: Database password
- `REDIS_PASSWORD`: Redis password (production)
- `SECRET_KEY`: JWT secret key
- `ANTHROPIC_API_KEY`: AI API key
- `CORS_ORIGINS`: Allowed origins

## Additional Resources

- [Full Optimization Guide](./SERVICE_OPTIMIZATION_GUIDE.md)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes HPA Guide](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [PostgreSQL Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Configuration](https://redis.io/docs/management/config/)
