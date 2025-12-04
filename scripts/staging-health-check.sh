#!/bin/bash
# Staging Health Check Script
# Verifies all services are running and healthy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.staging.yml"
PROJECT_NAME="simple378-staging"
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:8080"

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Staging Environment Health Check${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Check Docker containers
echo -e "${YELLOW}Checking Docker containers...${NC}"
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
echo ""

# Check backend health endpoint
echo -e "${YELLOW}Checking backend health...${NC}"
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
    BACKEND_RESPONSE=$(curl -s "$BACKEND_URL/health")
    echo "  Response: $BACKEND_RESPONSE"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi
echo ""

# Check frontend
echo -e "${YELLOW}Checking frontend...${NC}"
if curl -f -s -o /dev/null "$FRONTEND_URL"; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend is not accessible${NC}"
    exit 1
fi
echo ""

# Check database connection
echo -e "${YELLOW}Checking database...${NC}"
if docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec -T db pg_isready -U "${POSTGRES_USER:-fraud_detector}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is ready${NC}"
else
    echo -e "${RED}✗ Database is not ready${NC}"
    exit 1
fi
echo ""

# Check Redis
echo -e "${YELLOW}Checking Redis...${NC}"
if docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec -T cache redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is ready${NC}"
else
    echo -e "${RED}✗ Redis is not ready${NC}"
    exit 1
fi
echo ""

# Check API endpoints
echo -e "${YELLOW}Checking critical API endpoints...${NC}"

# Check API docs
if curl -f -s -o /dev/null "$BACKEND_URL/docs"; then
    echo -e "${GREEN}✓ API docs accessible${NC}"
else
    echo -e "${RED}✗ API docs not accessible${NC}"
fi

# Check OpenAPI schema
if curl -f -s -o /dev/null "$BACKEND_URL/openapi.json"; then
    echo -e "${GREEN}✓ OpenAPI schema accessible${NC}"
else
    echo -e "${RED}✗ OpenAPI schema not accessible${NC}"
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}All health checks passed!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Staging environment is ready for testing."
echo ""

exit 0
