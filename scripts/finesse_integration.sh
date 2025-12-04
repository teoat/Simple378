#!/bin/bash
# Integration Verification Script
# Tests all external service connections and integrations

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           INTEGRATION VERIFICATION                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/.."

PASSED=0
FAILED=0

check_service() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "  Testing $name... "
    if eval "$command" 2>/dev/null | grep -q "$expected" 2>/dev/null; then
        echo "✅ OK"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo "❌ FAILED"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 1. Docker Services
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [1/6] Docker Services Status                               │"
echo "└────────────────────────────────────────────────────────────┘"
echo ""

if command -v docker &> /dev/null; then
    echo "Running containers:"
    docker ps --format "  {{.Names}}: {{.Status}}" 2>/dev/null | head -10 || echo "  ⚠️ Docker not running"
else
    echo "  ⚠️ Docker not installed"
fi
echo ""

# 2. Database Connection
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [2/6] PostgreSQL Database                                  │"
echo "└────────────────────────────────────────────────────────────┘"
echo ""

if docker-compose exec -T db pg_isready -U postgres 2>/dev/null; then
    echo "  ✅ PostgreSQL: Ready"
    PASSED=$((PASSED + 1))
    
    # Check database exists
    if docker-compose exec -T db psql -U postgres -lqt 2>/dev/null | grep -q simple378; then
        echo "  ✅ Database 'simple378': Exists"
        PASSED=$((PASSED + 1))
    else
        echo "  ⚠️ Database 'simple378': Not found"
        FAILED=$((FAILED + 1))
    fi
else
    echo "  ❌ PostgreSQL: Not reachable"
    FAILED=$((FAILED + 1))
fi
echo ""

# 3. Redis Connection
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [3/6] Redis Cache                                          │"
echo "└────────────────────────────────────────────────────────────┘"
echo ""

if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "  ✅ Redis: Connected"
    PASSED=$((PASSED + 1))
    
    # Check memory usage
    REDIS_MEM=$(docker-compose exec -T redis redis-cli INFO memory 2>/dev/null | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    echo "  📊 Memory used: ${REDIS_MEM:-Unknown}"
else
    echo "  ❌ Redis: Not reachable"
    FAILED=$((FAILED + 1))
fi
echo ""

# 4. Meilisearch
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [4/6] Meilisearch                                          │"
echo "└────────────────────────────────────────────────────────────┘"
echo ""

MEILI_HEALTH=$(curl -s http://localhost:7700/health 2>/dev/null)
if echo "$MEILI_HEALTH" | grep -q "available"; then
    echo "  ✅ Meilisearch: Healthy"
    PASSED=$((PASSED + 1))
    
    # Check indexes
    INDEXES=$(curl -s http://localhost:7700/indexes 2>/dev/null | python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d.get('results', [])))" 2>/dev/null || echo "0")
    echo "  📊 Indexes: $INDEXES"
else
    echo "  ❌ Meilisearch: Not reachable"
    FAILED=$((FAILED + 1))
fi
echo ""

# 5. Backend API
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [5/6] Backend API                                          │"
echo "└────────────────────────────────────────────────────────────┘"
echo ""

BACKEND_HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null)
if echo "$BACKEND_HEALTH" | grep -qE "(ok|healthy|running)"; then
    echo "  ✅ Backend API: Healthy"
    PASSED=$((PASSED + 1))
else
    # Try alternative health check
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health 2>/dev/null)
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo "  ✅ Backend API: Healthy (HTTP 200)"
        PASSED=$((PASSED + 1))
    else
        echo "  ❌ Backend API: Not reachable (Status: ${BACKEND_STATUS:-N/A})"
        FAILED=$((FAILED + 1))
    fi
fi

# Test API endpoints
echo ""
echo "  Endpoint Tests:"
check_service "POST /api/v1/login" "curl -s -X POST http://localhost:8000/api/v1/login -H 'Content-Type: application/json' -d '{}' -w '%{http_code}'" "422\|401\|400"
check_service "GET /api/v1/cases" "curl -s http://localhost:8000/api/v1/cases -w '%{http_code}'" "200\|401\|403"
echo ""

# 6. Frontend
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [6/6] Frontend                                             │"
echo "└────────────────────────────────────────────────────────────┘"
echo ""

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "  ✅ Frontend: Serving (HTTP 200)"
    PASSED=$((PASSED + 1))
elif [ "$FRONTEND_STATUS" = "304" ]; then
    echo "  ✅ Frontend: Serving (HTTP 304)"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ Frontend: Not reachable (Status: ${FRONTEND_STATUS:-N/A})"
    FAILED=$((FAILED + 1))
fi
echo ""

# WebSocket Check
echo "  WebSocket Test:"
if command -v wscat &> /dev/null; then
    if timeout 3 wscat -c ws://localhost:8000/ws --execute "ping" 2>/dev/null; then
        echo "    ✅ WebSocket: Connected"
        PASSED=$((PASSED + 1))
    else
        echo "    ⚠️ WebSocket: Could not connect (may need auth)"
    fi
else
    echo "    ⚠️ wscat not installed, skipping WebSocket test"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           SUMMARY                                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Passed: $PASSED"
echo "  Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ ALL INTEGRATIONS VERIFIED"
    exit 0
else
    echo "⚠️  SOME INTEGRATIONS FAILED"
    exit 1
fi
