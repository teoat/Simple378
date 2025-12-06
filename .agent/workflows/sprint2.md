---
description: Sprint 2 - Advanced Features (Redaction, Auto-Mapping, Categorization)
---

# Sprint 2: Advanced Features

**Goal:** Implement 2 killer advanced features + 1 core missing page.
**Timeline:** Weeks 3-4 (Accelerated)

## 2.1 Redaction Gap Analysis 🚀
Value: Infer values for redacted bank statement items.

1. Create heuristic analysis service
   - `backend/app/services/redaction_analyzer.py`
   - Implement logic for sequence gaps and running balance math
2. Create Backend Endpoint
   - `POST /api/v1/ingestion/{id}/analyze-redactions`
   - Update `backend/app/api/v1/endpoints/ingestion.py`
3. Create Frontend UI - `RedactionAnalysisPanel`
   - Create `frontend/src/components/ingestion/RedactionAnalysisPanel.tsx`
   - Display inferred values and confidence
4. Integrate into Ingestion Wizard
   - Update `frontend/src/components/ingestion/PreviewStep.tsx` to include the panel

## 2.2 AI Auto-Mapping 🚀
Value: ML-powered column detection.

5. Create Auto-Mapper Service
   - `backend/app/services/auto_mapper.py`
   - Implement simple heuristic/regex based matching first (rule-based "AI")
6. Create Mapping Template Models
   - Add `MappingTemplate` to `backend/app/db/models.py`
   - Run alembic migration
7. Create Backend Endpoints
   - `POST /api/v1/ingestion/{id}/auto-map`
   - `GET /api/v1/ingestion/templates`
   - Update `backend/app/api/v1/endpoints/ingestion.py`
8. Update Frontend FieldMapper
   - Update `frontend/src/components/ingestion/FieldMapper.tsx` to use auto-suggestions

## 2.3 Transaction Categorization Page 🟡
Value: Categorize transactions efficiently.

9. Create Categorization Page
   - Create `frontend/src/pages/TransactionCategorization.tsx`
   - Add route `/categorization/:caseId` in `App.tsx` and Sidebar
10. Create Categorization Components
    - `frontend/src/components/categorization/CategoryPicker.tsx`
    - `frontend/src/components/categorization/BulkActionBar.tsx`
11. Create Categorization Service & Endpoints
    - `backend/app/services/categorizer.py`
    - `backend/app/api/v1/endpoints/categorization.py`

## Validation
12. Run Tests
    - Create `frontend/tests/e2e/categorization.spec.ts`
    - Run `npx playwright test`

// turbo
13. Update Status
    - Update `docs/IMPLEMENTATION_STATUS.md`
