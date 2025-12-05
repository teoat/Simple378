# ⚡ Quickstart Guide

> Get Simple378 running in 5 minutes

---

## Prerequisites

- Docker & Docker Compose installed
- Git installed
- 4GB RAM minimum

---

## Step 1: Clone Repository

```bash
git clone https://github.com/your-org/simple378.git
cd simple378
```

---

## Step 2: Environment Setup

```bash
# Copy example environment file
cp .env.example .env

# Edit if needed (defaults work for local development)
```

---

## Step 3: Start Services

```bash
# Start all services
docker-compose up -d

# Wait for services to be ready (~30 seconds)
docker-compose logs -f
```

---

## Step 4: Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API Docs** | http://localhost:8000/docs |

---

## Step 5: Login

Use the default credentials:

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `admin123` |

---

## 🎉 You're Ready!

Explore the system:

1. **Dashboard** - View system metrics
2. **Cases** - Browse investigation cases
3. **Adjudication** - Review flagged alerts
4. **Reconciliation** - Match transactions

---

## Next Steps

- [Full Installation Guide](./INSTALLATION.md) - Detailed setup
- [Configuration](./CONFIGURATION.md) - Customize settings
- [User Guide](../03-user-guide/DASHBOARD.md) - Learn the system

---

## Common Issues

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5173
lsof -i :8000

# Stop the process or change port in docker-compose.yml
```

### Database Not Ready
```bash
# Wait for PostgreSQL to be ready
docker-compose logs postgres

# Restart if needed
docker-compose restart backend
```

---

*Need help? See [Troubleshooting](../05-operations/TROUBLESHOOTING.md)*
