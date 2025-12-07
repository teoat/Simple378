#!/bin/bash
set -e

echo "🚀 Simple378 Docker Deployment Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo "Please create .env.production based on .env.production.template"
    exit 1
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed!${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment Checklist${NC}"
echo "1. Checking Docker installation..."
docker --version
docker compose version

echo ""
echo "2. Stopping any existing containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

echo ""
echo "3. Removing old images (optional)..."
read -p "Do you want to remove old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose -f docker-compose.prod.yml down --rmi all --volumes
fi

echo ""
echo -e "${YELLOW}🔨 Building Services${NC}"
echo "Building all Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

echo ""
echo -e "${YELLOW}🚢 Starting Services${NC}"
echo "Starting all containers..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

echo ""
echo -e "${YELLOW}📊 Container Status${NC}"
docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${YELLOW}🔍 Health Checks${NC}"

# Check database
echo "Checking PostgreSQL..."
if docker exec fraud_db pg_isready -U fraud_admin_prod > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
fi

# Check Redis
echo "Checking Redis..."
if docker exec fraud_redis redis-cli --no-auth-warning -a YourRedisProductionPassword ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis is not ready${NC}"
fi

# Check backend
echo "Checking Backend API..."
sleep 5
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API not ready yet (may need more time)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📝 Service URLs:"
echo "  - Frontend: http://localhost (via nginx)"
echo "  - Backend API: http://localhost:8000"
echo "  - Jaeger UI: http://localhost:16686"
echo ""
echo "📊 Useful Commands:"
echo "  View logs:        docker compose -f docker-compose.prod.yml logs -f"
echo "  View specific:    docker compose -f docker-compose.prod.yml logs -f backend"
echo "  Stop all:         docker compose -f docker-compose.prod.yml down"
echo "  Restart service:  docker compose -f docker-compose.prod.yml restart backend"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  1. Update .env.production with your actual credentials"
echo "  2. Replace placeholder API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY)"
echo "  3. Set CORS_ORIGINS to your production domain"
echo "  4. Use strong passwords for production!"
echo ""
