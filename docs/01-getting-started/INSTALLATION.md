# 🔧 Installation Guide

> Complete setup instructions for Simple378

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Docker Installation](#docker-installation)
3. [Manual Installation](#manual-installation)
4. [Production Setup](#production-setup)

---

## System Requirements

### Minimum
| Resource | Requirement |
|----------|-------------|
| **RAM** | 4GB |
| **CPU** | 2 cores |
| **Disk** | 20GB |
| **OS** | Linux, macOS, Windows (WSL2) |

### Recommended (Production)
| Resource | Requirement |
|----------|-------------|
| **RAM** | 16GB |
| **CPU** | 4+ cores |
| **Disk** | 100GB SSD |
| **OS** | Ubuntu 22.04 LTS |

---

## Docker Installation (Recommended)

### Step 1: Install Docker

**macOS:**
```bash
brew install --cask docker
```

**Ubuntu:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Step 2: Clone and Start

```bash
# Clone repository
git clone https://github.com/your-org/simple378.git
cd simple378

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d
```

### Step 3: Verify Installation

```bash
# Check all services are running
docker-compose ps

# Expected output:
# NAME                STATUS
# simple378-frontend  Up
# simple378-backend   Up
# simple378-postgres  Up
# simple378-redis     Up
```

---

## Manual Installation

### Prerequisites

| Software | Version |
|----------|---------|
| Node.js | 18+ |
| Python | 3.11+ |
| PostgreSQL | 15+ |
| Redis | 7+ |

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

```bash
# Create database
createdb simple378

# Run migrations (from backend directory)
alembic upgrade head

# Seed initial data
python scripts/seed_data.py
```

---

## Production Setup

### Step 1: Configure Environment

```bash
# Create production environment file
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/simple378

# Redis
REDIS_URL=redis://host:6379

# Security
SECRET_KEY=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256

# API
OPENAI_API_KEY=sk-...

# CORS
CORS_ORIGINS=https://your-domain.com
```

### Step 2: Build for Production

```bash
# Build frontend
cd frontend
npm run build

# Build Docker images
docker-compose -f docker-compose.prod.yml build
```

### Step 3: Deploy

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

---

## Verify Installation

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend accessible
curl http://localhost:5173
```

### Run Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## Next Steps

- [Configuration Guide](./CONFIGURATION.md) - Customize settings
- [User Guide](../03-user-guide/DASHBOARD.md) - Learn the system
- [Deployment Guide](../05-operations/DEPLOYMENT.md) - Production deployment
