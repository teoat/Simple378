---
description: Quick Start Sprint 1 - Begin Implementation
---

# Sprint 1: Foundation - Quick Start Workflow

This workflow will guide you through starting Sprint 1 of the Option C implementation plan.

---

## Prerequisites

- [X] Option C selected
- [X] Implementation plan reviewed
- [X] Development environment ready

---

## Sprint 1 Overview

**Duration:** 2 weeks (Dec 6 - Dec 20)  
**Goal:** Complete Ingestion + Visualization pages  
**Estimated Effort:** 47.75 hours (~6 working days)

---

## Phase 1: Ingestion Page Enhancement

### Step 1: Rename Forensics to Ingestion

// turbo
```bash
# Navigate to frontend
cd frontend/src/pages

# Rename the file
mv Forensics.tsx Ingestion.tsx
```

### Step 2: Update imports and exports

Edit `Ingestion.tsx` (formerly Forensics.tsx):
- Change export name from `Forensics` to `Ingestion`
- Update component name throughout file

### Step 3: Update route in App.tsx

Edit `frontend/src/App.tsx`:
- Update import: `const Ingestion = lazy(() => import('./pages/Ingestion')...`
- Update route: `<Route path="/ingestion" element={<Ingestion />} />`
- Remove old Forensics route (if `/forensics` exists)

### Step 4: Update sidebar navigation

Edit `frontend/src/components/layout/Sidebar.tsx` (or wherever nav is defined):
- Change link from `/forensics` to `/ingestion`
- Update label from "Forensics" to "Ingestion"
- Update icon to FileUp or Upload icon

### Step 5: Test basic navigation

// turbo
```bash
cd frontend
npm run dev
```

In browser:
- Navigate to http://localhost:5173/ingestion
- Verify page loads
- Verify sidebar link works

### Step 6: Create multi-step wizard structure

Create `frontend/src/types/ingestion.ts`:
```typescript
export type IngestionStep = 
  | 'source' 
  | 'upload' 
  | 'mapping' 
  | 'preview' 
  | 'confirm';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
}
```

### Step 7: Update Ingestion.tsx with wizard framework

Add state management for steps:
```typescript
const [step, setStep] = useState<IngestionStep>('source');
const [sourceType, setSourceType] = useState<'file' | 'database' | 'api'>('file');
```

### Step 8: Create StepProgress component

```bash
mkdir -p frontend/src/components/ingestion
touch frontend/src/components/ingestion/StepProgress.tsx
```

Implement progress indicator showing 5 steps.

### Step 9: Create step components

```bash
cd frontend/src/components/ingestion
touch SourceSelection.tsx
touch UploadStep.tsx
touch MappingStep.tsx
touch PreviewStep.tsx
touch ConfirmStep.tsx
```

### Step 10: Implement SourceSelection component

Create UI with 3 cards:
- File Upload (with upload icon)
- Database Connection (with database icon)
- API Feed (with link icon)

### Step 11: Create FieldMapper component

```bash
touch frontend/src/components/ingestion/FieldMapper.tsx
```

Implement drag-and-drop field mapping interface.

### Step 12: Install dependencies (if needed)

```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable
```

### Step 13: Backend - Add ingestion endpoints

Edit `backend/app/api/v1/endpoints/ingestion.py`:
- Add `GET /ingestion/:id/schema` endpoint
- Add `POST /ingestion/:id/mapping` endpoint
- Add `GET /ingestion/:id/preview` endpoint

### Step 14: Test full ingestion flow

// turbo
```bash
# Backend
cd backend
docker-compose up -d
```

// turbo
```bash
# Frontend
cd frontend
npm run dev
```

Manual test:
1. Navigate to /ingestion
2. Select File Upload
3. Upload a CSV file
4. Map fields
5. Preview data
6. Confirm and submit

### Step 15: Write E2E test

```bash
touch frontend/tests/e2e/ingestion.spec.ts
```

Test full workflow from source selection to confirmation.

---

## Phase 2: Visualization Page

### Step 1: Install chart dependencies

```bash
cd frontend
npm install recharts @types/recharts
```

### Step 2: Create page file

```bash
touch frontend/src/pages/Visualization.tsx
```

### Step 3: Add route

Edit `frontend/src/App.tsx`:
- Add lazy import for Visualization
- Add route: `<Route path="/visualization" element={<Visualization />} />`

### Step 4: Update sidebar navigation

Add "Visualization" link to sidebar with chart icon.

### Step 5: Create KPICard component

```bash
mkdir -p frontend/src/components/visualization
touch frontend/src/components/visualization/KPICard.tsx
```

Props: title, value, trend, icon, status

### Step 6: Create chart components

```bash
cd frontend/src/components/visualization
touch ExpenseChart.tsx
touch BalanceTreemap.tsx
touch CashFlowWaterfall.tsx
touch AIInsightPanel.tsx
```

### Step 7: Backend - Create visualization endpoint

```bash
touch backend/app/api/v1/endpoints/visualization.py
```

Implement:
- `GET /visualization/kpis`
- `GET /visualization/expenses`
- `GET /visualization/balance-sheet`
- `POST /visualization/ai-insight`

### Step 8: Register visualization routes

Edit `backend/app/api/v1/api.py`:
- Import visualization router
- Include router in API

### Step 9: Implement KPI calculations

Create `backend/app/services/visualization_service.py`:
- Cash flow calculation
- Balance sheet breakdown
- Expense trending

### Step 10: Build Visualization page layout

Structure:
- Header with date range picker
- 3 KPI cards (row 1)
- 2 chart cards (row 2)
- 1 full-width expense chart (row 3)

### Step 11: Connect backend data

Use React Query to fetch:
```typescript
const { data: kpis } = useQuery({
  queryKey: ['visualization', 'kpis', dateRange],
  queryFn: () => api.getFinancialKPIs(dateRange),
});
```

### Step 12: Add date range filtering

Implement DateRangePicker component.

### Step 13: Test visualization page

Manual test:
1. Navigate to /visualization
2. Verify KPI cards load
3. Verify charts render
4. Test date range filter
5. Test AI insight panel

### Step 14: Write E2E test

```bash
touch frontend/tests/e2e/visualization.spec.ts
```

### Step 15: Performance check

Verify page loads in <2 seconds with real data.

---

## Sprint 1 Completion Checklist

### Deliverables
- [ ] Ingestion.tsx with full 5-step wizard
- [ ] Visualization.tsx with KPIs and charts
- [ ] 8+ new components created
- [ ] Backend endpoints functional
- [ ] E2E tests passing
- [ ] Documentation updated

### Quality Gates
- [ ] TypeScript strict mode (no errors)
- [ ] ESLint passing
- [ ] All tests passing (unit + E2E)
- [ ] Mobile responsive
- [ ] Accessible (WCAG AA minimum)
- [ ] Performance: Lighthouse ≥90

### Documentation
- [ ] Update IMPLEMENTATION_STATUS.md
- [ ] Add screenshots to page docs
- [ ] Update README.md if needed

---

## Sprint 1 Review

**Date:** December 20, 2025

Demo checklist:
- [ ] Show full ingestion workflow
- [ ] Show field mapping interface
- [ ] Show visualization page with real data
- [ ] Show responsive design
- [ ] Code review passed

**Decision:** Go/No-Go for Sprint 2

---

## Troubleshooting

### Issue: Cannot rename Forensics.tsx
**Solution:** Ensure no other files are importing it, or update imports first

### Issue: Charts not rendering
**Solution:** Verify recharts installation, check console for errors

### Issue: Backend endpoints 404
**Solution:** Verify router is registered in api.py, restart backend

### Issue: Type errors in field mapping
**Solution:** Define proper TypeScript interfaces in types/ingestion.ts

---

## Next Steps

After Sprint 1 completion:
1. Sprint 1 review and demo
2. Sprint 1 retrospective
3. Sprint 2 planning
4. Start Sprint 2: Advanced Features

---

**Workflow Status:** Ready  
**Estimated Time:** 6 working days  
**Dependencies:** None  
**Start Date:** 2025-12-06
