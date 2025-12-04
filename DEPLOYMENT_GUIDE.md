# Deployment Guide - Fraud Detection System

## Overview
This guide provides step-by-step instructions for deploying the Fraud Detection System using Docker.

## Prerequisites

### Required Software
- Docker Engine 20.10+ 
- Docker Compose V2 (included with Docker Desktop)
- Git

### System Requirements
- Minimum 4GB RAM (8GB recommended)
- 20GB available disk space
- Linux, macOS, or Windows with WSL2

## Quick Start (Development)

### 1. Clone the Repository
```bash
git clone https://github.com/teoat/Simple378.git
cd Simple378
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set required values:
```env
POSTGRES_USER=fraud_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=fraud_detection
REDIS_URL=redis://cache:6379/0
CORS_ORIGINS=http://localhost:5173
```

### 3. Build and Start Services
```bash
docker compose up --build
```

Wait for all services to start (2-5 minutes on first build).

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Qdrant Dashboard**: http://localhost:6333/dashboard
- **Jaeger UI**: http://localhost:16686

### 5. Initialize Database
```bash
# Run migrations
docker compose exec backend poetry run alembic upgrade head

# Create admin user (optional)
docker compose exec backend python create_user.py
```

### 6. Verify Deployment
```bash
# Check all services are running
docker compose ps

# Check backend health
curl http://localhost:8000/health

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Production Deployment

### 1. Prepare Production Environment

```bash
# Create production environment file
cp .env.example .env.production
```

Edit `.env.production` with production values:
```env
POSTGRES_USER=fraud_user
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_DB=fraud_detection
REDIS_PASSWORD=<strong-random-password>
REDIS_URL=redis://:${REDIS_PASSWORD}@cache:6379/0
CORS_ORIGINS=https://your-domain.com
API_URL=https://api.your-domain.com
```

### 2. Build Production Images
```bash
docker compose -f docker-compose.prod.yml build
```

### 3. Start Production Stack
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 4. Run Database Migrations
```bash
docker compose -f docker-compose.prod.yml exec backend poetry run alembic upgrade head
```

### 5. Configure SSL/TLS

Add SSL certificates to `nginx/ssl/`:
```bash
mkdir -p nginx/ssl
# Copy your SSL certificate and key
cp /path/to/cert.pem nginx/ssl/
cp /path/to/key.pem nginx/ssl/
```

Update `nginx/nginx.conf` for HTTPS configuration.

### 6. Verify Production Deployment

```bash
# Check service health
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs

# Test database connection
docker compose -f docker-compose.prod.yml exec backend poetry run python -c "from app.db.session import engine; print('DB Connected')"
```

## Service Architecture

### Core Services
1. **Backend** (FastAPI)
   - Port: 8000
   - Handles API requests
   - Manages AI orchestration
   - Performs fraud detection

2. **Frontend** (React + Nginx)
   - Port: 5173 (dev) / 8080 (prod)
   - User interface
   - Data visualization
   - Case management

3. **Database** (PostgreSQL)
   - Port: 5433 (external)
   - Stores all application data
   - Supports async operations

4. **Vector Database** (Qdrant)
   - Port: 6333
   - Semantic search
   - AI embeddings storage

5. **Cache** (Redis)
   - Port: 6380 (external)
   - Session storage
   - Real-time data caching

6. **MCP Server**
   - Agent coordination
   - Multi-agent communication

7. **Jaeger** (Tracing)
   - Port: 16686 (UI)
   - Distributed tracing
   - Performance monitoring

## Monitoring and Maintenance

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend

# Last 100 lines
docker compose logs --tail=100
```

### Resource Usage
```bash
# Check container stats
docker stats

# Check disk usage
docker system df
```

### Backup Database
```bash
# Backup
docker compose exec db pg_dump -U fraud_user fraud_detection > backup.sql

# Restore
docker compose exec -T db psql -U fraud_user fraud_detection < backup.sql
```

### Update Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose up --build -d

# Run any new migrations
docker compose exec backend poetry run alembic upgrade head
```

## Troubleshooting

### Services Won't Start
```bash
# Check logs for errors
docker compose logs

# Reset everything (WARNING: deletes data)
docker compose down -v
docker compose up --build
```

### Database Connection Errors
```bash
# Check if database is running
docker compose ps db

# Check database logs
docker compose logs db

# Verify environment variables
docker compose exec backend env | grep DATABASE
```

### Build Failures

**SSL Certificate Errors**:
If you encounter SSL certificate verification errors during build:
- This is typically an environmental issue (corporate proxy)
- Build in a standard environment
- Or configure Docker to trust your corporate CA

**Out of Memory**:
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or close other applications
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Restart specific service
docker compose restart backend

# Scale services (if needed)
docker compose up -d --scale backend=2
```

## Security Considerations

### Production Checklist
- [ ] Use strong passwords for all services
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure firewall to restrict access
- [ ] Enable Redis password authentication
- [ ] Use secrets management for sensitive data
- [ ] Regularly update Docker images
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Implement backup strategy
- [ ] Set up monitoring alerts

### Network Security
```bash
# The application uses an isolated Docker network (fraud_net)
# Only expose necessary ports to the host
# Use nginx as reverse proxy in production
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend workers
docker compose up -d --scale backend=3

# Use load balancer (nginx) to distribute traffic
```

### Vertical Scaling
- Increase Docker resource limits
- Allocate more CPU/memory in docker-compose.yml

## CI/CD Integration

The repository includes GitHub Actions workflows:
- `.github/workflows/ci.yml` - Automated testing
- `.github/workflows/cd.yml` - Docker image builds
- `.github/workflows/quality-checks.yml` - Code quality

### Deploy from CI/CD
```bash
# Tag a release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# CI/CD will build and push Docker images
```

## Support and Documentation

- **Architecture**: See `/docs/architecture/`
- **API Documentation**: http://localhost:8000/docs (when running)
- **Project Documentation**: 
  - `COMPREHENSIVE_FIX_SUMMARY.md` - Implementation details
  - `PROJECT_COMPLETE.md` - Feature completeness
  - `BRANCH_ANALYSIS.md` - Repository structure
  - `DOCKER_BUILD_VERIFICATION.md` - Build verification

## Rollback Procedure

### Quick Rollback
```bash
# Stop current deployment
docker compose down

# Checkout previous version
git checkout v1.0.0  # or specific commit

# Rebuild and start
docker compose up --build -d

# Restore database backup if needed
docker compose exec -T db psql -U fraud_user fraud_detection < backup.sql
```

## Next Steps After Deployment

1. **Create Admin User**: Use `create_user.py` script
2. **Configure AI Models**: Set up API keys for LangChain/Anthropic
3. **Import Initial Data**: Use ingestion endpoints
4. **Set Up Monitoring**: Configure alerts and dashboards
5. **Test Workflows**: Verify fraud detection functionality
6. **Train Users**: Provide access and training materials

## Conclusion

The Fraud Detection System is production-ready and can be deployed using Docker Compose. Follow this guide for a successful deployment, and refer to the troubleshooting section if you encounter any issues.

For questions or issues, refer to the project documentation or create an issue in the GitHub repository.
