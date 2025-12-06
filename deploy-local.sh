#!/bin/bash

# ==============================================================================
# Local Development Deployment (Without Docker)
# ==============================================================================

set -e

echo "🚀 AntiGravity - Local Development Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check for .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating .env file...${NC}"
    cp .env.example .env 2>/dev/null || echo "DATABASE_URL=sqlite+aiosqlite:///./fraud_detection.db" > .env
fi

source .env

echo -e "${BLUE}📦 Step 1: Setting up Backend...${NC}"

cd backend

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install --upgrade pip > /dev/null
pip install -r requirements.txt 2>/dev/null || {
    echo "Installing via setup.py..."
    pip install -e . || echo "⚠️  Some packages may be missing"
}

# Run migrations
echo "Running database migrations..."
python -m alembic upgrade head 2>/dev/null || echo "⚠️  Migrations skipped (alembic not configured)"

cd ..

echo ""
echo -e "${BLUE}📦 Step 2: Setting up Frontend...${NC}"

cd frontend

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    /usr/local/bin/npm install || echo "⚠️  npm not found, skipping frontend setup"
fi

cd ..

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "📝 To start services:"
echo ""
echo "  Backend (Terminal 1):"
echo "    cd backend"
echo "    source .venv/bin/activate"
echo "    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "  Frontend (Terminal 2):"
echo "    cd frontend"
echo "    /usr/local/bin/npm run dev"
echo ""
echo "📊 Service URLs (once running):"
echo "  Backend API:          http://localhost:8000"
echo "  API Docs:             http://localhost:8000/api/v1/docs"
echo "  GraphQL:              http://localhost:8000/graphql"
echo "  Frontend:             http://localhost:5173"
echo ""
echo "💡 Quick start commands:"
echo "  ./start-backend.sh    # Start backend only"
echo "  ./start-frontend.sh   # Start frontend only"
echo ""
