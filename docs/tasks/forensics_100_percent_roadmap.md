# Forensics Module - Roadmap to 100/100

This document outlines the remaining tasks required to elevate the Forensics module from its current state (Completed Core Features) to a "Perfect" 100/100 score, focusing on robustness, security, and advanced visualization.

## 1. Robustness & Auditability (Event Sourcing)
*Current Status: Missing*
To align with the system's growing Event Sourcing architecture (introduced in Ingestion), all forensic actions must generate audit events.

- [ ] **Data Model**: Ensure `Event` model is imported in `backend/app/api/v1/endpoints/forensics.py` and `services/forensics.py`.
- [ ] **Document Analysis Event**: In `ForensicsService.analyze_document`, emit a `DOCUMENT_ANALYZED` event containing the file hash, metadata summary, and manipulation verdict.
- [ ] **Entity Resolution Event**: In `EntityResolutionService.ai_entity_resolution`, emit `ENTITY_RESOLVED` events for each accepted match, linking the two entity IDs.

## 2. Security & Hygiene
*Current Status: Basic checks only*
Real-world forensic tools must ensure the safety of the files they analyze.

- [ ] **ClamAV Integration**: Integrate `clamd` (via `pyclamd` or subprocess) in `ForensicsService` to scan files *before* processing.
    - *Task*: Add `scan_file(file_path)` method.
    - *Task*: Reject upload if virus detected.
- [ ] **File Type Verification**: Enforce strict MIME type checking using `python-magic` (already imported) to prevent extension spoofing (e.g., `.exe` renamed to `.pdf`).

## 3. Search & Discovery
*Current Status: Isolated*
Analyzed entities and documents are currently siloed in the Forensics module.

- [ ] **Indexing**: After successful analysis, push the document metadata and extracted text to the Search Service (Meilisearch/Postgres Search).
    - *Task*: Call `search_service.index_document(...)` at the end of the analysis pipeline.

## 4. Advanced Visualization (UI)
*Current Status: Functional but simple*
The documentation describes a multi-stage pipeline visualization which provides better user feedback than a simple spinner.

- [ ] **Processing Pipeline Component**: Create `src/components/forensics/ProcessingPipeline.tsx`.
    - *Visuals*: Stepper component showing: Upload (✅) -> Virus Scan (✅) -> OCR (🔄) -> Metadata (⏳) -> Analysis.
    - *Integration*: Connect to WebSocket progress updates (similar to Ingestion).
- [ ] **Network Graph**: Replace the placeholder "Interactive network visualization" in `Forensics.tsx` with a real graph using `react-force-graph` or `recharts`.

## 5. Advanced Analysis (Backend)
*Current Status: Basic ELA*
The ELA implementation is computationally expensive and simple.

- [ ] **Optimization**: Move ELA processing to a background worker (Celery/RQ) if not already handled by async thread pool.
- [ ] **OCR Integration**: If `tesseract` is available, extract text from images to find hidden/embedded text.

## Completion Criteria
The module will be considered 100/100 when:
1. Every analysis action creates a traceable `Event`.
2. Malicious files are blocked by ClamAV.
3. Analyzed documents are searchable globally.
4. The UI visualizes the exact stage of processing (not just "Loading").
