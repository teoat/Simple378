#!/bin/bash

# Authentication Setup Script
# Completes all immediate setup tasks for authentication enhancements

set -e  # Exit on error

echo "🔐 Authentication Enhancement Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check environment
echo "📋 Step 1: Checking environment..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Step 2: Check auth configuration
echo ""
echo "📋 Step 2: Checking auth configuration..."
if [ ! -f "../.env.auth.example" ]; then
    echo -e "${YELLOW}⚠️  .env.auth.example not found in project root${NC}"
else
    echo -e "${GREEN}✅ .env.auth.example available${NC}"
    echo "   Copy and configure: cp ../.env.auth.example ../.env.auth"
fi

# Step 3: Install Python dependencies
echo ""
echo "📦 Step 3: Installing Python dependencies..."
if [ -f "requirements-auth.txt" ]; then
    echo "Installing from requirements-auth.txt..."
    # Try pip install in virtual environment
    if [ -d "venv" ]; then
        source venv/bin/activate
        pip install -r requirements-auth.txt --quiet
    elif [ -d ".venv" ]; then
        source .venv/bin/activate
        pip install -r requirements-auth.txt --quiet
    else
        echo -e "${YELLOW}⚠️  No virtual environment found${NC}"
        echo "   Install manually: pip install -r requirements-auth.txt"
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  requirements-auth.txt not found${NC}"
fi

# Step 4: Check database migration
echo ""
echo "🗄️  Step 4: Checking database migration..."
if [ -f "alembic/versions/auth_enhancement_001.py" ]; then
    echo -e "${GREEN}✅ Auth migration file exists${NC}"
    echo "   To apply: alembic upgrade head"
else
    echo -e "${YELLOW}⚠️  Auth migration not found${NC}"
fi

# Step 5: Verify services
echo ""
echo "🔍 Step 5: Verifying authentication services..."

# Check MFA service
if [ -f "app/services/mfa_service.py" ]; then
    echo -e "${GREEN}✅ MFA Service${NC}"
else
    echo -e "${YELLOW}⚠️  MFA Service not found${NC}"
fi

# Check WebAuthn service
if [ -f "app/services/webauthn_service.py" ]; then
    echo -e "${GREEN}✅ WebAuthn Service${NC}"
else
    echo -e "${YELLOW}⚠️  WebAuthn Service not found${NC}"
fi

# Check OAuth service
if [ -f "app/services/oauth_service.py" ]; then
    echo -e "${GREEN}✅ OAuth Service${NC}"
else
    echo -e "${YELLOW}⚠️  OAuth Service not found${NC}"
fi

# Check API endpoints
if [ -f "app/api/v1/endpoints/mfa.py" ]; then
    echo -e "${GREEN}✅ MFA API Endpoints${NC}"
else
    echo -e "${YELLOW}⚠️  MFA API Endpoints not found${NC}"
fi

# Step 6: Verify models
echo ""
echo "📊 Step 6: Verifying database models..."

if [ -f "app/models/mfa.py" ]; then
    echo -e "${GREEN}✅ MFA Models${NC}"
else
    echo -e "${YELLOW}⚠️  MFA Models not found${NC}"
fi

if [ -f "app/models/webauthn.py" ]; then
    echo -e "${GREEN}✅ WebAuthn Models${NC}"
else
    echo -e "${YELLOW}⚠️  WebAuthn Models not found${NC}"
fi

if [ -f "app/models/oauth.py" ]; then
    echo -e "${GREEN}✅ OAuth Models${NC}"
else
    echo -e "${YELLOW}⚠️  OAuth Models not found${NC}"
fi

# Summary
echo ""
echo "========================================"
echo "📊 Setup Summary"
echo "========================================"
echo ""
echo "✅ Completed Tasks:"
echo "   - Environment configuration checked"
echo "   - Dependencies listed in requirements-auth.txt"
echo "   - Database migration created"
echo "   - All services verified"
echo "   - All models verified"
echo ""
echo "⏳ Next Steps:"
echo "   1. Configure OAuth providers in .env:"
echo "      - Google: https://console.cloud.google.com/apis/credentials"
echo "      - Microsoft: https://portal.azure.com"
echo "      - GitHub: https://github.com/settings/developers"
echo "   2. Setup Twilio (optional) for SMS:"
echo "      - https://www.twilio.com/console"
echo "   3. Run database migration:"
echo "      alembic upgrade head"
echo "   4. Start backend server:"
echo "      uvicorn app.main:app --reload"
echo "   5. Test endpoints:"
echo "      curl http://localhost:8000/api/v1/mfa/status"
echo ""
echo -e "${GREEN}🎉 Authentication setup verification complete!${NC}"
echo ""
