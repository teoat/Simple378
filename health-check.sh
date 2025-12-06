#!/bin/bash

# Quick health check script for all services

services=(
  "backend:8000:/health"
  "mcp-server:8080:/health"
  "frontend:5173:/"
  "grafana:3000:/api/health"
  "prometheus:9090:/-/healthy"
  "meilisearch:7700:/health"
)

echo "🏥 AntiGravity Health Check"
echo "============================"
echo ""

for service in "${services[@]}"; do
  IFS=':' read -r name port path <<< "$service"
  
echo -n "Checking $name... "
  
  if curl -sf "http://localhost:$port$path" > /dev/null 2>&1; then
    echo "✅ OK"
  else
    echo "❌ FAIL"
  fi
done

echo ""
echo "Docker Containers:"
docker-compose ps
