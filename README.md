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

### 2. **Quick Deploy (Recommended)**

Deploy all services with one command:

```bash
./deploy.sh
```

This will start:
- Backend API (FastAPI + GraphQL)
- Frontend (React + Vite)
- PostgreSQL, Redis, Qdrant, Meilisearch
- MCP Coordination Server
- Monitoring stack (Prometheus, Grafana, Jaeger)
- Object storage (MinIO)

**See:** [Deployment Guide](docs/DEPLOYMENT_SUMMARY.md)

### 3. Manual Docker Compose

Start individual service groups:

```bash
# Infrastructure only
docker-compose up -d db cache vector_db meilisearch

# Full stack
docker-compose up --build
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **GraphQL:** [http://localhost:8000/graphql](http://localhost:8000/graphql)
- **Grafana:** [http://localhost:3000](http://localhost:3000)
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

## Contributing

We welcome contributions! Please see:

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guidelines for contributors (humans and AI)
- **[AGENTS.md](AGENTS.md)** - Comprehensive guide for GitHub Copilot coding agents
- **[Task Guidelines](docs/COPILOT_TASK_GUIDELINES.md)** - Which tasks are suitable for AI agents

### For GitHub Copilot Coding Agents

If you're an AI coding agent:
1. Read **[AGENTS.md](AGENTS.md)** for repository context and coding standards
2. Review **[COPILOT_TASK_GUIDELINES.md](docs/COPILOT_TASK_GUIDELINES.md)** to understand task suitability
3. Use issue templates in `.github/ISSUE_TEMPLATE/` for well-structured tasks
4. Follow the pull request template for comprehensive PR descriptions

### Quick Start for Contributors

```bash
# Clone and setup
git clone https://github.com/teoat/Simple378.git
cd Simple378
cp .env.example .env

# Backend
cd backend && poetry install && poetry run pytest

# Frontend
cd frontend && npm install && npm test

# All services with Docker
docker-compose up --build
```

## Documentation

### 📚 Quick Links

- **[Documentation Index](docs/INDEX.md)** - Complete documentation navigation with diagrams
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines (developers & AI agents)
- **[CODEOWNERS](CODEOWNERS)** - Code review responsibilities

### 🏗️ Technical Documentation

- **[Backend README](backend/README.md)** - Backend setup, testing, API development
- **[Frontend README](frontend/README.md)** - Frontend build, deployment, E2E testing
- **[Architecture Docs](docs/architecture/)** - System design and decision records

### 🔒 Security & Quality

- **[Security & Quality Guide](docs/SECURITY_AND_QUALITY.md)** - Comprehensive guide covering:
  - Vulnerability management & scanning
  - Testing strategy (80%+ coverage required)
  - Incident response procedures
  - Monitoring and alerting (Prometheus)
  - Performance optimization

### 🤖 For AI Agents

- **[AGENTS.md](AGENTS.md)** - Comprehensive guide for GitHub Copilot
- **[Task Guidelines](docs/COPILOT_TASK_GUIDELINES.md)** - Which tasks are suitable for AI
