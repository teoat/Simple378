# Complete E2E Test Setup Guide
**Path A: Install & Test - Full Implementation**  
**Created:** 2025-12-07  
**Status:** Ready for Execution

## 🎯 Overview

This guide walks you through the complete setup and execution of all 38 E2E Playwright tests for the Simple378 fraud detection system.

---

## ✅ What's Been Prepared

I've created the following setup infrastructure for you:

### 📁 Files Created

1. **`setup_nodejs.sh`** - Node.js installation guide
2. **`setup_frontend.sh`** - Frontend dependency installer
3. **`run_e2e_tests.sh`** - Complete interactive test runner
4. **`backend/scripts/seed_test_data.py`** - Test data seeder
5. **`frontend/test-data/`** - Test fixture files
   - `sample.csv` - Transaction data
   - `sample.pdf` - PDF placeholder
   - `sample.xlsx` - Excel placeholder
   - `invalid.exe` - Invalid file type for rejection tests

---

## 🚀 Quick Start (Step-by-Step)

### **Step 1: Install Node.js** ⏱️ 5-10 minutes

Node.js is required but not currently installed. Choose ONE method:

#### Option A: Official Installer (RECOMMENDED)
```bash
# 1. Visit in your browser:
open https://nodejs.org/

# 2. Download the LTS version (Long Term Support)
# 3. Run the .pkg installer
# 4. Follow the installation wizard
# 5. Restart your terminal
# 6. Verify installation:
node --version  # Should show v20.x.x or similar
npm --version   # Should show v10.x.x or similar
```

#### Option B: Via Homebrew
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js
brew install node

# Verify
node --version
npm --version
```

#### Option C: Via NVM (Node Version Manager)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install --lts
nvm use --lts

# Verify
node --version
```

---

### **Step 2: Run Setup Script** ⏱️ 3-5 minutes

After Node.js is installed:

```bash
cd /Users/Arief/Desktop/Simple378
./setup_frontend.sh
```

This will:
- ✅ Verify Node.js installation
- ✅ Install all frontend npm dependencies (~200MB, 500+ packages)
- ✅ Install Playwright Chromium browser (~100MB)

**Expected output:**
```
✅ Node.js found: v20.x.x
📦 Installing frontend dependencies...
✅ Frontend setup complete!
```

---

### **Step 3: Seed Test Data** ⏱️ 1 minute

Create test users, cases, and data:

```bash
cd /Users/Arief/Desktop/Simple378/backend
poetry run python scripts/seed_test_data.py
```

**This creates:**
- 👤 `test@example.com` / `testpass123` (Analyst role)
- 👤 `admin@example.com` / `password` (Admin role)
- 📁 Case: `123e4567-e89b-12d3-a456-426614174000` (Primary test case)
- 📁 Case: `CASE-E2E-001` (Secondary test case)
- 👥 2 Test subjects (John Doe, Acme Corp)
- 💰 20+ Sample transactions
- 🚨 5 Test alerts for adjudication

**Expected output:**
```
✅ Test data seeding completed successfully!
📋 Summary:
  • Users: 2
  • Cases: 2
  • Subjects: 2
  • Transactions: 20
  • Alerts: 5
```

---

### **Step 4: Start Backend** ⏱️ 10 seconds

In a **new terminal window**:

```bash
cd /Users/Arief/Desktop/Simple378/backend
poetry run uvicorn app.main:app --reload --port 8000
```

**Keep this running!** You should see:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Verify: `curl http://localhost:8000/docs` (should return OpenAPI docs)

---

### **Step 5: Start Frontend** ⏱️ 10 seconds

In **another new terminal window**:

```bash
cd /Users/Arief/Desktop/Simple378/frontend
npm run dev
```

**Keep this running!** You should see:
```
VITE v5.x.x  ready in 500 ms
➜  Local:   http://localhost:5173/
```

Verify: Open http://localhost:5173 in your browser

---

### **Step 6: Run E2E Tests** ⏱️ 5-15 minutes

Now you have TWO options:

#### Option A: Interactive Runner (RECOMMENDED)
```bash
cd /Users/Arief/Desktop/Simple378
./run_e2e_tests.sh
```

This will:
1. Check all prerequisites
2. Verify services are running
3. Offer test execution options:
   - Run all tests
   - Run smoke tests only
   - Run specific suite
   - Run in headed mode (see browser)

#### Option B: Manual Execution
```bash
cd /Users/Arief/Desktop/Simple378/frontend

# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/adjudication-workflow.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run with debugging
npm run test:e2e -- --debug

# Run specific test by name
npm run test:e2e -- --grep "should display adjudication queue"
```

---

## 📊 Understanding Test Results

### Successful Test Output
```
✓ tests/adjudication-workflow.spec.ts:17:3 › should display adjudication queue
✓ tests/analytics.spec.ts:14:3 › Predictive Analytics Dashboard
```

### Failed Test Output
```
✗ tests/adjudication-workflow.spec.ts:28:3 › should allow case review
  Error: Timed out waiting for selector "text=Review Case"
```

### View HTML Report
```bash
# After tests complete:
open frontend/playwright-report/index.html
```

---

## 🐛 Troubleshooting

### Issue: "npm: command not found"
**Solution:** Node.js not installed or terminal not restarted. Go back to Step 1.

### Issue: "Error: listen EADDRINUSE: address already in use :::8000"
**Solution:** Backend is already running. Find and kill: `lsof -ti:8000 | xargs kill`

### Issue: "Error: listen EADDRINUSE: address already in use :::5173"
**Solution:** Frontend is already running. Find and kill: `lsof -ti:5173 | xargs kill`

### Issue: Tests fail with "Navigation failed"
**Solution:** 
1. Check backend is running: `curl http://localhost:8000/health`
2. Check frontend is running: `curl http://localhost:5173`
3. Check test data exists: `poetry run python -c "from app.db.session import *; print('DB OK')"`

### Issue: Login tests fail
**Solution:** Run seed script again: `poetry run python scripts/seed_test_data.py --clear`

### Issue: Database errors
**Solution:**
```bash
cd backend
poetry run alembic downgrade -1
poetry run alembic upgrade head
poetry run python scripts/seed_test_data.py --clear
```

---

## 📈 Expected Test Results

Based on the analysis, here's what to expect:

### ✅ Likely to Pass (if features complete)
- Basic page navigation tests
- Component rendering tests
- Login/authentication flows

### ⚠️  May Fail (missing features)
- Keyboard shortcuts for adjudication
- Predictive analytics tab
- Offline mode indicator
- Bulk operations UI
- Phase control panel
- Some export functions

### 🔧 Will Need Fixes
- Missing `data-testid` attributes
- Empty state messages
- API error handling
- Toast notifications
- Drag-and-drop visual feedback

---

## 🎯 Test Execution Strategy

### Phase 1: Smoke Test (2-3 minutes)
```bash
npm run test:e2e -- tests/visualization.smoke.spec.ts
```
Quick validation that basic setup works.

### Phase 2: Login & Auth (2-3 minutes)
```bash
npm run test:e2e -- tests/e2e/case-management.spec.ts --grep "login"
```
Verify authentication works.

### Phase 3: Full Suite (10-15 minutes)
```bash
npm run test:e2e
```
Run all 38 tests and collect results.

### Phase 4: Fix & Retry
Based on failures, fix issues and re-run specific tests:
```bash
npm run test:e2e -- tests/specific-test.spec.ts
```

---

## 📝 Next Steps After Testing

### If Tests Pass ✅
1. Celebrate! 🎉
2. Set up CI/CD pipeline
3. Add more test coverage
4. Document test scenarios

### If Tests Fail ❌
1. Review HTML report: `frontend/playwright-report/index.html`
2. Check screenshots: `frontend/test-results/`
3. Fix issues based on categories in `E2E_TEST_RESOLUTION_PLAN.md`
4. Re-run specific failing tests
5. Iterate until all pass

---

## 🔄 Continuous Testing Workflow

Once setup is complete, your daily workflow:

```bash
# Morning: Start services
cd backend && poetry run uvicorn app.main:app --reload &
cd frontend && npm run dev &

# Work on features

# Before committing: Run affected tests
cd frontend
npm run test:e2e -- tests/your-feature.spec.ts

# Fix issues, iterate

# End of day: Stop services
kill $(lsof -ti:8000)  # Backend
kill $(lsof -ti:5173)  # Frontend
```

---

## 📚 Additional Resources

- **Test Documentation:** `docs/testing/E2E_TEST_RESOLUTION_PLAN.md`
- **Immediate Actions:** `docs/testing/IMMEDIATE_E2E_ACTIONS.md`
- **Playwright Docs:** https://playwright.dev/
- **Test Reports:** `frontend/playwright-report/`
- **Test Results:** `frontend/test-results/`

---

## ⚡ Quick Command Reference

```bash
# Setup
./setup_nodejs.sh          # Node.js installation guide
./setup_frontend.sh        # Install dependencies

# Services
cd backend && poetry run uvicorn app.main:app --reload
cd frontend && npm run dev

# Testing
./run_e2e_tests.sh        # Interactive runner
npm run test:e2e          # Run all tests
npm run test:e2e -- --headed    # See browser
npm run test:e2e -- --debug     # Debug mode

# Data
poetry run python scripts/seed_test_data.py         # Seed
poetry run python scripts/seed_test_data.py --clear # Clear & re-seed

# Ports
lsof -i :8000             # Check backend
lsof -i :5173             # Check frontend
lsof -ti:8000 | xargs kill    # Kill backend
lsof -ti:5173 | xargs kill    # Kill frontend
```

---

## 🎬 Ready to Start!

**Your next command:**
```bash
# If Node.js not installed yet:
./setup_nodejs.sh
# Then install it using one of the provided methods

# After Node.js is installed:
./setup_frontend.sh

# Then proceed with the interactive test runner:
./run_e2e_tests.sh
```

Good luck! 🚀
