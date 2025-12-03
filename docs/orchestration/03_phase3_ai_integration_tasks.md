# Phase 3: AI Integration - Tasks & Todos

**Goal:** Integrate Advanced AI for sophisticated analysis and reasoning.

## 1. AI Orchestrator
- [ ] **LLM Client Setup**:
    - [ ] Integrate `anthropic` SDK (Claude 3.5 Sonnet).
    - [ ] Integrate `openai` SDK (GPT-4o) as fallback.
    - [ ] Implement `LLMService` with retry logic and provider switching.
- [ ] **LangGraph Implementation**:
  - [ ] Define `InvestigationState` schema (subject_id, messages, next_step, findings, final_verdict).
  - [ ] Create `Supervisor` node to delegate tasks.
  - [ ] Create `Worker` nodes:
    - [ ] `DocumentProcessor` (Auto-categorize, extract metadata).
    - [ ] `FraudAnalyst` (Multi-persona analysis).
    - [ ] `ReconciliationEngine` (Match funds).
    - [ ] `ReportGenerator` (Assemble packages).
  - [ ] Configure Postgres checkpointing for state persistence.

## 2. MCP Server & Agents

- [ ] **MCP Server**:
  - [ ] Set up a local MCP server to expose system tools.
  - [ ] Expose tools: `extract_receipt_data`, `ocr_document`, `flag_expense_fraud`, `match_bank_transaction`.
- [ ] **Agent Personas**:
  - [ ] Define system prompts for Supervisor and Workers.
  - [ ] Implement context management (handling token limits).

## 3. Human-in-the-Loop (HITL)

- [ ] **Checkpoints**:
  - [ ] Implement graph checkpoints before critical actions (e.g., Report Generation).
- [ ] **Intervention UI**:
  - [ ] Create API to fetch current graph state.
  - [ ] Create API to update state/next_step (Analyst feedback).

## 4. Caching & Performance

- [ ] **Redis Caching**:
  - [ ] Cache LLM responses based on query hash.
  - [ ] Implement cache invalidation on new data ingestion.

## 4. Testing & Validation
- [ ] **Evaluation Dataset**:
    - [ ] Create synthetic fraud cases (positive/negative samples).
- [ ] **Automated Eval**:
    - [ ] Run agents against the dataset and measure accuracy/recall.
