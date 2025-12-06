#!/bin/bash
# Start Simple378 with Standardized Ports

echo "🚀 Starting Simple378 with Standardized Configuration"
echo "======================================================"
echo ""

# Stop all running containers
echo "Step 1: Stopping existing containers..."
docker compose down 2>/dev/null
echo "✓ Existing containers stopped"
echo ""

# Start development services
echo "Step 2: Starting development environment..."
docker compose up -d

echo ""
echo "Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "Step 3: Checking service status..."
docker compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Simple378 Development Environment Started!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Standardized Access Points:"
echo "   Frontend:     http://localhost:5173 (Vite standard)"
echo "   Backend API:  http://localhost:8000"
echo "   PostgreSQL:   localhost:5432 (standard)"
echo "   Redis:        localhost:6379 (standard)"
echo "   Qdrant:       localhost:6333"
echo "   Meilisearch:  localhost:7700"
echo "   Jaeger UI:    http://localhost:16686"
echo ""
echo "🔐 Credentials:"
echo "   PostgreSQL: postgres/postgres"
echo "   Database:   fraud_detection"
echo ""
echo "📊 Useful Commands:"
echo "   View logs:  docker compose logs -f"
echo "   Stop all:   docker compose down"
echo "   Restart:    docker compose restart"
echo ""
echo "✅ All ports are now standardized!"
echo ""
