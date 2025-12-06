#!/bin/bash
# Database Migration Helper Script

cd "$(dirname "$0")/backend"

echo "🗄️  Database Migration Helper"
echo "============================="
echo ""

# Check if database is accessible
echo "Checking database connection..."
if docker exec -it fraud_db psql -U postgres -c "SELECT 1;" &> /dev/null; then
    echo "✓ Database is accessible"
else
    echo "✗ Database is not accessible"
    echo "  Start it with: docker compose up -d db"
    exit 1
fi

echo ""
echo "Running migrations..."
echo ""

# Run the migration
alembic upgrade head

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Migrations completed successfully!"
else
    echo ""
    echo "✗ Migration failed"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check database is running: docker compose ps"
    echo "2. Check connection: docker exec -it fraud_db psql -U postgres"
    echo "3. View logs: docker compose logs db"
    exit 1
fi
