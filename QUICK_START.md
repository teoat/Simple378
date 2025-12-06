# 🚀 Quick Start - Deploy in 5 Minutes

## Prerequisites
- ✅ Docker Desktop installed and running
- ✅ All production files created (already done!)

---

## 🎯 Deploy Now (3 Commands)

### 1. Configure Secrets (2 minutes)
```bash
# Generate secrets
openssl rand -hex 32  # Copy this for SECRET_KEY
openssl rand -hex 16  # Copy this for POSTGRES_PASSWORD
openssl rand -hex 16  # Copy this for REDIS_PASSWORD

# Edit environment file
nano .env.production
# Replace all CHANGE_ME values with generated secrets above
```

### 2. Deploy (1 minute)
```bash
# One command deployment
./deploy-production.sh

# OR manually:
docker compose -f docker-compose.prod.yml up -d
```

### 3. Verify (1 minute)
```bash
# Check health
curl http://localhost/health

# Open in browser
open http://localhost
```

---

## 🎉 That's It!

**Access Points:**
- 🌐 Frontend: http://localhost
- 🔧 API: http://localhost/api/v1
- 📊 Prometheus: http://localhost:9090
- 📈 Grafana: http://localhost:3000

**Useful Commands:**
```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop all
docker compose -f docker-compose.prod.yml down

# Restart
docker compose -f docker-compose.prod.yml restart
```

---

## ⚡ Quick Troubleshooting

**Services won't start?**
```bash
docker compose -f docker-compose.prod.yml logs backend
```

**Need to rebuild?**
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**Clean reset?**
```bash
docker compose -f docker-compose.prod.yml down -v
# Then deploy again
```

---

**For detailed instructions, see:** `docs/DEPLOYMENT_GUIDE.md`
