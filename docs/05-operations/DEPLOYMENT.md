# 🚀 Deployment Guide

> Production deployment for Simple378

---

## Deployment Options

| Option | Best For | Complexity |
|--------|----------|------------|
| Docker Compose | Single server, staging | Low |
| Kubernetes | High availability, scale | High |
| Cloud (AWS/GCP) | Managed services | Medium |

---

## Docker Compose (Recommended)

### Prerequisites
- Linux server (Ubuntu 22.04 recommended)
- Docker & Docker Compose installed
- Domain name with SSL certificate
- Minimum 4GB RAM, 2 CPU cores

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/simple378.git
cd simple378
```

### Step 2: Configure Environment

```bash
cp .env.example .env.production
nano .env.production
```

**Required settings:**
```env
# Database (use strong passwords!)
DATABASE_URL=postgresql://simple378:STRONG_PASSWORD@postgres:5432/simple378
REDIS_URL=redis://redis:6379

# Security
SECRET_KEY=generate-a-32-char-random-string
CORS_ORIGINS=https://your-domain.com

# AI Services
OPENAI_API_KEY=sk-your-key

# Production settings
DEBUG=false
LOG_LEVEL=INFO
```

### Step 3: Build & Deploy

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Step 4: Setup Nginx (SSL)

```nginx
# /etc/nginx/sites-available/simple378
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Step 5: Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Database Backup

### Automated Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup-db.sh

BACKUP_DIR=/opt/backups
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker exec simple378-postgres pg_dump -U postgres simple378 > $BACKUP_DIR/simple378_$DATE.sql

# Compress
gzip $BACKUP_DIR/simple378_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

### Cron Job

```bash
# Daily at 2 AM
0 2 * * * /opt/scripts/backup-db.sh
```

---

## Health Checks

### Backend Health

```bash
curl http://localhost:8000/health
```

Expected: `{"status": "healthy"}`

### Docker Health

```bash
docker-compose -f docker-compose.prod.yml ps
```

All services should show `Up (healthy)`.

---

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancer

Use Nginx or HAProxy to distribute traffic across replicas.

---

## Rollback

### Quick Rollback

```bash
# Stop current
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout v1.0.0

# Rebuild and start
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Rollback

```bash
# Restore from backup
docker exec -i simple378-postgres psql -U postgres simple378 < backup.sql
```

---

## Security Checklist

- [ ] Strong database passwords
- [ ] SSL/TLS enabled
- [ ] Firewall configured (only 80, 443 open)
- [ ] Regular security updates
- [ ] Backup encryption enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Debug mode disabled

---

## Related

- [Monitoring](./MONITORING.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
