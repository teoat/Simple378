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

