#!/bin/bash
# Quick Start Script for Simple378 Production

set -e

echo "🚀 Simple378 Production Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check environment file
echo -e "${YELLOW}Step 1: Checking environment configuration...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Creating .env.production from template...${NC}"
    cp .env.production.template .env.production
    echo -e "${RED}⚠️  IMPORTANT: Edit .env.production and fill in actual secrets!${NC}"
    echo -e "${RED}   Use: openssl rand -hex 32 to generate secrets${NC}"
    echo ""
    read -p "Press enter when you've updated .env.production..."
fi
echo -e "${GREEN}✓ Environment file exists${NC}"
echo ""

# Step 2: Check Docker
echo -e "${YELLOW}Step 2: Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

# Step 3: Check Docker Compose
echo -e "${YELLOW}Step 3: Checking Docker Compose...${NC}"
if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Step 4: Build and start services
echo -e "${YELLOW}Step 4: Starting services...${NC}"
echo "This may take a few minutes on first run..."
echo ""

docker compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}✓ Services started!${NC}"
echo ""

# Step 5: Wait for services to be healthy
echo -e "${YELLOW}Step 5: Waiting for services to be healthy...${NC}"
sleep 10

# Step 6: Check health
echo -e "${YELLOW}Step 6: Checking service health...${NC}"
echo ""

# Check backend health
if curl -f http://localhost/health &> /dev/null; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# Check frontend (if served via nginx)
if curl -f http://localhost/ &> /dev/null; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may still be building...${NC}"
fi

# Check Prometheus
if curl -f http://localhost:9090 &> /dev/null; then
    echo -e "${GREEN}✓ Prometheus is running${NC}"
else
    echo -e "${YELLOW}⚠ Prometheus not accessible${NC}"
fi

# Check Grafana
if curl -f http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}✓ Grafana is running${NC}"
else
    echo -e "${YELLOW}⚠ Grafana not accessible${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Simple378 is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📍 Access Points:"
echo "   Frontend:   http://localhost"
echo "   Backend API: http://localhost/api/v1"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana:    http://localhost:3000 (admin/admin)"
echo ""
echo "📊 Useful Commands:"
echo "   View logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "   Stop:         docker compose -f docker-compose.prod.yml down"
echo "   Restart:      docker compose -f docker-compose.prod.yml restart"
echo "   Status:       docker compose -f docker-compose.prod.yml ps"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "   1. Test the application at http://localhost"
echo "   2. Check Prometheus metrics at http://localhost:9090"
echo "   3. View dashboards in Grafana at http://localhost:3000"
echo "   4. Monitor logs: docker compose -f docker-compose.prod.yml logs -f backend"
echo ""
