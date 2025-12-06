# Simple378 Frontend Master Documentation

**Version:** 2.0  
**Last Updated:** December 5, 2025  
**Status:** Consolidated Single Source of Truth (SSOT)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Pages Reference](#pages-reference)
4. [Feature Enhancements](#feature-enhancements)
5. [Fraud Detection Methods](#fraud-detection-methods)
6. [Technical Quality](#technical-quality)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Project Overview

The Simple378 Frontend is a React-based forensic investigation platform designed for fraud detection, transaction reconciliation, and case management. The system features a modern glassmorphism UI with real-time WebSocket updates, AI-powered analysis (Frenly AI), and comprehensive audit capabilities.

### Current Status

| Metric | Value |
|--------|-------|
| **Codebase Size** | 8,870+ lines TypeScript/TSX |
| **Components** | 70+ components and pages |
| **Pages Implemented** | 10 core pages |
| **Build Status** | ✅ PASSING |
| **Architecture Score** | 7/10 (Good with improvements needed) |

### Key Strengths
- ✅ Modern glassmorphism UI with dark mode
- ✅ Real-time WebSocket updates
- ✅ Production-grade error handling (timeout, retry, 401 auto-logout)
- ✅ Strong TypeScript foundation
- ✅ Framer Motion animations

### Areas for Improvement
- ⚠️ Large components need refactoring (SemanticSearch: 647 lines)
- ⚠️ Test coverage needs expansion
- ⚠️ Bundle size optimization (unused dependencies)
- ⚠️ Accessibility improvements for WCAG 2.1 AA

---

## Architecture Overview

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **State Management** | React Query (TanStack Query) |
| **Styling** | Tailwind CSS + Custom Glassmorphism |
| **Animations** | Framer Motion |
| **Charts** | Recharts + Victory |
| **Real-time** | Native WebSocket |
| **Routing** | React Router v6 |

### Project Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── adjudication/    # Alert cards, reasoning panels
│   ├── charts/          # Chart wrappers
│   ├── common/          # Buttons, modals, loaders
│   ├── dashboard/       # Dashboard widgets
│   ├── layout/          # Headers, sidebars, navigation
│   └── reconciliation/  # Matching components
├── context/             # React contexts (Auth, Theme)
├── hooks/               # Custom hooks
│   ├── useWebSocket.ts  # WebSocket management
│   └── useAuth.ts       # Authentication
├── lib/                 # Utilities
│   ├── api.ts           # API client with retry/timeout
│   └── utils.ts         # Helper functions
├── pages/               # Route components (10 pages)
├── types/               # TypeScript definitions
└── App.tsx              # Main application
```

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Backend   │◄───►│  React Query│◄───►│  Components │
│   FastAPI   │     │   (Cache)   │     │   (UI)      │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       │                                       │
       ▼                                       ▼
┌─────────────┐                         ┌─────────────┐
│  WebSocket  │─────────────────────────│  State      │
│  (Real-time)│                         │  Updates    │
└─────────────┘                         └─────────────┘
```

---

## Pages Reference

### 1. Login (`Login.tsx`)

**Route:** `/login`  
**Purpose:** User authentication entry point

| Feature | Status |
|---------|--------|
| Email/password form | ✅ |
| Glassmorphism design | ✅ |
| Token-based auth | ✅ |
| Error handling | ✅ |
| Loading states | ⚠️ Needs improvement |

**Design:**
- Animated background with floating blobs
- Centered card with glass effect
- Gradient border animation

---

### 2. Dashboard (`Dashboard.tsx`)

**Route:** `/` (authenticated)  
**Purpose:** System overview and key metrics

| Feature | Status |
|---------|--------|
| Metrics cards | ✅ |
| Recent activity | ✅ |
| Quick actions | ✅ |
| Real-time updates | ✅ |
| Error boundary | ⚠️ Missing |

**Metrics Displayed:**
- Total cases analyzed
- High-risk subjects
- Pending reviews
- System health

---

### 3. Case List (`CaseList.tsx`)

**Route:** `/cases`  
**Purpose:** Browse and manage investigation cases

**Features:**
- Paginated case list
- Filtering by status, risk level
- Sorting capabilities
- Quick case preview
- Bulk selection

**Architecture Notes:**
- 443 lines (borderline large)
- Recommend extracting to hooks

---

### 4. Case Detail (`CaseDetail.tsx`)

**Route:** `/cases/:id`  
**Purpose:** Deep dive into individual cases

**Tabs:**
1. **Overview** - Subject info, risk summary
2. **Graph Analysis** - Entity relationship visualization
3. **Timeline** - Chronological event view
4. **Financials** - Transaction breakdown
5. **Evidence** - Supporting documents

**Components Used:**
- `RiskBar` - Risk score visualization
- `StatusBadge` - Case status indicator
- `EntityGraph` - Network visualization

---

### 5. Adjudication Queue (`AdjudicationQueue.tsx`)

**Route:** `/adjudication`  
**Purpose:** Review and decide on flagged alerts

**Layout:** Three-column design
- **Left:** Alert list (scrollable)
- **Center:** Selected alert details
- **Right:** AI reasoning panel

**Keyboard Shortcuts:**
| Key | Action |
|-----|--------|
| `J` | Next alert |
| `K` | Previous alert |
| `A` | Approve |
| `R` | Reject |
| `E` | Escalate |
| `?` | Show help |

---

### 6. Reconciliation (`Reconciliation.tsx`)

**Route:** `/reconciliation`  
**Purpose:** Match expenses with bank transactions

**Features:**
- Drag-and-drop matching
- Auto-reconciliation algorithm
- Discrepancy highlighting
- Confidence scoring
- Match/unmatch operations

**Layout:**
- Left panel: Expenses (draggable)
- Center panel: Match operations
- Right panel: Bank transactions

---

### 7. Semantic Search (`SemanticSearch.tsx`)

**Route:** `/search`  
**Purpose:** AI-powered document and entity search

**Features:**
- Natural language queries
- Semantic understanding
- Filter by entity type
- Recent searches
- Search suggestions

**Architecture Notes:**
- ⚠️ 647 lines (needs refactoring)
- Extract into: `useSearchState`, `SearchInterface`, `QueryBuilder`, `ResultsList`

---

### 8. Search Analytics (`SearchAnalytics.tsx`)

**Route:** `/analytics`  
**Purpose:** Search pattern and usage insights

**Charts:**
- Search volume over time
- Popular query terms
- User activity distribution

---

### 9. Ingestion (`Ingestion.tsx`)

**Route:** `/ingestion`  
**Purpose:** Document upload and processing

**Features:**
- Drag-and-drop file upload
- Processing pipeline visualization
- OCR status tracking
- Batch import wizard
- Upload history

---

### 10. Settings (`Settings.tsx`)

**Route:** `/settings`  
**Purpose:** User preferences and configuration

**Tabs:**
- **General:** Profile, notifications
- **Security:** Password, 2FA
- **Privacy:** Data export, deletion
- **About:** Version info

---

## Feature Enhancements

### Enhancement 1: Location Tracking from Transactions

**Route:** `/location-tracking`  
**Purpose:** Track suspect's physical location based on transaction locations

**Data Sources:**
- ATM withdrawals (with location)
- EDC/POS transactions (merchant address)
- Online transfers (IP geolocation)
- Bank branch visits
- International wire transfers

**Features:**
- Map visualization with pins
- Chronological movement timeline
- Conflict detection (claimed vs actual location)
- Pattern analysis

---

### Enhancement 2: Pattern Library

**Route:** `/patterns`  
**Purpose:** Save and reuse fraud detection patterns

**Pattern Types:**
- **System Patterns:** Built-in (Mirroring, Round-trip, Personal Diversion)
- **Custom Patterns:** User-created templates

**Features:**
- Pattern search and filtering
- Usage statistics
- Import/export patterns

---

### Enhancement 3: Predictive Risk Scoring

**Purpose:** Automatic transaction risk calculation (0-100)

**Scoring Factors:**
| Factor | Weight |
|--------|--------|
| Timing & Velocity | 25 |
| Amount Pattern | 20 |
| Entity Relationship | 20 |
| Vendor Profile | 15 |
| Transaction Characteristics | 20 |

---

### Enhancement 4: Collaborative Annotations

**Purpose:** Team notes and discussion on transactions

**Features:**
- Thread-based comments
- @mentions support
- Auto-generated AI notes
- Hashtag categorization
- Reactions

---

### Enhancement 5: Keyboard Shortcuts

**Navigation:**
| Shortcut | Action |
|----------|--------|
| `J` / `K` | Next / Previous item |
| `G + D` | Go to Dashboard |
| `G + R` | Go to Reconciliation |
| `/` | Focus search |

**Actions:**
| Shortcut | Action |
|----------|--------|
| `M` | Mark as Mirrored |
| `F` | Flag transaction |
| `A` | Accept AI suggestion |
| `Shift + A` | Select all |

---

### Enhancement 6: Asset Tracing

**Route:** `/assets`  
**Purpose:** Track physical assets purchased with diverted funds

**Asset Categories:**
- Real estate
- Vehicles
- Investments
- Jewelry
- Cryptocurrency

---

### Enhancement 7: AI Training Mode

**Purpose:** Improve Frenly AI through investigator feedback

**Features:**
- Accuracy tracking
- Pattern-specific performance
- Feedback submission
- Learning statistics

---

### Enhancement 8: Project Cost Analysis

**Route:** `/project-analysis`  
**Purpose:** Compare project purchases against claimed expenses

**Analysis Sections:**
- Budget vs Actual comparison
- Material items reconciliation
- Purchase vs Expense matching
- Unit price benchmarking
- Labor cost analysis

---

### Enhancement 9: Four Personas Expert Comments

**Purpose:** Contextual expert insights from 4 perspectives

| Persona | Role | Expertise |
|---------|------|-----------|
| 👮‍♀️ **Frenly AI** | AI Assistant | Pattern detection, anomalies |
| ⚖️ **Legal Advisor** | Legal Counsel | Evidence admissibility |
| 📊 **Forensic Accountant** | Financial Expert | Numbers, ratios |
| 🔍 **Senior Investigator** | Detective | Case strategy |

---

## Fraud Detection Methods

### ACFE Fraud Tree Coverage

Based on the Association of Certified Fraud Examiners (ACFE) 2024 Report.

#### Asset Misappropriation (89% of cases)

| Scheme | Detection Method | Risk Score |
|--------|------------------|------------|
| Shell Company | Vendor with no online presence, shared addresses | 85-100 |
| Ghost Employee | Payroll vs attendance mismatch | 90-100 |
| Expense Padding | Receipts vs bank payments variance | 70-85 |
| Check Kiting | Circular transfers between accounts | 80-95 |
| Skimming | Revenue vs deposit discrepancies | 75-90 |

#### Corruption (46% of cases)

| Scheme | Detection Method | Risk Score |
|--------|------------------|------------|
| Kickbacks | Suspicious 4-5% consistent payments | 80-95 |
| Bid Rigging | Losing bids consistently from same vendors | 85-100 |
| Related Party | Undisclosed family/friend connections | 75-90 |
| Lifestyle Mismatch | Income vs spending analysis | 70-85 |

#### Financial Statement Fraud (5% of cases)

| Scheme | Detection Method | Risk Score |
|--------|------------------|------------|
| Fictitious Revenue | Revenue spikes before reporting | 90-100 |
| Early Recognition | Backdated entries | 85-95 |
| Concealed Liabilities | Unrecorded obligations | 80-90 |
| Improper Disclosure | Missing material facts | 75-85 |

#### Procurement Fraud

| Scheme | Detection Method | Risk Score |
|--------|------------------|------------|
| Contract Splitting | Multiple POs just below approval threshold | 85-100 |
| Phantom Vendor | Invoice without delivery/payment | 90-100 |
| Duplicate Invoice | Same invoice number/amount | 80-95 |
| Change Order Abuse | Excessive scope changes | 70-85 |

---

## Technical Quality

### Current Issues (Resolved)

| Issue | Status | Fix Applied |
|-------|--------|-------------|
| Unclosed JSX tag | ✅ Fixed | Closed PageErrorBoundary tag |
| `any` types in serviceWorker | ✅ Fixed | Added proper interfaces |
| Implicit `any` in SearchAnalytics | ✅ Fixed | Added type annotation |
| API timeout handling | ✅ Added | 30s timeout with fetchWithTimeout |
| Retry logic | ✅ Added | Exponential backoff (3 attempts) |
| 401 auto-logout | ✅ Added | Clears token, redirects to login |

### Pending Improvements

| Area | Priority | Timeline |
|------|----------|----------|
| Component refactoring | Medium | Week 5-6 |
| Test coverage (>50%) | High | Week 7-8 |
| Bundle optimization | Low | Week 9 |
| Accessibility audit | Medium | Week 10-11 |

### Performance Targets

| Metric | Current | Target |
|--------|---------|--------|
| First Contentful Paint | ~1.5s | <1.0s |
| Time to Interactive | ~2.5s | <2.0s |
| Bundle Size | ~850KB | <600KB |
| Lighthouse Performance | ~75 | >90 |

---

## Accessibility Guidelines

### WCAG 2.1 AA Checklist

#### Navigation
- [ ] Skip links on all pages
- [ ] Proper heading hierarchy (single H1)
- [ ] ARIA landmarks

#### Interactive Elements
- [ ] All buttons have labels
- [ ] Keyboard navigation complete
- [ ] Focus indicators visible
- [ ] No keyboard traps

#### Visual
- [ ] Color contrast 4.5:1 (normal) / 3:1 (large)
- [ ] Color not sole information indicator
- [ ] Focus ring contrast sufficient

#### Screen Readers
- [ ] Images have alt text
- [ ] Form labels associated
- [ ] Dynamic content in aria-live regions
- [ ] Page titles descriptive

### Success Metrics
- Lighthouse Accessibility Score: >95
- Zero critical violations
- All flows keyboard accessible
- Screen reader verified

---

## Implementation Roadmap

| Phase | Features | Timeline | Status |
|-------|----------|----------|--------|
| **Phase 1** | Critical bug fixes | Week 1 | ✅ Complete |
| **Phase 2** | Build verification | Week 2 | ✅ Complete |
| **Phase 3** | Error handling | Week 3-4 | ✅ Complete |
| **Phase 4** | Component refactoring | Week 5-6 | 🔄 In Progress |
| **Phase 5A** | Location Tracking, Pattern Library | Week 9-10 | ⏳ Planned |
| **Phase 5B** | Risk Scoring, Keyboard Shortcuts | Week 11-12 | ⏳ Planned |
| **Phase 5C** | Annotations, Asset Tracing | Week 13-14 | ⏳ Planned |
| **Phase 5D** | AI Training Mode | Week 15-16 | ⏳ Planned |
| **Phase 6A** | ACFE Asset Misappropriation | Week 17-18 | ⏳ Planned |
| **Phase 6B** | Corruption & Procurement | Week 19-20 | ⏳ Planned |
| **Phase 6C** | Financial Statement & Benford's | Week 21-22 | ⏳ Planned |
| **Phase 6D** | Project Cost, Four Personas | Week 23-24 | ⏳ Planned |

---

## Quick Reference

### API Client Usage

```typescript
import { api } from '@/lib/api';

// With automatic timeout, retry, and error handling
const cases = await api.getCases({ status: 'pending' });
```

### Adding a New Page

1. Create `src/pages/NewPage.tsx`
2. Add route in `App.tsx`
3. Add to navigation in `Layout.tsx`
4. Create corresponding hooks if needed

### Component Guidelines

- Max 200-250 lines per component
- Extract logic to custom hooks
- Use TypeScript strictly (no `any`)
- Add error boundaries where appropriate

---

## Document History

| Date | Version | Changes |
|------|---------|---------|
| Dec 5, 2025 | 2.0 | Consolidated from 8 separate documents |
| Dec 5, 2025 | 2.0 | Added Feature Enhancements (9 features) |
| Dec 5, 2025 | 2.0 | Added ACFE Fraud Detection Methods |
| Dec 5, 2025 | 2.0 | Added Four Personas Expert Comments |

---

*This document supersedes: PAGE_DESCRIPTIONS.md, FRONTEND_COMPREHENSIVE_ANALYSIS.md, FRONTEND_PAGES_ARCHITECTURE_ANALYSIS.md, FRONTEND_REMEDIATION_PLAN.md, FRONTEND_REMEDIATION_STATUS.md, UI_UX_ENHANCEMENT_PROPOSAL.md, ACCESSIBILITY_GUIDE.md*

*For detailed page workflows and mockups, see: [COMPREHENSIVE_PAGE_WORKFLOW.md](./COMPREHENSIVE_PAGE_WORKFLOW.md)*
