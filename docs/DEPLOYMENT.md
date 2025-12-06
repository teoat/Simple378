# 🚀 Full System Deployment Guide

## Overview

This guide will help you deploy the entire AntiGravity Fraud Detection System, including all MCP servers and supporting infrastructure.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AntiGravity System                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React)          Backend (FastAPI)                 │
│  Port: 5173                Port: 8000                        │
│  ├─ GraphQL Client         ├─ REST API                       │
│  ├─ Event Sourcing         ├─ GraphQL API                    │
│  └─ Offline Sync           └─ WebSocket                      │
│                                                               │
│  MCP Coordination Server                                     │
│  Port: 8080                                                  │
│  ├─ Task Coordination                                        │
│  ├─ Agent Registry                                           │
│  └─ Inter-agent Messaging                                    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PostgreSQL (5432)         Redis (6379)                      │
│  Qdrant (6333)             Meilisearch (7700)                │
│  MinIO (9000/9001)                                           │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                Observability Stack                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Prometheus (9090)         Grafana (3000)                    │
│  Jaeger (16686)                                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Required
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**

### Optional (for local development)
- **Node.js** (v20+)
- **Python** (3.12+)
- **Poetry** (Python package manager)

## Quick Start

### 1. Clone and Configure

```bash
cd /Users/Arief/Desktop/Simple378

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 2. Deploy Everything

```bash
./deploy.sh
```

This script will:
1. ✅ Stop any existing containers
2. ✅ Build all Docker images
3. ✅ Start infrastructure services (DB, Cache, etc.)
4. ✅ Wait for infrastructure to be ready
5. ✅ Start application services
6. ✅ Run health checks

### 3. Access Services

Once deployment completes, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main web application |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/api/v1/docs | Swagger UI |
| **GraphQL** | http://localhost:8000/graphql | GraphQL Playground |
| **MCP Server** | http://localhost:8080 | Agent coordination |
| **Grafana** | http://localhost:3000 | Monitoring dashboards |
| **Prometheus** | http://localhost:9090 | Metrics database |
| **Jaeger** | http://localhost:16686 | Distributed tracing |
| **MinIO** | http://localhost:9001 | Object storage console |

## Manual Deployment

### Step 1: Start Infrastructure

```bash
docker-compose up -d db cache vector_db meilisearch prometheus grafana jaeger minio
```

### Step 2: Wait for Services

```bash
# Check PostgreSQL
docker-compose exec db pg_isready -U fraud_user

# Check Redis
docker-compose exec cache redis-cli ping
```

### Step 3: Run Migrations

```bash
docker-compose exec backend alembic upgrade head
```

### Step 4: Start Applications

```bash
docker-compose up -d backend mcp-server frontend
```

## MCP Server Configuration

### Available MCP Servers

1. **Agent Coordination** (Port 8080)
   - Task distribution
   - Agent lifecycle management
   - Inter-agent messaging

2. **Chrome DevTools** (Browser automation)
3. **Context7** (Documentation retrieval)
4. **Memory** (Knowledge graph)
5. **Postgres** (Database queries)
6. **Prometheus** (Metrics)

### Verify MCP Server

```bash
curl http://localhost:8080/health
```

## Environment Variables

### Core Settings

```env
# Database
POSTGRES_USER=fraud_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=fraud_detection

# API
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Security
SECRET_KEY=your_secret_key_here
ANTHROPIC_API_KEY=your_anthropic_key

# MCP
COORDINATION_TTL=3600
```

### Optional Settings

```env
# Monitoring
GRAFANA_ADMIN_PASSWORD=admin
SENTRY_DSN=your_sentry_dsn

# Search
MEILI_MASTER_KEY=masterKey

# Storage
MINIO_ROOT_USER=fraud_storage_admin
MINIO_ROOT_PASSWORD=your_minio_password
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mcp-server
```

### Check Service Status

```bash
docker-compose ps
```

### Resource Usage

```bash
docker stats
```

## Grafana Dashboards

1. Navigate to http://localhost:3000
2. Login with `admin` / `admin` (or your configured password)
3. Pre-configured dashboards:
   - Backend API Performance
   - Database Metrics
   - MCP Task Coordination
   - System Resource Usage

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Verify database connection
docker-compose exec backend python -c "from app.db.session import engine; print('OK')"
```

### MCP Server connection issues

```bash
# Restart MCP server
docker-compose restart mcp-server

# Check connectivity
curl http://localhost:8080/health
```

### Database migration errors

```bash
# Reset database (⚠️ DESTROYS DATA)
docker-compose down -v
docker-compose up -d db
docker-compose exec backend alembic upgrade head
```

### Frontend can't reach backend

1. Check CORS settings in `.env`
2. Verify backend is running: `curl http://localhost:8000/health`
3. Check browser console for CORS errors

## Scaling

### Horizontal Scaling

Add more workers for the backend:

```yaml
backend:
  deploy:
    replicas: 3
```

### Load Balancing

Use nginx as a reverse proxy:

```bash
docker-compose -f docker-compose.yml -f docker-compose.lb.yml up
```

## Security

### Production Checklist

- [ ] Change all default passwords
- [ ] Set strong `SECRET_KEY`
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up backup system
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up monitoring alerts

## Backup

### Database Backup

```bash
docker-compose exec db pg_dump -U fraud_user fraud_detection > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db psql -U fraud_user fraud_detection < backup.sql
```

## Shutdown

### Graceful Shutdown

```bash
docker-compose down
```

### Complete Cleanup (⚠️ Removes data)

```bash
docker-compose down -v --remove-orphans
```

## Next Steps

1. **Configure Authentication**: Set up OAuth providers
2. **Load Test Data**: Import sample datasets
3. **Configure Alerts**: Set up Grafana alerts
4. **Run E2E Tests**: Execute Playwright tests
5. **Review Logs**: Check for any errors or warnings

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review docs: `/docs`
- Health checks: All services expose `/health` endpoints
