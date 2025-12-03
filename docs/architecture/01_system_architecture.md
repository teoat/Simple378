# System Architecture

## 1. High-Level Overview
Simple378 is a privacy-first, AI-powered fraud detection platform designed for high-stakes financial investigations. It uses a **Supervisor-Worker** agentic architecture to automate analysis while keeping a human in the loop.

## 2. Core Components

### 2.1 Backend (FastAPI)
- **Role:** API Gateway, Business Logic, Orchestrator.
- **Key Modules:**
    - `mens_rea`: Intent detection engine.
    - `graph`: Entity link analysis.
    - `ai`: LangGraph supervisor and tool execution.
    - `ingestion`: Multi-bank CSV/PDF parsing.
    - `sync`: Offline synchronization endpoints.

### 2.2 Database Layer
- **PostgreSQL (Primary):** Stores structured data (Users, Subjects, Transactions, Cases).
- **TimescaleDB (Extension):** Optimized for time-series financial data (Cashflows).
- **Qdrant (Vector DB):** Stores embeddings for:
    - Evidence documents (semantic search).
    - Past case analyses (RAG).
- **Redis:** Caching, Pub/Sub, and Celery Broker.

### 2.3 AI & Agents
- **Tooling:** Standard REST API endpoints (FastAPI) for agent tools. (MCP Server deferred to Phase 4).
- **Agents:**
    - **Document Processor:** Extracts text/metadata from files.
    - **Fraud Analyst:** Two personas: **Auditor** (Compliance) and **Prosecutor** (Legal).
    - **Reconciliation Engine:** Matches fund releases to expenses.
- **LLM:** Anthropic Claude 3.5 Sonnet (Reasoning), GPT-4o (Fallback).
- **Workflows:** Celery task chains (Phase 1-3). Temporal.io (Phase 4).

### 2.4 Frontend (React + Vite)
- **Offline-First:** Uses **RxDB** for local storage and sync.
- **Visualizations:** React Flow (Graph), Recharts (Financials).
- **Assistant:** AI overlay for guidance and command execution.
- **Real-time:** Socket.io / Redis Pub/Sub.

## 3. Data Flow

### 3.1 Evidence Ingestion Pipeline
1.  **Upload:** User uploads PDF/Image.
2.  **Security:** File encrypted (AES-256) and stored (R2/Local). Hash generated.
3.  **Processing:** OCR (Tesseract) -> Metadata Extraction -> Vector Embedding (Qdrant).
4.  **Indexing:** Metadata stored in Postgres, Vectors in Qdrant.

### 3.2 Offline Sync Architecture
- **Local:** SQLite (encrypted) stores a subset of data.
- **Sync:** Delta-based synchronization when online.
- **Conflict Resolution:** "Last Write Wins" or User Prompt for collisions.

## 4. Security & Compliance
- **GDPR:** "Right to Erasure" endpoint deletes data from Postgres, Qdrant, and Storage.
- **Audit:** Immutable logs for every file access and AI decision.
- **Encryption:** All sensitive data encrypted at rest and in transit.
