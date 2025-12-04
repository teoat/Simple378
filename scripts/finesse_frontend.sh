#!/bin/bash
# Frontend Finesse Check Script
# Performs comprehensive quality checks on the frontend codebase

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           FRONTEND FINESSE CHECK                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || { echo "❌ Frontend directory not found"; exit 1; }

ERRORS=0
WARNINGS=0

# 1. TypeScript Type Check
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [1/6] TypeScript Type Checking                             │"
echo "└────────────────────────────────────────────────────────────┘"
if npx tsc --noEmit 2> /tmp/ts_check.log; then
    echo "✅ TypeScript: No type errors"
else
    TS_ERRORS=$(grep -c "error TS" /tmp/ts_check.log 2>/dev/null || echo 0)
    echo "❌ TypeScript: $TS_ERRORS errors found"
    ERRORS=$((ERRORS + TS_ERRORS))
fi
echo ""

# 2. ESLint Check
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [2/6] ESLint Linting                                       │"
echo "└────────────────────────────────────────────────────────────┘"
if npm run lint 2>&1 | tee /tmp/eslint.log; then
    echo "✅ ESLint: No linting errors"
else
    LINT_ERRORS=$(grep -c "error" /tmp/eslint.log 2>/dev/null || echo 0)
    LINT_WARNINGS=$(grep -c "warning" /tmp/eslint.log 2>/dev/null || echo 0)
    echo "⚠️  ESLint: $LINT_ERRORS errors, $LINT_WARNINGS warnings"
    ERRORS=$((ERRORS + LINT_ERRORS))
    WARNINGS=$((WARNINGS + LINT_WARNINGS))
fi
echo ""

# 3. Unused Exports Check
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [3/6] Unused Exports Detection                             │"
echo "└────────────────────────────────────────────────────────────┘"
if command -v npx &> /dev/null; then
    echo "Scanning for unused exports..."
    npx ts-prune --error 2>/dev/null | head -15 || echo "⚠️  ts-prune not available, skipping"
else
    echo "⚠️  npx not available, skipping unused exports check"
fi
echo ""

# 4. Build Check
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [4/6] Production Build Check                               │"
echo "└────────────────────────────────────────────────────────────┘"
if npm run build 2>&1 | tee /tmp/build.log; then
    echo "✅ Build: Successful"
    echo ""
    echo "Bundle Analysis:"
    grep -A 10 "dist/" /tmp/build.log 2>/dev/null | head -15 || true
else
    echo "❌ Build: Failed"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Dependency Audit
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [5/6] Security Dependency Audit                            │"
echo "└────────────────────────────────────────────────────────────┘"
npm audit --production 2>&1 | tail -15 || true
echo ""

# 6. Component Inventory
echo "┌────────────────────────────────────────────────────────────┐"
echo "│ [6/6] Component Inventory                                  │"
echo "└────────────────────────────────────────────────────────────┘"
echo "Pages:"
find src/pages -name "*.tsx" -type f | wc -l | xargs echo "  Count:"
find src/pages -name "*.tsx" -type f | sed 's/.*\//    - /'
echo ""
echo "Components:"
find src/components -name "*.tsx" -type f | wc -l | xargs echo "  Count:"
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
    echo "✅ FRONTEND FINESSE CHECK PASSED"
    exit 0
else
    echo "❌ FRONTEND FINESSE CHECK FAILED"
    exit 1
fi
