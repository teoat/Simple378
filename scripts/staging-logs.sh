#!/bin/bash
# Staging Logs Script
# Fetches and displays logs from staging environment

set -e

COMPOSE_FILE="docker-compose.staging.yml"
PROJECT_NAME="simple378-staging"

# Default values
SERVICE="${1:-all}"
TAIL_LINES="${2:-100}"

echo "Fetching logs from staging environment..."
echo "Service: $SERVICE"
echo "Lines: $TAIL_LINES"
echo ""

if [ "$SERVICE" = "all" ]; then
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs --tail="$TAIL_LINES" --follow
else
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs --tail="$TAIL_LINES" --follow "$SERVICE"
fi
