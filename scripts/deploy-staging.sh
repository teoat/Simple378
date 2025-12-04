#!/bin/bash
# Staging Deployment Script
# Deploys Simple378 to staging environment using Docker Compose

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.staging.yml"
PROJECT_NAME="simple378-staging"
BACKUP_DIR="/opt/simple378/backups"
MAX_ROLLBACK_ATTEMPTS=3

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Simple378 Staging Deployment${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log errors
error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Function to log warnings
warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if Docker is running
log "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running"
    exit 1
fi

# Check if docker-compose is available
log "Checking Docker Compose..."
if ! docker-compose --version > /dev/null 2>&1; then
    error "Docker Compose is not installed"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup current database (if exists)
log "Creating database backup..."
if docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps | grep -q "fraud_db_staging"; then
    BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec -T db \
        pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "$BACKUP_FILE" 2>/dev/null || \
        warn "Database backup failed (may be first deployment)"
    
    if [ -f "$BACKUP_FILE" ]; then
        log "Database backed up to: $BACKUP_FILE"
    fi
fi

# Pull latest images
log "Pulling latest Docker images..."
export GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-}"
export IMAGE_TAG="${IMAGE_TAG:-staging}"

if [ -z "$GITHUB_REPOSITORY" ]; then
    warn "GITHUB_REPOSITORY not set, using local builds"
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build
else
    log "Pulling from GitHub Container Registry..."
    docker pull "ghcr.io/${GITHUB_REPOSITORY}/backend:${IMAGE_TAG}" || {
        error "Failed to pull backend image"
        exit 1
    }
    docker pull "ghcr.io/${GITHUB_REPOSITORY}/frontend:${IMAGE_TAG}" || {
        error "Failed to pull frontend image"
        exit 1
    }
fi

# Stop existing containers (gracefully)
log "Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down --remove-orphans || true

# Start services
log "Starting services..."
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d

# Wait for services to start
log "Waiting for services to initialize..."
sleep 10

# Check service health
log "Checking service health..."
MAX_HEALTH_CHECKS=30
HEALTH_CHECK_COUNT=0

while [ $HEALTH_CHECK_COUNT -lt $MAX_HEALTH_CHECKS ]; do
    if docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps | grep -q "healthy"; then
        log "Services are healthy!"
        break
    fi
    
    HEALTH_CHECK_COUNT=$((HEALTH_CHECK_COUNT + 1))
    if [ $HEALTH_CHECK_COUNT -eq $MAX_HEALTH_CHECKS ]; then
        error "Services failed to become healthy after $MAX_HEALTH_CHECKS attempts"
        
        # Show logs for debugging
        log "Showing container logs..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs --tail=50
        
        # Attempt rollback
        warn "Attempting to roll back..."
        if [ -f "$BACKUP_FILE" ]; then
            docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
            # Restore from backup would go here
        fi
        exit 1
    fi
    
    echo -n "."
    sleep 2
done
echo ""

# Clean up old images
log "Cleaning up old Docker images..."
docker image prune -f > /dev/null 2>&1 || true

# Display deployment information
log "Deployment completed successfully!"
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Deployment Summary${NC}"
echo -e "${GREEN}=====================================${NC}"
echo "Project: $PROJECT_NAME"
echo "Environment: staging"
echo "Image Tag: $IMAGE_TAG"
echo "Version: ${VERSION:-unknown}"
echo ""
echo "Services:"
docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
echo ""
echo -e "${GREEN}Access URLs:${NC}"
echo "  Frontend: http://localhost:8080"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  Jaeger UI: http://localhost:16686"
echo ""
echo -e "${GREEN}Logs:${NC}"
echo "  View logs: docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f"
echo ""
echo -e "${GREEN}Health Check:${NC}"
echo "  ./staging-health-check.sh"
echo ""

exit 0
