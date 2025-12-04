#!/bin/bash
# Staging Rollback Script
# Rolls back staging deployment to previous version

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.staging.yml"
PROJECT_NAME="simple378-staging"
BACKUP_DIR="/opt/simple378/backups"

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Staging Rollback${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""

# List available backups
echo "Available database backups:"
ls -lht "$BACKUP_DIR"/db_backup_*.sql 2>/dev/null || {
    echo -e "${RED}No backups found${NC}"
    exit 1
}
echo ""

# Get the most recent backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/db_backup_*.sql 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}No backup file found${NC}"
    exit 1
fi

echo -e "${GREEN}Latest backup: $LATEST_BACKUP${NC}"
echo ""

# Confirm rollback
read -p "Are you sure you want to rollback to this backup? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

# Stop services
echo "Stopping services..."
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down

# Restore database
echo "Restoring database from backup..."
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d db

# Wait for database
sleep 5

# Restore backup
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec -T db \
    psql -U "${POSTGRES_USER}" "${POSTGRES_DB}" < "$LATEST_BACKUP"

echo -e "${GREEN}Database restored successfully${NC}"

# Restart all services
echo "Restarting services..."
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d

echo ""
echo -e "${GREEN}Rollback completed${NC}"
echo ""

exit 0
