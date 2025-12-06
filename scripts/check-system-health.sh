#!/bin/bash

# Simple378 - System Health Check Script
# Verifies all services and provides actionable feedback

echo "🔍 Simple378 System Health Check"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall health
ALL_HEALTHY=true

# Function to check if port is listening
check_port() {
    local PORT=$1
    local NAME=$2
    local URL=$3
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}✅ $NAME${NC} running on port ${YELLOW}$PORT${NC}"
        
        # Try to curl if URL provided
        if [ ! -z "$URL" ]; then
            if curl -sf "$URL" > /dev/null 2>&1; then
                echo "   └─ Health check: ${GREEN}PASS${NC}"
            else
                echo "   └─ Health check: ${YELLOW}NO RESPONSE${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ $NAME${NC} NOT running on port ${YELLOW}$PORT${NC}"
        ALL_HEALTHY=false
    fi
}

# Check all standard ports
echo "📡 Checking Services..."
echo ""

check_port 5173 "Frontend (Vite)" "http://localhost:5173"
check_port 8000 "Backend (FastAPI)" "http://localhost:8000/health"
check_port 5432 "PostgreSQL" ""
check_port 6379 "Redis" ""
check_port 6333 "Qdrant (Vector DB)" "http://localhost:6333/health"

echo ""
echo "=================================="
echo ""

# Check for port conflicts on 5173
CONFLICT_ON_5173=$(lsof -i :5173 2>/dev/null | grep -v "COMMAND" | wc -l | tr -d ' ')
if [ "$CONFLICT_ON_5173" -gt "1" ]; then
    echo -e "${YELLOW}⚠️  WARNING:${NC} Multiple processes detected on port 5173"
    echo "   Run: kill -9 \$(lsof -t -i:5173) to clean up"
    echo ""
fi

# Check environment files
echo "📄 Checking Configuration Files..."
echo ""

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env${NC} exists"
else
    echo -e "${YELLOW}⚠️  backend/.env${NC} NOT FOUND (using defaults)"
    ALL_HEALTHY=false
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ frontend/.env${NC} exists"
else
    echo -e "${YELLOW}⚠️  frontend/.env${NC} NOT FOUND (using defaults)"
fi

echo ""
echo "=================================="
echo ""

# Check Node.js and Python
echo "🛠️  Checking Development Tools..."
echo ""

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js${NC} installed: $NODE_VERSION"
else
    echo -e "${RED}❌ Node.js${NC} NOT FOUND"
    ALL_HEALTHY=false
fi

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python${NC} installed: $PYTHON_VERSION"
else
    echo -e "${RED}❌ Python${NC} NOT FOUND"
    ALL_HEALTHY=false
fi

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker${NC} installed: $DOCKER_VERSION"
else
    echo -e "${YELLOW}⚠️  Docker${NC} NOT FOUND (optional)"
fi

echo ""
echo "=================================="
echo ""

# Final summary
if [ "$ALL_HEALTHY" = true ] ; then
    echo -e "${GREEN}🎉 System is HEALTHY!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:5173 in your browser"
    echo "  2. Test the ingestion workflow"
    echo "  3. Review optimization docs in /docs folder"
else
    echo -e "${RED}⚠️  System has ISSUES${NC}"
    echo ""
    echo "Recommended actions:"
    echo "  1. Start missing services"
    echo "  2. Check configuration files"
    echo "  3. Review logs for errors"
    echo ""
    echo "Quick fixes:"
    echo "  • Frontend: cd frontend && npm run dev"
    echo "  • Backend:  cd backend && uvicorn app.main:app --reload"
    echo "  • PostgreSQL: docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15"
    echo "  • Redis: docker run -p 6379:6379 redis:7-alpine"
fi

echo ""
echo "=================================="
echo ""
echo "📚 Documentation: ./docs/"
echo "   • COMPLETE_SYSTEM_STATUS.md - Overall status"
echo "   • QUICK_START_OPTIMIZATION.md - Action items"
echo "   • PORT_CONFIGURATION.md - Port setup guide"
echo ""

exit $([ "$ALL_HEALTHY" = true ] && echo 0 || echo 1)
