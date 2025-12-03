# Phase 2: Core Fraud Detection - Tasks & Todos

**Goal:** Build the analytical engines that power the fraud detection system.

## 1. Mens Rea Detection Engine
- [x] **Data Models**:
    - [x] Define `Indicator` schema (type, confidence, evidence).
    - [x] Define `AnalysisResult` schema.
- [x] **Rule-Based Engine**:
    - [x] Implement `StructuringDetector` (financial patterns).
    - [x] Implement `RapidMovementDetector` (velocity checks).
- [x] **Semantic Engine (Preliminary)**:
    - [x] Create placeholder for LLM-based intent analysis (to be connected in Phase 3).
- [x] **API Endpoints**:
    - [x] `POST /api/v1/analysis/mens-rea/{subject_id}`

## 2. Human Adjudication System
- [x] **Data Models**:
    - [x] Define `AdjudicationCase` (status, priority, assigned_to).
    - [x] Define `AdjudicationComment` (case_id, author_id, content).
- [x] **API Endpoints**:
    - [x] `GET /api/v1/adjudication/queue` (Filterable list).
    - [x] `POST /api/v1/adjudication/{case_id}/decision` (Approve/Reject/Escalate).
- [x] **Workflow Logic**:
    - [x] Implement state transitions (Pending -> In Review -> Resolved).
    - [x] Implement assignment logic.

## 3. Entity Link Analyzer
- [x] **Graph Data Structure**:
    - [x] Install `networkx`.
    - [x] Define Node types: `Person`, `Company`, `Account`, `IP`.
    - [x] Define Edge types: `Transaction`, `Communication`, `Relationship`.
- [x] **Ingestion Pipeline**:
    - [x] **Enhanced CSV Ingestion**:
        - [x] Create flexible schema validator (Pydantic).
        - [x] Implement async processing for large files.
        - [x] Create service to parse CSV/JSON transaction logs into Graph Nodes/Edges.
- [x] **Resolution Service**:
    - [x] Implement basic entity resolution (name matching).
    - [x] (Optional) Connect to Qdrant for fuzzy matching.
- [x] **API Endpoints**:
    - [x] `GET /api/v1/graph/{subject_id}` (Returns JSON graph format).

## 4. Forensics Service

- [x] **File Upload**:
  - [x] Create `POST /api/v1/forensics/upload`.
  - [x] Implement secure file storage (MinIO or local encrypted volume).
  - [x] **Encryption at Rest**:
    - [x] Implement AES-256-GCM encryption.
    - [x] Implement key management (Master Key + DEK).
- [x] **Metadata Extraction**:
  - [x] Implement `ExifTool` wrapper or python library for images.
  - [x] Implement `PyPDF2` for PDF metadata.
- [x] **OCR Service**:
  - [x] Integrate `Tesseract` (or placeholder) for text extraction.
  - [x] **PII Scrubbing**:
    - [x] Implement Microsoft Presidio or Regex-based scrubber.
    - [x] Redact SSNs, Credit Cards, Emails/Phones.

## 5. Scoring Algorithms

- [x] **Evidence Quality Scoring**:
  - [x] Implement `calculate_overall_evidence_score` (Authenticity, Completeness, Chain of Custody).
- [x] **Expense-Transaction Matching**:
  - [x] Implement matching logic (Amount, Date, Vendor, Description).
- [x] **Fraud Confidence Scoring**:
  - [x] Implement weighted signal combination (Mens Rea, Evidence, Matching, AI Consensus).

## 6. Offline Storage (Backend)

- [x] **Encrypted Archive**:
  - [x] Implement `AES-256` encryption for sensitive files at rest.
  - [x] Create utility to export case data to an encrypted SQLite file.
