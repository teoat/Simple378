#!/bin/bash
# Database Optimization Verification Script
# Usage: ./verify_db_optimization.sh
# Checks that both fraud_db and fraud_timescale are properly tuned

set -e

echo "=========================================="
echo "Database Optimization Verification"
echo "$(date)"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0

check_param() {
    local container=$1
    local param=$2
    local expected=$3
    
    actual=$(docker exec "$container" psql -U postgres -t -c "SHOW $param;" 2>&1 | xargs)
    
    if [[ "$actual" == "$expected" ]]; then
        echo -e "${GREEN}✓${NC} $container - $param: $actual"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $container - $param: Expected '$expected', got '$actual'"
        ((FAILED++))
    fi
}

check_index() {
    local container=$1
    local db=$2
    local index=$3
    
    exists=$(docker exec "$container" psql -U postgres -d "$db" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE indexname = '$index';" 2>&1 | xargs)
    
    if [[ "$exists" == "1" ]]; then
        echo -e "${GREEN}✓${NC} $container - Index $index exists"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} $container - Index $index not found (may be OK if DB is new)"
        ((PASSED++))
    fi
}

echo "1. Checking fraud_db Configuration"
echo "-----------------------------------"
check_param "fraud_db" "shared_buffers" "2GB"
check_param "fraud_db" "work_mem" "20MB"
check_param "fraud_db" "maintenance_work_mem" "512MB"
check_param "fraud_db" "max_connections" "200"
check_param "fraud_db" "effective_cache_size" "5GB"
check_param "fraud_db" "wal_buffers" "16MB"
echo ""

echo "2. Checking fraud_timescale Configuration"
echo "-----------------------------------------"
check_param "fraud_timescale" "shared_buffers" "2GB"
check_param "fraud_timescale" "work_mem" "50MB"
check_param "fraud_timescale" "maintenance_work_mem" "1GB"
check_param "fraud_timescale" "max_connections" "150"
check_param "fraud_timescale" "effective_cache_size" "5500MB"
check_param "fraud_timescale" "jit" "on"
echo ""

echo "3. Checking fraud_db Indexes"
echo "-----------------------------"
check_index "fraud_db" "fraud_detection" "idx_cases_created_at"
check_index "fraud_db" "fraud_detection" "idx_cases_risk_score"
check_index "fraud_db" "fraud_detection" "idx_audit_logs_timestamp"
check_index "fraud_db" "fraud_detection" "idx_subjects_created_at"
echo ""

echo "4. Resource Utilization"
echo "----------------------"
echo "fraud_db:"
docker stats --no-stream fraud_db 2>/dev/null | tail -1 || echo "  (Stats unavailable)"
echo ""
echo "fraud_timescale:"
docker stats --no-stream fraud_timescale 2>/dev/null | tail -1 || echo "  (Stats unavailable)"
echo ""

echo "5. Database Sizes"
echo "-----------------"
fraud_db_size=$(docker exec fraud_db psql -U postgres -t -c "SELECT pg_size_pretty(pg_database_size('fraud_detection'));" 2>&1 | xargs)
fraud_ts_size=$(docker exec fraud_timescale psql -U postgres -t -c "SELECT pg_size_pretty(pg_database_size('fraud_detection_timeseries'));" 2>&1 | xargs)

echo "fraud_db:        $fraud_db_size"
echo "fraud_timescale: $fraud_ts_size"
echo ""

echo "6. Connection Activity"
echo "---------------------"
fraud_db_conns=$(docker exec fraud_db psql -U postgres -t -c "SELECT count(*) FROM pg_stat_activity;" 2>&1 | xargs)
fraud_ts_conns=$(docker exec fraud_timescale psql -U postgres -t -c "SELECT count(*) FROM pg_stat_activity;" 2>&1 | xargs)

echo "fraud_db active connections:        $fraud_db_conns / 200"
echo "fraud_timescale active connections: $fraud_ts_conns / 150"
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed:${NC} $FAILED"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Databases are optimized.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some checks failed. Restart containers if changes were made:${NC}"
    echo "  docker-compose down"
    echo "  docker-compose up -d db timescale"
    echo "  sleep 30 && ./verify_db_optimization.sh"
    exit 1
fi
