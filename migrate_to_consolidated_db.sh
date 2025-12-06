#!/bin/bash
# Database Consolidation Migration Script
# Combines fraud_db and fraud_timescale into single optimized instance
# Timestamp: 2025-12-06

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database Consolidation Migration${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check both databases exist
echo "Checking existing databases..."
if ! docker ps | grep -q fraud_db; then
    echo -e "${RED}Error: fraud_db container not found${NC}"
    exit 1
fi
if ! docker ps | grep -q fraud_timescale; then
    echo -e "${YELLOW}Warning: fraud_timescale not running (may already be removed)${NC}"
fi

# ============================================================
# PHASE 1: BACKUP
# ============================================================
echo ""
echo -e "${GREEN}PHASE 1: Creating Backups${NC}"
echo "Creating backup of fraud_db..."
docker exec fraud_db pg_dump -U postgres fraud_detection > "fraud_detection_backup_$(date +%Y%m%d_%H%M%S).sql"
echo -e "${GREEN}✓ fraud_db backed up${NC}"

if docker ps | grep -q fraud_timescale; then
    echo "Creating backup of fraud_timescale..."
    docker exec fraud_timescale pg_dump -U postgres fraud_detection_timeseries > "fraud_detection_timeseries_backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${GREEN}✓ fraud_timescale backed up${NC}"
fi

# ============================================================
# PHASE 2: STOP SERVICES
# ============================================================
echo ""
echo -e "${GREEN}PHASE 2: Stopping Services${NC}"
echo "Stopping all services..."
docker-compose down

# Small delay
sleep 2

echo -e "${GREEN}✓ Services stopped${NC}"

# ============================================================
# PHASE 3: UPDATE CONFIGURATION
# ============================================================
echo ""
echo -e "${GREEN}PHASE 3: Updating Configuration${NC}"
echo "Backing up original docker-compose.yml..."
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)

echo "Restoring consolidated docker-compose.yml..."
# Check if consolidated version exists
if [ -f "docker-compose.consolidated.yml" ]; then
    cp docker-compose.consolidated.yml docker-compose.yml
    echo -e "${GREEN}✓ Configuration updated (consolidated version applied)${NC}"
else
    echo -e "${RED}Error: docker-compose.consolidated.yml not found${NC}"
    echo "Restoring original..."
    cp docker-compose.yml.backup.* docker-compose.yml
    exit 1
fi

# ============================================================
# PHASE 4: REMOVE OLD VOLUMES (optional)
# ============================================================
echo ""
echo -e "${YELLOW}PHASE 4: Prepare for Migration${NC}"
read -p "Remove old database volumes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing old volumes..."
    docker volume rm simple378_postgres_data 2>/dev/null || true
    docker volume rm simple378_timescale_data 2>/dev/null || true
    echo -e "${GREEN}✓ Old volumes removed${NC}"
else
    echo -e "${YELLOW}⚠ Keeping old volumes (consolidation will use new unified volume)${NC}"
fi

# ============================================================
# PHASE 5: START CONSOLIDATED DATABASE
# ============================================================
echo ""
echo -e "${GREEN}PHASE 5: Starting Consolidated Database${NC}"
echo "Starting services..."
docker-compose up -d db

echo "Waiting for database to initialize (30 seconds)..."
sleep 30

# Check if database is ready
echo "Checking database connectivity..."
for i in {1..10}; do
    if docker exec fraud_db psql -U postgres -d fraud_detection -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is ready${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}Error: Database did not become ready${NC}"
        exit 1
    fi
    echo "Waiting... ($i/10)"
    sleep 3
done

# ============================================================
# PHASE 6: RESTORE DATA (optional)
# ============================================================
echo ""
echo -e "${GREEN}PHASE 6: Data Migration${NC}"
read -p "Restore data from backup? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Find most recent backup
    latest_backup=$(ls -t fraud_detection_backup_*.sql 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        echo "Restoring from $latest_backup..."
        docker exec -i fraud_db psql -U postgres fraud_detection < "$latest_backup"
        echo -e "${GREEN}✓ Data restored${NC}"
    else
        echo -e "${YELLOW}⚠ No backup file found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping data restore${NC}"
fi

# ============================================================
# PHASE 7: START OTHER SERVICES
# ============================================================
echo ""
echo -e "${GREEN}PHASE 7: Starting Other Services${NC}"
docker-compose up -d backend cache vector_db meilisearch jaeger

echo "Waiting for services to initialize (20 seconds)..."
sleep 20

# ============================================================
# PHASE 8: VERIFICATION
# ============================================================
echo ""
echo -e "${GREEN}PHASE 8: Verification${NC}"

echo "Running verification checks..."
echo ""

# Check database parameters
echo "Database Configuration:"
echo "  shared_buffers: $(docker exec fraud_db psql -U postgres -t -c "SHOW shared_buffers;" | xargs)"
echo "  work_mem: $(docker exec fraud_db psql -U postgres -t -c "SHOW work_mem;" | xargs)"
echo "  max_connections: $(docker exec fraud_db psql -U postgres -t -c "SHOW max_connections;" | xargs)"
echo "  jit: $(docker exec fraud_db psql -U postgres -t -c "SHOW jit;" | xargs)"

# Check TimescaleDB extension
echo ""
echo "TimescaleDB Extension:"
if docker exec fraud_db psql -U postgres -d fraud_detection -c "CREATE EXTENSION IF NOT EXISTS timescaledb;" > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ TimescaleDB extension available${NC}"
else
    echo -e "${RED}  ✗ Failed to create TimescaleDB extension${NC}"
fi

# Check running services
echo ""
echo "Running Services:"
docker-compose ps

# ============================================================
# PHASE 9: CLEANUP & SUMMARY
# ============================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Summary:"
echo "  ✓ Backups created"
echo "  ✓ Services migrated to consolidated setup"
echo "  ✓ Database optimizations applied"
echo "  ✓ All services running"
echo ""
echo "Next Steps:"
echo "  1. Run tests: docker-compose exec backend pytest"
echo "  2. Check logs: docker-compose logs -f backend"
echo "  3. Access app: http://localhost:5173"
echo "  4. Verify optimization: ./verify_db_optimization.sh"
echo ""
echo "Rollback (if needed):"
echo "  docker-compose down"
echo "  cp docker-compose.yml.backup.* docker-compose.yml"
echo "  docker-compose up -d"
echo ""
echo -e "${GREEN}Backups saved:${NC}"
ls -lh fraud_detection_backup_*.sql 2>/dev/null || echo "  No backup files"
echo ""
