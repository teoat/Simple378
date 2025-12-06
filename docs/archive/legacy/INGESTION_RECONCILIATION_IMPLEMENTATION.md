# Ingestion & Reconciliation Page Implementation Plan

> **Created:** 2025-12-05  
> **Status:** 📋 Planning  
> **Priority:** HIGH  
> **Source:** COMPREHENSIVE_PAGE_WORKFLOW.md enhancements

---

## Overview

This document tracks the implementation of new features for the **Ingestion** and **Reconciliation** pages as specified in the updated `COMPREHENSIVE_PAGE_WORKFLOW.md`.

---

## Part 1: Ingestion Page Enhancements

### 1.1 Image Processing Pipeline

**Status:** ❌ Not Started

#### Backend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Create image upload endpoint | `backend/app/api/v1/endpoints/ingest.py` | HIGH | Medium |
| Implement OCR service (Tesseract/Google Vision) | `backend/app/services/ocr_service.py` | HIGH | High |
| Add EXIF metadata extraction | `backend/app/services/metadata_service.py` | MEDIUM | Low |
| Implement ELA tampering detection | `backend/app/services/forensic_image_service.py` | MEDIUM | High |
| Add face detection service | `backend/app/services/face_detection_service.py` | LOW | High |
| Document classification (receipt/invoice/statement) | `backend/app/services/document_classifier.py` | MEDIUM | High |

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Add image preview component | `frontend/src/components/ingestion/ImagePreview.tsx` | HIGH | Medium |
| Create OCR results display | `frontend/src/components/ingestion/OcrResults.tsx` | HIGH | Medium |
| Add metadata panel | `frontend/src/components/ingestion/MetadataPanel.tsx` | MEDIUM | Low |
| Implement image manipulation tools (zoom/rotate/enhance) | `frontend/src/components/ingestion/ImageTools.tsx` | LOW | Medium |

#### API Endpoints

```
POST /api/v1/ingest/image/ocr
GET  /api/v1/ingest/image/metadata/{file_id}
POST /api/v1/ingest/image/forensics
POST /api/v1/ingest/image/classify
```

---

### 1.2 PDF & Document Processing Pipeline

**Status:** ❌ Not Started

#### Backend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| PDF text extraction (PyMuPDF/pdfplumber) | `backend/app/services/pdf_service.py` | HIGH | Medium |
| Table detection and extraction | `backend/app/services/table_extractor.py` | HIGH | High |
| Form field extraction | `backend/app/services/form_parser.py` | MEDIUM | Medium |
| Signature/stamp detection | `backend/app/services/signature_detector.py` | LOW | High |
| PDF metadata extraction | `backend/app/services/pdf_metadata.py` | MEDIUM | Low |
| Document comparison (diff) | `backend/app/services/document_diff.py` | LOW | Medium |

#### Dependencies

```txt
# Add to requirements.txt
PyMuPDF>=1.23.0
pdfplumber>=0.10.0
pdf2image>=1.16.0
camelot-py>=0.11.0  # Table extraction
```

---

### 1.3 Video Processing Pipeline

**Status:** ❌ Not Started

#### Backend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Video upload with chunked upload | `backend/app/api/v1/endpoints/video_upload.py` | HIGH | Medium |
| FFmpeg integration for frame extraction | `backend/app/services/video_processor.py` | HIGH | High |
| Whisper integration for transcription | `backend/app/services/transcription_service.py` | HIGH | High |
| Speaker diarization | `backend/app/services/speaker_diarization.py` | MEDIUM | High |
| Timeline indexing | `backend/app/services/timeline_indexer.py` | MEDIUM | Medium |

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Video player component | `frontend/src/components/ingestion/VideoPlayer.tsx` | HIGH | Medium |
| Timeline viewer with thumbnails | `frontend/src/components/ingestion/VideoTimeline.tsx` | HIGH | High |
| Transcript display with search | `frontend/src/components/ingestion/TranscriptViewer.tsx` | MEDIUM | Medium |
| Segment bookmarking | `frontend/src/components/ingestion/SegmentBookmarks.tsx` | LOW | Low |

#### API Endpoints

```
POST /api/v1/ingest/video/upload (chunked)
POST /api/v1/ingest/video/frames
POST /api/v1/ingest/video/transcribe
POST /api/v1/ingest/video/clip
GET  /api/v1/ingest/video/timeline/{video_id}
```

#### Infrastructure

- FFmpeg must be installed on server
- GPU recommended for Whisper transcription
- Large file storage (S3/MinIO) for video files

---

## Part 2: Reconciliation Page Enhancements

### 2.1 Two-Panel Layout (Bank Statements ↔ Expenses)

**Status:** ❌ Not Started

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Split-panel layout component | `frontend/src/components/reconciliation/SplitPanelLayout.tsx` | HIGH | Medium |
| Bank statement list (left panel) | `frontend/src/components/reconciliation/BankStatementPanel.tsx` | HIGH | Medium |
| Expense list (right panel) | `frontend/src/components/reconciliation/ExpensePanel.tsx` | HIGH | Medium |
| Visual matching lines (SVG connector) | `frontend/src/components/reconciliation/MatchingLines.tsx` | HIGH | High |
| Match status indicators | `frontend/src/components/reconciliation/MatchStatus.tsx` | MEDIUM | Low |

---

### 2.2 Multi-Bank Account Management

**Status:** ❌ Not Started

#### Backend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Bank account model | `backend/app/models/bank_account.py` | HIGH | Low |
| Bank account CRUD endpoints | `backend/app/api/v1/endpoints/bank_accounts.py` | HIGH | Medium |
| Bank statement parser (multi-bank) | `backend/app/services/bank_statement_parser.py` | HIGH | High |
| Completeness calculation | `backend/app/services/data_completeness.py` | MEDIUM | Medium |

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Bank account selector | `frontend/src/components/reconciliation/BankAccountSelector.tsx` | HIGH | Medium |
| Completeness indicator | `frontend/src/components/reconciliation/CompletenessIndicator.tsx` | MEDIUM | Low |
| Add account modal | `frontend/src/components/reconciliation/AddAccountModal.tsx` | MEDIUM | Medium |

#### Database Schema

```sql
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    bank_name VARCHAR(100) NOT NULL,
    account_number_masked VARCHAR(20),
    account_number_hash VARCHAR(64),  -- For matching, not display
    status VARCHAR(20) DEFAULT 'pending',  -- complete, partial, missing
    coverage_percentage DECIMAL(5,2),
    transaction_count INTEGER DEFAULT 0,
    balance DECIMAL(18,2),
    currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.3 Matched Transactions Pool

**Status:** ❌ Not Started

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| View toggle component | `frontend/src/components/reconciliation/ViewToggle.tsx` | HIGH | Low |
| Matched pool (collapsed) | `frontend/src/components/reconciliation/MatchedPoolCollapsed.tsx` | HIGH | Low |
| Matched pool (expanded table) | `frontend/src/components/reconciliation/MatchedPoolExpanded.tsx` | MEDIUM | Medium |
| Auto-hide animation | `frontend/src/hooks/useAutoHide.ts` | LOW | Low |

---

### 2.4 Simulation Mode (Incomplete Bank Data)

**Status:** ❌ Not Started

#### Backend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Gap detection algorithm | `backend/app/services/gap_detector.py` | HIGH | Medium |
| Transaction estimation engine | `backend/app/services/transaction_estimator.py` | HIGH | High |
| Confidence scoring | `backend/app/services/confidence_scorer.py` | MEDIUM | Medium |
| Historical pattern analyzer | `backend/app/services/pattern_analyzer.py` | MEDIUM | High |

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Simulation mode toggle | `frontend/src/components/reconciliation/SimulationMode.tsx` | HIGH | Low |
| Data completeness panel | `frontend/src/components/reconciliation/DataCompleteness.tsx` | HIGH | Medium |
| Simulated transaction card | `frontend/src/components/reconciliation/SimulatedTransaction.tsx` | HIGH | Medium |
| Confidence indicator | `frontend/src/components/reconciliation/ConfidenceIndicator.tsx` | MEDIUM | Low |

#### API Endpoints

```
POST /api/v1/reconciliation/simulate
GET  /api/v1/reconciliation/gaps/{case_id}
POST /api/v1/reconciliation/estimate/accept
POST /api/v1/reconciliation/estimate/reject
```

---

### 2.5 Suspicious Patterns Panel (AI-Enhanced)

**Status:** ❌ Not Started

#### Backend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Mirroring detection algorithm | `backend/app/services/fraud/mirroring_detector.py` | HIGH | High |
| Personal expense detection | `backend/app/services/fraud/personal_expense_detector.py` | HIGH | High |
| AI pattern training endpoint | `backend/app/api/v1/endpoints/ai_training.py` | MEDIUM | High |
| Pattern library storage | `backend/app/models/fraud_pattern.py` | MEDIUM | Medium |
| Feedback loop handler | `backend/app/services/fraud/feedback_handler.py` | MEDIUM | Medium |

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Suspicious patterns panel | `frontend/src/components/reconciliation/SuspiciousPatternsPanel.tsx` | HIGH | High |
| Mirrored transaction card | `frontend/src/components/reconciliation/MirroredTransactionCard.tsx` | HIGH | Medium |
| Personal expense table | `frontend/src/components/reconciliation/PersonalExpenseTable.tsx` | HIGH | Medium |
| AI learning feedback buttons | `frontend/src/components/reconciliation/AiFeedback.tsx` | MEDIUM | Low |
| Pattern library viewer | `frontend/src/components/reconciliation/PatternLibrary.tsx` | LOW | Medium |

#### Database Schema

```sql
CREATE TABLE fraud_patterns (
    id UUID PRIMARY KEY,
    category VARCHAR(50) NOT NULL,  -- mirroring, personal_diversion, inflated, phantom, related_party
    pattern_definition JSONB NOT NULL,
    accuracy DECIMAL(5,2),
    sample_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fraud_feedback (
    id UUID PRIMARY KEY,
    transaction_id UUID,
    pattern_id UUID REFERENCES fraud_patterns(id),
    feedback VARCHAR(20),  -- fraud, legitimate, unknown
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.6 Real Cashflow Calculator (Forensic Proof)

**Status:** ❌ Not Started

**Core Formula:**
```
Real Cashflow = Reported Cashflow
                − Mirrored Transactions (fake circulation)
                − Personal Expenses (diverted funds)
                − Phantom Expenses (never spent)
                − Inflated Amounts (overstated)
```

#### Backend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Cashflow aggregation service | `backend/app/services/fraud/cashflow_calculator.py` | HIGH | Medium |
| Fraud deduction calculator | `backend/app/services/fraud/deduction_calculator.py` | HIGH | Medium |
| Fraud ratio analyzer | `backend/app/services/fraud/ratio_analyzer.py` | HIGH | Low |
| SAR (Suspicious Activity Report) generator | `backend/app/services/reports/sar_generator.py` | MEDIUM | High |
| Cashflow export (PDF/Excel) | `backend/app/services/reports/cashflow_export.py` | MEDIUM | Medium |

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Real Cashflow Panel | `frontend/src/components/reconciliation/RealCashflowPanel.tsx` | HIGH | High |
| Fraud breakdown visualization | `frontend/src/components/reconciliation/FraudBreakdown.tsx` | HIGH | Medium |
| Comparison bar chart | `frontend/src/components/reconciliation/CashflowComparison.tsx` | MEDIUM | Medium |
| Formula display component | `frontend/src/components/reconciliation/FormulaDisplay.tsx` | LOW | Low |

#### API Endpoints

```
GET  /api/v1/reconciliation/cashflow/real/{case_id}
GET  /api/v1/reconciliation/cashflow/breakdown/{case_id}
POST /api/v1/reconciliation/cashflow/export/pdf
POST /api/v1/reconciliation/cashflow/export/excel
POST /api/v1/reconciliation/sar/generate
```

#### Data Model

```python
@dataclass
class RealCashflowAnalysis:
    case_id: UUID
    
    # Reported (Inflated)
    reported_expenses: Decimal
    bank_statement_total: Decimal
    reported_cashflow: Decimal
    
    # Deductions
    mirrored_transactions: Decimal
    mirrored_count: int
    mirrored_fees_extracted: Decimal  # The "cut" taken in round-trips
    
    personal_diversions: Decimal
    personal_self_family: Decimal
    personal_related_party: Decimal
    personal_recipient_count: int
    
    phantom_expenses: Decimal  # Claimed but no bank record
    inflated_amounts: Decimal  # Difference from actual
    
    # Result
    total_fraudulent_flows: Decimal
    real_cashflow: Decimal
    fraud_ratio: Decimal  # Percentage of fraud vs claimed
    
    # Metadata
    calculated_at: datetime
    confidence_level: str  # high, medium, low based on data completeness
---

## Part 3: Entity Link Analysis Page

### 3.1 Entity Graph Visualization

**Status:** ❌ Not Started

**Route:** `/entity-analysis` (After Dashboard in navigation)

#### Backend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Entity model (Person, Company, Account) | `backend/app/models/entity.py` | HIGH | Medium |
| Relationship model | `backend/app/models/relationship.py` | HIGH | Medium |
| Graph query service | `backend/app/services/entity/graph_service.py` | HIGH | High |
| Entity extraction from documents | `backend/app/services/entity/entity_extractor.py` | MEDIUM | High |
| Cluster detection algorithm | `backend/app/services/entity/cluster_detector.py` | HIGH | High |
| Money flow tracing | `backend/app/services/entity/flow_tracer.py` | HIGH | High |
| Risk scoring service | `backend/app/services/entity/risk_scorer.py` | MEDIUM | Medium |

#### Frontend Tasks

| Task | File | Priority | Complexity |
|------|------|----------|------------|
| Graph canvas (D3.js/vis.js) | `frontend/src/components/entity/EntityGraph.tsx` | HIGH | High |
| Entity node component | `frontend/src/components/entity/EntityNode.tsx` | HIGH | Medium |
| Entity detail panel | `frontend/src/components/entity/EntityDetailPanel.tsx` | HIGH | Medium |
| Money flow trace view | `frontend/src/components/entity/MoneyFlowTrace.tsx` | HIGH | High |
| Cluster visualization | `frontend/src/components/entity/ClusterView.tsx` | MEDIUM | Medium |
| Entity search & filter | `frontend/src/components/entity/EntitySearch.tsx` | MEDIUM | Low |
| Graph export (PNG/PDF) | `frontend/src/components/entity/GraphExport.tsx` | LOW | Medium |

#### API Endpoints

```
GET  /api/v1/entity/graph/{case_id}
GET  /api/v1/entity/{entity_id}
GET  /api/v1/entity/{entity_id}/connections
POST /api/v1/entity/trace
GET  /api/v1/entity/clusters/{case_id}
POST /api/v1/entity/search
POST /api/v1/entity/export/graph
```

#### Database Schema

```sql
CREATE TABLE entities (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    entity_type VARCHAR(20) NOT NULL,  -- person, company, bank_account, address
    name VARCHAR(255) NOT NULL,
    identifier VARCHAR(100),  -- NPWP, NIB, account number hash
    metadata JSONB,
    risk_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE entity_relationships (
    id UUID PRIMARY KEY,
    source_entity_id UUID REFERENCES entities(id),
    target_entity_id UUID REFERENCES entities(id),
    relationship_type VARCHAR(50) NOT NULL,  -- payment, ownership, employment, family
    amount DECIMAL(18,2),
    transaction_date DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE entity_clusters (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    name VARCHAR(255),
    cluster_type VARCHAR(50),  -- family_network, shell_company, circular_flow
    risk_level VARCHAR(20),
    total_flow DECIMAL(18,2),
    member_count INTEGER,
    detected_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cluster_members (
    cluster_id UUID REFERENCES entity_clusters(id),
    entity_id UUID REFERENCES entities(id),
    role VARCHAR(50),  -- central, pass_through, endpoint
    PRIMARY KEY (cluster_id, entity_id)
);
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Multi-bank account model and CRUD
- [ ] Split-panel reconciliation layout
- [ ] Bank statement parser (BCA, Mandiri, BNI formats)
- [ ] Basic matching visualization

### Phase 2: Core Features (Week 3-4)
- [ ] Matched pool with hide/show toggle
- [ ] Image upload and OCR integration
- [ ] PDF text extraction
- [ ] Gap detection and completeness tracking

### Phase 3: AI & Simulation (Week 5-6)
- [ ] Simulation mode for missing data
- [ ] Mirroring transaction detection
- [ ] Personal expense detection
- [ ] Pattern library foundation
- [ ] Real cashflow calculator

### Phase 4: Advanced Features (Week 7-8)
- [ ] Video processing pipeline
- [ ] AI feedback loop
- [ ] Pattern training UI
- [ ] Full forensic analysis suite
- [ ] **Entity Link Analysis graph (D3.js)**
- [ ] **Cluster detection algorithm**
- [ ] **Money flow tracing**

---

## Dependencies to Install

### Backend (Python)

```txt
# requirements.txt additions
pytesseract>=0.3.10
Pillow>=10.0.0
PyMuPDF>=1.23.0
pdfplumber>=0.10.0
python-magic>=0.4.27
exifread>=3.0.0
imagehash>=4.3.1
openai-whisper>=20231117
ffmpeg-python>=0.2.0
```

### Frontend (npm)

```json
{
  "dependencies": {
    "react-dropzone": "^14.2.3",
    "react-player": "^2.13.0",
    "react-pdf": "^7.5.0",
    "@dnd-kit/core": "^6.0.8",
    "d3": "^7.8.5"
  }
}
```

---

## Related Documentation

- [COMPREHENSIVE_PAGE_WORKFLOW.md](../frontend/COMPREHENSIVE_PAGE_WORKFLOW.md) - Full UI specifications
- [AUTHENTICATION_DIAGNOSTIC_REPORT.md](../AUTHENTICATION_DIAGNOSTIC_REPORT.md) - Auth system status
- [MEDIUM_PRIORITY_ROADMAP.md](./MEDIUM_PRIORITY_ROADMAP.md) - Other planned features

---

## Notes

1. **Bank Statement Formats**: Need to support multiple Indonesian bank formats (BCA, Mandiri, BNI, BRI, CIMB)
2. **AI Training**: Patterns learned from user feedback should be case-specific initially, then generalized
3. **Performance**: Video processing should be async with WebSocket progress updates
4. **Privacy**: Personal account detection should not store actual account numbers, only hashed patterns
