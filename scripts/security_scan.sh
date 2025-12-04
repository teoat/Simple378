#!/bin/bash

# Security dependency scanning script

echo "========================================"
echo "Security Dependency Scanning"
echo "========================================"
echo ""

# Backend (Python)
echo "Scanning Python dependencies..."
cd backend

# Check if poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "Poetry not found. Installing..."
    pip install poetry
fi

# Install and run safety check
echo "Running safety check..."
poetry run pip install safety
poetry run safety check --json > ../reports/safety-report.json 2>&1 || true
poetry run safety check 2>&1 || echo "Safety check found vulnerabilities (see report above)"

echo ""
echo "Scanning for outdated packages..."
poetry show --outdated

cd ..

# Frontend (Node.js)
echo ""
echo "========================================"
echo "Scanning Node.js dependencies..."
cd frontend

# Run npm audit
echo "Running npm audit..."
npm audit --json > ../reports/npm-audit-report.json 2>&1 || true
npm audit 2>&1 || echo "npm audit found vulnerabilities (see report above)"

echo ""
echo "Checking for outdated packages..."
npm outdated || true

cd ..

# Docker image scanning (if trivy is installed)
echo ""
echo "========================================"
if command -v trivy &> /dev/null; then
    echo "Scanning Docker images..."
    
    echo "Scanning backend image..."
    trivy image fraud_backend --severity HIGH,CRITICAL --format json --output reports/trivy-backend.json 2>&1 || true
    trivy image fraud_backend --severity HIGH,CRITICAL 2>&1 || echo "Backend image has vulnerabilities"
    
    echo ""
    echo "Scanning frontend image..."
    trivy image fraud_frontend --severity HIGH,CRITICAL --format json --output reports/trivy-frontend.json 2>&1 || true
    trivy image fraud_frontend --severity HIGH,CRITICAL 2>&1 || echo "Frontend image has vulnerabilities"
else
    echo "Trivy not installed. Skipping Docker image scanning."
    echo "Install with: brew install aquasecurity/trivy/trivy (macOS) or see https://github.com/aquasecurity/trivy"
fi

echo ""
echo "========================================"
echo "Security scan complete!"
echo "Reports saved in ./reports/ directory"
echo "========================================"
