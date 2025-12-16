# Executive Master Plan

> **📋 Note:** For detailed architecture specifications, see [CONSOLIDATED_ARCHITECTURE_SPEC.md](./CONSOLIDATED_ARCHITECTURE_SPEC.md) which consolidates all design proposals and orchestration documents.

## 1. Orchestration Goals
- **Reconcile:** Phase-based fund releases vs expenses; expose fraud via weighted matching and evidence scoring.
- **Ingest:** Analyze multi-modal evidence (PDFs, images, chat logs) with EXIF/OCR/forensics; maintain chain-of-custody.
- **Detect Mens Rea:** Identify compounding, desynchronized, and phantom expenses; temporal anomalies; velocity mismatches.
- **Entity Link Analysis:** Trace money flow to detect shell companies, kickbacks, collusion rings, circular payments.
- **Prosecution Artifacts:** Generate timelines, waterfall/Sankey, force graphs, geographic maps, legal packages.
- **AI Assistant:** Onboarding AI assistant overlay across pages for guidance, command execution, and proactive suggestions.
- **Offline-First:** Encrypted local storage and conflict-aware sync; enforce GDPR compliance.

## 2. Services & Responsibilities
- **Backend (FastAPI):** API, reconciliation, scoring, mensrea, entity graph, visualization data, offline sync endpoints.
- **Database (PostgreSQL + TimescaleDB):** Projects, phases, fund_releases, expenses, evidence, fraud_flags, entities. Hypertables for cashflows.
- **Vector DB (Qdrant):** Semantic search over evidence and prior analyses.
- **Cache/Queue (Redis + Celery):** Async extraction, AI calls, graph builds, visualization generation; pub/sub for UI updates.
- **Storage (Cloudflare R2 + Local Encrypted):** Evidence blobs; SHA-256 hashes, optional IPFS anchoring later.
- **Search (Meilisearch):** Fast lookup for expenses/evidence.
- **AI Providers:** Claude 3.5 Sonnet (primary), GPT-4o fallback; Tesseract/Azure Document Intelligence for OCR; OpenCV/ExifTool for forensics.
- **MCP Server:** Tool registry (`extract_receipt_data`, `flag_expense_fraud`, `match_bank_transaction`, `render_reconciliation_html`).
- **MCP Agents:** Document Processor, Fraud Analyst (personas), Reconciliation Engine, Report Generator.
- **Frontend (React/TS):** Dashboards, fraud review, entity network, visualizations, assistant widget.
- **Auth (Better Auth):** RBAC roles; GDPR user consent and erasure endpoints.
- **Notifications (Novu):** Alerts for fraud flags, reconciliation completions.

## 3. Workflows (DAGs)
### Evidence Ingestion
Upload → Hash/Store → Validate → OCR/EXIF/PDF Metadata → Image Forensics → Index (Qdrant/Meilisearch) → Emit `evidence_processed`.

### Reconciliation (Phase-Based)
Collect Data → Weighted Matching → Phase Variance → Mens Rea Indicators → Fraud Confidence → Flags → Visualizations.

### AI Fraud Analysis (Personas)
Trigger on High Variance → Persona Prompts (Auditor/Prosecutor) → Consensus → Escalate.

### Entity Link Analysis
Build Graph → Detect Patterns (Shell/Kickback) → Emit `entity_patterns_detected`.

### Legal Package
Assemble Artifacts → PDF Sign → Export.

### Offline Sync
Local SQLite + Encrypted Cache → Delta Sync → Conflict Resolution.

## 4. Agent Collaboration (MCP)
### Tools
- `extract_receipt_data(file_path)`: EXIF + OCR + forensic signals.
- `flag_expense_fraud(expense_id, persona)`: Runs persona analysis and stores flags.
- `match_bank_transaction(expense_id)`: Computes weighted matching candidates.
- `render_reconciliation_html(case_id, sections)`: Compiles report HTML.

### Agents
- **Document Processor:** Auto-categorize uploads, extract metadata, index in Qdrant.
- **Fraud Analyst:** Coordinates personas, computes consensus, escalates high severity.
- **Reconciliation Engine:** Runs phase variance, mensrea scoring, emits flags.
- **Report Generator:** Assembles visualizations and legal packages.

### Protocol
- Agents communicate via MCP router; publish events to Redis pub/sub.
- Retries with exponential backoff; circuit breaker on AI provider failures.
- Cache tool outputs keyed by content hashes; idempotent operations.

## 5. Phase Plan & Feature Tiers
- **Phase 1: Foundation (Simple Tier):**
    - **Modules:** Auth (Better Auth), Cases, Evidence, Basic Reconciliation, Reports, Notifications (Novu).
    - **Goal:** Basic fraud detection MVP.
- **Phase 2: AI & Advanced Detection (Advanced Tier):**
    - **Modules:** AI Fraud (Claude), Forensics (Exif/OpenCV), Entity Analysis (NetworkX), Mens Rea, Vector Search (Qdrant), Meilisearch.
    - **Goal:** AI-powered analysis and visualization.
- **Phase 3: Offline & Collaboration (Advanced+ Tier):**
    - **Modules:** Offline Sync (RxDB), Realtime (Liveblocks), Workflows (Temporal), Feature Flags (Unleash).
    - **Goal:** Field support and team collaboration.
- **Phase 4: Enterprise & Legal (Extreme Tier):**
    - **Modules:** MCP Agents, AI Assistant (LangGraph), Behavioral Analysis, Network Analysis, Legal Package (Blockchain).
    - **Goal:** Prosecution-ready enterprise system.
- **Phase 5: Scale & Optimize (Extreme Tier):**
    - **Modules:** API Gateway (Kong), Event Bus (NATS), Cache (Dragonfly), Observability.
    - **Goal:** Production hardening.

## 6. Operations & Tech Stack
- **Auth:** Better Auth (Self-hosted).
- **Notifications:** Novu.
- **Search:** Meilisearch.
- **Vector DB:** Qdrant.
- **Offline:** RxDB.
- **Queues:** Celery (Phase 1-3) -> Temporal (Phase 4).
- **Storage:** Cloudflare R2 + MinIO SDK.

## 7. Success Metrics & SLAs
- **Performance:** API p95 < 500ms. Evidence scoring < 100ms.
- **Accuracy:** High matching precision/recall. Low false-positive rate.
- **Reliability:** Queue backlog thresholds. Offline sync conflict rate < 2%.
- **Business:** Prosecution readiness > 70. Time-to-reconciliation < 1 day.