#!/bin/bash
# Complete E2E Test Setup and Execution Guide
# Simple378 Fraud Detection System
# Created: 2025-12-07

set -e

PROJECT_ROOT="/Users/Arief/Desktop/Simple378"
cd "$PROJECT_ROOT"

echo "=================================================="
echo "Simple378 E2E Test Setup & Execution"
echo "=================================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :"$1" &> /dev/null
}

echo "📋 Step 1: Prerequisites Check"
echo "=================================================="

# Check Node.js
if ! command_exists node; then
    echo "❌ Node.js is NOT installed"
    echo "   Please install Node.js first:"
    echo "   1. Visit https://nodejs.org/"
    echo "   2. Download and install LTS version"
    echo "   3. Restart terminal and run this script again"
    exit 1
else
    echo "✅ Node.js installed: $(node --version)"
    echo "✅ npm installed: $(npm --version)"
fi

# Check Python
if ! command_exists python3; then
    echo "❌ Python 3 is NOT installed"
    exit 1
else
    echo "✅ Python 3 installed: $(python3 --version)"
fi

# Check Poetry
if ! command_exists poetry; then
    echo "❌ Poetry is NOT installed"
    echo "   Install with: curl -sSL https://install.python-poetry.org | python3 -"
    exit 1
else
    echo "✅ Poetry installed: $(poetry --version)"
fi

echo ""
echo "📦 Step 2: Install Dependencies"
echo "=================================================="

echo "Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "Installing Playwright browsers..."
npx playwright install chromium 2>&1 | tail -5
echo "✅ Playwright browsers installed"

echo ""
echo "Installing backend dependencies..."
cd "$PROJECT_ROOT/backend"
poetry install --no-interaction 2>&1 | tail -5
echo "✅ Backend dependencies installed"

echo ""
echo "🗄️  Step 3: Database Setup"
echo "=================================================="

cd "$PROJECT_ROOT/backend"

echo "Running database migrations..."
poetry run alembic upgrade head
echo "✅ Database migrations complete"

echo ""
echo "Seeding test data..."
poetry run python scripts/seed_test_data.py
echo "✅ Test data seeded"

echo ""
echo "🚀 Step 4: Start Services"
echo "=================================================="

# Check if backend is running
if port_in_use 8000; then
    echo "✅ Backend already running on port 8000"
else
    echo "⚠️  Backend is NOT running on port 8000"
    echo "   Starting backend server..."
    cd "$PROJECT_ROOT/backend"
    poetry run uvicorn app.main:app --reload --port 8000 &
    BACKEND_PID=$!
    echo "   Backend started (PID: $BACKEND_PID)"
    sleep 3
fi

# Check if frontend is running
if port_in_use 5173; then
    echo "✅ Frontend already running on port 5173"
else
    echo "⚠️  Frontend is NOT running on port 5173"
    echo "   Starting frontend dev server..."
    cd "$PROJECT_ROOT/frontend"
    npm run dev &
    FRONTEND_PID=$!
    echo "   Frontend started (PID: $FRONTEND_PID)"
    sleep 5
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 3

# Health check
echo "Checking backend health..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed (might be normal if /health endpoint doesn't exist)"
fi

echo ""
echo "🧪 Step 5: Run E2E Tests"
echo "=================================================="

cd "$PROJECT_ROOT/frontend"

echo ""
echo "Choose test execution mode:"
echo "  1. Run ALL tests (may take 5-10 minutes)"
echo "  2. Run smoke tests only (quick validation)"
echo "  3. Run specific test suite"
echo "  4. Run in headed mode (see browser)"
echo "  5. Skip tests (just setup environment)"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "Running ALL E2E tests..."
        npm run test:e2e -- --reporter=list
        ;;
    2)
        echo ""
        echo "Running smoke tests..."
        npm run test:e2e -- tests/visualization.smoke.spec.ts --reporter=list
        ;;
    3)
        echo ""
        echo "Available test suites:"
        echo "  - tests/adjudication-workflow.spec.ts"
        echo "  - tests/analytics.spec.ts"
        echo "  - tests/e2e/case-management.spec.ts"
        echo "  - tests/e2e/visualization.spec.ts"
        echo "  - tests/file-upload.spec.ts"
        echo "  - tests/reconciliation.spec.ts"
        read -p "Enter test file path: " testfile
        npm run test:e2e -- "$testfile" --reporter=list
        ;;
    4)
        echo ""
        echo "Running tests in headed mode..."
        npm run test:e2e -- --headed --reporter=list
        ;;
    5)
        echo ""
        echo "Skipping tests. Environment is ready!"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "✅ E2E Test Execution Complete!"
echo "=================================================="
echo ""
echo "📊 View test report:"
echo "   open $PROJECT_ROOT/frontend/playwright-report/index.html"
echo ""
echo "🔍 Debug failed tests:"
echo "   npm run test:e2e -- --debug"
echo ""
echo "📝 View test logs:"
echo "   $PROJECT_ROOT/frontend/test-results/"
echo ""
echo "🛑 Stop services:"
if [ -n "$BACKEND_PID" ]; then
    echo "   kill $BACKEND_PID  # Backend"
fi
if [ -n "$FRONTEND_PID" ]; then
    echo "   kill $FRONTEND_PID  # Frontend"
fi
echo "=================================================="
