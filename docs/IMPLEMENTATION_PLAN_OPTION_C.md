# 🚀 Implementation Plan: Option C (Hybrid Approach)

**Strategy:** Balance Completeness + Innovation  
**Timeline:** 10 weeks (3 sprints)  
**Goal:** 80% completeness + 3 killer features  
**Started:** 2025-12-06

---

## 📊 Overview

### Success Metrics
- ✅ 13/15 core pages implemented (87%)
- 🚀 3 advanced features shipped
- ✅ 100% backend endpoint coverage
- ✅ E2E tests for all workflows
- ✅ Production deployment ready

### Sprint Breakdown
```
Sprint 1 (Weeks 1-2): Foundation
├─ Ingestion page enhancement
├─ Visualization page creation
└─ Backend endpoints

Sprint 2 (Weeks 3-4): Advanced Features
├─ 🚀 Redaction Gap Analysis
├─ 🚀 AI Auto-Mapping
└─ Transaction Categorization

Sprint 3 (Weeks 5-6): Polish
├─ Final Summary page
├─ 🚀 Burn Rate Simulator
└─ Error pages
```

---

## 🎯 Sprint 1: Foundation (Weeks 1-2)

### Objective
Complete the two highest-value missing core pages with backend support.

### Tasks

#### 1.1 Ingestion Page Enhancement 🔴 HIGH PRIORITY

**Current State:** `Forensics.tsx` (5,862 bytes) - basic upload  
**Target State:** Full multi-step wizard with field mapping

**Sub-tasks:**
- [ ] **1.1.1** Rename `Forensics.tsx` → `Ingestion.tsx`
  - Update route in `App.tsx`
  - Update sidebar navigation
  - Update imports across codebase
  - **Estimated:** 0.5 hours

- [ ] **1.1.2** Create multi-step wizard framework
  - Types: `type IngestionStep = 'source' | 'upload' | 'mapping' | 'preview' | 'confirm'`
  - State management with `useState`
  - Progress indicator component
  - **Estimated:** 2 hours

- [ ] **1.1.3** Build step components
  - `SourceSelection.tsx` - File/Database/API tiles
  - `UploadStep.tsx` - Enhance existing upload
  - `MappingStep.tsx` - NEW field mapper
  - `PreviewStep.tsx` - NEW data preview table
  - `ConfirmStep.tsx` - Summary and submit
  - **Estimated:** 8 hours

- [ ] **1.1.4** Create `FieldMapper` component
  - Source fields list (draggable)
  - Target fields list (droppable)
  - Mapping arrows/connectors
  - Save/Load mapping state
  - **Estimated:** 6 hours

- [ ] **1.1.5** Backend endpoints
  - `GET /api/v1/ingestion/:id/schema` - Detect source schema
  - `POST /api/v1/ingestion/:id/mapping` - Save field mapping
  - `GET /api/v1/ingestion/:id/preview` - Preview mapped data
  - **Estimated:** 4 hours

- [ ] **1.1.6** Integration & testing
  - E2E test: Full upload → mapping → preview → confirm flow
  - Error handling for each step
  - **Estimated:** 3 hours

**Total Estimate:** 23.5 hours (~ 3 days)

---

#### 1.2 Visualization Page Creation 🔴 HIGH PRIORITY

**Current State:** Does not exist  
**Target State:** Financial KPIs, charts, and insights page

**Sub-tasks:**
- [ ] **1.2.1** Create page structure
  - `frontend/src/pages/Visualization.tsx`
  - Add route: `/visualization`
  - Add to sidebar navigation
  - **Estimated:** 1 hour

- [ ] **1.2.2** Install dependencies
  ```bash
  npm install recharts @types/recharts
  ```
  - **Estimated:** 0.25 hours

- [ ] **1.2.3** Create KPI card component
  - `components/visualization/KPICard.tsx`
  - Props: title, value, trend, icon, status
  - Glassmorphism styling
  - **Estimated:** 2 hours

- [ ] **1.2.4** Create chart components
  - `ExpenseChart.tsx` - Line chart (monthly trends)
  - `BalanceTreemap.tsx` - Treemap (balance sheet breakdown)
  - `CashFlowWaterfall.tsx` - Waterfall chart
  - **Estimated:** 6 hours

- [ ] **1.2.5** Create AI Insight Panel
  - `AIInsightPanel.tsx`
  - Ask question interface
  - Display AI-generated insights
  - **Estimated:** 3 hours

- [ ] **1.2.6** Backend endpoint
  - `backend/app/api/v1/endpoints/visualization.py`
  - `GET /visualization/kpis` - Calculate financial KPIs
  - `GET /visualization/expenses` - Monthly expense trend
  - `GET /visualization/balance-sheet` - Balance breakdown
  - `POST /visualization/ai-insight` - AI analysis
  - **Estimated:** 5 hours

- [ ] **1.2.7** Data integration
  - Connect to real transaction data
  - Calculate metrics (cash flow, burn rate, etc.)
  - **Estimated:** 4 hours

- [ ] **1.2.8** Testing
  - Unit tests for components
  - E2E test for page load and interaction
  - **Estimated:** 3 hours

**Total Estimate:** 24.25 hours (~ 3 days)

---

#### 1.3 Sprint 1 Deliverables

**Frontend:**
- ✅ `Ingestion.tsx` - Full 5-step wizard
- ✅ `Visualization.tsx` - KPIs + 3 charts
- ✅ 8 new components

**Backend:**
- ✅ `visualization.py` endpoint
- ✅ Enhanced `ingestion.py` with schema/mapping
- ✅ 6 new API routes

**Testing:**
- ✅ E2E test: Ingestion workflow
- ✅ E2E test: Visualization page
- ✅ Unit tests for all components

**Documentation:**
- ✅ Update IMPLEMENTATION_STATUS.md
- ✅ Add screenshots to docs

**Total Sprint 1:** ~6 working days (47.75 hours)

---

## 🚀 Sprint 2: Advanced Features (Weeks 3-4)

### Objective
Implement 2 killer advanced features + 1 core missing page.

### Tasks

#### 2.1 Redaction Gap Analysis 🚀 KILLER FEATURE #1

**Location:** Enhance Ingestion page  
**Value:** Infer values for redacted bank statement items

**Sub-tasks:**
- [ ] **2.1.1** Create heuristic analysis service
  - `backend/app/services/redaction_analyzer.py`
  - Sequence gap logic (Cheque #101, #103 → infer #102)
  - Running balance math (Balance_Before - Balance_After)
  - Pattern matching for partial metadata
  - **Estimated:** 8 hours

- [ ] **2.1.2** Backend endpoint
  - `POST /ingestion/:id/analyze-redactions`
  - Return inferred values with confidence scores
  - **Estimated:** 3 hours

- [ ] **2.1.3** Frontend UI
  - `RedactionAnalysisPanel.tsx`
  - Display inferred values
  - Confidence indicators
  - Accept/Reject interface
  - **Estimated:** 5 hours

- [ ] **2.1.4** Integration
  - Auto-run analysis after upload
  - Show results in Preview step
  - Allow manual trigger
  - **Estimated:** 3 hours

- [ ] **2.1.5** Testing
  - Unit tests with mock redacted data
  - E2E test with sample bank statement
  - **Estimated:** 3 hours

**Total Estimate:** 22 hours (~ 3 days)

---

#### 2.2 AI Auto-Mapping 🚀 KILLER FEATURE #2

**Location:** Enhance Ingestion mapping step  
**Value:** ML-powered column detection, saves hours per upload

**Sub-tasks:**
- [ ] **2.2.1** Create ML classifier service
  - `backend/app/services/auto_mapper.py`
  - Train on common column patterns
  - Confidence scoring for each mapping
  - **Estimated:** 10 hours

- [ ] **2.2.2** Mapping template library
  - Database model: `MappingTemplate`
  - CRUD endpoints for templates
  - **Estimated:** 4 hours

- [ ] **2.2.3** Backend endpoint
  - `POST /ingestion/:id/auto-map`
  - Return suggested mappings with confidence
  - `GET /ingestion/templates` - List saved templates
  - `POST /ingestion/templates` - Save current mapping
  - **Estimated:** 4 hours

- [ ] **2.2.4** Frontend integration
  - Auto-suggest in `FieldMapper`
  - Confidence badges (98%, 75%, etc.)
  - "Apply Suggestion" buttons
  - Template selector dropdown
  - **Estimated:** 6 hours

- [ ] **2.2.5** Testing
  - Unit tests with various CSV formats
  - E2E test: Auto-map → manual adjust → save template
  - **Estimated:** 4 hours

**Total Estimate:** 28 hours (~ 3.5 days)

---

#### 2.3 Transaction Categorization Page 🟡 CORE FEATURE

**Current State:** Does not exist  
**Target State:** ML auto-categorization + manual picker

**Sub-tasks:**
- [ ] **2.3.1** Create page
  - `frontend/src/pages/TransactionCategorization.tsx`
  - Route: `/categorization/:caseId`
  - **Estimated:** 1 hour

- [ ] **2.3.2** Create components
  - `CategoryPicker.tsx` - Dropdown/search for categories
  - `MerchantNormalizer.tsx` - Standardize merchant names
  - `BulkCategorizer.tsx` - Batch categorization
  - **Estimated:** 6 hours

- [ ] **2.3.3** Backend ML service
  - `backend/app/services/categorizer.py`
  - ML model for auto-categorization
  - Merchant normalization logic
  - **Estimated:** 8 hours

- [ ] **2.3.4** Backend endpoint
  - `POST /categorization/:case_id/auto-categorize`
  - `PUT /categorization/:transaction_id/category`
  - `GET /categorization/categories` - List all categories
  - **Estimated:** 3 hours

- [ ] **2.3.5** Testing
  - E2E test: Auto-categorize → manual adjust → save
  - **Estimated:** 3 hours

**Total Estimate:** 21 hours (~ 2.5 days)

---

#### 2.4 Sprint 2 Deliverables

**Features:**
- 🚀 Redaction Gap Analysis (live)
- 🚀 AI Auto-Mapping (live)
- ✅ Transaction Categorization page

**Backend:**
- ✅ `redaction_analyzer.py` service
- ✅ `auto_mapper.py` ML service
- ✅ `categorizer.py` ML service
- ✅ `categorization.py` endpoint
- ✅ `MappingTemplate` model

**Frontend:**
- ✅ `TransactionCategorization.tsx`
- ✅ `RedactionAnalysisPanel.tsx`
- ✅ Enhanced `FieldMapper` with AI suggestions
- ✅ 5 new components

**Total Sprint 2:** ~9 working days (71 hours)

---

## ✨ Sprint 3: Polish (Weeks 5-6)

### Objective
Final missing page + 1 advanced feature + system polish

### Tasks

#### 3.1 Final Summary Page ✅ CORE FEATURE

**Current State:** Does not exist  
**Target State:** Case completion summary with report generation

**Sub-tasks:**
- [ ] **3.1.1** Create page
  - `frontend/src/pages/FinalSummary.tsx`
  - Route: `/summary/:caseId`
  - **Estimated:** 1 hour

- [ ] **3.1.2** Create components
  - `SuccessBanner.tsx` - Completion status
  - `SummaryCard.tsx` - Metric cards (Ingestion, Reconciliation, etc.)
  - `KeyFindings.tsx` - Top findings list
  - `ActionButtons.tsx` - PDF/Archive/New Case
  - **Estimated:** 5 hours

- [ ] **3.1.3** PDF generation service
  - `backend/app/services/report_generator.py`
  - Jinja2 template for report
  - WeasyPrint PDF conversion
  - **Estimated:** 8 hours

- [ ] **3.1.4** Backend endpoint
  - `GET /summary/:case_id` - Get case summary
  - `POST /summary/:case_id/generate-pdf` - Generate report
  - `POST /summary/:case_id/archive` - Archive case
  - **Estimated:** 4 hours

- [ ] **3.1.5** Testing
  - E2E test: Navigate to summary → Generate PDF → Archive
  - **Estimated:** 3 hours

**Total Estimate:** 21 hours (~ 2.5 days)

---

#### 3.2 Burn Rate Simulator 🚀 KILLER FEATURE #3

**Location:** Add to Visualization page  
**Value:** What-if scenario analysis for financial projections

**Sub-tasks:**
- [ ] **3.2.1** Create simulator component
  - `BurnRateSimulator.tsx`
  - Slider inputs (monthly burn, runway, etc.)
  - Real-time chart update
  - **Estimated:** 6 hours

- [ ] **3.2.2** Simulation engine
  - `backend/app/services/burn_rate_sim.py`
  - Monte Carlo simulation
  - Scenario projections
  - **Estimated:** 8 hours

- [ ] **3.2.3** Backend endpoint
  - `POST /visualization/simulate-burn-rate`
  - **Estimated:** 2 hours

- [ ] **3.2.4** Integration
  - Add to Visualization page as new section
  - Save/Load scenarios
  - **Estimated:** 4 hours

- [ ] **3.2.5** Testing
  - Unit tests for simulation logic
  - E2E test: Adjust parameters → See projections
  - **Estimated:** 3 hours

**Total Estimate:** 23 hours (~ 3 days)

---

#### 3.3 Error Pages ✅ CORE FEATURE

**Current State:** Does not exist  
**Target State:** Professional error handling (404, 500, 403)

**Sub-tasks:**
- [ ] **3.3.1** Create error page components
  - `NotFound.tsx` (404)
  - `ServerError.tsx` (500)
  - `Forbidden.tsx` (403)
  - `Offline.tsx` (network error)
  - **Estimated:** 4 hours

- [ ] **3.3.2** Add routes
  - Update `App.tsx` with error routes
  - Global error boundary enhancements
  - **Estimated:** 2 hours

- [ ] **3.3.3** Error state illustrations
  - Generate error illustrations with generate_image
  - **Estimated:** 1 hour

- [ ] **3.3.4** Testing
  - E2E tests for each error page
  - **Estimated:** 2 hours

**Total Estimate:** 9 hours (~ 1 day)

---

#### 3.4 System-Wide Polish

**Sub-tasks:**
- [ ] **3.4.1** Documentation cleanup
  - Update all page docs with ✅/🟡/🔴 badges
  - Consolidate SSOT violations
  - Archive obsolete docs
  - **Estimated:** 4 hours

- [ ] **3.4.2** Performance optimization
  - Bundle size analysis
  - Lazy loading optimization
  - Image compression
  - **Estimated:** 4 hours

- [ ] **3.4.3** Accessibility audit
  - Run axe-core on all new pages
  - Fix ARIA issues
  - Keyboard navigation validation
  - **Estimated:** 4 hours

- [ ] **3.4.4** E2E test suite
  - Complete workflow tests
  - Cross-browser testing
  - **Estimated:** 6 hours

- [ ] **3.4.5** Update README
  - Reflect new features
  - Update screenshots
  - **Estimated:** 2 hours

**Total Estimate:** 20 hours (~ 2.5 days)

---

#### 3.5 Sprint 3 Deliverables

**Features:**
- ✅ Final Summary page
- 🚀 Burn Rate Simulator
- ✅ Error pages (4 pages)

**Polish:**
- ✅ Documentation updated
- ✅ Performance optimized
- ✅ Accessibility 100%
- ✅ E2E test coverage complete

**Total Sprint 3:** ~9 working days (73 hours)

---

## 📊 Overall Timeline

### Week-by-Week Breakdown

**Week 1:**
- Days 1-3: Ingestion page enhancement
- Days 4-5: Start Visualization page

**Week 2:**
- Days 1-2: Complete Visualization page
- Days 3-5: Buffer + Sprint 1 testing

**Week 3:**
- Days 1-3: Redaction Gap Analysis
- Days 4-5: Start AI Auto-Mapping

**Week 4:**
- Days 1-2: Complete AI Auto-Mapping
- Days 3-5: Transaction Categorization

**Week 5:**
- Days 1-2: Final Summary page
- Days 3-5: Start Burn Rate Simulator

**Week 6:**
- Days 1: Complete Burn Rate Simulator
- Days 2-3: Error pages
- Days 4-5: Polish & deployment prep

---

## 📈 Progress Tracking

### Implementation Status

#### Core Pages (13/15 = 87%)
- [x] Login
- [x] Dashboard
- [x] Case List
- [x] Case Detail
- [x] Adjudication Queue
- [x] Reconciliation
- [ ] **Ingestion** (Sprint 1)
- [ ] **Transaction Categorization** (Sprint 2)
- [ ] **Visualization** (Sprint 1)
- [ ] **Final Summary** (Sprint 3)
- [x] Settings
- [x] Semantic Search
- [x] Search Analytics
- [ ] **Error Pages** (Sprint 3)
- ~~Global Search~~ (Deferred to v1.1)

#### Advanced Features (3/8 = 38%)
- [ ] 🚀 **Redaction Gap Analysis** (Sprint 2)
- [ ] 🚀 **AI Auto-Mapping** (Sprint 2)
- [ ] 🚀 **Burn Rate Simulator** (Sprint 3)
- ~~Mapping Templates~~ (Included in Auto-Mapping)
- ~~Data Hygiene Rules~~ (Deferred to v1.1)
- ~~Multi-File Stitching~~ (Deferred to v1.1)
- ~~Many-to-One Matching~~ (Deferred to v1.1)
- ~~ML Ghost Matching~~ (Deferred to v1.2)

---

## ✅ Definition of Done

### Per Sprint
- [ ] All tasks completed
- [ ] Unit tests written and passing
- [ ] E2E tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] IMPLEMENTATION_STATUS.md updated

### Per Feature
- [ ] Backend endpoint functional
- [ ] Frontend UI complete with glassmorphism
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Accessible (WCAG 2.1 AA minimum)
- [ ] Integration tested

### Project Completion
- [ ] All 3 sprints completed
- [ ] 13/15 core pages implemented
- [ ] 3/3 killer features shipped
- [ ] E2E test coverage ≥80%
- [ ] Documentation 100% accurate
- [ ] Performance: Lighthouse ≥95
- [ ] Accessibility: ≥95% WCAG AA
- [ ] Production deployment successful

---

## 🚨 Risks & Mitigations

### Risk 1: Scope Creep
**Likelihood:** High  
**Impact:** Medium  
**Mitigation:** Strict sprint boundaries, defer non-essential features to v1.1

### Risk 2: ML Model Accuracy (Auto-Mapping)
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:** Start with rule-based heuristics, iterate to ML if needed

### Risk 3: PDF Generation Performance
**Likelihood:** Medium  
**Impact:** Low  
**Mitigation:** Async generation, progress indicators, consider external service

### Risk 4: Timeline Slippage
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:** Weekly checkpoints, buffer time built into each sprint

---

## 📞 Sprint Review Schedule

### Sprint 1 Review (End of Week 2)
- Demo: Ingestion wizard + Visualization page
- Retrospective
- Sprint 2 planning

### Sprint 2 Review (End of Week 4)
- Demo: Redaction Gap Analysis + AI Auto-Mapping
- Retrospective
- Sprint 3 planning

### Sprint 3 Review (End of Week 6)
- Demo: Full system walkthrough
- Final retrospective
- Production go/no-go decision
- v1.1 planning

---

## 🎯 Success Criteria

### Must Have (MVP+)
- ✅ 13/15 core pages implemented
- ✅ 3 killer features operational
- ✅ E2E tests passing
- ✅ Production deployment successful

### Nice to Have
- ✅ Lighthouse score ≥98
- ✅ Zero known bugs
- ✅ User documentation complete
- ✅ Video tutorial created

### Deferred to v1.1
- Global Search (Cmd+K)
- Data Hygiene Rules
- Multi-File Stitching
- Story Mode (Summary page)

---

## 📝 Next Actions

### Immediate (Today)
1. ✅ Review this plan
2. ✅ Create Sprint 1 board/tickets
3. ✅ Set up project tracking
4. ⏭️ Start Task 1.1.1: Rename Forensics.tsx

### This Week
- Complete Ingestion page enhancement
- Start Visualization page

### Decision Points
- **Week 2:** Sprint 1 review - Go/No-go for Sprint 2
- **Week 4:** Sprint 2 review - Adjust Sprint 3 scope if needed
- **Week 6:** Final review - Production deployment decision

---

**Plan Status:** Ready for execution  
**Approval:** Awaiting stakeholder sign-off  
**Start Date:** 2025-12-06  
**Target Completion:** 2026-01-17 (6 weeks)  
**Prepared by:** Antigravity Agent
