#!/bin/bash

# Comprehensive Diagnostic Runner for AntiGravity Fraud Detection System
# This script runs diagnostics across all system layers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/diagnostic_results_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging function
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" >> "$LOG_FILE"
    echo -e "[$timestamp] [$level] $message"
}

# Header
show_header() {
    echo -e "${PURPLE}🔍 AntiGravity Comprehensive Diagnostic Suite${NC}"
    echo -e "${PURPLE}=================================================${NC}"
    echo ""
    echo -e "Systematic debugging across all layers:"
    echo -e "  🏗️  Application Layer (Frontend/Backend)"
    echo -e "  🗄️  Infrastructure Layer (Database/Cache)"
    echo -e "  🌐 Network Layer (API/WebSocket)"
    echo -e "  🔐 Security Layer (Auth/Authorization)"
    echo -e "  ⚡ Performance Layer (Metrics/Analysis)"
    echo -e "  📊 Data Layer (Integrity/Consistency)"
    echo ""
}

# System status check
check_system_status() {
    log "INFO" "🔍 Checking system status..."

    echo -e "${BLUE}📊 System Status Check${NC}"
    echo -e "${BLUE}======================${NC}"

    # Check Docker services
    echo "Docker Services:"
    if command -v docker &> /dev/null && docker ps &> /dev/null; then
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10
    else
        echo -e "${RED}❌ Docker not available${NC}"
    fi
    echo ""

    # Check backend health
    echo "Backend Health:"
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        health_response=$(curl -s http://localhost:8000/health)
        echo -e "${GREEN}✅ Backend healthy: $health_response${NC}"
    else
        echo -e "${RED}❌ Backend not responding${NC}"
    fi
    echo ""

    # Check database
    echo "Database Status:"
    if docker exec simple378-db-1 pg_isready -U fraud_admin -q 2>/dev/null; then
        echo -e "${GREEN}✅ Database ready${NC}"
    else
        echo -e "${RED}❌ Database not accessible${NC}"
    fi
    echo ""

    log "SUCCESS" "System status check complete"
}

# Backend diagnostics
run_backend_diagnostics() {
    log "INFO" "🚀 Running backend diagnostics..."

    echo -e "${BLUE}🚀 Backend Diagnostics${NC}"
    echo -e "${BLUE}=====================${NC}"

    if [ -f "backend_diagnostics.py" ]; then
        python3 backend_diagnostics.py 2>&1 | tee -a "$LOG_FILE"
        echo -e "${GREEN}✅ Backend diagnostics complete${NC}"
    else
        echo -e "${RED}❌ Backend diagnostics script not found${NC}"
    fi
    echo ""
}

# Database diagnostics
run_database_diagnostics() {
    log "INFO" "🗄️ Running database diagnostics..."

    echo -e "${BLUE}🗄️ Database Diagnostics${NC}"
    echo -e "${BLUE}========================${NC}"

    # Basic connection test
    echo "Connection Test:"
    if docker exec simple378-db-1 pg_isready -U fraud_admin -d fraud_detection -q 2>/dev/null; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
    fi

    # Get basic stats
    echo -e "\nDatabase Statistics:"
    docker exec simple378-db-1 psql -U fraud_admin -d fraud_detection -c "
        SELECT
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes
        FROM pg_stat_user_tables
        ORDER BY n_tup_ins DESC
        LIMIT 5;
    " 2>/dev/null || echo -e "${YELLOW}⚠️ Could not retrieve table statistics${NC}"

    echo -e "${GREEN}✅ Database diagnostics complete${NC}"
    echo ""
}

# Network diagnostics
run_network_diagnostics() {
    log "INFO" "🌐 Running network diagnostics..."

    echo -e "${BLUE}🌐 Network Diagnostics${NC}"
    echo -e "${BLUE}======================${NC}"

    # Test API endpoints
    endpoints=(
        "http://localhost:8000/health"
        "http://localhost:8000/cases/"
        "http://localhost:8000/dashboard/metrics"
        "http://localhost:8000/auth/me"
    )

    echo "API Endpoint Tests:"
    for endpoint in "${endpoints[@]}"; do
        if curl -sf --max-time 5 "$endpoint" > /dev/null 2>&1; then
            response_time=$(curl -s -w "%{time_total}" -o /dev/null "$endpoint")
            echo -e "✅ ${endpoint}: $(echo "$response_time * 1000" | bc 2>/dev/null || echo "N/A")ms"
        else
            echo -e "❌ ${endpoint}: Failed"
        fi
    done

    # Test WebSocket (if available)
    echo -e "\nWebSocket Test:"
    if nc -z localhost 8000 2>/dev/null; then
        echo -e "${GREEN}✅ WebSocket port accessible${NC}"
    else
        echo -e "${YELLOW}⚠️ WebSocket port not accessible${NC}"
    fi

    echo -e "${GREEN}✅ Network diagnostics complete${NC}"
    echo ""
}

# Security diagnostics
run_security_diagnostics() {
    log "INFO" "🔐 Running security diagnostics..."

    echo -e "${BLUE}🔐 Security Diagnostics${NC}"
    echo -e "${BLUE}========================${NC}"

    # Check HTTPS
    echo "HTTPS Check:"
    if curl -I https://localhost 2>/dev/null | grep -q "200 OK"; then
        echo -e "${GREEN}✅ HTTPS enabled${NC}"
    else
        echo -e "${YELLOW}⚠️ HTTPS not configured${NC}"
    fi

    # Check authentication
    echo -e "\nAuthentication Check:"
    auth_response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/auth/me)
    if [ "$auth_response" = "401" ]; then
        echo -e "${GREEN}✅ Authentication properly configured${NC}"
    elif [ "$auth_response" = "200" ]; then
        echo -e "${YELLOW}⚠️ Authentication bypassed (check security)${NC}"
    else
        echo -e "${RED}❌ Authentication endpoint not responding${NC}"
    fi

    # Check for security headers
    echo -e "\nSecurity Headers:"
    headers=$(curl -s -I http://localhost:8000/health)
    security_headers=(
        "X-Content-Type-Options"
        "X-Frame-Options"
        "X-XSS-Protection"
        "Content-Security-Policy"
    )

    for header in "${security_headers[@]}"; do
        if echo "$headers" | grep -qi "$header"; then
            echo -e "✅ $header: Present"
        else
            echo -e "❌ $header: Missing"
        fi
    done

    echo -e "${GREEN}✅ Security diagnostics complete${NC}"
    echo ""
}

# Performance diagnostics
run_performance_diagnostics() {
    log "INFO" "⚡ Running performance diagnostics..."

    echo -e "${BLUE}⚡ Performance Diagnostics${NC}"
    echo -e "${BLUE}==========================${NC}"

    # Backend performance
    echo "Backend Performance:"
    for i in {1..3}; do
        start=$(date +%s%N)
        curl -s http://localhost:8000/health > /dev/null
        end=$(date +%s%N)
        duration=$(( (end - start) / 1000000 ))
        echo "Request $i: ${duration}ms"
    done

    # Database performance
    echo -e "\nDatabase Performance:"
    query_time=$(docker exec simple378-db-1 psql -U fraud_admin -d fraud_detection -c "
        \timing on
        SELECT COUNT(*) FROM pg_stat_activity;
        \timing off
    " 2>&1 | grep "Time:" | sed 's/Time: //' | sed 's/ms//' | head -1)

    if [ -n "$query_time" ]; then
        echo "Sample query time: ${query_time}ms"
    else
        echo "Could not measure query performance"
    fi

    # System resources
    echo -e "\nSystem Resources:"
    if command -v top &> /dev/null; then
        cpu_usage=$(top -l 1 | grep "CPU usage" | sed 's/.*CPU usage: //' | sed 's/%.*//')
        echo "CPU Usage: ${cpu_usage}%"
    fi

    memory_usage=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep "simple378-backend" || echo "Backend stats unavailable")
    echo "Container Memory: $memory_usage"

    echo -e "${GREEN}✅ Performance diagnostics complete${NC}"
    echo ""
}

# Data integrity diagnostics
run_data_diagnostics() {
    log "INFO" "📊 Running data integrity diagnostics..."

    echo -e "${BLUE}📊 Data Integrity Diagnostics${NC}"
    echo -e "${BLUE}==============================${NC}"

    # Check for data consistency
    echo "Data Consistency Check:"
    docker exec simple378-db-1 psql -U fraud_admin -d fraud_detection -c "
        -- Check for orphaned records
        SELECT 'cases_without_details' as check_name, COUNT(*) as count
        FROM cases c
        LEFT JOIN case_details cd ON c.id = cd.case_id
        WHERE cd.case_id IS NULL

        UNION ALL

        -- Check for invalid status values
        SELECT 'invalid_status_values' as check_name, COUNT(*) as count
        FROM cases
        WHERE status NOT IN ('pending', 'active', 'closed', 'escalated', 'under review', 'reviewed')

        UNION ALL

        -- Check for future created dates
        SELECT 'future_created_dates' as check_name, COUNT(*) as count
        FROM cases
        WHERE created_at > NOW();
    " 2>/dev/null || echo -e "${YELLOW}⚠️ Could not perform data consistency checks${NC}"

    # Check table sizes
    echo -e "\nTable Sizes:"
    docker exec simple378-db-1 psql -U fraud_admin -d fraud_detection -c "
        SELECT
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 5;
    " 2>/dev/null || echo -e "${YELLOW}⚠️ Could not retrieve table sizes${NC}"

    echo -e "${GREEN}✅ Data integrity diagnostics complete${NC}"
    echo ""
}

# Generate recommendations
generate_recommendations() {
    log "INFO" "💡 Generating diagnostic recommendations..."

    echo -e "${BLUE}💡 Diagnostic Recommendations${NC}"
    echo -e "${BLUE}===============================${NC}"

    recommendations=()

    # Check backend health
    if ! curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        recommendations+=("🔴 CRITICAL: Backend service is not responding - restart required")
    fi

    # Check database connectivity
    if ! docker exec simple378-db-1 pg_isready -U fraud_admin -q 2>/dev/null; then
        recommendations+=("🔴 CRITICAL: Database connection failed - check database service")
    fi

    # Check security headers
    if ! curl -s -I http://localhost:8000/health | grep -q "X-Content-Type-Options"; then
        recommendations+=("🟡 HIGH: Security headers missing - implement CSP and security headers")
    fi

    # Check HTTPS
    if ! curl -I https://localhost 2>/dev/null | grep -q "200 OK"; then
        recommendations+=("🟡 HIGH: HTTPS not configured - implement SSL/TLS")
    fi

    # Performance recommendations
    backend_perf=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:8000/health)
    if (( $(echo "$backend_perf > 2.0" | bc -l 2>/dev/null || echo "0") )); then
        recommendations+=("🟢 MEDIUM: Slow API response times - optimize database queries")
    fi

    # Display recommendations
    if [ ${#recommendations[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ No critical issues found - system is healthy!${NC}"
    else
        echo "Issues requiring attention:"
        for i in "${!recommendations[@]}"; do
            echo "$((i+1)). ${recommendations[i]}"
        done
    fi

    echo ""
    log "SUCCESS" "Recommendations generated"
}

# Frontend diagnostics instructions
show_frontend_instructions() {
    echo -e "${BLUE}🎨 Frontend Diagnostics${NC}"
    echo -e "${BLUE}========================${NC}"
    echo "To run frontend diagnostics:"
    echo "1. Open browser to http://localhost:5173"
    echo "2. Open Developer Tools (F12)"
    echo "3. Go to Console tab"
    echo "4. Run: diagnostics.runFullDiagnostics()"
    echo ""
    echo "Available frontend diagnostic functions:"
    echo "  diagnostics.checkEnvironment()"
    echo "  diagnostics.analyzeReactComponents()"
    echo "  diagnostics.analyzeNetwork()"
    echo "  diagnostics.monitorPerformance()"
    echo "  diagnostics.analyzeSecurity()"
    echo "  diagnostics.auditAccessibility()"
    echo ""
}

# Main execution
main() {
    show_header

    echo "Starting comprehensive diagnostic suite..."
    echo "Results will be logged to: $LOG_FILE"
    echo ""

    # Run all diagnostic modules
    check_system_status
    run_backend_diagnostics
    run_database_diagnostics
    run_network_diagnostics
    run_security_diagnostics
    run_performance_diagnostics
    run_data_diagnostics

    # Generate recommendations
    generate_recommendations

    # Frontend instructions
    show_frontend_instructions

    echo -e "${GREEN}🎉 Comprehensive diagnostics complete!${NC}"
    echo -e "${CYAN}📋 Check $LOG_FILE for detailed logs${NC}"
    echo -e "${CYAN}🔧 Address any critical issues found above${NC}"
    echo -e "${CYAN}🎨 Run frontend diagnostics in browser console${NC}"
}

# Run main function
main "$@"