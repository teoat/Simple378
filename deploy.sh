#!/bin/bash

# ==============================================================================
# AntiGravity Fraud Detection System - Full Deployment Script
# ==============================================================================

set -e

echo "🚀 AntiGravity Fraud Detection - Full Deployment"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file${NC}"
    else
        echo -e "${RED}✗ .env.example not found. Please create .env manually${NC}"
        exit 1
    fi
fi

# Load environment variables
source .env

echo -e "${BLUE}📦 Step 1: Stopping existing containers...${NC}"
docker-compose down

echo ""
echo -e "${BLUE}📦 Step 2: Building containers...${NC}"
docker-compose build

echo ""
echo -e "${BLUE}📦 Step 3: Starting infrastructure services...${NC}"
docker-compose up -d db cache vector_db meilisearch prometheus grafana jaeger minio

echo ""
echo -e "${BLUE}⏳ Waiting for infrastructure to be ready...${NC}"
sleep 10

# Check database health
echo -e "${BLUE}🔍 Checking PostgreSQL...${NC}"
docker-compose exec -T db pg_isready -U ${POSTGRES_USER} || {
    echo -e "${RED}✗ PostgreSQL not ready${NC}"
    exit 1
}
echo -e "${GREEN}✓ PostgreSQL ready${NC}"

# Check Redis health
echo -e "${BLUE}🔍 Checking Redis...${NC}"
docker-compose exec -T cache redis-cli ping | grep PONG || {
    echo -e "${RED}✗ Redis not ready${NC}"
    exit 1
}
echo -e "${GREEN}✓ Redis ready${NC}"

echo ""
echo -e "${BLUE}📦 Step 4: Starting application services...${NC}"
docker-compose up -d backend mcp-server frontend

echo ""
echo -e "${BLUE}⏳ Waiting for backend to be ready...${NC}"
sleep 15

# Check backend health
for i in {1..30}; do
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "📊 Service URLs:"
echo "  Backend API:          http://localhost:8000"
echo "  API Docs:             http://localhost:8000/api/v1/docs"
echo "  GraphQL Playground:   http://localhost:8000/graphql"
echo "  Frontend:             http://localhost:5173"
echo "  MCP Server:           http://localhost:8080"
echo ""
echo "🔧 Infrastructure:"
echo "  PostgreSQL:           localhost:5432"
echo "  Redis:                localhost:6379"
echo "  Qdrant:               http://localhost:6333"
echo "  Meilisearch:          http://localhost:7700"
echo "  MinIO:                http://localhost:9001"
echo ""
echo "📈 Monitoring:"
echo "  Prometheus:           http://localhost:9090"
echo "  Grafana:              http://localhost:3000"
echo "  Jaeger:               http://localhost:16686"
echo ""
echo "🔑 Default Credentials:"
echo "  Grafana:              admin / ${GRAFANA_ADMIN_PASSWORD:-admin}"
echo "  MinIO:                ${MINIO_ROOT_USER:-fraud_storage_admin} / [see .env]"
echo ""
echo "📝 View logs:"
echo "  docker-compose logs -f [service_name]"
echo ""
echo "🛑 Stop all services:"
echo "  docker-compose down"
echo ""
