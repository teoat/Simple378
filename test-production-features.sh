#!/bin/bash
# Test Production Features - Quick Validation

echo "🧪 Testing Production Hardening Features"
echo "========================================"
echo ""

# Test 1: Check if backend can start
echo "Test 1: Backend startup check..."
cd backend
if python3 -c "from app.main import app; print('✓ Backend imports successfully')" 2>/dev/null; then
    echo "✓ Backend code is valid"
else
    echo "✗ Backend has import errors"
    echo "  Run: cd backend && python3 -c 'from app.main import app'"
fi
cd ..
echo ""

# Test 2: Check cache service
echo "Test 2: Cache service check..."
if python3 -c "import sys; sys.path.insert(0, 'backend'); from app.services.cache_service import cache; print('✓ Cache service imports')" 2>/dev/null; then
    echo "✓ Cache service is valid"
else
    echo "✗ Cache service has issues"
fi
echo ""

# Test 3: Check Docker Compose syntax
echo "Test 3: Docker Compose validation..."
if docker compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    echo "✓ Docker Compose config is valid"
else
    echo "✗ Docker Compose config has errors"
    echo "  Run: docker compose -f docker-compose.prod.yml config"
fi
echo ""

# Test 4: Check Nginx config (if nginx installed)
echo "Test 4: Nginx configuration check..."
if command -v nginx &> /dev/null; then
    if nginx -t -c nginx/nginx.conf 2>&1 | grep -q "successful"; then
        echo "✓ Nginx config is valid"
    else
        echo "⚠ Nginx config may need adjustment for your system"
    fi
else
    echo "⚠ Nginx not installed locally (will run in Docker)"
fi
echo ""

# Test 5: Check environment file
echo "Test 5: Environment configuration..."
if [ -f .env.production ]; then
    echo "✓ .env.production exists"
    if grep -q "CHANGE_ME" .env.production; then
        echo "⚠ WARNING: .env.production still has template values!"
        echo "  Edit .env.production and replace CHANGE_ME values"
    else
        echo "✓ .env.production appears configured"
    fi
else
    echo "✗ .env.production not found"
    echo "  Run: cp .env.production.template .env.production"
fi
echo ""

# Test 6: Check required files
echo "Test 6: Required files check..."
required_files=(
    "backend/app/main.py"
    "backend/app/services/cache_service.py"
    "docker-compose.prod.yml"
    "nginx/nginx.conf"
    "prometheus/prometheus.yml"
)

all_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file MISSING"
        all_exist=false
    fi
done
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if $all_exist; then
    echo "🎉 All production files are in place!"
    echo ""
    echo "Next steps:"
    echo "1. Configure .env.production with real secrets"
    echo "2. Run: ./deploy-production.sh"
    echo "3. Or manually: docker compose -f docker-compose.prod.yml up -d"
else
    echo "⚠️  Some files are missing. Review implementation."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
