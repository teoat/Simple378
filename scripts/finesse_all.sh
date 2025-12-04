#!/bin/bash
# Master Finesse Check Script
# Runs all finesse checks in sequence with comprehensive reporting

set -e

SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Results tracking
FRONTEND_RESULT=0
BACKEND_RESULT=0
INTEGRATION_RESULT=0
OVERLAP_RESULT=0

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║      ███████╗██╗███╗   ██╗███████╗███████╗███████╗███████╗           ║"
echo "║      ██╔════╝██║████╗  ██║██╔════╝██╔════╝██╔════╝██╔════╝           ║"
echo "║      █████╗  ██║██╔██╗ ██║█████╗  ███████╗███████╗█████╗             ║"
echo "║      ██╔══╝  ██║██║╚██╗██║██╔══╝  ╚════██║╚════██║██╔══╝             ║"
echo "║      ██║     ██║██║ ╚████║███████╗███████║███████║███████╗           ║"
echo "║      ╚═╝     ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚══════╝╚══════╝           ║"
echo "║                                                                      ║"
echo "║                    COMPLETE SYSTEM AUDIT                             ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  📅 Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  📁 Project: $(pwd)"
echo ""

# Parse arguments
SKIP_FRONTEND=false
SKIP_BACKEND=false
SKIP_INTEGRATION=false
SKIP_OVERLAPS=false
OUTPUT_DIR=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-frontend) SKIP_FRONTEND=true; shift ;;
        --skip-backend) SKIP_BACKEND=true; shift ;;
        --skip-integration) SKIP_INTEGRATION=true; shift ;;
        --skip-overlaps) SKIP_OVERLAPS=true; shift ;;
        --output) OUTPUT_DIR="$2"; shift 2 ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-frontend     Skip frontend checks"
            echo "  --skip-backend      Skip backend checks"
            echo "  --skip-integration  Skip integration checks"
            echo "  --skip-overlaps     Skip overlap detection"
            echo "  --output DIR        Save results to directory"
            echo ""
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Create output directory if specified
if [ -n "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
    echo "  📝 Results will be saved to: $OUTPUT_DIR"
    echo ""
fi

# Separator function
separator() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Section 1: Frontend Checks
if [ "$SKIP_FRONTEND" = false ]; then
    separator
    echo -e "${BLUE}▶ SECTION 1: FRONTEND CHECKS${NC}"
    separator
    
    if [ -n "$OUTPUT_DIR" ]; then
        if "$SCRIPT_DIR/finesse_frontend.sh" 2>&1 | tee "$OUTPUT_DIR/frontend_results.txt"; then
            FRONTEND_RESULT=0
        else
            FRONTEND_RESULT=1
        fi
    else
        if "$SCRIPT_DIR/finesse_frontend.sh"; then
            FRONTEND_RESULT=0
        else
            FRONTEND_RESULT=1
        fi
    fi
else
    echo -e "${YELLOW}⏭️  Skipping frontend checks${NC}"
fi

# Section 2: Backend Checks
if [ "$SKIP_BACKEND" = false ]; then
    separator
    echo -e "${BLUE}▶ SECTION 2: BACKEND CHECKS${NC}"
    separator
    
    if [ -n "$OUTPUT_DIR" ]; then
        if "$SCRIPT_DIR/finesse_backend.sh" 2>&1 | tee "$OUTPUT_DIR/backend_results.txt"; then
            BACKEND_RESULT=0
        else
            BACKEND_RESULT=1
        fi
    else
        if "$SCRIPT_DIR/finesse_backend.sh"; then
            BACKEND_RESULT=0
        else
            BACKEND_RESULT=1
        fi
    fi
else
    echo -e "${YELLOW}⏭️  Skipping backend checks${NC}"
fi

# Section 3: Integration Checks
if [ "$SKIP_INTEGRATION" = false ]; then
    separator
    echo -e "${BLUE}▶ SECTION 3: INTEGRATION CHECKS${NC}"
    separator
    
    if [ -n "$OUTPUT_DIR" ]; then
        if "$SCRIPT_DIR/finesse_integration.sh" 2>&1 | tee "$OUTPUT_DIR/integration_results.txt"; then
            INTEGRATION_RESULT=0
        else
            INTEGRATION_RESULT=1
        fi
    else
        if "$SCRIPT_DIR/finesse_integration.sh"; then
            INTEGRATION_RESULT=0
        else
            INTEGRATION_RESULT=1
        fi
    fi
else
    echo -e "${YELLOW}⏭️  Skipping integration checks${NC}"
fi

# Section 4: Overlap Detection
if [ "$SKIP_OVERLAPS" = false ]; then
    separator
    echo -e "${BLUE}▶ SECTION 4: OVERLAP DETECTION${NC}"
    separator
    
    if [ -n "$OUTPUT_DIR" ]; then
        if python3 "$SCRIPT_DIR/detect_overlaps.py" backend/app 2>&1 | tee "$OUTPUT_DIR/overlap_results.txt"; then
            OVERLAP_RESULT=0
        else
            OVERLAP_RESULT=1
        fi
    else
        if python3 "$SCRIPT_DIR/detect_overlaps.py" backend/app; then
            OVERLAP_RESULT=0
        else
            OVERLAP_RESULT=1
        fi
    fi
else
    echo -e "${YELLOW}⏭️  Skipping overlap detection${NC}"
fi

# Final Summary
separator
echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                      FINESSE CHECK SUMMARY                           ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

print_result() {
    local name=$1
    local result=$2
    local skipped=$3
    
    if [ "$skipped" = true ]; then
        echo -e "  ⏭️  $name: ${YELLOW}SKIPPED${NC}"
    elif [ "$result" -eq 0 ]; then
        echo -e "  ✅ $name: ${GREEN}PASSED${NC}"
    else
        echo -e "  ❌ $name: ${RED}FAILED${NC}"
    fi
}

print_result "Frontend Checks" $FRONTEND_RESULT $SKIP_FRONTEND
print_result "Backend Checks" $BACKEND_RESULT $SKIP_BACKEND
print_result "Integration Checks" $INTEGRATION_RESULT $SKIP_INTEGRATION
print_result "Overlap Detection" $OVERLAP_RESULT $SKIP_OVERLAPS

echo ""

# Calculate total result
TOTAL_FAILED=$((FRONTEND_RESULT + BACKEND_RESULT + INTEGRATION_RESULT + OVERLAP_RESULT))

if [ $TOTAL_FAILED -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "  ${GREEN}🎉 ALL FINESSE CHECKS PASSED!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "  ${RED}⚠️  $TOTAL_FAILED CHECK(S) FAILED - REVIEW REQUIRED${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""
echo "  📋 Reference: docs/FINESSE_CHECK_ORCHESTRATION.md"
echo ""

if [ -n "$OUTPUT_DIR" ]; then
    # Generate summary file
    cat > "$OUTPUT_DIR/summary.md" << EOF
# Finesse Check Summary

**Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Project:** $(pwd)

## Results

| Check | Result |
|-------|--------|
| Frontend | $([ $FRONTEND_RESULT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED") |
| Backend | $([ $BACKEND_RESULT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED") |
| Integration | $([ $INTEGRATION_RESULT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED") |
| Overlaps | $([ $OVERLAP_RESULT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED") |

## Overall

**Status:** $([ $TOTAL_FAILED -eq 0 ] && echo "✅ ALL CHECKS PASSED" || echo "⚠️ $TOTAL_FAILED CHECK(S) FAILED")

## Detailed Results

See individual result files in this directory:
- frontend_results.txt
- backend_results.txt
- integration_results.txt  
- overlap_results.txt
EOF

    echo "  📁 Results saved to: $OUTPUT_DIR/summary.md"
    echo ""
fi

exit $TOTAL_FAILED
