# AntiGravity Fraud Detection - MCP Server Configuration

## Overview
This directory contains the Model Context Protocol (MCP) server that coordinates distributed AI agents across the AntiGravity system.

## MCP Servers Integrated

### 1. **Agent Coordination MCP**
- **Port**: 8080
- **Purpose**: Coordinates tasks between multiple AI agents
- **Endpoints**:
  - `/tasks` - Task management
  - `/agents` - Agent registry
  - `/coordination` - Inter-agent communication

### 2. **Chrome DevTools MCP**
- **Purpose**: Browser automation for E2E testing
- **Tools**: `puppeteer_navigate`, `puppeteer_click`, `puppeteer_screenshot`

### 3. **Context7 MCP**
- **Purpose**: Library documentation retrieval
- **Tools**: `resolve-library-id`, `get-library-docs`

### 4. **Memory MCP**
- **Purpose**: Knowledge graph for persistent entity memory
- **Tools**: `create_entities`, `open_nodes`, `search_nodes`, `create_relations`

### 5. **Postgres MCP**
- **Purpose**: Direct database querying
- **Tools**: `query` (read-only SQL execution)

### 6. **Prometheus MCP**
- **Purpose**: Metrics and monitoring
- **Tools**: `instant_query`, `range_query`, `alerts`, `targets`

## Building the MCP Server

```bash
cd mcp-server
docker build -t fraud-mcp-server .
```

## Running Standalone

```bash
docker run -p 8080:8080 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  fraud-mcp-server
```

## Configuration

Environment variables (set in `.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `BACKEND_URL` - Main backend API URL
- `COORDINATION_TTL` - Task coordination timeout (seconds)

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`

## Health Check

```bash
curl http://localhost:8080/health
```

## Monitoring

The MCP server exposes Prometheus metrics at `/metrics`.
