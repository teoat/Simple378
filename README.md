# Fraud Detection System

## Overview

A privacy-focused, AI-powered fraud detection system with offline capabilities.

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

## Agent Coordination

⚠️ **IMPORTANT**: This project enforces strict agent coordination. All IDE agents MUST use the `agent-coordination` MCP server.

- **Rules**: [.agent/rules/agent_coordination.mdc](.agent/rules/agent_coordination.mdc)
- **Verification**: Run `.agent/workflows/verify_mcp_config.md`

## Getting Started

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Run with Docker

Start all services (Backend, Frontend, DB, Redis, Qdrant):

```bash
docker-compose up --build
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Qdrant UI:** [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

### 3. Local Development

#### Backend

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Architecture

See `docs/architecture/` for detailed design documents.

## Documentation

### Quick Links
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Docker Build Verification](DOCKER_BUILD_VERIFICATION.md)** - Build status and readiness
- **[Branch Analysis](BRANCH_ANALYSIS.md)** - Repository branch strategy
- **[Comprehensive Fix Summary](COMPREHENSIVE_FIX_SUMMARY.md)** - Implementation details
- **[Project Complete](PROJECT_COMPLETE.md)** - Feature completeness overview

### Production Deployment

For production deployment with Docker:

```bash
# See DEPLOYMENT_GUIDE.md for complete instructions
docker compose -f docker-compose.prod.yml up --build -d
```

## Repository Branch Strategy

⚠️ **IMPORTANT**: This repository contains the fraud detection system on the `main` branch. Other branches (`copilot/diagnose-working-build`, `copilot/improve-code-efficiency`, `copilot/pull-completed-codes`) contain different, unrelated projects and should **NOT** be merged to main.

See [BRANCH_ANALYSIS.md](BRANCH_ANALYSIS.md) for detailed branch information.

## Project Status

✅ **Production Ready** - All core features implemented and tested
- Phase 1: Foundation ✅
- Phase 2: Core Engine ✅
- Phase 3: AI Integration ✅
- Phase 4: Visualization & UX ✅
- Phase 5: Polish & Deploy ✅

