# Copilot Instructions - Reconciliation & Fraud Detection Platform

## Project Overview

**AI-Powered Reconciliation & Fraud Detection System** - A comprehensive platform that reconciles phase-based fund releases against expenses, detects embezzlement and fraud through multi-modal AI analysis, entity link analysis, and criminal intent (mensrea) detection. Provides prosecution-ready evidence packages with advanced visualizations.

**Key Capabilities:**
- Phase-based fund tracking with cashflow reconciliation
- **Weighted scoring system** for evidence quality and matching confidence
- Multi-modal evidence analysis (documents, images, chat logs, bank statements)
- EXIF/metadata extraction and digital forensics
- Entity relationship analysis detecting shell companies, kickback schemes, collusion rings
- Mensrea (criminal intent) scoring through pattern analysis
- 4 AI personas (Auditor, Law Enforcement, Prosecutor, Judge) providing multi-perspective fraud assessment
- Interactive visualizations proving fraud through timeline, network graphs, Sankey diagrams
- Onboarding AI assistant with context awareness and natural language commands
- Offline-first capability with sync for field investigators
- GDPR-compliant audit trails and data handling

## Technology Stack

### Backend
- **Framework:** Python 3.11+ with FastAPI (async/await for performance)
- **Database:** PostgreSQL 15+ with TimescaleDB extension (time-series cashflow)
- **Vector Search:** Qdrant (local, self-hosted for semantic search across evidence)
- **Cache/Queue:** Redis (caching AI responses, Celery task queue, pub/sub)
- **Task Queue:** Celery with Redis broker for async processing
- **Workflow:** Temporal.io for complex multi-step processes
- **AI/LLM:** Claude 3.5 Sonnet (primary), GPT-4o (complex cases fallback)
- **MCP:** Custom FastAPI-based MCP server for AI agent tools

### Frontend
- **Framework:** React 18+ with TypeScript
- **State:** React Query (server state), Zustand (client state)
- **UI:** Tailwind CSS with shadcn/ui components
- **Charts:** Recharts, Plotly.js for interactive visualizations
- **Network:** D3.js for force-directed graphs, Cytoscape.js for entity networks
- **Maps:** Leaflet for geographic visualizations
- **Real-time:** Socket.io client for live updates

### Storage
- **Hot Storage:** Cloudflare R2 (active cases, zero egress fees)
- **Offline Storage:** Local filesystem with encrypted archives
- **Evidence Chain:** SHA-256 hashes in PostgreSQL + optional IPFS for immutable proof

### Modular Architecture
- **Auth:** Better Auth (self-hosted, TypeScript-first)
- **Notifications:** Novu (multi-channel: email, SMS, in-app)
- **Search:** Meilisearch (instant typo-tolerant search)
- **Offline:** RxDB (offline-first database with sync)
- **Collaboration:** Liveblocks (real-time multi-user)
- **Feature Flags:** Unleash (gradual rollouts, A/B testing)
- **Monitoring:** Highlight.io (session replay, error tracking)
- **API Gateway:** Kong (rate limiting, auth proxy)
- **Event Bus:** NATS (lightweight event streaming)

## Architecture

### Data Flow

```
User Upload → Evidence Processor → Forensics Extraction (EXIF/OCR)
                                 → Storage (R2 + Local + Hash Chain)
                                 → Vector DB (Semantic Search)
                                 → Evidence Quality Scoring ⭐ NEW
                                 → AI Analysis (4 Personas)
                                 → Fraud Flags

Fund Release → Reconciliation Engine → Matching Engine (Weighted) ⭐ NEW
                                    → Mensrea Detector
                                    → Entity Link Analyzer
                                    → Visualization Generator
                                    → Legal Package Exporter
```

## Weighted Scoring System ⭐ NEW

### 1. Evidence Quality Scoring (`packages/scoring/evidence-quality.ts`)

**Purpose:** Rate evidence strength for legal admissibility and fraud detection confidence.

**Scoring Dimensions (0-100 each):**

```typescript
interface EvidenceQualityScore {
  overall_score: number;          // Weighted average 0-100
  dimensions: {
    authenticity: number;         // 30% weight - Is it genuine?
    completeness: number;         // 20% weight - All required data present?
    chain_of_custody: number;     // 25% weight - Proper handling trail?
    metadata_integrity: number;   // 15% weight - EXIF/metadata consistent?
    legal_admissibility: number;  // 10% weight - Court-ready?
  };
  red_flags: RedFlag[];
  recommendation: 'ACCEPT' | 'REVIEW' | 'REJECT';
}
```

### 2. Expense-Bank Transaction Matching Score (`packages/scoring/matching.ts`)

**Purpose:** Calculate confidence that an expense claim matches a bank transaction.

**Matching Dimensions (0-1 confidence each):**

```typescript
interface MatchingScore {
  overall_confidence: number;     // 0-1, weighted average
  dimensions: {
    amount_match: number;         // 35% weight
    date_proximity: number;       // 25% weight
    vendor_similarity: number;    // 20% weight
    description_match: number;    // 15% weight
    location_match: number;       // 5% weight (if GPS available)
  };
  match_type: 'EXACT' | 'HIGH' | 'PROBABLE' | 'POSSIBLE' | 'UNLIKELY';
  alternative_matches: Match[];   // Other possible matches
}
```

### 3. Fraud Confidence Scoring (Enhanced Mensrea)

**Combines multiple fraud indicators with evidence quality:**

```typescript
interface FraudConfidenceScore {
  overall_confidence: number;       // 0-1
  mensrea_score: number;           // Criminal intent 0-1
  evidence_quality_avg: number;    // Average evidence score
  supporting_evidence_count: number;
  red_flags: RedFlag[];
  prosecution_readiness: number;   // 0-100
  recommendation: string;
}
```

## Recommendations: Add & Delete ⭐

### ✅ **RECOMMENDED ADDITIONS**

#### 1. **Machine Learning Model for Pattern Recognition** (Advanced Tier)
**Why:** Current rule-based mensrea detection could miss subtle patterns
```python
# packages/ml-models/
- Anomaly detection using Isolation Forest
- Fraud classification using XGBoost
- Time-series forecasting for spending patterns
- Clustering for grouping similar fraud cases
```

#### 2. **Automated Evidence Collection** (Advanced Tier)
**Why:** Reduce manual work, increase evidence completeness
```python
# packages/evidence-automation/
- Bank API integration (Plaid, TrueLayer) for automatic transaction import
- Email parsing for receipts (IMAP/Gmail API)
- Cloud storage scanning (Google Drive, Dropbox) for expense documents
- Calendar integration for expense timing verification
```

#### 3. **Vendor Verification Service** (Simple Tier)
**Why:** Current system assumes vendor names are correct
```python
# packages/vendor-verification/
- Business registry lookup (Companies House, SEC)
- Domain/website verification
- Phone number validation
- Address geocoding and verification
- Social media presence check
```

#### 4. **Interview Transcript Analysis** (Extreme Tier)
**Why:** Detect lies and inconsistencies in suspect interviews
```python
# packages/interview-analysis/
- Transcript to text (Whisper AI)
- Sentiment analysis
- Statement contradiction detection
- Evasiveness scoring
- Timeline extraction from verbal accounts
```

#### 5. **Comparative Analytics Dashboard** (Advanced Tier)
**Why:** Benchmark against normal spending patterns
```python
# packages/analytics/
- Industry spending benchmarks
- Peer project comparison
- Historical trend analysis
- Seasonal adjustment
- Risk heat maps
```

#### 6. **Whistleblower Portal** (Simple Tier)
**Why:** Anonymous fraud reporting can uncover hidden cases
```python
# packages/whistleblower/
- Anonymous submission portal (Tor support)
- Encrypted file uploads
- Anonymous messaging system
- Reward/bounty tracking
- Tip credibility scoring
```

#### 7. **Mobile App for Field Investigators** (Future - Phase 4)
**Why:** Offline evidence collection on-site
```typescript
// apps/mobile/ (React Native)
- Camera integration for instant receipt capture
- GPS auto-tagging
- Voice memos
- Offline sync with RxDB
- Biometric authentication
```

#### 8. **Blockchain Evidence Notarization** (Extreme Tier)
**Why:** Irrefutable proof of evidence existence at specific time
```python
# packages/blockchain/
- Ethereum timestamp anchoring
- IPFS content-addressed storage
- Smart contract for evidence chain
- Merkle tree for batch notarization
```

---

### ❌ **RECOMMENDED DELETIONS/SIMPLIFICATIONS**

#### 1. **Remove: Custom MCP Server** ❌
**Why:** Adds complexity, standard REST APIs sufficient for v1
**Replace with:** Standard FastAPI endpoints with OpenAPI docs
**Savings:** 2-3 weeks development time

**Exception:** Keep if planning multi-agent orchestration in Phase 4 (Extreme)

#### 2. **Remove: Temporal.io (Phase 1-2)** ❌
**Why:** Overkill for simple workflows, steep learning curve
**Replace with:** Celery with task chains for basic workflows
**Move to:** Phase 4 (Extreme) if complex approval workflows needed
**Savings:** Infrastructure complexity, $200/mo hosting

#### 3. **Simplify: 4 AI Personas → 2 Personas** (Phase 1-2) ✅
**Why:** 4 personas = 4x API costs, diminishing returns
**Keep:** Auditor + Prosecutor (cover compliance + legal)
**Remove (Phase 1):** Law Enforcement + Judge
**Add back:** Phase 3-4 if budget allows
**Savings:** 50% AI API costs (~$500/mo)

#### 4. **Remove: Liveblocks** (Phase 1-3) ❌
**Why:** Real-time collaboration not critical for fraud investigation
**Replace with:** Simple comment system, activity feed
**Move to:** Phase 4 (Extreme) if multi-user editing needed
**Savings:** $99/mo subscription

#### 5. **Remove: Kong API Gateway** (Phase 1-2) ❌
**Why:** Overkill for single API, adds deployment complexity
**Replace with:** FastAPI built-in rate limiting, nginx for production
**Move to:** Phase 4 if microservices architecture
**Savings:** Infrastructure complexity

#### 6. **Simplify: NATS → Redis Pub/Sub** (Phase 1-3) ✅
**Why:** Redis already in stack, NATS adds another service
**Keep Redis for:** Cache + Queue + Pub/Sub
**Add NATS:** Phase 4 if event sourcing needed
**Savings:** One less service to maintain

#### 7. **Remove: Highlight.io** (Phase 1-2) ❌
**Why:** Sentry handles error tracking, session replay nice-to-have
**Replace with:** Sentry (already in stack)
**Add back:** Phase 4 for advanced debugging
**Savings:** $200/mo

#### 8. **Simplify: Behavioral Analysis Module** (Phase 1-3) ❌
**Why:** Psychological profiling requires expertise, low ROI for v1
**Replace with:** Simple escalation pattern detection
**Move to:** Phase 4 (Extreme) with expert consultation
**Savings:** 3-4 weeks development

---

### 📊 **Revised Technology Stack (Optimized)**

**Phase 1-2 (Simple + Advanced):**
- Auth: Better Auth ✅
- Database: PostgreSQL + TimescaleDB ✅
- Cache/Queue: Redis (cache + Celery + pub/sub) ✅
- Vector DB: Qdrant ✅
- Search: Meilisearch ✅
- Storage: Cloudflare R2 + MinIO SDK ✅
- Notifications: Novu ✅
- AI: Claude 3.5 Sonnet ✅
- Monitoring: Sentry ✅
- ~~MCP Server~~ → Standard REST API
- ~~Temporal~~ → Celery task chains
- ~~4 AI Personas~~ → 2 personas (Auditor + Prosecutor)
- ~~Kong~~ → FastAPI + nginx
- ~~NATS~~ → Redis Pub/Sub
- ~~Highlight.io~~ → Sentry

**Savings:** ~$500/mo + 4-6 weeks dev time

**Phase 3-4 (Extreme) - Add back if needed:**
- Temporal.io (complex workflows)
- All 4 AI personas
- Liveblocks (collaboration)
- Highlight.io (session replay)
- NATS (event sourcing)
- MCP Server (multi-agent)
- Kong (microservices)
