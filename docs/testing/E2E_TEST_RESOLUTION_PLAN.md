# E2E Test Resolution Plan
**Created:** 2025-12-07  
**Status:** In Progress  
**Total Failing Tests:** 38

## Overview
All 38 Playwright E2E tests are currently failing across multiple feature areas. This document outlines the systematic approach to fix these tests.

## Test Failure Categories

### 1. Adjudication Workflow (4 tests)
**Files:** `tests/adjudication-workflow.spec.ts`

**Issues:**
- `/adjudication` route not implemented or not accessible
- No "Adjudication Queue" page/component
- Missing decision workflow UI (Approve/Reject/Escalate buttons)
- Keyboard shortcuts for decisions not implemented

**Dependencies:**
- Adjudication page component
- API endpoint: `/api/v1/adjudication/queue`
- API endpoint: `/api/v1/cases/{id}/decision`
- Keyboard shortcut handlers

**Action Required:**
1. Check if `/adjudication` route exists in router
2. Create or verify `AdjudicationQueue` page component
3. Implement decision panel with Approve/Reject/Escalate actions
4. Add keyboard shortcuts (e.g., 'a' for approve)

---

### 2. Analytics & Visualization (3 tests)
**Files:** `tests/analytics.spec.ts`

**Issues:**
- Predictive Analytics tab not present on case detail pages
- `/cases/{id}/visualization` route navigation issues
- Missing components: Outcome Prediction, Risk Forecast, Resource Estimation
- Ingestion wizard flow incomplete

**Dependencies:**
- `PredictiveAnalyticsDashboard` component
- API endpoints for predictive models
- Ingestion wizard multi-step form

**Action Required:**
1. Add Predictive Analytics tab to case detail page
2. Implement predictive components
3. Verify visualization route accessibility
4. Complete ingestion wizard UI

---

### 3. Case Management E2E (7 tests)
**Files:** `tests/e2e/case-management.spec.ts`

**Issues:**
- Test credentials (`test@example.com`/`testpass123`) may not exist
- Case creation workflow may have validation issues
- Search and filter functionality not working as expected
- Offline mode detection/indicator not visible
- Pagination controls not rendering
- Bulk operations UI not implemented

**Dependencies:**
- Test user in database
- `/api/v1/cases` endpoints (GET, POST, PUT)
- Offline service worker
- Bulk action endpoints

**Action Required:**
1. Create test user with known credentials
2. Verify case CRUD API endpoints
3. Implement/verify offline detection UI
4. Add bulk operations UI to cases list
5. Ensure pagination controls render

---

### 4. Visualization Page E2E (14 tests)
**Files:** `tests/e2e/visualization.spec.ts`

**Issues:**
- Mock case ID (`MOCK_CASE_ID`) returns 404 or not found
- Missing `data-testid` attributes on components
- KPI cards not rendering with expected structure
- Tab navigation between Cashflow/Milestones/Fraud/Graphs not working
- Waterfall chart component missing or not rendering
- Empty state messages not implemented
- Export/Refresh buttons missing
- API route mocking not working properly

**Dependencies:**
- `/api/v1/cases/{id}/financials` endpoint
- Test case data seeded in database
- All visualization components with proper test IDs

**Action Required:**
1. Create seed data with known case ID for testing
2. Add `data-testid` attributes to all visualization components
3. Verify all tab components render correctly
4. Implement empty state views
5. Add Export and Refresh button handlers
6. Test API error handling

---

### 5. Phase Control Panel (3 tests)
**Files:** `tests/e2e/visualization.spec.ts` (lines 250-286)

**Issues:**
- `/cases/{id}/milestones/{milestone_id}` route not found
- "Mark Phase as Complete" button not rendering
- Completion form not showing
- Cancel functionality not working

**Dependencies:**
- Phase control panel component
- API endpoint: `/api/v1/milestones/{id}/complete`
- Milestone detail page

**Action Required:**
1. Create or verify milestone detail route
2. Implement phase control panel UI
3. Add completion form with evidence upload
4. Implement cancel button logic

---

### 6. File Upload (7 tests)
**Files:** `tests/file-upload.spec.ts`

**Issues:**
- Upload zone may not have expected text content
- Drag-and-drop state changes not visible
- File type validation not working
- No test files available for upload testing
- Processing state not showing
- File size limits not displayed

**Dependencies:**
- File upload component on ingestion page
- API endpoint: `/api/v1/ingestion/upload`
- Test fixture files

**Action Required:**
1. Verify ingestion page upload zone implementation
2. Add visual feedback for drag states
3. Create test fixture files in `/frontend/test-data/`
4. Implement file type and size validation
5. Add processing state UI

---

### 7. Reconciliation (3 tests)
**Files:** `tests/reconciliation.spec.ts`

**Issues:**
- Reconciliation page may not be loading properly
- Transaction lists (internal/external) not rendering
- AI Auto-Match button not triggering API call
- Manual match flow not working
- Success toast messages not appearing

**Dependencies:**
- `/api/v1/reconciliation/auto-match` endpoint
- `/api/v1/reconciliation/match` endpoint
- Toast notification system

**Action Required:**
1. Verify reconciliation page loads all sections
2. Implement auto-match API integration
3. Add manual match selection logic
4. Ensure toast notifications work

---

### 8. Visualization Network & Flow (1 test)
**Files:** `tests/visualization.smoke.spec.ts`

**Issues:**
- Network & Flow tab not rendering expected components
- Entity Network, Financial Flows, Transaction Timeline, Activity Heatmap missing
- Export SVG/PNG button not present
- Legend items (Subject/Bank/Other) not visible

**Dependencies:**
- Network visualization components (D3.js or react-force-graph)
- Export functionality for graphs

**Action Required:**
1. Complete Network & Flow tab implementation
2. Add all four visualization panels
3. Implement graph export feature
4. Add legend/status indicators

---

## Environment Setup Issues

### Critical Blockers
- **No npm/npx available** - Cannot run tests without Node.js
- **Backend may not be running** - Tests expect API at `http://localhost:8000`
- **Frontend dev server** - Tests expect frontend at `http://localhost:5173`
- **No test database** - Need seeded test data

### Setup Required
1. Install Node.js (if not available)
2. Run `cd frontend && npm install`
3. Install Playwright browsers: `npx playwright install`
4. Start backend: `cd backend && poetry run uvicorn app.main:app --reload`
5. Seed test database with known fixtures
6. Run frontend: `cd frontend && npm run dev`

---

## Systematic Resolution Strategy

### Phase 1: Environment Setup (IMMEDIATE)
- [ ] Verify Node.js/npm installation
- [ ] Install frontend dependencies
- [ ] Install Playwright browsers
- [ ] Start backend service
- [ ] Start frontend dev server
- [ ] Create test user account
- [ ] Seed test database

### Phase 2: Fix Critical UI Components (SHORT TERM)
- [ ] Complete visualization page tabs
- [ ] Add data-testid attributes
- [ ] Implement empty states
- [ ] Fix routing issues
- [ ] Add export/refresh buttons

### Phase 3: Fix API Integration (SHORT TERM)
- [ ] Verify all endpoints exist
- [ ] Test authentication flow
- [ ] Fix API error responses
- [ ] Add proper CORS headers

### Phase 4: Feature Completeness (MEDIUM TERM)
- [ ] Complete adjudication workflow
- [ ] Finish file upload implementation
- [ ] Complete reconciliation features
- [ ] Add predictive analytics
- [ ] Implement offline mode

### Phase 5: Test Infrastructure (MEDIUM TERM)
- [ ] Create test fixtures
- [ ] Add API mocking capability
- [ ] Set up CI/CD test pipeline
- [ ] Add test data seed scripts

### Phase 6: Polish & Edge Cases (LONG TERM)
- [ ] Keyboard shortcuts
- [ ] Bulk operations
- [ ] Error handling
- [ ] Loading states
- [ ] Accessibility

---

## Quick Wins (Can Fix Immediately)

1. **Add data-testid attributes** - Search codebase and add to key components
2. **Create test fixtures** - Add sample files to `frontend/test-data/`
3. **Seed test user** - Add SQL script or backend command
4. **Fix routes** - Ensure all expected routes are in router
5. **Add empty states** - Simple conditional rendering

---

## Commands to Run Tests

Once environment is set up:

```bash
# Run all E2E tests
cd frontend
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/adjudication-workflow.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run with debugging
npm run test:e2e -- --debug

# Update snapshots
npm run test:e2e -- --update-snapshots
```

---

## Test Data Requirements

### Required Test Users
```json
{
  "email": "test@example.com",
  "password": "testpass123",
  "role": "analyst"
},
{
  "email": "admin@example.com",
  "password": "password",
  "role": "admin"
}
```

### Required Test Cases
- Case ID: `123e4567-e89b-12d3-a456-426614174000` (for analytics/visualization tests)
- Case Number: `CASE-E2E-001` (for case management tests)
- Status: Various (pending, in_progress, closed)

### Required Test Files
- `frontend/test-data/sample.csv`
- `frontend/test-data/sample.pdf`
- `frontend/test-data/sample.xlsx`
- `frontend/test-data/invalid.exe` (for rejection testing)

---

## Next Steps

**Immediate Actions:**
1. Verify Node.js is installed and fix npm access
2. Check if backend is running and accessible
3. Run a single simple test to validate environment
4. Create test data seed script

**Would you like me to:**
- Create a test data seed script?
- Fix a specific category of tests first?
- Set up the test environment?
- Add missing data-testid attributes to components?
