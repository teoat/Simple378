#!/bin/bash
# Backend Finesse Check Script
# Performs comprehensive quality checks on the backend codebase

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           BACKEND FINESSE CHECK                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || { echo "❌ Backend directory not found"; exit 1; }

ERRORS=0
WARNINGS=0

# 1. Ruff Linting
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [1/7] Ruff Linting                                         │"
echo "└────────────────────────────────────────────────────────────┘"
if command -v ruff &> /dev/null; then
    if ruff check app/ 2>&1 | tee /tmp/ruff.log; then
        echo "✅ Ruff: No linting errors"
    else
        RUFF_ERRORS=$(wc -l < /tmp/ruff.log)
        echo "❌ Ruff: $RUFF_ERRORS issues found"
        ERRORS=$((ERRORS + RUFF_ERRORS))
    fi
else
    echo "⚠️  Ruff not installed, running flake8..."
    if command -v flake8 &> /dev/null; then
        flake8 app/ --count --show-source --statistics 2>&1 | head -20 || true
    fi
fi
echo ""

# 2. Black Formatting
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [2/7] Black Formatting Check                               │"
echo "└────────────────────────────────────────────────────────────┘"
if command -v black &> /dev/null; then
    if black --check app/ 2>&1 | tee /tmp/black.log; then
        echo "✅ Black: All files properly formatted"
    else
        echo "⚠️  Black: Some files need formatting"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "⚠️  Black not installed, skipping format check"
fi
echo ""

# 3. isort Import Check
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [3/7] Import Sorting (isort)                               │"
echo "└────────────────────────────────────────────────────────────┘"
if command -v isort &> /dev/null; then
    if isort --check-only app/ 2>&1 | tee /tmp/isort.log; then
        echo "✅ isort: Imports are properly sorted"
    else
        echo "⚠️  isort: Some imports need sorting"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "⚠️  isort not installed, skipping import check"
fi
echo ""

# 4. Type Hints Check (mypy)
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [4/7] Type Checking (mypy)                                 │"
echo "└────────────────────────────────────────────────────────────┘"
if command -v mypy &> /dev/null; then
    mypy app/ --ignore-missing-imports --no-error-summary 2>&1 | tail -25 || true
else
    echo "⚠️  mypy not installed, skipping type check"
fi
echo ""

# 5. Security Scan (bandit)
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [5/7] Security Scan (bandit)                               │"
echo "└────────────────────────────────────────────────────────────┘"
if command -v bandit &> /dev/null; then
    bandit -r app/ -ll --quiet 2>&1 | tail -20 || true
else
    echo "⚠️  bandit not installed, skipping security scan"
fi
echo ""

# 6. Duplicate Code Detection
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [6/7] Duplicate Code Detection                             │"
echo "└────────────────────────────────────────────────────────────┘"
echo "Scanning for duplicate code patterns..."

# Simple duplicate detection using grep patterns
echo "Checking for common copy-paste patterns:"
echo ""

# Check for duplicate function signatures
echo "  Functions with similar names:"
grep -rh "^def " app/ 2>/dev/null | sort | uniq -d | head -10 || echo "    None found"
echo ""

# Check for duplicate imports
echo "  Duplicate import statements:"
grep -rh "^from " app/ 2>/dev/null | sort | uniq -c | sort -rn | head -5 | awk '$1 > 3 {print "    " $0}' || true
echo ""

# 7. API Endpoint Inventory
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [7/7] API Endpoint Inventory                               │"
echo "└────────────────────────────────────────────────────────────┘"
echo "Endpoint files:"
find app/api -name "*.py" -type f | grep -v __pycache__ | wc -l | xargs echo "  Count:"
echo ""
echo "Route decorators found:"
grep -rh "@router\.\(get\|post\|put\|delete\|patch\)" app/api/ 2>/dev/null | wc -l | xargs echo "  Total routes:"
echo ""

echo "Service files:"
find app/services -name "*.py" -type f | grep -v __pycache__ | wc -l | xargs echo "  Count:"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           SUMMARY                                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Total Errors:   $ERRORS"
echo "  Total Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ BACKEND FINESSE CHECK PASSED"
    exit 0
else
    echo "❌ BACKEND FINESSE CHECK FAILED"
    exit 1
fi
