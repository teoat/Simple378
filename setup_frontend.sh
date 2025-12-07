#!/bin/bash
# Frontend Setup Script for Simple378
# Run this AFTER installing Node.js
# Created: 2025-12-07

set -e  # Exit on error

echo "=================================================="
echo "Simple378 Frontend Setup"
echo "=================================================="
echo ""

# Check Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed!"
    echo "Please run ./setup_nodejs.sh first and install Node.js"
    exit 1
fi

echo "✅ Node.js found:"
node --version
npm --version
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

echo "📦 Installing frontend dependencies..."
echo "This may take a few minutes..."
npm install

echo ""
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "=================================================="
echo "Next steps:"
echo "1. Make sure backend is running (port 8000)"
echo "2. Start frontend dev server: npm run dev"
echo "3. Run E2E tests: npm run test:e2e"
echo "=================================================="
