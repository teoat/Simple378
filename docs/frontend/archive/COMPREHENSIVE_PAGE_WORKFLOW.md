# Comprehensive Page Workflow & Design Specification

**Created:** December 5, 2025  
**Last Updated:** December 6, 2025  
**Status:** Design Blueprint & Current Implementation Analysis

This document combines the current frontend implementation with the proposed comprehensive workflow design, providing a complete picture of both the existing system and the target vision.

> 📚 **Detailed Page Documentation:** See [docs/frontend/pages/](./pages/README.md) for comprehensive documentation of each individual page.

---

## Table of Contents

1. [Page Sequence Workflow](#page-sequence-workflow)
2. [Global Elements](#i-global-elements)
3. [Implementation Status Matrix](#implementation-status-matrix)
4. [Detailed Page Workflows](#ii-detailed-page-workflows)
5. [Gap Analysis](#gap-analysis)
6. [Migration Path](#migration-path)
7. [Page Documentation Links](#page-documentation-links)

---

## Page Sequence Workflow

This section describes the logical flow and navigation sequence through the application.

### Primary User Journey (Core Flow)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      SIMPLE378 PRIMARY PAGE FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐     ┌──────────────────┐     ┌──────────────────┐
    │  LOGIN   │────▶│ CASE MANAGEMENT  │────▶│   CASE DETAIL    │
    │ (Page 1) │     │    (Page 2)      │     │   (Page 3)       │
    │          │     │  View All Cases  │     │  Investigation   │
    └──────────┘     └──────────────────┘     └────────┬─────────┘
                                                       │
                                                       ▼
                     ┌──────────────────────────────────────────────────────┐
                     │           INGESTION & MAPPING (Page 4)               │
                     │    Upload Data → Define Field Mappings → Preview     │
                                     ┌────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  CATEGORIZATION  │
                                    │    (Page 5)      │
                                    │  Label Expenses  │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ RECONCILIATION   │
                                    │    (Page 6)      │
                                    │   Match Data     │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ HUMAN            │
                                    │ ADJUDICATION     │
                                    │    (Page 7)      │
                                    │ Resolve Conflicts│
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │    DASHBOARD     │
                                    │    (Page 8)      │
                                    │ System Metrics   │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │  VISUALIZATION   │
                                    │    (Page 9)      │
                                    │ Financial Charts │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │  FINAL SUMMARY   │
                                    │    (Page 10)     │
                                    │  Report & Close  │
                                    └──────────────────┘


    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                        EXTENDED / BONUS PAGES                               │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │                                                                             │
    │   ┌────────────────────┐          ┌────────────────────┐                   │
    │   │  SEARCH ANALYTICS  │          │  SEMANTIC SEARCH   │                   │
    │   │    (Extended)      │          │    (Extended)      │                   │
    │   │  Usage Insights    │          │  AI-Powered Query  │                   │
    │   └────────────────────┘          └────────────────────┘                   │
    │                                                                             │
    │   Accessible from sidebar - Optional advanced features                      │
    └─────────────────────────────────────────────────────────────────────────────┘
```

---

### Complete Page Sequence (Linear Flow)

```
┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐
│   1   │───▶│   2   │───▶│   3   │───▶│   4   │───▶│   5   │───▶│   6   │───▶│   7   │───▶│   8   │───▶│   9   │───▶│  10   │
│ Login │    │ Cases │    │Detail │    │Ingest │    │Catgz  │    │Reconc │    │ Adjud │    │ Dash  │    │  Viz  │    │Summary│
└───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └───────┘
                                            │
                                       + Mapping
```

**Core Page Sequence:**

| Step | Page | Name | Purpose |
|------|------|------|---------|
| 1 | Login | Authentication | User login and access control |
| 2 | Cases | Case Management | Browse and manage all cases |
| 3 | Case Detail | Investigation | Deep dive into specific case |
| 4 | Ingestion & Mapping | Data Input | Upload files and define field mappings |
| 5 | Categorization | Expense Labeling | Classify bank transactions (AI + Manual) |
| 6 | Reconciliation | Data Matching | Match incoming vs existing data |
| 7 | Human Adjudication | Conflict Resolution | Resolve flagged discrepancies |
| 8 | Dashboard | Metrics Overview | System health and KPIs |
| 9 | Visualization | Financial Analysis | Charts and expense breakdowns |
| 10 | Final Summary | Reporting | Generate reports and close cases |

**Extended Pages (Bonus Features):**

| Page | Name | Purpose |
|------|------|---------|
| Ext-A | Search Analytics | Insights into search usage patterns |
| Ext-B | Semantic Search | AI-powered natural language search |

---

### Detailed Step-by-Step Flow

#### Step 1: Login (Authentication)
- User enters credentials
- System validates and creates session
- Redirects to **Case Management** (Page 2)

#### Step 2: Case Management
- View list of all cases (paginated, filterable)
- Search by case ID, subject name, status
- Click on a case to open **Case Detail** (Page 3)
- Or create a new case

#### Step 3: Case Detail
- Deep investigation view with tabs:
  - Overview, Graph Analysis, Timeline, Financials, Evidence
- Review case data and risk indicators
- Navigate to **Ingestion & Mapping** (Page 4) to add data

#### Step 4: Ingestion & Mapping
- **Ingestion:** Upload source files (CSV, JSON, Excel, DB connection)
- **Mapping:** Define how source fields map to system schema
- Preview data before committing
- Proceed to **Categorization** (Page 5)

#### Step 5: Categorization
- Label raw bank transactions
- AI auto-suggests categories (e.g., "Uber" -> "Travel")
- Bulk edit and apply rules
- Proceed to **Reconciliation** (Page 6)

#### Step 6: Reconciliation
- Match incoming data against existing records
- View match rate, new records, conflicts
- Flagged items sent to **Human Adjudication** (Page 7)

#### Step 7: Human Adjudication
- Three-column layout: Queue, Comparison, Decision
- Review conflicts side-by-side
- Accept source, accept system, merge, or mark as new
- AI assistant provides context
- Proceed to **Dashboard** (Page 8)

#### Step 8: Dashboard
- System-wide metrics and KPIs
- Active cases, high risk subjects, pending reviews
- Charts: Risk distribution, weekly activity
- Navigate to **Visualization** (Page 9)

#### Step 9: Visualization (Financial)
- Financial deep-dive charts
- Cash flow, balance sheet, expense trends
- AI-generated explanations
- Navigate to **Forensic Balance Sheet** (Page 9b) for fraud detection
- Proceed to **Final Summary** (Page 10)

#### Step 9b: Forensic Balance Sheet (Fraud Detection)
- Phase-by-phase fund release vs. expense tracking
- Detection of expense claims exceeding actual cashflow
- Mirroring fraud detection (round-trip transfers)
- Personal account diversion analysis
- AI forensic summary with SAR generation

#### Step 10: Final Summary
- Case completion status
- Executive summary cards (Ingestion, Reconciliation, Adjudication)
- Generate PDF report
- Archive case or start new

---

### Navigation Matrix

| From \ To | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 9b | 10 |
|-----------|---|---|---|---|---|---|---|---|---|----|----|
| **1. Login** | - | ✓ | - | - | - | - | - | - | - | - | - |
| **2. Cases** | - | - | ✓ | ✓ | - | - | - | ✓ | - | - | - |
| **3. Case Detail** | - | ✓ | - | ✓ | - | - | ✓ | ✓ | ✓ | ✓ | - |
| **4. Ingestion** | - | ✓ | ✓ | - | ✓ | ✓ | - | ✓ | - | - | - |
| **5. Categorize**| - | - | - | ✓ | - | ✓ | - | - | - | - | - |
| **6. Reconcile** | - | - | - | - | ✓ | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| **7. Adjudicate**| - | ✓ | ✓ | - | - | ✓ | - | ✓ | - | ✓ | ✓ |
| **8. Dashboard** | ✓ | ✓ | - | ✓ | ✓ | ✓ | ✓ | - | ✓ | ✓ | ✓ |
| **9. Visualization** | - | - | ✓ | - | - | - | - | ✓ | - | ✓ | ✓ |
| **9b. Forensic BS**| - | - | ✓ | - | - | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| **10. Summary** | - | ✓ | - | ✓ | - | - | - | ✓ | - | - | - |

**Legend:** ✓ = Direct navigation available

---

### Sidebar Navigation Order

The sidebar provides global navigation ordered by the primary workflow:

```
┌─────────────────────────────────────┐
│  [LOGO]                             │
├─────────────────────────────────────┤
│  📋 Cases           ← Start here    │
│  📁 Case Detail                     │
│  📥 Ingestion                       │
│  🗺️  Mapping                        │
│  🔄 Reconciliation                  │
│  ⚖️  Adjudication                   │
│  📊 Dashboard                       │
│  📈 Visualization                   │
│  📄 Summary                         │
├─────────────────────────────────────┤
│  EXTENDED FEATURES                  │
│  🔍 Search Analytics   (Bonus)      │
│  🧠 Semantic Search    (Bonus)      │
└─────────────────────────────────────┘
```

---

### Modal/Overlay Interactions

Certain interactions happen via overlays rather than page navigation:

| Trigger | Overlay Type | Available From |
|---------|-------------|----------------|
| **Meta Agent** | Chat panel (right) | All pages (2-9) |
| **Settings** | Modal or slide-out | Main header (⚙️ icon) |
| **Global Search** | Dropdown results | Main header |
| **CSV Wizard** | Full-screen modal | Ingestion page |
| **2FA Setup** | Modal dialog | Settings |
| **Keyboard Shortcuts** | Help overlay | Case Detail |

---

### Extended Pages (Bonus Features)

These pages provide additional functionality but are not part of the core workflow:

#### Search Analytics
- **Purpose:** Insights into how users search the system
- **Features:** 
  - Total searches, active users, average results
  - Popular queries, search type distribution
  - Performance metrics (cache hit rate, response time)
- **Access:** Sidebar (under Extended Features)

#### Semantic Search
- **Purpose:** AI-powered natural language search
- **Features:**
  - Natural language query input
  - Relevance scoring and matched terms
  - Advanced filters (date range, risk score, status)
  - Saved searches
- **Access:** Sidebar (under Extended Features)

---

## I. Global Elements

These elements should be persistent across all authenticated pages (Pages 2–9).

### 1. Persistent Navigation (Left Sidebar)

**Visual Design:**
- **Width:** 60px collapsed, 240px expanded (hover/focus)
- **Position:** Fixed, left edge of viewport
- **Background:** Glassmorphism effect with backdrop-blur
- **Z-index:** High (e.g., 1000) to stay above content

**Content Structure:**
```
┌─────────────────┐
│  [LOGO]         │  ← App branding
├─────────────────┤
│  🏠 Dashboard    │  ← Icon + Label (on hover)
│  📋 Cases        │
│  📥 Ingestion    │
│  ️  Mapping     │
│  🏷️  Categorize  │
│  🔄 Reconcile    │
│  ⚖️  Adjudication│
│  📊 Analytics    │
│  🔍 Search       │
│  📈 Viz (New)    │
│  📄 Summary (New)│
└─────────────────┘
```

**Note:** Settings is accessed via the main header, not the sidebar.

**Interaction:**
- **Hover/Focus:** Sidebar expands smoothly (300ms transition)
- **Active State:** Highlighted background gradient (blue-to-cyan)
- **Icons:** Lucide React icons with tooltip on collapsed state
- **Accessibility:** Full keyboard navigation, ARIA labels

**Current Status:** ✅ Partially Implemented (exists but needs enhancement for expand/collapse)

---

### 2. Main Header (Top Bar)

**Visual Design:**
- **Height:** 64px
- **Position:** Fixed, top of viewport (below z-index of modals)
- **Background:** Semi-transparent white/slate with backdrop-blur

**Content Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│ Page Title          [🔍 Global Search]      [⚙️] [🤖] [@] [User] │
└──────────────────────────────────────────────────────────────────┘
```

**Elements (Left to Right):**
1. **Page Title:** Dynamic (e.g., "Case Management," "Financial Visualization")
   - Font: 24px, bold, slate-900/white
2. **Global Search:** 
   - Input field with search icon
   - Placeholder: "Search cases, IDs, or data..."
   - Quick keyboard shortcut: `Cmd+K` / `Ctrl+K`
3. **Settings Icon:** ⚙️
   - Opens Settings modal/slide-out panel
   - Quick access without leaving current page
   - Contains: Profile, Security (2FA), Preferences, Audit Log
4. **Meta Agent Icon:** 🤖
   - Toggles AI assistant chat panel
   - Shows notification badge when suggestions available
5. **User Profile:**
   - Avatar circle (40px)
   - Dropdown menu: View Profile, Logout

**Current Status:** ✅ Implemented (in layout component)

---

### 3. Frenly AI Assistant (Top Right Overlay)

**Critical Feature:** AI assistant "Frenly" available on all pages (2–9). A friendly female police officer character that provides contextual guidance.

**Character Design:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                           ┌───────────────────────────────────────┐            │
│                        ╭──│  "I noticed something suspicious!     │            │
│                       ╱   │   PT ABC received Rp 500M but sent    │            │
│                      ╱    │   96% to CV XYZ just 3 days later.    │            │
│                     ╱     │   This looks like a mirroring pattern │            │
│   ┌─────────────┐  ╱      │   Want me to trace the money flow? 🔍 │            │
│   │  👮‍♀️ FRENLY │◄─       │                                       │            │
│   │  ──────────│          │   [Yes, trace it] [Show details]      │            │
│   │  ⭐ Always here       └───────────────────────────────────────┘            │
│   │    to help!  │                                                              │
│   └─────────────┘                                                              │
│                                                                                 │
│   Female police officer avatar with:                                            │
│   • Friendly expression                                                         │
│   • Police cap with star badge                                                  │
│   • Professional but approachable look                                          │
│   • Subtle animation (blinking, nodding)                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Visual Design:**
- **Position:** Fixed, bottom-right corner (20px from edges)
- **Avatar:** Female police officer, circular, 64px diameter
  - Character: Friendly female officer with police cap
  - Badge: "FRENLY AI" name tag
  - Expression: Changes based on context (alert 🚨, thinking 🤔, happy 😊)
  - Animated: Subtle idle animation, waves when new insight

**Comic Bubble Interaction (NOT a chatbox):**
```
                    ╭────────────────────────────────────────╮
                   ╱│  💡 Hey! I found 3 suspicious patterns │
                  ╱ │     in your reconciliation data!       │
                 ╱  │                                        │
    ┌──────────┐╱   │  • 2 mirrored transactions             │
    │ 👮‍♀️      │    │  • 1 personal diversion                │
    │ FRENLY   │    │                                        │
    │ AI       │    │  [Show me] [Later] [Mark as reviewed]  │
    └──────────┘    ╰────────────────────────────────────────╯
```

**Bubble Types:**
1. **Alert Bubble (Red border):** Urgent findings, fraud detected
2. **Insight Bubble (Blue border):** Helpful observations
3. **Tip Bubble (Yellow border):** Suggestions and guidance
4. **Success Bubble (Green border):** Confirmations

**Dynamic Bubble Sizing:**
The bubble automatically expands and contracts based on text length:

```
SHORT MESSAGE (Compact):
                    ╭──────────────────────╮
    ┌──────────┐   ╱│  ✅ Transaction matched! │
    │ 👮‍♀️      │◄──  ╰──────────────────────╯
    └──────────┘   

MEDIUM MESSAGE (Standard):
                    ╭────────────────────────────────────╮
    ┌──────────┐   ╱│  💡 I found a suspicious pattern   │
    │ 👮‍♀️      │◄──  │     in the last 3 transactions.   │
    └──────────┘    ╰────────────────────────────────────╯

LONG MESSAGE (Expanded with scroll):
                    ╭─────────────────────────────────────────────╮
    ┌──────────┐   ╱│  🚨 ALERT: Multiple red flags detected!     │
    │ 👮‍♀️      │◄──  │                                             │
    └──────────┘    │  1. PT ABC received Rp 500M on Jan 15       │
                    │  2. Transferred 96% to CV XYZ (3 days)      │
                    │  3. CV XYZ sent to personal account         │
                    │  4. Same pattern repeated in February       │
                    │                                             │
                    │  Total suspicious flow: Rp 1.2B             │
                    │                                             │
                    │  [View Timeline] [Trace Flow] [Flag All]    │
                    ╰─────────────────────────────────────────────╯
```

**Sizing Rules:**
| Text Length | Bubble Width | Max Height | Behavior |
|-------------|--------------|------------|----------|
| 1-50 chars | 180px min | 60px | Compact, single line |
| 51-150 chars | 280px | 120px | Standard, 2-3 lines |
| 151-300 chars | 380px | 200px | Expanded, multi-line |
| 300+ chars | 420px max | 300px | Scrollable content |

**Animation Behavior:**
- **Appear:** Bubble pops in with spring animation (200ms)
- **Expand:** Smooth resize transition (150ms ease-out)
- **Contract:** Gentle shrink when text reduces (150ms)
- **Dismiss:** Fade out + scale down (150ms)

**Contextual Guidance Examples:**
- **Reconciliation Page:** 
  ```
  👮‍♀️💬 "I see you're matching transactions. Want me to 
       auto-detect mirroring patterns? I found 3 potential 
       cases already!"
  ```
- **Entity Analysis Page:** 
  ```
  👮‍♀️💬 "Interesting! PT ABC and CV XYZ share the same 
       director. This forms a suspicious cluster. Should 
       I highlight the network?"
  ```
- **Dashboard:** 
  ```
  👮‍♀️💬 "Good morning! Your fraud ratio increased 5% this 
       week. The main contributor is personal diversions. 
       Want me to show the breakdown?"
  ```

**Technical Implementation:**
- React component: `FrenlyAI.tsx`
- State management for bubble visibility
- Animation library: Framer Motion
- Avatar: SVG or Lottie animation
- Speech synthesis option for accessibility

**Current Status:** ❌ Not Implemented (Planned - Phase 3 AI Integration)

---

## Implementation Status Matrix

| Page # | Proposed Name | Current Implementation | Status | Priority |
|--------|---------------|------------------------|--------|----------|
| 1 | Authentication/Login | Login.tsx | ✅ Complete | - |
| 2 | Case Management | CaseList.tsx | ✅ Complete | - |
| 2a | Case Detail | CaseDetail.tsx | ✅ Complete | - |
| 3 | Ingestion | Forensics.tsx | 🟡 Partial | High |
| 4 | Mapping | Consolidated into Ingestion | 🟡 Combined | High |
| 5 | Categorization | Categorization.tsx | ✅ Implemented | High |
| 6 | Reconciliation | Reconciliation.tsx | 🟡 Partial | Medium |
| 7 | Human Adjudication | AdjudicationQueue.tsx | ✅ Complete | - |
| 8 | Dashboard (Operational) | Dashboard.tsx | ✅ Complete | - |
| 9 | Visualization (Financial) | - | ❌ Missing | Medium |
| 10 | Final Summary | - | ❌ Missing | Low |
| - | Search Analytics | SearchAnalytics.tsx | ✅ Bonus | - |
| - | Semantic Search | SemanticSearch.tsx | ✅ Bonus | - |
| - | Settings | Settings.tsx | ✅ Complete | - |

**Legend:**
- ✅ Complete: Fully implemented
- 🟡 Partial: Core features exist but need UX alignment
- ❌ Missing: Not yet implemented

---

## II. Detailed Page Workflows

### Page 1: Authentication / Login

**Route:** `/login`  
**Component:** `Login.tsx`  
**Status:** ✅ Complete

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────┐
│                                            │
│     [Animated Background]                  │
│                                            │
│     ┌──────────────────┐                  │
│     │  [LOGO]          │                  │
│     │  Welcome Back    │                  │
│     │                  │                  │
│     │  [Email]         │                  │
│     │  [Password]      │                  │
│     │  [Login Button]  │                  │
│     │                  │                  │
│     │  Forgot Password?│                  │
│     └──────────────────┘                  │
│                                            │
│  [Feature Highlights Panel] →             │
└────────────────────────────────────────────┘
```

#### Current Implementation Features
- ✅ Split-screen layout (form left, branding right)
- ✅ Animated background blobs with glassmorphism
- ✅ `LoginForm` component with validation
- ✅ Error handling with `PageErrorBoundary`
- ✅ Premium visual design with gradient text
- ✅ Fully responsive

#### Design Requirements (Proposed)
- **Background:** Large, visually appealing abstract graphic hinting at data/connectivity
- **Login Card:** Clean, centered, semi-transparent
- **Footer Links:** "Forgot Password" and "Request Access"
- **Brand Identity:** Professional, modern, trustworthy

#### Alignment
The current implementation exceeds the proposed design with premium animations and glassmorphism effects. No changes needed.

---

### Page 2: Case Management Dashboard

**Route:** `/cases`  
**Component:** `CaseList.tsx`  
**Status:** ✅ Complete

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ [📋 Case Management Dashboard]           [@] [User]        │
├────────────────────────────────────────────────────────────┤
│ [➕ New Case]  [Filters: Status ▼] [Date: ▼] [🔍 Search] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Case List (Table/Card View)            │  Quick Stats   │
│  ┌──────────────────────────────────┐   │  ┌───────────┐ │
│  │ ID │ Status │ Priority │ Date   │   │  │Total: 142 │ │
│  ├───────────────────────────────────┤   │  │Open: 23   │ │
│  │...│ 🟢 Open │ High  │ 12/1     │   │  │Pending: 5 │ │
│  │...│ 🟡 Review│ Med  │ 12/2     │   │  │[Chart]    │ │
│  └──────────────────────────────────┘   │  └───────────┘ │
│                                                            │
│  [Pagination: ← 1 2 3 →]                                  │
└────────────────────────────────────────────────────────────┘
```

#### Current Implementation Features
- ✅ Paginated, sortable, filterable table (`CaseTable`)
- ✅ Real-time search with `CaseSearch` component
- ✅ Multi-criteria filters: status, risk, assignee (`CaseFilters`)
- ✅ Bulk selection with `BulkActions`
- ✅ WebSocket integration for live updates
- ✅ Responsive layout with glassmorphism

#### Design Requirements (Proposed)
- **Control Panel:** Filters, date picker, "Create New Case" button
- **Case List:** Scannable table/card view
  - Columns: Case ID, Status, Priority, Creation Date, Last Updated, Assigned User
  - Color-coded status tags (red/orange/green)
- **Quick Status Sidebar:** Persistent panel with metrics and charts

#### Alignment
Current implementation has all core features. **Missing:** Right sidebar with quick stats panel.

**Action Item:** Add `<QuickStatsSidebar />` component to the right side.

---

### Page 2a: Case Detail (Sub-view)

**Route:** `/cases/:id`  
**Component:** `CaseDetail.tsx`  
**Status:** ✅ Complete

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ ← Back to Cases                            [@] [User]      │
├────────────────────────────────────────────────────────────┤
│ [Case 45-A: Corporate Merger Data]    [Status: Active]    │
│ Risk: ████████░░ 87%                                       │
├────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Timeline] [Financials] [Evidence]     │
├──────────────────────────────┬─────────────────────────────┤
│                              │  Case Summary Card          │
│  Tab Content Area            │  ┌─────────────────────┐   │
│  (Dynamic based on tab)      │  │ ID: 45-A            │   │
│                              │  │ Owner: John Doe     │   │
│                              │  │ Status: Active      │   │
│                              │  │ Priority: High      │   │
│                              │  │ Created: 12/1/2025  │   │
│                              │  │                     │   │
│                              │  │ [Advance Stage]     │   │
│                              │  └─────────────────────┘   │
└──────────────────────────────┴─────────────────────────────┘
```

#### Current Implementation Features
- ✅ Tabbed interface (Overview, Graph, Timeline, Financials, Evidence)
- ✅ Subject profile header with risk score and status
- ✅ Keyboard shortcuts (1-5 for tab navigation)
- ✅ `EntityGraph` visualization
- ✅ `CaseOverview`, `CaseTimeline`, `CaseFinancials` components
- ✅ AI Insights panel in right sidebar
- ✅ Action buttons (Escalate, Approve)

#### Design Requirements (Proposed)
- **Case Summary Card:** Fixed left sidebar with metadata
- **Tabs:** Activity Log, Data Sources, Team & Comments

#### Alignment
Current implementation has tabs on top with right sidebar for actions/AI. Proposed has left sidebar summary.

**Action Item:** Consider layout refactor to move summary to persistent left column, or document current design as acceptable alternative.

---

### Page 4: Ingestion

**Route:** `/forensics` (Proposed: `/ingestion`)  
**Component:** `Forensics.tsx`  
**Status:** 🟡 Partial Implementation

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📥 New Data Ingestion]                                         [@] [User]     │
├────────────────────────────────────────────────────────────────────────────────┤
│  Timeline: ① Source → ② Upload → ③ Preview → ④ Process → ⑤ Ingest            │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Step 1: Source Selection                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ 📁 Files    │ │ 🗄️  Database │ │ 🔗 API      │ │ 📷 Media    │             │
│  │ CSV/Excel   │ │ Connection  │ │ Feed        │ │ Image/Video │             │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                                │
│  [Selected: Media Files]                                                       │
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                        │   │
│  │          ┌──────────────────────────────────────────┐                 │   │
│  │          │                                          │                 │   │
│  │          │     📷 🎥  Drag & Drop Zone              │                 │   │
│  │          │                                          │                 │   │
│  │          │     Drop images, videos, or documents    │                 │   │
│  │          │            or click to browse            │                 │   │
│  │          │                                          │                 │   │
│  │          └──────────────────────────────────────────┘                 │   │
│  │                                                                        │   │
│  │  Supported Formats:                                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │ 📊 Data:    CSV, JSON, XML, Excel (.xlsx, .xls)                 │  │   │
│  │  │ 📄 Docs:    PDF, Word (.docx), Scanned Documents                │  │   │
│  │  │ 📷 Images:  JPG, PNG, TIFF, BMP, HEIC, WebP, RAW formats        │  │   │
│  │  │ 🎥 Videos:  MP4, MOV, AVI, MKV, WebM, MPEG                      │  │   │
│  │  │ 🔊 Audio:   MP3, WAV, M4A (for transcription)                   │  │   │
│  │  └─────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  [Next: Preview & Process →]                                                   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### File Type Capabilities

**📷 Image File Processing:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│  IMAGE PROCESSING PIPELINE                                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Upload    │───▶│   OCR       │───▶│  Metadata   │───▶│  Analysis   │    │
│  │   Image     │    │  Extraction │    │  Extraction │    │  & Tagging  │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                                                │
│  Features:                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ ✓ OCR Text Extraction (Tesseract/Google Vision)                         │ │
│  │   - Receipt text → Expense amounts, vendor names, dates                  │ │
│  │   - Bank statements → Account numbers, balances, transactions            │ │
│  │   - Contracts → Key terms, signatures, dates                             │ │
│  │                                                                          │ │
│  │ ✓ EXIF Metadata Extraction                                               │ │
│  │   - GPS coordinates (photo location)                                     │ │
│  │   - Timestamp (when photo was taken)                                     │ │
│  │   - Device info (camera/phone model)                                     │ │
│  │   - Modification history (edited flag)                                   │ │
│  │                                                                          │ │
│  │ ✓ Forensic Analysis                                                      │ │
│  │   - Image tampering detection (ELA - Error Level Analysis)               │ │
│  │   - Duplicate detection (perceptual hashing)                             │ │
│  │   - Face detection (for identity verification)                           │ │
│  │   - Document type classification (receipt, invoice, statement)           │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**📄 PDF & Document Processing:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│  PDF/DOCUMENT PROCESSING PIPELINE                                              │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Upload    │───▶│   Text      │───▶│   Table     │───▶│  Structure  │    │
│  │   PDF/Doc   │    │  Extraction │    │  Detection  │    │  Analysis   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                                                │
│  Features:                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ ✓ Text Extraction                                                        │ │
│  │   - Native PDF text (PyMuPDF/pdfplumber)                                 │ │
│  │   - Scanned PDF → OCR fallback                                           │ │
│  │   - Multi-language support                                                │ │
│  │   - Handwriting recognition (for forms)                                   │ │
│  │                                                                          │ │
│  │ ✓ Table & Structure Detection                                            │ │
│  │   - Financial tables → Structured data                                    │ │
│  │   - Invoice line items extraction                                         │ │
│  │   - Bank statement parsing                                                │ │
│  │   - Form field extraction                                                 │ │
│  │                                                                          │ │
│  │ ✓ Document Intelligence                                                   │ │
│  │   - Document type classification (invoice, contract, statement, receipt) │ │
│  │   - Key-value pair extraction (dates, amounts, parties)                   │ │
│  │   - Signature detection and location                                      │ │
│  │   - Stamp/seal detection                                                  │ │
│  │                                                                          │ │
│  │ ✓ Forensic Document Analysis                                              │ │
│  │   - PDF metadata extraction (author, creation date, software used)        │ │
│  │   - Modification history detection                                        │ │
│  │   - Hidden text/layer detection                                           │ │
│  │   - Document comparison (diff between versions)                           │ │
│  │   - Digital signature verification                                        │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**🎥 Video File Processing:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│  VIDEO PROCESSING PIPELINE                                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Upload    │───▶│   Frame     │───▶│   Audio     │───▶│  Timeline   │    │
│  │   Video     │    │  Extraction │    │ Transcribe  │    │  Indexing   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                                                │
│  Features:                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ ✓ Key Frame Extraction                                                   │ │
│  │   - Scene change detection                                               │ │
│  │   - Document/screen captures                                             │ │
│  │   - Face captures at regular intervals                                   │ │
│  │   - Timestamp overlay preservation                                       │ │
│  │                                                                          │ │
│  │ ✓ Audio Transcription (Whisper/Google Speech)                            │ │
│  │   - Full transcript with timestamps                                      │ │
│  │   - Speaker diarization (who said what)                                  │ │
│  │   - Keyword flagging (amounts, names, suspicious phrases)                │ │
│  │                                                                          │ │
│  │ ✓ Video Metadata                                                         │ │
│  │   - Duration, resolution, codec                                          │ │
│  │   - Creation/modification dates                                          │ │
│  │   - GPS if available (dashcam, phone video)                              │ │
│  │                                                                          │ │
│  │ ✓ Evidence Tagging                                                       │ │
│  │   - Searchable timeline with thumbnails                                  │ │
│  │   - Bookmark suspicious segments                                         │ │
│  │   - Chain of custody tracking                                            │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Media Preview Interface

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  MEDIA PREVIEW & EXTRACTION                                                    │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Uploaded: receipt_march_2024.jpg                                             │
│  ┌────────────────────────────────┬────────────────────────────────────────┐  │
│  │                                │  📋 EXTRACTED DATA                     │  │
│  │   ┌────────────────────────┐  │                                        │  │
│  │   │                        │  │  OCR Results:                          │  │
│  │   │    [IMAGE PREVIEW]     │  │  ├─ Vendor: "ACME Supplies Inc"        │  │
│  │   │                        │  │  ├─ Amount: $1,234.56                  │  │
│  │   │    📷 receipt.jpg      │  │  ├─ Date: March 15, 2024               │  │
│  │   │                        │  │  ├─ Tax: $98.76                        │  │
│  │   │                        │  │  └─ Receipt #: INV-2024-0892          │  │
│  │   └────────────────────────┘  │                                        │  │
│  │                                │  📍 Location Metadata:                 │  │
│  │   [🔍 Zoom] [↻ Rotate]        │  ├─ GPS: 37.7749° N, 122.4194° W       │  │
│  │   [📐 Enhance] [🎨 Filters]   │  ├─ Address: San Francisco, CA         │  │
│  │                                │  └─ Captured: 2024-03-15 14:32:18     │  │
│  │                                │                                        │  │
│  │                                │  ⚠️ FORENSIC FLAGS:                    │  │
│  │                                │  └─ ✅ No tampering detected           │  │
│  │                                │                                        │  │
│  └────────────────────────────────┴────────────────────────────────────────┘  │
│                                                                                │
│  [✓ Confirm Extraction] [✎ Edit Values] [🗑️ Reject] [→ Next File]            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Video Timeline Interface

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  VIDEO EVIDENCE VIEWER                                                         │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  surveillance_office_2024-03-15.mp4  [Duration: 02:34:15]                     │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                        │   │
│  │                    [VIDEO PLAYER - 1920x1080]                         │   │
│  │                                                                        │   │
│  │                         ▶️ 00:15:32 / 02:34:15                         │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  Timeline with Key Frames:                                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │ ▼        ▼    ⚠️▼        ▼            ⚠️▼        ▼                    │   │
│  │ ┌──┐    ┌──┐  ┌──┐     ┌──┐         ┌──┐     ┌──┐                     │   │
│  │ │░░│    │░░│  │🔴│     │░░│         │🔴│     │░░│                     │   │
│  │ └──┘    └──┘  └──┘     └──┘         └──┘     └──┘                     │   │
│  │ 0:00   15:32  23:45   45:00        1:12:00  1:45:00      ──────▶ 2:34 │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
│  🔴 Flagged Segments (2):                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ [23:45] Document exchange detected - Face #2 hands paper to Face #1     │ │
│  │ [1:12:00] Cash counting detected - Amount estimate: $5,000-$10,000      │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  📝 Transcript Search: [________________________] [Search]                    │
│                                                                                │
│  [📌 Bookmark] [✂️ Clip Segment] [📷 Export Frame] [📄 Full Transcript]       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Supported File Types Summary

| Category | Extensions | Processing | Output |
|----------|------------|------------|--------|
| **Data Files** | CSV, JSON, XML, XLSX, XLS | Schema detection, validation | Structured records |
| **Documents** | PDF, DOCX, TXT | Text extraction, OCR | Searchable text |
| **Images** | JPG, PNG, TIFF, BMP, HEIC, WebP | OCR, EXIF, forensics | Extracted data + metadata |
| **Videos** | MP4, MOV, AVI, MKV, WebM | Frame extraction, transcription | Timeline + transcript |
| **Audio** | MP3, WAV, M4A | Transcription, speaker ID | Searchable transcript |

#### Current Implementation Features

- ✅ File upload with drag-and-drop (`UploadZone`)
- ✅ Real-time progress tracking via WebSocket (`ProcessingPipeline`)
- ✅ CSV import wizard (`CSVWizard`)
- ✅ Forensic analysis results display (`ForensicResults`)
- ✅ Upload history (`UploadHistory`)
- ✅ Metadata extraction and OCR

#### Design Requirements (Proposed)

- **Step-by-step guided process:**
  1. Source selection (File/Database/API/Media)
  2. Upload/Connect interface
  3. Media preview with extracted data
  4. Validation and confirmation
  5. "Start Ingestion" action

#### Action Items

1. Add stepper/timeline component showing progress through stages
2. Implement source type selection (File/DB/API/Media)
3. Add data preview table before final ingestion
4. Rename route from `/forensics` to `/ingestion`
5. Keep forensic analysis as a sub-feature
6. **NEW: Implement image processing pipeline**
   - Integrate Tesseract/Google Vision for OCR
   - Add EXIF metadata extraction library
   - Implement Error Level Analysis for tampering detection
7. **NEW: Implement video processing pipeline**
   - Integrate FFmpeg for frame extraction
   - Add Whisper/Speech-to-Text for transcription
   - Build timeline viewer component with thumbnails
8. **NEW: Media evidence management**
   - Chain of custody logging
   - Segment bookmarking and clipping
   - Face detection and tagging

#### Backend API Requirements

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/ingest/upload` | POST | Upload any file type |
| `/api/v1/ingest/image/ocr` | POST | Extract text from image |
| `/api/v1/ingest/image/metadata` | GET | Get EXIF data |
| `/api/v1/ingest/image/forensics` | POST | Run tampering detection |
| `/api/v1/ingest/video/frames` | POST | Extract key frames |
| `/api/v1/ingest/video/transcribe` | POST | Transcribe audio track |
| `/api/v1/ingest/video/clip` | POST | Export video segment |

---

### Page 4b: Mapping

**Route:** `/mapping` (Proposed)  
**Component:** Not yet implemented  
**Status:** ❌ Missing

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ [🗺️  Data Mapping Definition]              [@] [User]      │
├────────────────────────────────────────────────────────────┤
│  Source Fields              Target Fields (Data Model)     │
├──────────────────────────┬─────────────────────────────────┤
│ Detected Fields:         │ System Fields:                  │
│                          │                                 │
│ ☐ first_name    STRING   ┊────→ ☑ full_name               │
│ ☐ last_name     STRING   ┊─┘                               │
│ ☐ birth_date    DATE     ┊────→ ☑ date_of_birth           │
│ ☐ ssn           STRING   ┊────→ ☑ tax_id                   │
│ ☐ addr_line1    STRING   │     ☐ address                   │
│ ☐ addr_line2    STRING   │     ☐ city                      │
│ ☐ city          STRING   │     ☐ state                     │
│                          │     ☐ zip_code                  │
│ Sample Values:           │                                 │
│ John, Smith, 1980-05-15  │                                 │
└──────────────────────────┴─────────────────────────────────┘
│ Transformation Panel (Selected: full_name)                 │
│ Formula: CONCAT(first_name, ' ', last_name)                │
│ [Save Mapping] [Test Transform] [Clear]                    │
└────────────────────────────────────────────────────────────┘
```

#### Proposed Features
- **Two-column layout:** Source fields (left) vs. Target fields (right)
- **Drag-and-drop mapping:** Visual lines connecting fields
- **Field metadata:** Data type, sample values shown
- **Transformation panel:** Define operations (concat, format, regex)
- **Validation:** Real-time checking of mapping completeness

#### Integration Points
- **Input:** Ingested data schema from Page 3
- **Output:** Mapping configuration for Page 5 (Reconciliation)

**Action Items:**
1. Create `Mapping.tsx` page component
2. Implement drag-and-drop library (e.g., `react-dnd`, `dnd-kit`)
3. Build `FieldMapper` component
4. Add transformation editor with formula support
5. Create API endpoints: `/api/v1/mapping/*`

---

### Page 5: Categorization

**Route:** `/categorization`
**Component:** `TransactionCategorization.tsx`
**Status:** ❌ Missing

#### Design Specification

**Layout:**

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏷️ Transaction Categorization           [⬇ Import Rules] [✚ New Rule] [Save]│
│ ─────────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  🔍 [ Search transactions...       ]    Filter: [All Amounts ▼] [Uncategorized ▼]│
│                                                                             │
│  ┌─────────────────────────────────────┐ ┌──────────────────────────────────┐│
│  │ 🤖 AI SUGGESTION                    │ │ ⚡ QUICK RULES                   ││
│  │ Found 15 recurring "Uber" rides.    │ │ If 'STARBUCKS' → 'Meals'         ││
│  │ [Apply 'Travel' Category to All?]   │ │ If 'AWS' → 'Software'            ││
│  └─────────────────────────────────────┘ └──────────────────────────────────┘│
│                                                                             │
│  ┌──┬────────────┬────────────────────────────┬─────────────┬──────────────┐│
│  │☐ │ DATE       │ DESCRIPTION                │ AMOUNT      │ CATEGORY     ││
│  ├──┼────────────┼────────────────────────────┼─────────────┼──────────────┤│
│  │☑ │ 2024-10-05 │ UBER *TRIP ID:8842         │ $ 24.50     │ 🚗 Travel [▼]││
│  │☐ │ 2024-10-06 │ STARBUCKS #2204            │ $ 8.40      │ ☕ Meals  [▼]││
│  │☐ │ 2024-10-06 │ DIGITALOCEAN *HOSTING      │ $ 45.00     │ 💻 IT/Ops [▼]││
│  └──┴────────────┴────────────────────────────┴─────────────┴──────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Proposed Features
- **Smart Classification:** AI matching based on vendor history
- **Rule Engine:** User-defined "If/Then" logic
- **Bulk Split:** Split transactions into multiple categories
- **Project Tagging:** Link expenses to Case IDs directly

#### Integration Points
- **Input:** Raw transactions from Page 4 (Ingestion)
- **Output:** Categorized records for Page 6 (Reconciliation)

**Action Items:**
1. Create `TransactionCategorization.tsx`
2. Implement Rule Engine (Regex/String match)
3. Integrate AI Suggestion API

---

### Page 6: Reconciliation

**Route:** `/reconciliation`  
**Component:** `Reconciliation.tsx`  
**Status:** 🟡 Partial Implementation

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [🔄 Bank Statement ↔ Expense Reconciliation]                    [@] [User]     │
├────────────────────────────────────────────────────────────────────────────────┤
│ Case: PROJECT-2024-001  │  Period: Jan 2024 - Mar 2024  │ [⚙️ Config] [▶️ Run] │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  🏦 BANK ACCOUNTS LOADED (3 of 5 known accounts)              [+ Add Account] │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ ☑ BCA **** 4589      │ Complete    │ Rp 2,450,000,000 │ 145 trans. │ ✅  │ │
│  │ ☑ Mandiri **** 7823  │ Partial     │ Rp 890,000,000   │ 67 trans.  │ ⚠️  │ │
│  │ ☑ BNI **** 1256      │ Complete    │ Rp 1,200,000,000 │ 89 trans.  │ ✅  │ │
│  │ ☐ BRI **** 9012      │ Missing     │ ?                │ -          │ 🔴  │ │
│  │ ☐ CIMB **** 3456     │ Missing     │ ?                │ -          │ 🔴  │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ⚠️ WARNING: 2 accounts missing data. Reconciliation may be incomplete.       │
│  [🔮 Enable Simulation Mode] to estimate missing transactions                  │
│                                                                                │
│  Match Summary:  ████████████░░░░ 78% Matched  │  ⚠️ 15 Unmatched  │  🔴 8 Flags │
│                                                                                │
├───────────────────────────────────┬────────────────────────────────────────────┤
│  🏦 BANK STATEMENTS (LEFT)        │  📋 EXPENSES (RIGHT)                       │
├───────────────────────────────────┼────────────────────────────────────────────┤
│                                   │                                            │
│  Filter: [All Banks ▼]            │  Source: Expense Reports + Invoices        │
│  Combined Balance: Rp 4.54B       │  Total Claimed: Rp 4,380,000,000           │
│  ─────────────────────────────    │  ──────────────────────────────────        │
│                                   │                                            │
│  📅 Jan 15  -Rp 50,000,000   ═══╗ │ ╔═══  Invoice #INV-001  Rp 50,000,000      │
│     🏦 BCA   PT Maju Jaya    ║║║ │ ║║║   PT Maju Jaya - Materials             │
│            ✅ MATCHED        ═══╝ │ ╚═══  ✅ MATCHED                           │
│                                   │                                            │
│  📅 Jan 15  -Rp 50,000,000   ═══╗ │ ╔═══  Invoice #INV-001  Rp 50,000,000      │
│            PT Maju Jaya      ║║║ │ ║║║   PT Maju Jaya - Materials             │
│            ✅ MATCHED        ═══╝ │ ╚═══  ✅ MATCHED                           │
│                                   │                                            │
│  📅 Jan 18  -Rp 25,000,000   ═══╗ │ ╔═══  Invoice #INV-002  Rp 25,500,000,000      │
│            Transfer Out      ║▒║ │ ║▒║   PT Sumber Makmur - Transport         │
│            ⚠️ PARTIAL        ═══╝ │ ╚═══  ⚠️ AMOUNT MISMATCH (+Rp 500,000)    │
│                                   │                                            │
│  📅 Jan 22  -Rp 15,000,000       │       ❌ NO MATCHING EXPENSE                │
│            Transfer to Personal  │       🔴 SUSPICIOUS: Personal Account      │
│            🔴 UNMATCHED          │                                            │
│                                   │                                            │
│  📅 Jan 25  -Rp 75,000,000   ═══╗ │ ╔═══  Invoice #INV-003  Rp 75,000,000      │
│            PT Konstruksi ABC ║║║ │ ║║║   PT Konstruksi ABC - Phase 1          │
│            ✅ MATCHED        ═══╝ │ ╚═══  ✅ MATCHED                           │
│                                   │                                            │
│                                   │       Invoice #INV-004  Rp 30,000,000      │
│  ❓ NO BANK TRANSACTION          │       PT Supplier X - Equipment            │
│                                   │       🔴 PHANTOM EXPENSE (No withdrawal)   │
│                                   │                                            │
│  [Load More Statements]           │  [Load More Expenses]                      │
│                                   │                                            │
├───────────────────────────────────┴────────────────────────────────────────────┤
│                                                                                │
│  🔍 RECONCILIATION ACTIONS                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ [🔗 Link Selected]  [🔓 Unlink]  [📝 Add Note]  [🚩 Flag for Review]     │ │
│  │ [📊 Export Matched] [📋 Export Unmatched] [➡️ Send to Adjudication]      │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Matching Rules Configuration

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  ⚙️ RECONCILIATION CONFIGURATION                                               │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Matching Criteria:                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ ☑ Amount Match      Tolerance: [±2%] or [±Rp 100,000]                    │ │
│  │ ☑ Date Match        Window: [±3 days]                                    │ │
│  │ ☑ Vendor Name       Fuzzy Match: [85%] similarity                        │ │
│  │ ☐ Reference Number  Exact match required                                 │ │
│  │ ☐ Account Category  Must match expense category                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  Fraud Detection Flags:                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ ☑ Flag transfers to personal accounts                                    │ │
│  │ ☑ Flag round-number transactions (e.g., exactly Rp 100,000,000)          │ │
│  │ ☑ Flag duplicate expense claims                                          │ │
│  │ ☑ Flag expenses without bank withdrawal (phantom expenses)               │ │
│  │ ☑ Flag same-day in/out transactions (mirroring)                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [Apply Configuration] [Save as Template] [Reset to Default]                   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### View Toggle & Matched Pool

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  📋 VIEW OPTIONS                                                               │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Show:  [●] Unmatched Only   [○] All Transactions   [○] Flagged Only          │
│                                                                                │
│  ☑ Auto-hide matched after 3 seconds     ☑ Collapse matched to pool           │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│  ✅ MATCHED TRANSACTIONS POOL (42 items)                          [▼ Expand]  │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  Summary: 42 matched  │  Total: Rp 1,850,000,000  │  100% confidence     │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [Show All Matched] [Export Matched CSV] [Verify Random Sample]                │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘

┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│  ✅ MATCHED POOL (Expanded View)                                   [▲ Hide]   │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ Date       │ Bank Statement          │ Expense                │ Conf.   │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │ Jan 15     │ -Rp 50,000,000          │ INV-001 Rp 50,000,000  │ 100% ✓  │ │
│  │ Jan 25     │ -Rp 75,000,000          │ INV-003 Rp 75,000,000  │ 100% ✓  │ │
│  │ Jan 28     │ -Rp 120,000,000         │ INV-005 Rp 120,000,000 │ 100% ✓  │ │
│  │ Feb 02     │ -Rp 45,000,000          │ INV-007 Rp 45,000,000  │ 98%  ✓  │ │
│  │ ...        │ (38 more)               │                        │         │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [🔓 Unmatch Selected] [📝 Add Bulk Note] [📊 Export to Excel]                 │
│                                                                                │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

#### Simulation Mode (Incomplete Bank Data)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  🔮 SIMULATION MODE - Estimating Missing Transactions             [❌ Disable] │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ⚠️ Active: Simulating transactions for 2 missing bank accounts               │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  📊 DATA COMPLETENESS ANALYSIS                                           │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Period: Jan 2024 - Mar 2024                                             │ │
│  │                                                                          │ │
│  │  Account          │ Status   │ Coverage │ Gap Analysis                  │ │
│  │  ────────────────────────────────────────────────────────────────────    │ │
│  │  BCA **** 4589    │ Complete │ 100%     │ No gaps                       │ │
│  │  Mandiri **** 7823│ Partial  │ 67%      │ Feb 15-28 missing (13 days)   │ │
│  │  BNI **** 1256    │ Complete │ 100%     │ No gaps                       │ │
│  │  BRI **** 9012    │ Missing  │ 0%       │ Full period missing           │ │
│  │  CIMB **** 3456   │ Missing  │ 0%       │ Full period missing           │ │
│  │                                                                          │ │
│  │  Overall Coverage: ████████░░░░░░░░ 53%                                  │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  🧮 SIMULATED TRANSACTIONS                                               │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Based on: Expense claims + Historical patterns + Vendor relationships   │ │
│  │                                                                          │ │
│  │  ~ ESTIMATED (BRI **** 9012) ~                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 📅 ~Jan 20  -Rp 85,000,000   ← INV-008 (PT Konstruksi XYZ)       │ │ │
│  │  │              Confidence: 78%  │  Basis: Recurring vendor payment  │ │ │
│  │  │              [✓ Accept Estimate] [✗ Reject] [? Mark Unknown]      │ │ │
│  │  ├────────────────────────────────────────────────────────────────────┤ │ │
│  │  │ 📅 ~Feb 05  -Rp 120,000,000  ← INV-012 (PT Sumber Daya)          │ │ │
│  │  │              Confidence: 65%  │  Basis: Invoice date correlation  │ │ │
│  │  │              [✓ Accept Estimate] [✗ Reject] [? Mark Unknown]      │ │ │
│  │  ├────────────────────────────────────────────────────────────────────┤ │ │
│  │  │ 📅 ~Feb 28  -Rp 45,000,000   ← INV-015 (Personal Account)        │ │ │
│  │  │              Confidence: 92%  │  Basis: Monthly salary pattern    │ │ │
│  │  │              🔴 HIGH RISK: Amount matches known diversion pattern │ │ │
│  │  │              [✓ Accept Estimate] [✗ Reject] [🚩 Flag for Review]  │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  ~ ESTIMATED (CIMB **** 3456) ~                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 📅 ~Jan 10  -Rp 200,000,000  ← INV-006 (PT Maju Sejahtera)       │ │ │
│  │  │              Confidence: 71%  │  Basis: Large contract payment    │ │ │
│  │  │              ⚠️ No historical data for this vendor                │ │ │
│  │  │              [✓ Accept Estimate] [✗ Reject] [? Mark Unknown]      │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  Total Simulated: 4 transactions │ Rp 450,000,000 │ Avg Confidence: 76% │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📊 Export Simulation Report] [🔄 Recalculate] [📋 Request Missing Statements]│
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Suspicious Patterns Panel (AI-Enhanced)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  🚨 SUSPICIOUS PATTERNS DETECTED                              [🤖 AI Learning] │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  🔄 MIRRORED TRANSACTIONS (Round-Trip)                    [5 detected]  │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Pattern: Money Out → Same/Related Account → Money Back                  │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ #1  Jan 15: -Rp 100M → PT ABC → Jan 18: +Rp 95M ← PT ABC Holdings │ │ │
│  │  │     ⏱️ 3 days apart  │  💰 Rp 5M "fee"  │  🔴 HIGH RISK           │ │ │
│  │  │     [Mark as Fraud] [Mark as Legitimate] [Add to AI Training]     │ │ │
│  │  ├────────────────────────────────────────────────────────────────────┤ │ │
│  │  │ #2  Feb 02: -Rp 50M → John Doe → Feb 02: +Rp 50M ← JD Consulting  │ │ │
│  │  │     ⏱️ Same day  │  💰 Exact amount  │  🔴 HIGH RISK              │ │ │
│  │  │     [Mark as Fraud] [Mark as Legitimate] [Add to AI Training]     │ │ │
│  │  ├────────────────────────────────────────────────────────────────────┤ │ │
│  │  │ #3  Feb 15: -Rp 200M → Vendor X → Feb 28: +Rp 180M ← Vendor X     │ │ │
│  │  │     ⏱️ 13 days  │  💰 Rp 20M retained  │  🟡 MEDIUM RISK          │ │ │
│  │  │     [Mark as Fraud] [Mark as Legitimate] [Add to AI Training]     │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  🤖 AI Insight: 78% match to known kickback patterns                    │ │
│  │  📊 Similar cases in database: 23 confirmed fraud, 4 legitimate         │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  👤 PERSONAL EXPENSE DIVERSION                            [8 detected]  │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Pattern: Project funds → Personal accounts / Family members            │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ Recipient          │ Frequency  │ Total Amount    │ Risk Level   │ │ │
│  │  ├────────────────────────────────────────────────────────────────────┤ │ │
│  │  │ Budi Santoso (Self)│ 12x/month  │ Rp 180,000,000  │ 🔴 HIGH      │ │ │
│  │  │ Siti Rahayu (Wife) │ 4x/month   │ Rp 45,000,000   │ 🔴 HIGH      │ │ │
│  │  │ CV Maju Bersama*   │ 6x/month   │ Rp 120,000,000  │ 🟡 MEDIUM    │ │ │
│  │  │ * Same address as project manager                                 │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  🤖 AI Learned Patterns:                                                │ │
│  │  ├─ "Operational costs" on weekends → 92% personal                     │ │
│  │  ├─ Round amounts (Rp 10M, 50M, 100M) → 85% suspicious                 │ │
│  │  ├─ End-of-month transfers to family → 89% diversion                   │ │
│  │  └─ Same-name variations (PT ABC / CV ABC) → 76% related party         │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### AI Learning & Pattern Training

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  🤖 AI FRAUD DETECTION MODEL                                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Training Status: ████████████████████░░░░ 82% (1,247 samples)                │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  PATTERN LIBRARY                                                         │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Category              │ Learned Patterns │ Accuracy │ Last Updated     │ │
│  │  ─────────────────────────────────────────────────────────────────────  │ │
│  │  🔄 Mirrored Trans.    │ 47 patterns      │ 94.2%    │ 2 hours ago      │ │
│  │  👤 Personal Diversion │ 83 patterns      │ 91.7%    │ 1 hour ago       │ │
│  │  💰 Inflated Expenses  │ 62 patterns      │ 88.5%    │ 3 hours ago      │ │
│  │  📄 Phantom Invoices   │ 29 patterns      │ 96.1%    │ 5 hours ago      │ │
│  │  🏢 Related Party      │ 51 patterns      │ 87.3%    │ 30 mins ago      │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  Recent Feedback Loop:                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  ✅ User confirmed: "Weekend Rp 10M to personal" → Fraud (added)        │ │
│  │  ✅ User confirmed: "Monthly PT ABC invoice" → Legitimate (excluded)    │ │
│  │  ⏳ Pending review: 3 new patterns awaiting confirmation                 │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📊 View Full Pattern Library] [🔄 Retrain Model] [📤 Export Training Data]  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Real Cashflow Calculator (Forensic Proof)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  💰 REAL CASHFLOW ANALYSIS                                    [📊 Export PDF] │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                          │ │
│  │  📈 REPORTED CASHFLOW (Inflated)                                        │ │
│  │  ════════════════════════════════════════════════════════════════════   │ │
│  │                                                                          │ │
│  │     Total Expenses Claimed:              Rp  5,450,000,000              │ │
│  │     Bank Statements Total:               Rp  4,540,000,000              │ │
│  │                                          ─────────────────              │ │
│  │     Reported Project Cashflow:           Rp  5,450,000,000              │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                          │ │
│  │  ➖ DEDUCTIONS (Fraudulent Flows)                                        │ │
│  │  ════════════════════════════════════════════════════════════════════   │ │
│  │                                                                          │ │
│  │  🔄 Mirrored Transactions (Round-Trip):                                  │ │
│  │     ├─ 5 detected transactions                                          │ │
│  │     ├─ Total cycled amount:              Rp    850,000,000              │ │
│  │     └─ Net "fees" extracted:             Rp     42,500,000              │ │
│  │                                                                          │ │
│  │  👤 Personal Expense Diversions:                                         │ │
│  │     ├─ 8 detected recipients                                            │ │
│  │     ├─ Self/Family transfers:            Rp    345,000,000              │ │
│  │     └─ Related-party payments:           Rp    180,000,000              │ │
│  │                                                                          │ │
│  │  📄 Phantom Expenses (No Bank Record):                                   │ │
│  │     └─ Claimed but not withdrawn:        Rp    275,000,000              │ │
│  │                                                                          │ │
│  │  💸 Inflated Amounts (Overstated):                                       │ │
│  │     └─ Difference from actual:           Rp    128,000,000              │ │
│  │                                          ─────────────────              │ │
│  │     TOTAL FRAUDULENT FLOWS:              Rp  1,820,500,000              │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                          │ │
│  │  ✅ REAL CASHFLOW (Actual Project Spending)                              │ │
│  │  ════════════════════════════════════════════════════════════════════   │ │
│  │                                                                          │ │
│  │     Reported Cashflow:                   Rp  5,450,000,000              │ │
│  │     − Mirrored Transactions:             Rp    850,000,000              │ │
│  │     − Personal Diversions:               Rp    525,000,000              │ │
│  │     − Phantom Expenses:                  Rp    275,000,000              │ │
│  │     − Inflated Amounts:                  Rp    128,000,000              │ │
│  │                                          ═════════════════              │ │
│  │     REAL PROJECT CASHFLOW:               Rp  3,672,000,000   ✓         │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  📊 FRAUD RATIO:  33.4% of claimed expenses are fraudulent        │ │ │
│  │  │                                                                    │ │ │
│  │  │  Reported ████████████████████████████████░░░░░░░░░░░░  Rp 5.45B  │ │ │
│  │  │  Real     ██████████████████████░░░░░░░░░░░░░░░░░░░░░░  Rp 3.67B  │ │ │
│  │  │           ▲▲▲▲▲▲▲▲▲▲▲▲ Fraud                                      │ │ │
│  │  │                                                                    │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  📋 FORMULA BREAKDOWN                                                    │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │   Real Cashflow = Reported Cashflow                                      │ │
│  │                   − Mirrored Transactions (fake circulation)             │ │
│  │                   − Personal Expenses (diverted funds)                   │ │
│  │                   − Phantom Expenses (never spent)                       │ │
│  │                   − Inflation (overstated amounts)                       │ │
│  │                                                                          │ │
│  │   This proves the ACTUAL money spent on the project vs. what was        │ │
│  │   claimed. The difference is evidence of potential fraud/embezzlement.  │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📄 Generate SAR Report] [📊 Export to Excel] [🖨️ Print Summary]            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Current Implementation Features
- ✅ Drag-and-drop transaction matching
- ✅ Auto-reconciliation with confidence threshold
- ✅ Display of expenses vs. bank transactions
- ✅ Manual match creation
- ✅ File upload for transaction data

#### Design Requirements (Proposed)
- **Configuration Panel:** Show match algorithms clearly
- **Results Overview:** Large KPI cards (Match Rate, New Records, Conflicts)
- **Conflict List:** Filterable table linking to Adjudication

#### Alignment
Current implementation focuses on manual drag-and-drop. Needs metrics dashboard and better conflict management.

**Action Items:**
1. Add KPI cards for match rate, new records, conflicts
2. Implement "Run Reconciliation" workflow with progress indicator
3. Add configuration panel for match algorithm settings
4. Create direct links from conflict list to Adjudication page
5. Improve visual hierarchy and information display

---

### Page 7b: Entity Link Analysis

> **Note:** This page is positioned after Dashboard (Page 7) in the navigation flow.

**Route:** `/entity-analysis`  
**Component:** `EntityLinkAnalysis.tsx`  
**Status:** ❌ Not Implemented

#### Purpose

Visualize and analyze relationships between entities (people, companies, bank accounts) to detect:
- Hidden ownership structures
- Shell company networks
- Related-party transactions
- Collusion patterns
- Circular money flows

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [🕸️ Entity Link Analysis]                              [@] [User] [📥 Export] │
├────────────────────────────────────────────────────────────────────────────────┤
│ Case: PROJECT-2024-001        Period: Jan-Mar 2024        [🔍 Search Entity]  │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Entity Types:  [✓] People  [✓] Companies  [✓] Bank Accounts  [ ] Addresses  │
│  Connections:   [✓] Payments  [✓] Ownership  [✓] Employment  [ ] Family      │
│                                                         [Apply Filters]       │
│                                                                                │
├─────────────────────────────────────────────────┬──────────────────────────────┤
│                                                 │  📋 ENTITY DETAILS           │
│           🕸️ RELATIONSHIP NETWORK               │  ────────────────────────── │
│                                                 │                              │
│                    ┌─────────┐                  │  Selected: PT ABC Holdings   │
│                    │ PROJECT │                  │  Type: Company (PT)          │
│                    │  FUND   │                  │  Risk: 🔴 HIGH               │
│                    └────┬────┘                  │                              │
│            ┌───────────┼───────────┐            │  ┌────────────────────────┐ │
│            ▼           ▼           ▼            │  │ Connections: 12        │ │
│      ┌─────────┐ ┌─────────┐ ┌─────────┐       │  │ Transactions: 47       │ │
│      │   BCA   │ │ Mandiri │ │   BNI   │       │  │ Total Flow: Rp 2.5B    │ │
│      │ ****4589│ │ ****7823│ │ ****1256│       │  └────────────────────────┘ │
│      └────┬────┘ └────┬────┘ └────┬────┘       │                              │
│           │           │           │             │  Ownership:                  │
│           ▼           ▼           ▼             │  ├─ Budi Santoso (40%)       │
│      ┌─────────┐ ┌─────────┐ ┌─────────┐       │  ├─ Siti Rahayu (35%)        │
│      │ PT ABC  │ │ CV XYZ  │ │PT Maju  │       │  └─ PT Holdings (25%)        │
│      │Holdings │◄═══════►│ Jaya   │            │                              │
│      └────┬────┘ └────┬────┘ └────┬────┘       │  🚩 Red Flags:               │
│           │     ╲     │     ╱     │             │  ├─ Same address as PM       │
│           │      ╲    │    ╱      │             │  ├─ Circular payments        │
│           ▼       ╲   ▼   ╱       ▼             │  └─ Family connections       │
│      ┌─────────┐  ┌─────────┐  ┌─────────┐     │                              │
│      │  Budi   │──│  Siti   │──│  Andi   │     │  [View All Transactions]     │
│      │(PM/Owner)  │ (Wife)  │  │(Brother)│     │  [Trace Money Flow]          │
│      └─────────┘  └─────────┘  └─────────┘     │  [Generate Report]           │
│                                                 │                              │
│  [🔍 Zoom] [↔️ Pan] [🎯 Focus] [📸 Screenshot]  │                              │
│                                                 │                              │
├─────────────────────────────────────────────────┴──────────────────────────────┤
│                                                                                │
│  🔗 CONNECTION SUMMARY                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ Total Entities: 24  │  Connections: 67  │  Clusters: 3  │  Isolated: 2   │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ⚠️ DETECTED PATTERNS                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🔴 Shell Company Network: PT ABC ↔ CV XYZ ↔ PT Maju (Same directors)    │ │
│  │ 🔴 Family Diversion: PM → Wife Account → Brother's Company (Rp 525M)     │ │
│  │ 🟡 Circular Flow: Project → PT ABC → CV XYZ → Project (Rp 850M)          │ │
│  │ 🟡 Shared Address: 3 companies at same location                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Entity Types & Visualization

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  ENTITY LEGEND                                                                 │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Node Types:                          Connection Types:                        │
│  ┌────────────────────────────┐       ┌────────────────────────────┐          │
│  │ 👤 Person (Circle)         │       │ ───── Payment (Solid)      │          │
│  │ 🏢 Company (Square)        │       │ ═════ Ownership (Double)   │          │
│  │ 🏦 Bank Account (Hexagon)  │       │ - - - Employment (Dashed)  │          │
│  │ 📍 Address (Diamond)       │       │ ····· Family (Dotted)      │          │
│  │ 📄 Document (Rectangle)    │       │ ━━━━━ Contract (Bold)      │          │
│  └────────────────────────────┘       └────────────────────────────┘          │
│                                                                                │
│  Risk Colors:                         Node Size = Transaction Volume           │
│  ┌────────────────────────────┐                                               │
│  │ 🟢 Low Risk (Clean)        │       Connection Thickness = Transaction $     │
│  │ 🟡 Medium Risk (Review)    │                                               │
│  │ 🔴 High Risk (Flagged)     │                                               │
│  │ ⬛ Blocked (Blacklisted)   │                                               │
│  └────────────────────────────┘                                               │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Deep Dive: Entity Card

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  🏢 PT ABC HOLDINGS                                          [❌ Close]       │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────────────────────────┬──────────────────────────────────────────┤
│  │ BASIC INFORMATION               │ RISK ASSESSMENT                          │
│  ├─────────────────────────────────┼──────────────────────────────────────────┤
│  │ Type: Perseroan Terbatas (PT)   │ Overall Risk: 🔴 HIGH (87/100)           │
│  │ Established: 2019-03-15         │                                          │
│  │ Business: General Trading       │ Risk Factors:                            │
│  │ NPWP: 01.234.567.8-901.000      │ ├─ Same address as PM: +25              │
│  │ NIB: 1234567890123              │ ├─ Family ownership: +20                 │
│  │                                 │ ├─ Shell company pattern: +30            │
│  │ Address:                        │ └─ Circular transactions: +12            │
│  │ Jl. Sudirman No. 123            │                                          │
│  │ Jakarta Selatan 12190           │ [View Risk Breakdown]                    │
│  │ ⚠️ Same as Project Manager home │                                          │
│  └─────────────────────────────────┴──────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ OWNERSHIP STRUCTURE                                                      │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Budi Santoso (40%)  ─────┐                                              │ │
│  │  ⚠️ Project Manager       │                                              │ │
│  │                           ├──► PT ABC Holdings                           │ │
│  │  Siti Rahayu (35%)  ──────┤                                              │ │
│  │  ⚠️ PM's Wife             │                                              │ │
│  │                           │                                              │ │
│  │  PT XYZ Holdings (25%) ───┘                                              │ │
│  │  ⚠️ Also owned by PM                                                     │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ TRANSACTION HISTORY                                                      │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │ Date       │ From/To           │ Amount         │ Type      │ Flag      │ │
│  │────────────────────────────────────────────────────────────────────────  │ │
│  │ 2024-01-15 │ ← Project Fund    │ Rp 500,000,000 │ Payment   │ 🟡        │ │
│  │ 2024-01-18 │ → CV XYZ          │ Rp 480,000,000 │ Transfer  │ 🔴 Mirror │ │
│  │ 2024-01-22 │ → Budi (Personal) │ Rp 15,000,000  │ Transfer  │ 🔴 Divert │ │
│  │ 2024-02-01 │ ← Project Fund    │ Rp 750,000,000 │ Payment   │ 🟡        │ │
│  │ 2024-02-05 │ → PT Maju Jaya    │ Rp 720,000,000 │ Transfer  │ 🔴 Mirror │ │
│  │────────────────────────────────────────────────────────────────────────  │ │
│  │ Total In: Rp 1,250,000,000  │  Total Out: Rp 1,215,000,000  │ Net: +35M │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [🔗 View All Connections] [💰 Trace Money] [📄 View Documents] [🚩 Flag]     │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Money Flow Trace

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  💰 MONEY FLOW TRACE: Rp 500,000,000 (Jan 15, 2024)                           │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ORIGIN                                                           DESTINATION │
│  ┌────────────┐                                                               │
│  │  PROJECT   │                                                               │
│  │   FUND     │                                                               │
│  │ (Source)   │                                                               │
│  └─────┬──────┘                                                               │
│        │ Rp 500M (Jan 15)                                                     │
│        ▼                                                                      │
│  ┌────────────┐                                                               │
│  │  PT ABC    │ ← "Construction Materials" (Invoice #001)                     │
│  │  Holdings  │                                                               │
│  └─────┬──────┘                                                               │
│        │ Rp 480M (Jan 18, 3 days later)                                       │
│        ▼                                                                      │
│  ┌────────────┐                                                               │
│  │   CV XYZ   │ ← "Subcontractor Fee" (No invoice found)                      │
│  │            │                                                               │
│  └─────┬──────┘                                                               │
│        │ Rp 460M (Jan 20, 2 days later)                                       │
│        ▼                                                                      │
│  ┌────────────┐                                                               │
│  │  PT Maju   │ ← "Consulting Services"                                       │
│  │   Jaya     │                                                               │
│  └─────┬──────┘                                                               │
│        │                                                                      │
│        ├──────► Rp 400M → Bank Mandiri **** 7823 (PM's Personal)              │
│        │        🔴 FINAL DESTINATION: Personal Account                        │
│        │                                                                      │
│        └──────► Rp 60M → "Operational Expenses" (No trace)                    │
│                 🟡 LOST: Cannot trace further                                 │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │  SUMMARY                                                                 │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │  Original Amount:     Rp 500,000,000                                     │ │
│  │  Reached Personal:    Rp 400,000,000 (80%)  🔴                           │ │
│  │  "Fees" Extracted:    Rp  40,000,000 ( 8%)  🟡                           │ │
│  │  Lost/Untraceable:    Rp  60,000,000 (12%)  ⚠️                           │ │
│  │  ─────────────────────────────────────────────────────────               │ │
│  │  VERDICT: Layered Money Laundering Pattern Detected                      │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📊 Export Flow Diagram] [📄 Generate Evidence Report] [📤 Send to Review]   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Cluster Detection

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  🎯 DETECTED CLUSTERS                                                         │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ CLUSTER 1: "Family Business Network"                    Risk: 🔴 HIGH   │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Members (6):                                                            │ │
│  │  👤 Budi Santoso (PM)  ──── 👤 Siti Rahayu (Wife)                         │ │
│  │         │                         │                                      │ │
│  │         ▼                         ▼                                      │ │
│  │  🏢 PT ABC Holdings        🏢 CV Siti Fashion                           │ │
│  │         │                                                                │ │
│  │         ▼                                                                │ │
│  │  🏢 PT XYZ Trading   ────  👤 Andi Santoso (Brother)                     │ │
│  │                                                                          │ │
│  │  Total Flow Through Cluster: Rp 2,450,000,000                           │ │
│  │  Connection Pattern: Star (Central: Budi Santoso)                        │ │
│  │                                                                          │ │
│  │  [View Cluster Detail] [Trace All Flows] [Generate Report]               │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ CLUSTER 2: "Shell Company Chain"                        Risk: 🔴 HIGH   │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  🏢 PT Alpha → 🏢 PT Beta → 🏢 PT Gamma → 🏢 PT Delta                     │ │
│  │                                                                          │ │
│  │  Pattern: Linear chain with pass-through transactions                    │ │
│  │  Same Directors: 3 of 4 companies                                        │ │
│  │  Same Address: 2 of 4 companies                                          │ │
│  │                                                                          │ │
│  │  [View Cluster Detail] [Trace All Flows] [Generate Report]               │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Action Items

1. Implement force-directed graph visualization (D3.js or vis.js)
2. Create entity data model with relationship types
3. Build cluster detection algorithm (connected components)
4. Implement money flow tracing with hop tracking
5. Add risk scoring for entities based on connections
6. Create PDF/PNG export for evidence reports
7. Build search and filter functionality

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/entity/graph/{case_id}` | GET | Get full entity graph |
| `/api/v1/entity/{entity_id}` | GET | Get entity details |
| `/api/v1/entity/{entity_id}/connections` | GET | Get entity connections |
| `/api/v1/entity/trace` | POST | Trace money flow |
| `/api/v1/entity/clusters/{case_id}` | GET | Get detected clusters |
| `/api/v1/entity/search` | POST | Search entities |
| `/api/v1/entity/export/graph` | POST | Export graph as image |

---

### Page 7: Human Adjudication

**Route:** `/adjudication`  
**Component:** `AdjudicationQueue.tsx`  
**Status:** ✅ Complete

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ [⚖️  Human Adjudication: Record 00123]     [@] [User]      │
├──────────┬──────────────────────────────┬──────────────────┤
│ Queue    │  Comparison View             │ Decision Panel   │
│ (50)     │                              │                  │
│          │  Source Data    System Data  │ ☐ Accept Source  │
│ ☑ 00123  │  ┌──────────┐  ┌──────────┐ │ ☐ Accept System  │
│ ☐ 00456  │  │Name:     │  │Name:     │ │ ☐ Merge Fields   │
│ ☐ 00789  │  │John Smith│  │J. Smith ⚠│ │ ☐ New Record     │
│          │  │          │  │          │ │                  │
│ [Score]  │  │DOB:      │  │DOB:      │ │ Notes:          │
│ 98% ⚠    │  │1980-05-15│  │05/15/80⚠│ │ ┌─────────────┐ │
│ 87%      │  │          │  │          │ │ │             │ │
│ 65%      │  │Tax ID:   │  │Tax ID:   │ │ └─────────────┘ │
│          │  │123-45-67 │  │123-45-67✓│ │                  │
│ [1 2 3 →]│  └──────────┘  └──────────┘ │ [Submit Decision]│
└──────────┴──────────────────────────────┴──────────────────┘
```

#### Current Implementation Features
- ✅ Three-column layout (Queue, Detail, AI Assistant)
- ✅ Alert list with selection
- ✅ Detailed alert card with decision interface
- ✅ AI reasoning display
- ✅ WebSocket notifications for real-time updates
- ✅ Pagination
- ✅ Keyboard shortcuts (A/R/E for decisions)

#### Design Requirements (Proposed)
- **Conflict List:** Compact navigation panel
- **Comparison View:** Side-by-side conflicting data with highlights
- **Decision Panel:** Clear action buttons and notes field

#### Alignment
Current implementation is excellent and matches proposed design closely. The "AI Assistant" panel serves a similar purpose to the "Decision Panel."

**Enhancement Opportunities:**
1. Add side-by-side comparison for conflicting fields (currently shows single alert card)
2. Implement field-level conflict highlighting
3. Add decision notes/justification persistence
4. Show conflict score more prominently

---

### Page 8: Dashboard (Forensic Investigation)

**Route:** `/dashboard` or `/` (default)  
**Component:** `Dashboard.tsx`  
**Status:** ✅ Complete (Needs Enhancement)

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📊 Forensic Investigation Dashboard]                       [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Filters: [Date Range ▼] [Case ▼] [Analyst ▼] [Risk Level ▼]  [🔍 Apply]       │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  📊 INVESTIGATION SUMMARY (Current Case: PROJECT-2024-001)              │  │
│  ├─────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                         │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │  │
│  │  │ 💰 Real vs   │ │ 🔴 Fraud     │ │ 🔄 Mirrored  │ │ 👤 Personal  │   │  │
│  │  │   Reported   │ │    Ratio     │ │ Transactions │ │  Diversions  │   │  │
│  │  │  ───────     │ │  ───────     │ │  ───────     │ │  ───────     │   │  │
│  │  │ Rp 3.67B /   │ │   33.4%      │ │   5 Cases    │ │   8 Recipients│   │  │
│  │  │    Rp 5.45B  │ │  ⬆️ +5.2%    │ │  Rp 850M     │ │   Rp 525M    │   │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │  │
│  │                                                                         │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │  │
│  │  │ 📄 Phantom   │ │ 🏦 Bank      │ │ 🕸️ Entity    │ │ ⚖️ Pending   │   │  │
│  │  │   Expenses   │ │  Coverage    │ │   Clusters   │ │  Adjudication│   │  │
│  │  │  ───────     │ │  ───────     │ │  ───────     │ │  ───────     │   │  │
│  │  │  Rp 275M     │ │   53%        │ │  3 Networks  │ │   15 Items   │   │  │
│  │  │  (12 items)  │ │  (3/5 accts) │ │  24 Entities │ │  🔥 Priority │   │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌──────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │ 💰 CASHFLOW COMPARISON           │ │ 🚨 FRAUD BY CATEGORY             │   │
│  ├──────────────────────────────────┤ ├──────────────────────────────────┤   │
│  │                                  │ │                                  │   │
│  │  Reported ████████████████ 5.45B │ │  Mirrored     ████████ Rp 850M  │   │
│  │  Real     ██████████░░░░░ 3.67B  │ │  Personal     █████ Rp 525M     │   │
│  │           ▲▲▲▲▲▲ Fraud 1.78B     │ │  Phantom      ███ Rp 275M       │   │
│  │                                  │ │  Inflated     ██ Rp 128M        │   │
│  │  [View Breakdown →]              │ │  [View All →]                   │   │
│  └──────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                │
│  ┌──────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │ 🕸️ TOP RISK ENTITIES             │ │ 📈 INVESTIGATION PROGRESS        │   │
│  ├──────────────────────────────────┤ ├──────────────────────────────────┤   │
│  │                                  │ │                                  │   │
│  │  1. PT ABC Holdings    🔴 87/100 │ │  Ingestion     ████████████ 100% │   │
│  │  2. Budi Santoso (PM)  🔴 82/100 │ │  Reconciliation████████░░░  78%  │   │
│  │  3. CV XYZ Trading     🔴 76/100 │ │  Entity Analysis ██████░░░░  60% │   │
│  │  4. Siti Rahayu        🟡 65/100 │ │  Adjudication  ████░░░░░░░  35%  │   │
│  │  5. PT Maju Jaya       🟡 58/100 │ │  Report Ready  ░░░░░░░░░░░   0%  │   │
│  │                                  │ │                                  │   │
│  │  [View Entity Graph →]           │ │  Est. Completion: 3 days         │   │
│  └──────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ 🔔 RECENT ACTIVITY / ALERTS                                   [View All]│  │
│  ├─────────────────────────────────────────────────────────────────────────┤  │
│  │ 🔴 10:05  AI detected new mirroring pattern: PT ABC → CV XYZ (Rp 200M) │  │
│  │ 🟡 09:45  Bank statement gap detected: Mandiri Feb 15-28 missing        │  │
│  │ 🟢 09:30  Reconciliation matched 15 new transactions (confidence 98%)   │  │
│  │ 🔴 09:15  Personal expense flagged: PM → Wife account (Rp 45M)          │  │
│  │ 🟡 08:55  New cluster detected: "Shell Company Chain" (4 entities)      │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  [📤 Export Dashboard] [📄 Generate Summary Report] [⚙️ Customize Layout]      │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Updated KPI Tiles (Forensic Focus)

| KPI | Source | Description |
|-----|--------|-------------|
| Real vs Reported Cashflow | Real Cashflow Calculator | Shows actual vs claimed amounts |
| Fraud Ratio | Deduction Calculator | Percentage of fraudulent flows |
| Mirrored Transactions | Suspicious Patterns Panel | Round-trip money cycling |
| Personal Diversions | Personal Expense Detector | Funds to self/family/related |
| Phantom Expenses | Reconciliation | Claims with no bank record |
| Bank Coverage | Multi-Bank Tracker | Data completeness percentage |
| Entity Clusters | Entity Link Analysis | Detected networks/groups |
| Pending Adjudication | Human Adjudication Queue | Items needing review |

#### Current Implementation Features
- ✅ Key metrics cards (Active Cases, High Risk, Pending Reviews, System Load)
- ✅ Risk distribution chart (`RiskDistributionChart`)
- ✅ Weekly activity chart (`WeeklyActivityChart`)
- ✅ Recent activity feed (`RecentActivity`)
- ✅ Real-time updates via WebSocket
- ✅ Responsive grid layout

#### Enhancement Requirements
- ⬜ Add Real Cashflow comparison widget
- ⬜ Add Fraud by Category breakdown chart
- ⬜ Add Top Risk Entities list with scores
- ⬜ Add Investigation Progress tracker
- ⬜ Connect to Entity Link Analysis data
- ⬜ Connect to Reconciliation statistics
- ⬜ Add AI Alert stream (mirroring, patterns)
- ⬜ Add case-level filtering



---

### Page 9: Visualization (Financial) - NEW

**Route:** `/financial-visualization` (Proposed)  
**Component:** Not yet implemented  
**Status:** ❌ Missing

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ [📈 Financial Insight Visualization]       [@] [User]      │
├────────────────────────────────────────────────────────────┤
│  High-Level Status:                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ Cash Flow    │ │ Balance Sheet│ │ P&L YTD      │     │
│  │ ↑ +$2.4M     │ │ Ratio: 1.8:1 │ │ Net: $850K   │     │
│  │ (15% growth) │ │ ✓ Healthy    │ │ (12% margin) │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Interactive Balance Sheet Summary (Sankey/Treemap)│   │
│  │ [Visualization]                                    │   │
│  └────────────────────────────────────────────────────┘   │
├────────────────────────────────────────┬───────────────────┤
│  Expense Analysis:                     │ AI Explanation:   │
│                                        │                   │
│  ┌──────────────────────────────────┐ │ "The 35% spike   │
│  │ Monthly Expense Trend (24 mo)    │ │ in March is due  │
│  │ [Line Chart]                     │ │ to Phase A costs │
│  └──────────────────────────────────┘ │ in Case 201-C    │
│                                        │ ($450K external  │
│  ┌──────────────────────────────────┐ │ consulting) and  │
│  │ Expense by Phase (Stacked)       │ │ Case 205-A       │
│  │ [Bar/Pie Chart]                  │ │ ($120K software  │
│  └──────────────────────────────────┘ │ licenses)."      │
│                                        │                   │
│  [Interactive: Click for detail]      │ [Ask Follow-up]   │
└────────────────────────────────────────┴───────────────────┘
```

#### Proposed Features
- **Financial KPI Cards:**
  - Cash Flow Overview (net flow, directional indicator)
  - Balance Sheet Snapshot (asset/liability ratio)
  - P&L Summary
- **Interactive Visualizations:**
  - Sankey or treemap for balance sheet categories
  - Line chart: Monthly expense trends (12-24 months)
  - Stacked bar/pie: Expenses by business phase
- **AI Explanation Panel:**
  - Contextual, automatic insights
  - Click-to-trigger deeper analysis
  - Natural language explanations tied to specific data points

#### Integration Points
- **Data Source:** Case financial data, transaction reconciliations
- **AI Service:** LLM-powered insight generation
- **Export:** PDF reports, CSV data downloads

**Action Items:**
1. Create `FinancialVisualization.tsx` page
2. Implement financial KPI calculation endpoints
3. Integrate charting library (Recharts/Chart.js/D3)
4. Build Sankey/Treemap component for balance sheet
5. Connect to AI service for contextual explanations
6. Add interactivity (hover tooltips, click-to-drill)

---

### Page 9b: Forensic Balance Sheet - NEW (Fraud Detection)

**Route:** `/forensic-balance-sheet` (Proposed)  
**Component:** Not yet implemented  
**Status:** ❌ Missing - **HIGH PRIORITY FOR FRAUD DETECTION**

#### Purpose

This page is a **forensic accounting tool** designed to detect financial fraud in project-based funding by:
1. **Balancing bank statements against claimed expenses** per project phase
2. **Detecting expense inflation** where claimed amounts exceed actual fund outflows
3. **Identifying personal misuse** where project funds are diverted to personal accounts
4. **Exposing mirroring fraud** (round-trip transfers to inflate bank balances)

#### Fraud Detection Use Cases

| Fraud Type | Detection Method | Visual Indicator |
|------------|------------------|------------------|
| **Expense Inflation** | Claimed > Actual Cashflow | 🔴 Red bar, negative balance |
| **Personal Diversion** | Money out ≠ Project expenses | 🟠 Orange flag, fund leakage chart |
| **Mirroring/Round-Trip** | Same-name transfer in/out | 🟣 Purple highlight, circular flow |
| **Timing Manipulation** | End-of-period spikes | 📊 Timeline anomaly markers |

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Forensic Balance Sheet - Phase Fund Analysis]                [@] [User]    │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Case: [Dropdown ▼]    Phase: [All Phases ▼]    Date Range: [Jan - Dec 2024] │
│                                                                                │
├────────────────────────────┬───────────────────────────────────────────────────┤
│  🚨 FRAUD ALERTS (3)       │  📊 BALANCE OVERVIEW                              │
│  ╔═══════════════════════╗ │                                                   │
│  ║ Phase 2: Expenses     ║ │    Bank Statement Balance:         $1,250,000    │
│  ║ exceed cashflow by    ║ │    (─) Total Project Outflows:     $  980,000    │
│  ║ $145,000 ⚠️           ║ │    ════════════════════════════════════════════  │
│  ╠═══════════════════════╣ │    Net Available:                  $  270,000    │
│  ║ 3 Mirroring txns      ║ │                                                   │
│  ║ detected ($50K each)  ║ │    Claimed Expenses (All Phases):  $1,125,000    │
│  ╠═══════════════════════╣ │    (─) Verified Outflows:          $  980,000    │
│  ║ $28K unaccounted in   ║ │    ════════════════════════════════════════════  │
│  ║ personal account      ║ │    🔴 UNEXPLAINED GAP:             $  145,000    │
│  ╚═══════════════════════╝ │                                                   │
│                            │    [View Transaction Details]                     │
├────────────────────────────┴───────────────────────────────────────────────────┤
│                                                                                │
│  📋 PHASE-BY-PHASE FUND RELEASE TRACKING                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  Phase 1: Foundation          Phase 2: Framework         Phase 3: MEP  │  │
│  │  ════════════════════         ════════════════════       ════════════  │  │
│  │  Released:    $400,000        Released:    $350,000      Released: $0  │  │
│  │  Claimed:     $380,000        Claimed:     $495,000      Claimed:  $0  │  │
│  │  Actual Out:  $375,000        Actual Out:  $345,000      Actual:   $0  │  │
│  │  ──────────────────────       ──────────────────────     ────────────  │  │
│  │  ✅ BALANCED (+$20K)          🔴 OVER-CLAIMED (-$145K)   ⏳ Pending    │  │
│  │                               ⚠️ Potential Fraud                       │  │
│  │                                                                         │  │
│  │  [====██████████====]         [======█████████████====]                │  │
│  │  95% utilized                 141% claimed vs released                 │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  🔄 MIRRORING DETECTION (Round-Trip Transfer Analysis)                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  Detected Pattern: Account A → Account B → Account A                   │  │
│  │                                                                         │  │
│  │     ┌───────────────┐         ┌───────────────┐                        │  │
│  │     │ Main Account  │ ──$50K──▶│ "Supplier X"  │                        │  │
│  │     │ Bank Central  │         │ Bank Central  │                        │  │
│  │     │   (Subject)   │◀──$50K──│ (Same Owner?) │                        │  │
│  │     └───────────────┘  2 days └───────────────┘                        │  │
│  │                        later                                            │  │
│  │                                                                         │  │
│  │  ⚠️ 3 transactions flagged | Total: $150,000 | Same-day returns: 2    │  │
│  │                                                                         │  │
│  │  Purpose: Artificially inflates bank balance at reporting dates        │  │
│  │                                                                         │  │
│  │  [View All Mirroring Transactions] [Export Evidence]                   │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  💸 FUND LEAKAGE ANALYSIS (Personal vs Project Spending)                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  Total Money OUT from Project Account: $980,000                        │  │
│  │                                                                         │  │
│  │  ┌────────────────────────────────────────────────────────────────┐    │  │
│  │  │ ██████████████████████████████████████████████████  $723,000   │ ◀─ Verified Project Expenses  │
│  │  │ ████████████████████████                            $229,000   │ ◀─ Unverified (No Receipt)    │
│  │  │ ████                                                $ 28,000   │ ◀─ 🔴 Personal Account Transfer│
│  │  └────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                         │  │
│  │  Breakdown of Personal Transfers:                                       │  │
│  │  ┌──────────────┬──────────────┬──────────────┬────────────────────┐   │  │
│  │  │ Date         │ Amount       │ Destination  │ Flagged Reason     │   │  │
│  │  ├──────────────┼──────────────┼──────────────┼────────────────────┤   │  │
│  │  │ 2024-03-15   │ $12,000      │ Personal CC  │ Same-name payee    │   │  │
│  │  │ 2024-06-22   │ $8,500       │ Personal CC  │ Non-project vendor │   │  │
│  │  │ 2024-09-10   │ $7,500       │ Spouse Acct  │ Related party      │   │  │
│  │  └──────────────┴──────────────┴──────────────┴────────────────────┘   │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  📈 EXPENSE vs CASHFLOW TIMELINE                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  $150K ┤                           ████                                │  │
│  │        │                      ████ ████                                │  │
│  │  $100K ┤                 ████ ████ ████                                │  │
│  │        │            ████ ████ ████ ████ ████                          │  │
│  │   $50K ┤       ████ ████ ████ ████ ████ ████ ████                     │  │
│  │        │  ════ ████ ████ ████ ████ ████ ████ ████ ════ ════           │  │
│  │     $0 ┼────────────────────────────────────────────────────▶         │  │
│  │        Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov          │  │
│  │                                                                         │  │
│  │  Legend:  ████ Claimed Expenses   ════ Actual Bank Outflow             │  │
│  │           🔴 Months where Claimed > Outflow (Apr, May flagged)         │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  🧠 AI FORENSIC ANALYSIS                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  "Analysis indicates potential fund misappropriation in Phase 2:       │  │
│  │                                                                         │  │
│  │   1. Expenses claimed ($495K) exceed fund release ($350K) by $145K    │  │
│  │      - No additional funding authorized for this phase                 │  │
│  │      - Expense documentation incomplete for $89K                       │  │
│  │                                                                         │  │
│  │   2. Three round-trip transfers detected between Mar 15-20            │  │
│  │      - Same beneficiary name on both accounts                          │  │
│  │      - Pattern consistent with balance sheet inflation                 │  │
│  │                                                                         │  │
│  │   3. Personal account transfers total $28K                            │  │
│  │      - Subject's spouse account received $7.5K                         │  │
│  │      - Credit card payments ($20.5K) lack project justification       │  │
│  │                                                                         │  │
│  │   Confidence: 87% | Recommended Action: SAR Filing"                    │  │
│  │                                                                         │  │
│  │  [Generate SAR Report] [Request Additional Documents] [Escalate]       │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Features

**1. Balance Overview Panel**
- Side-by-side comparison of bank statement vs. expenses
- Automatic calculation of unexplained gaps
- Color-coded status (green = balanced, red = discrepancy)

**2. Phase-by-Phase Tracking**
- Construction/project phases with fund release amounts
- Visual progress bars showing utilization
- Automatic flagging when claimed > released

**3. Mirroring Detection**
- Algorithm to detect round-trip transfers:
  - Same-name accounts across institutions
  - In-out patterns within short timeframes
  - End-of-period timing coincidence
- Visual flow diagram showing money path

**4. Fund Leakage Analysis**
- Categorization: Verified | Unverified | Personal
- Detection of related-party transfers
- Same-name payee flagging

**5. Timeline Visualization**
- Dual-axis chart: Claimed vs Actual
- Monthly/quarterly breakdown
- Anomaly markers for discrepancy months

**6. AI Forensic Summary**
- Automated narrative explaining findings
- Confidence scoring
- SAR (Suspicious Activity Report) generation

#### Data Sources

| Data Type | Source | Purpose |
|-----------|--------|---------|
| Bank Statements | Ingested CSV/API | Actual cashflow |
| Expense Claims | Case documents | Claimed amounts |
| Phase Schedules | Project metadata | Fund release timing |
| Entity Database | Subject records | Related party detection |
| Transaction History | Reconciliation | Transfer patterns |

#### Fraud Detection Algorithms

**1. Over-Claim Detection**
```
IF claimed_expenses[phase] > funds_released[phase] + tolerance
   THEN flag_fraud("EXPENSE_INFLATION", phase, difference)
```

**2. Mirroring Detection**
```
FOR each outgoing_transfer:
   IF incoming_transfer EXISTS WHERE:
      - beneficiary_name SIMILAR TO sender_name
      - amount = outgoing_amount (+/- 5%)
      - timing < 7 days
   THEN flag_fraud("MIRRORING", transaction_pair)
```

**3. Personal Diversion Detection**
```
FOR each transfer:
   IF recipient IN [subject.personal_accounts, subject.related_parties]
      AND purpose NOT IN approved_project_categories
   THEN flag_fraud("PERSONAL_DIVERSION", transfer, recipient_type)
```

#### Integration Points

- **Input:** Reconciliation data (Page 5), Case data (Page 3)
- **Output:** SAR reports, evidence exports, adjudication queue
- **AI:** LLM analysis for narrative generation
- **Export:** PDF forensic report, CSV transaction evidence

#### Implementation Priority

| Component | Priority | Effort |
|-----------|----------|--------|
| Balance Overview | 🔴 Critical | 2 days |
| Phase Tracking | 🔴 Critical | 3 days |
| Mirroring Detection Algorithm | 🔴 Critical | 3 days |
| Fund Leakage Analysis | 🟠 High | 2 days |
| Timeline Chart | 🟠 High | 2 days |
| AI Forensic Summary | 🟡 Medium | 3 days |
| SAR Report Generator | 🟡 Medium | 2 days |

**Total Estimated Effort:** 2-3 weeks

---

### Page 10: Final Summary - NEW

**Route:** `/summary` (Proposed)  
**Component:** Not yet implemented  
**Status:** ❌ Missing

#### Design Specification

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ [📄 System Final Summary & Reporting]      [@] [User]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│              ✓ SUCCESS! Case Closed                        │
│           99.8% Data Quality Achieved                      │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  Executive Summary:                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ Ingestion    │ │Reconciliation│ │ Adjudication │      │
│  │              │ │              │ │              │      │
│  │ 12,450 recs  │ │ Match: 94.2% │ │ Resolved: 98 │      │
│  │ 8 files      │ │ New: 890     │ │ Avg: 8.3 min │      │
│  │ ✓ Complete   │ │ Reject: 45   │ │ ✓ Complete   │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                            │
│  Key Visualizations (Static):                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [Dashboard Charts - Page 7]                          │ │
│  │ [Financial Highlights - Page 8]                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Action Block:                                            │
│  [📥 Generate PDF Report]  [🗄️  Archive Case]  [➕ New] │
└────────────────────────────────────────────────────────────┘
```

#### Proposed Features
- **Success Banner:** Large, reassuring completion status
- **Executive Summary Cards:**
  - Ingestion metrics (total records, files)
  - Reconciliation results (match rate, new/rejected)
  - Adjudication performance (conflicts resolved, avg time)
- **Static Visualizations:** Key charts from Dashboard and Financial pages
- **Export Actions:**
  - Generate PDF report
  - Archive case
  - Start new case

#### Integration Points
- **Data Aggregation:** Pull metrics from all pipeline stages
- **Report Generation:** PDF templating engine
- **Archival System:** Case closure and archival logic

**Action Items:**
1. Create `FinalSummary.tsx` page
2. Build report generation API (`/api/v1/reports/generate`)
3. Implement PDF template with proper branding
4. Add case archival workflow
5. Create summary metric aggregation service
6. Design print-friendly styles

---

## Gap Analysis

### Missing Core Pages

| Page | Priority | Estimated Effort | Dependencies |
|------|----------|------------------|--------------|
| Mapping (Page 4) | **High** | 2-3 weeks | Ingestion refactor |
| Financial Visualization (Page 8) | **Medium** | 2 weeks | Financial data APIs |
| Final Summary (Page 9) | **Low** | 1 week | Report generation service |

### Enhancement Needs for Existing Pages

| Page | Enhancement | Priority | Effort |
|------|-------------|----------|--------|
| Ingestion (Page 3) | Multi-step wizard, source type selection | **High** | 1 week |
| Case Management (Page 2) | Quick stats sidebar | **Medium** | 3-5 days |
| Reconciliation (Page 5) | KPI dashboard, algorithm config | **Medium** | 1 week |
| Dashboard (Page 7) | Global filters, customizable widgets | **Medium** | 1-2 weeks |
| Adjudication (Page 6) | Side-by-side field comparison | **Low** | 3-5 days |

### Global Components Needed

| Component | Priority | Effort |
|-----------|----------|--------|
| Meta Agent (AI Overlay) | **High** | 2-3 weeks |
| Collapsible Sidebar Navigation | **Medium** | 1 week |
| Global Search | **Medium** | 1 week |

---

## Migration Path

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement collapsible sidebar navigation
- [ ] Add global search to header
- [ ] Create Meta Agent UI shell (non-functional)
- [ ] Standardize page layouts with consistent header/footer

### Phase 2: High-Priority Pages (Weeks 3-6)
- [ ] Refactor Ingestion page with multi-step wizard
- [ ] Build Mapping page (Page 4)
- [ ] Enhance Reconciliation with KPI dashboard
- [ ] Add quick stats sidebar to Case Management

### Phase 3: AI Integration (Weeks 7-9)
- [ ] Connect Meta Agent to AI backend
- [ ] Implement contextual guidance for each page
- [ ] Add AI explanations to Financial Visualization

### Phase 4: New Pages (Weeks 10-12)
- [ ] Build Financial Visualization page (Page 8)
- [ ] Create Final Summary page (Page 9)
- [ ] Implement PDF report generation

### Phase 5: Polish & Optimization (Weeks 13-14)
- [ ] Dashboard customization features
- [ ] Global filter system
- [ ] Chart interactivity and drill-down
- [ ] Comprehensive E2E testing
- [ ] Performance optimization
- [ ] Accessibility audit

---

## Design System Integration

All pages must adhere to the established design system:

### Visual Principles
- **Glassmorphism:** `backdrop-blur-xl`, semi-transparent backgrounds
- **Color Palette:** Blue-to-cyan gradients for primary actions
- **Dark Mode:** Full support with CSS custom properties
- **Responsive:** Mobile-first with breakpoints at 640px, 768px, 1024px, 1280px

### Component Library
- **Core UI:** Button, Input, Card, Badge, Tabs (from `components/ui/`)
- **Data Display:** Table, charts (Recharts), badges, progress bars
- **Feedback:** Toast notifications, loading skeletons, error boundaries
- **Navigation:** Sidebar, breadcrumbs, pagination

### Accessibility
- **WCAG 2.1 AAA Target:** All interactive elements keyboard accessible
- **Screen Readers:** Comprehensive ARIA labels and live regions
- **Focus Management:** Visible indicators, logical tab order
- **Color Contrast:** 7:1 minimum ratio

---

## Proposed Additional Pages

The following pages are recommended to complete the forensic investigation workflow:

### Page 10: Timeline / Chronology View (Proposed)

**Route:** `/timeline`  
**Purpose:** Display all events in chronological order to build case narrative

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📅 Case Timeline]                                          [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Case: PROJECT-2024-001        [Filter: All ▼] [Zoom: Month ▼] [Search 🔍]    │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  2024                                                                         │
│  ═══════════════════════════════════════════════════════════════════════════  │
│                                                                                │
│  JAN ──────────────────────────────────────────────────────────────────────   │
│  │                                                                           │
│  ├─ 📄 Jan 5   Project contract signed (Rp 10B budget)                       │
│  │            └─ [View Document]                                             │
│  │                                                                           │
│  ├─ 🏢 Jan 10  PT ABC Holdings registered as vendor                          │
│  │            └─ ⚠️ Same address as PM (Red Flag)                            │
│  │                                                                           │
│  ├─ 💰 Jan 15  First payment to PT ABC (Rp 500M)                             │
│  │            └─ [View Transaction] [View Invoice]                           │
│  │                                                                           │
│  ├─ 🔄 Jan 18  PT ABC → CV XYZ (Rp 480M) ⚠️ MIRRORED                         │
│  │            └─ 3 days after receipt, 96% of amount                         │
│  │                                                                           │
│  ├─ 👤 Jan 22  CV XYZ → Personal Account (Rp 400M) 🔴 DIVERSION              │
│  │                                                                           │
│  FEB ──────────────────────────────────────────────────────────────────────   │
│  │                                                                           │
│  ├─ ⚠️ Feb 1   Second payment to PT ABC (Rp 750M)                            │
│  ├─ 🔄 Feb 5   PT ABC → PT Maju Jaya (Rp 720M) ⚠️ MIRRORED                   │
│  └─ ...                                                                      │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ TIMELINE SUMMARY                                                         │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │ Total Events: 127  │  Red Flags: 23  │  Transactions: 89  │  Docs: 15   │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📤 Export Timeline] [📄 Generate Narrative] [🖨️ Print]                      │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Chronological event display with filtering
- Event type icons (📄 Document, 💰 Payment, 🏢 Entity, 👤 Personal, 🔄 Suspicious)
- Zoom levels (Day, Week, Month, Quarter, Year)
- Inline document/transaction preview
- Narrative generation for court presentation

---

### Page 11: Evidence Locker (Proposed)

**Route:** `/evidence`  
**Purpose:** Organize and track all evidence pieces with chain of custody

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [🔐 Evidence Locker]                                        [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Case: PROJECT-2024-001                    [+ Add Evidence] [📤 Export All]   │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Filter: [Type ▼] [Source ▼] [Date ▼] [Status ▼]  [🔍 Search]                │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ EVIDENCE ITEMS (47 items)                                     [Grid|List]│ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐              │ │
│  │  │ 📄 EV-001      │ │ 🏦 EV-002      │ │ 🖼️ EV-003      │              │ │
│  │  │                │ │                │ │                │              │ │
│  │  │ Contract.pdf   │ │ BCA Statement  │ │ Receipt Scan   │              │ │
│  │  │                │ │ Jan 2024       │ │ Inflated       │              │ │
│  │  │ ✅ Verified    │ │ ✅ Complete   │ │ ⚠️ Tampered    │              │ │
│  │  │ 2024-01-05     │ │ 2024-02-15     │ │ 2024-01-20     │              │ │
│  │  └────────────────┘ └────────────────┘ └────────────────┘              │ │
│  │                                                                          │ │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐              │ │
│  │  │ 📧 EV-004      │ │ 🎥 EV-005      │ │ 📞 EV-006      │              │ │
│  │  │                │ │                │ │                │              │ │
│  │  │ PM Email       │ │ Meeting Video  │ │ Call Recording │              │ │
│  │  │ to Vendor      │ │ "Arrangement"  │ │ "Coordination" │              │ │
│  │  │ 🔴 Incriminating│ │ ⚠️ Review     │ │ 🔴 Key Evidence│              │ │
│  │  │ 2024-01-08     │ │ 2024-01-25     │ │ 2024-02-10     │              │ │
│  │  └────────────────┘ └────────────────┘ └────────────────┘              │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📋 CHAIN OF CUSTODY (EV-003: Receipt Scan)                              │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │ 2024-01-20 10:05  Uploaded by @investigator1                            │ │
│  │ 2024-01-20 10:15  Hash verified: SHA256-abc123...                        │ │
│  │ 2024-01-20 14:30  Forensic analysis: Tampering detected (ELA)           │ │
│  │ 2024-01-21 09:00  Reviewed by @supervisor                               │ │
│  │ 2024-01-21 09:15  Tagged as "Key Evidence"                              │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Evidence cataloging with unique IDs
- File type support (PDF, Images, Videos, Audio, Emails)
- Chain of custody tracking
- Hash verification for integrity
- Tampering detection status
- Evidence tagging and categorization
- Court-ready export with certificates

---

### Page 12: Report Generator (Proposed)

**Route:** `/reports`  
**Purpose:** Generate various investigation reports

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📋 Report Generator]                                       [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Case: PROJECT-2024-001                                                        │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ SELECT REPORT TYPE                                                       │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐│ │
│  │  │ 🚨 SAR Report       │ │ 📊 Audit Report     │ │ ⚖️ Court Report     ││ │
│  │  │                     │ │                     │ │                     ││ │
│  │  │ Suspicious Activity │ │ Internal Audit      │ │ Legal Proceedings   ││ │
│  │  │ Report for PPATK    │ │ Summary             │ │ Evidence Package    ││ │
│  │  │                     │ │                     │ │                     ││ │
│  │  │ [Generate →]        │ │ [Generate →]        │ │ [Generate →]        ││ │
│  │  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘│ │
│  │                                                                          │ │
│  │  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐│ │
│  │  │ 💰 Cashflow Report  │ │ 🕸️ Entity Report    │ │ 📈 Executive Summary││ │
│  │  │                     │ │                     │ │                     ││ │
│  │  │ Real vs Reported    │ │ Network Analysis    │ │ High-level overview ││ │
│  │  │ with Forensic Proof │ │ with Diagrams       │ │ for Management      ││ │
│  │  │                     │ │                     │ │                     ││ │
│  │  │ [Generate →]        │ │ [Generate →]        │ │ [Generate →]        ││ │
│  │  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘│ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📁 GENERATED REPORTS                                                     │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │ Date       │ Type          │ Generated By   │ Status    │ Actions       │ │
│  │────────────────────────────────────────────────────────────────────────  │ │
│  │ 2024-02-20 │ SAR Report    │ @investigator1 │ ✅ Final  │ [📥] [👁️] [🗑️]│ │
│  │ 2024-02-18 │ Cashflow      │ @investigator1 │ 📝 Draft  │ [📥] [👁️] [✏️]│ │
│  │ 2024-02-15 │ Entity Report │ @investigator2 │ ✅ Final  │ [📥] [👁️] [🗑️]│ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Report Types:**
| Report | Purpose | Format | Recipients |
|--------|---------|--------|------------|
| SAR (Suspicious Activity Report) | PPATK regulatory filing | PDF | Regulators |
| Audit Report | Internal investigation summary | PDF/Excel | Management |
| Court Report | Legal proceedings evidence | PDF | Legal team |
| Cashflow Report | Real vs Reported analysis | PDF/Excel | Investigators |
| Entity Report | Network/relationship analysis | PDF | Investigators |
| Executive Summary | High-level overview | PDF/PPT | Executives |

---

### Page 13: Audit Trail (Proposed)

**Route:** `/audit-trail`  
**Purpose:** Track all investigator actions for accountability

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📝 Audit Trail]                                            [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Filter: [User ▼] [Action ▼] [Date Range] [Case ▼]      [🔍 Search] [📤 Export]│
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ ACTIVITY LOG                                               Page 1 of 15 │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  🕐 2024-02-20 10:05:32                                                  │ │
│  │  👤 investigator1@company.com                                            │ │
│  │  🔹 Flagged transaction TX-0045 as "Mirrored"                            │ │
│  │  📍 Case: PROJECT-2024-001 | Page: Reconciliation                        │ │
│  │  💾 Details: {"tx_id": "TX-0045", "flag": "mirrored", "reason": "..."}  │ │
│  │                                                                          │ │
│  │  ─────────────────────────────────────────────────────────────────────  │ │
│  │                                                                          │ │
│  │  🕐 2024-02-20 09:45:18                                                  │ │
│  │  👤 investigator1@company.com                                            │ │
│  │  🔹 Generated SAR Report (Draft)                                         │ │
│  │  📍 Case: PROJECT-2024-001 | Page: Reports                               │ │
│  │  💾 Report ID: RPT-2024-0015                                             │ │
│  │                                                                          │ │
│  │  ─────────────────────────────────────────────────────────────────────  │ │
│  │                                                                          │ │
│  │  🕐 2024-02-20 09:30:05                                                  │ │
│  │  👤 supervisor@company.com                                               │ │
│  │  🔹 Approved adjudication decision (TX-0042)                             │ │
│  │  📍 Case: PROJECT-2024-001 | Page: Adjudication                          │ │
│  │  💾 Decision: "Confirmed Fraud" | Confidence: 98%                        │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [← Previous] [1] [2] [3] ... [15] [Next →]                                   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Tracked Actions:**
- Evidence upload/modification
- Transaction flagging
- Adjudication decisions
- Report generation
- Case status changes
- User access patterns
- Data exports

---

### Page 14: Beneficiary Analysis (Proposed)

**Route:** `/beneficiary`  
**Purpose:** Identify ultimate beneficiaries of fraudulent flows

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [👥 Beneficiary Analysis]                                   [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Case: PROJECT-2024-001                                                        │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 💰 TOTAL FRAUDULENT FLOWS: Rp 1,820,500,000                              │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 👥 ULTIMATE BENEFICIARIES                                                │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Rank │ Beneficiary          │ Relationship    │ Amount       │ % Total │ │
│  │  ════════════════════════════════════════════════════════════════════   │ │
│  │                                                                          │ │
│  │  #1   │ 👤 Budi Santoso      │ Project Manager │ Rp 895.5M    │ 49.2%  │ │
│  │       │ Personal accounts    │ (Direct)        │              │        │ │
│  │       │ ┌──────────────────────────────────────────────────────────┐   │ │
│  │       │ │ BCA ****4589:     Rp 450M (cash withdrawals)           │   │ │
│  │       │ │ Mandiri ****7823: Rp 320M (property purchase)          │   │ │
│  │       │ │ Other:            Rp 125.5M                            │   │ │
│  │       │ └──────────────────────────────────────────────────────────┘   │ │
│  │                                                                          │ │
│  │  #2   │ 👤 Siti Rahayu       │ PM's Wife       │ Rp 345M      │ 18.9%  │ │
│  │       │ ┌──────────────────────────────────────────────────────────┐   │ │
│  │       │ │ CV Siti Fashion:  Rp 200M (fake invoices)              │   │ │
│  │       │ │ Personal:         Rp 145M                              │   │ │
│  │       │ └──────────────────────────────────────────────────────────┘   │ │
│  │                                                                          │ │
│  │  #3   │ 👤 Andi Santoso      │ PM's Brother    │ Rp 180M      │  9.9%  │ │
│  │       │                      │                 │              │        │ │
│  │                                                                          │ │
│  │  #4   │ 🏢 PT ABC Holdings   │ Shell Company   │ Rp 42.5M     │  2.3%  │ │
│  │       │ (Retained "fees")    │                 │              │        │ │
│  │                                                                          │ │
│  │  #5   │ 🔍 Unidentified      │ Lost Trace      │ Rp 357.5M    │ 19.6%  │ │
│  │       │                      │                 │              │        │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📊 BENEFICIARY DISTRIBUTION                                             │ │
│  │                                                                          │ │
│  │  Budi Santoso   ██████████████████████████████████████████████░░ 49.2%  │ │
│  │  Siti Rahayu    ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 18.9%   │ │
│  │  Unidentified   ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 19.6%   │ │
│  │  Andi Santoso   ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  9.9%   │ │
│  │  PT ABC         ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  2.3%   │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📤 Export Analysis] [📄 Generate Report] [🔗 View Entity Graph]             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Ultimate beneficiary identification
- Relationship mapping to primary suspect
- Amount and percentage breakdown
- Fund usage tracking (property, cash, investments)
- Asset tracing integration
- Court-ready beneficiary report

---

## Feature Enhancements (Proposed)

### Enhancement 1: Location Tracking from Transactions

**Route:** `/location-tracking`  
**Purpose:** Track suspect's physical location based on ATM withdrawals, purchases, and transaction locations

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📍 Location Tracking]                                      [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Subject: Budi Santoso (PM)               Period: Jan - Mar 2024               │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🗺️ LOCATION MAP                                           [Satellite ▼] │ │
│  │                                                                          │ │
│  │                    ┌─── Bali (3 days)                                   │ │
│  │                    │    Feb 10-12: Rp 45M withdrawals                   │ │
│  │     ┌──────────────┴─────────┐                                          │ │
│  │     │     INDONESIA MAP      │◄── Singapore (1 day)                     │ │
│  │     │   ⚫ Jakarta (Home)     │    Feb 15: Rp 120M transfer              │ │
│  │     │   🔴 Surabaya          │                                          │ │
│  │     │   🟡 Bali              │                                          │ │
│  │     │   🟢 Bandung           │                                          │ │
│  │     └────────────────────────┘                                          │ │
│  │                                                                          │ │
│  │  Legend: 🔴 High Activity | 🟡 Medium | 🟢 Low | ⚫ Base Location        │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📅 LOCATION TIMELINE                                                     │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Jan 15 ──●── Jakarta, Menteng                                          │ │
│  │           │   🏧 ATM BCA Menteng - Rp 50,000,000                        │ │
│  │           │   🛒 Grand Indonesia Mall - Rp 15,000,000                   │ │
│  │           │                                                             │ │
│  │  Jan 18 ──●── Jakarta, Sudirman                                         │ │
│  │           │   🏧 ATM Mandiri SCBD - Rp 100,000,000                      │ │
│  │           │   ⚠️ CONFLICT: Claimed in Surabaya on expense report!       │ │
│  │           │                                                             │ │
│  │  Feb 10 ──●── Bali, Seminyak                                            │ │
│  │           │   🏧 ATM BCA Seminyak - Rp 25,000,000                       │ │
│  │           │   🛒 Beachwalk Mall - Rp 12,000,000                         │ │
│  │           │   🏨 Hotel payment - Rp 8,000,000                           │ │
│  │           │                                                             │ │
│  │  Feb 11 ──●── Bali, Kuta                                                │ │
│  │           │   🛒 Discovery Mall - Rp 5,000,000                          │ │
│  │           │                                                             │ │
│  │  Feb 15 ──●── Singapore (!)                                             │ │
│  │               💰 Transfer via Wise - Rp 120,000,000                     │ │
│  │               🔴 ALERT: International transfer, not on travel record    │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🚨 LOCATION ANOMALIES DETECTED                                          │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  ⚠️ Jan 18: Location mismatch with expense claim                        │ │
│  │     Bank: Jakarta, Sudirman | Expense Claim: Surabaya site visit        │ │
│  │     [View Expense] [View Transaction]                                    │ │
│  │                                                                          │ │
│  │  🔴 Feb 15: Unauthorized international transaction                       │ │
│  │     Location: Singapore | No travel approval on file                     │ │
│  │     [View Details] [Flag for Review]                                     │ │
│  │                                                                          │ │
│  │  ⚠️ Multiple Bali transactions during "work from home" period            │ │
│  │     3 days of transactions in Bali, no leave request                     │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📤 Export Location Report] [🗺️ Full Screen Map] [📊 Analysis]              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources for Location:**
| Source | Location Info | Accuracy |
|--------|---------------|----------|
| ATM Withdrawals | ATM branch address | High |
| EDC Transactions | Merchant location | High |
| Online Transfers | IP geolocation (if available) | Medium |
| Bank Branch Visits | Branch address | High |
| International Transfers | Country + City | High |

**Features:**
- Map visualization with transaction pins
- Timeline view of movements
- Conflict detection (expense claim vs actual location)
- Pattern analysis (frequent locations, unusual travel)
- Cross-reference with HR travel records
- Export location report

---

### Enhancement 2: Pattern Library

**Route:** `/patterns`  
**Purpose:** Save and reuse fraud detection patterns across cases

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📚 Pattern Library]                                        [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Search: [________________] [Type ▼] [Risk ▼]       [+ Create New Pattern]    │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🔄 SYSTEM PATTERNS (Built-in)                                           │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐            │ │
│  │  │ 🔄 Mirroring    │ │ 👤 Personal     │ │ 📄 Phantom      │            │ │
│  │  │                 │ │    Diversion    │ │    Expense      │            │ │
│  │  │ A→B→C within 7  │ │ Company to self │ │ Claim with no   │            │ │
│  │  │ days, >90% amt  │ │ or family acct  │ │ bank withdrawal │            │ │
│  │  │                 │ │                 │ │                 │            │ │
│  │  │ Risk: 🔴 High    │ │ Risk: 🔴 High    │ │ Risk: 🔴 High    │            │ │
│  │  │ [Apply] [Edit]  │ │ [Apply] [Edit]  │ │ [Apply] [Edit]  │            │ │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘            │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📁 CUSTOM PATTERNS (User-created)                                       │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐            │ │
│  │  │ 🏗️ Contractor   │ │ 🎁 Kickback     │ │ 📊 Invoice      │            │ │
│  │  │    Split        │ │    Pattern      │ │    Inflation    │            │ │
│  │  │                 │ │                 │ │                 │            │ │
│  │  │ Multiple small  │ │ Vendor pays %   │ │ Invoice > actual│            │ │
│  │  │ contracts to    │ │ back via 3rd    │ │ by >20%         │            │ │
│  │  │ avoid approval  │ │ party           │ │                 │            │ │
│  │  │                 │ │                 │ │                 │            │ │
│  │  │ Created by: You │ │ Created by: Team│ │ Imported: ACFE  │            │ │
│  │  │ [Apply] [Edit]  │ │ [Apply] [View]  │ │ [Apply] [View]  │            │ │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘            │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📈 PATTERN STATISTICS (This Case)                                       │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │ Mirroring:         ████████████████ 15 matches                          │ │
│  │ Personal Diversion:████████ 8 matches                                   │ │
│  │ Phantom Expense:   ████████████ 12 matches                              │ │
│  │ Invoice Inflation: ██████ 6 matches                                     │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Enhancement 3: Predictive Risk Scoring

**Purpose:** Auto-calculate risk scores for transactions and entities

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📊 Risk Scoring Engine]                                    [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Transaction: TX-0045                          OVERALL RISK SCORE: 87/100    │
│  PT ABC → CV XYZ | Rp 480,000,000                         ████████████░░░    │
│                                                           🔴 HIGH RISK        │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  📊 FACTOR BREAKDOWN                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                          │ │
│  │  Timing & Velocity                                              +25 pts │ │
│  │  ├─ Round-trip within 3 days                    ████████████████████░░ │ │
│  │  └─ "Transfer too fast after receipt"                                   │ │
│  │                                                                          │ │
│  │  Amount Pattern                                                 +20 pts │ │
│  │  ├─ 96% of received amount transferred          ████████████████░░░░░░ │ │
│  │  └─ "Almost entire amount moved out"                                    │ │
│  │                                                                          │ │
│  │  Entity Relationship                                            +15 pts │ │
│  │  ├─ Same director detected                      ████████████░░░░░░░░░░ │ │
│  │  └─ "CV XYZ owned by PT ABC director's brother"                         │ │
│  │                                                                          │ │
│  │  Vendor Profile                                                 +10 pts │ │
│  │  ├─ First-time vendor                           ████████░░░░░░░░░░░░░░ │ │
│  │  └─ "No prior transactions with this vendor"                            │ │
│  │                                                                          │ │
│  │  Transaction Characteristics                                    +17 pts │ │
│  │  ├─ Weekend transaction (+5)                    █████░░░░░░░░░░░░░░░░░ │ │
│  │  ├─ Above average amount (+7)                   ███████░░░░░░░░░░░░░░░ │ │
│  │  └─ Round number (+5)                           █████░░░░░░░░░░░░░░░░░ │ │
│  │                                                 ─────────────────────── │ │
│  │                                                 TOTAL: 87 points        │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  📋 RISK THRESHOLDS                                                           │
│  ┌────────────────┬────────────────┬────────────────┬────────────────┐       │
│  │ 🟢 LOW (0-39)  │ 🟡 MED (40-69) │ 🔴 HIGH (70-89)│ ⬛ CRIT (90+)  │       │
│  │ Auto-clear     │ Review queue   │ Priority review│ Immediate flag │       │
│  └────────────────┴────────────────┴────────────────┴────────────────┘       │
│                                                                                │
│  [⚙️ Adjust Weights] [📤 Export Calculation] [🔄 Recalculate]                 │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Risk Factors:**
| Factor Category | Max Points | Components |
|----------------|------------|------------|
| Timing & Velocity | 25 | Round-trip speed, unusual timing |
| Amount Pattern | 25 | Percentage transferred, round numbers |
| Entity Relationship | 20 | Related parties, same address |
| Vendor Profile | 15 | New vendor, dormant vendor |
| Transaction Characteristics | 15 | Weekend, holiday, large amount |

---

### Enhancement 4: Collaborative Annotations

**Purpose:** Team notes and discussions on transactions

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Transaction TX-0045                                          [💬 5 notes]     │
│ PT ABC → CV XYZ  |  Rp 480,000,000  |  Jan 18, 2024                           │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  📌 TEAM ANNOTATIONS                                           [+ Add Note]   │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 👤 @david_investigator                           2 hours ago       │ │ │
│  │  │                                                                    │ │ │
│  │  │ Same director as PT ABC. I checked company registry - both        │ │ │
│  │  │ registered to "Andi Santoso" who is PM's brother.                 │ │ │
│  │  │                                                                    │ │ │
│  │  │ 📎 Attached: company_registry_screenshot.pdf                       │ │ │
│  │  │                                                                    │ │ │
│  │  │   💬 @supervisor replied:                                         │ │ │
│  │  │   "Good catch! Add to family network cluster."                    │ │ │
│  │  │                                                                    │ │ │
│  │  │   ✅ @david_investigator: "Done, added to cluster CL-003"         │ │ │
│  │  │                                                                    │ │ │
│  │  │ [Reply] [React 👍 2]                                               │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 👤 @maria_analyst                                  yesterday       │ │ │
│  │  │                                                                    │ │ │
│  │  │ 96% of received amount transferred - classic mirroring pattern.  │ │ │
│  │  │ The 4% retained is exactly Rp 20M which matches typical "fee".   │ │ │
│  │  │                                                                    │ │ │
│  │  │ 🏷️ Tags: #mirroring #fee_pattern                                   │ │ │
│  │  │                                                                    │ │ │
│  │  │ [Reply] [React 👍 4]                                               │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 🤖 Frenly AI                                      auto-generated   │ │ │
│  │  │                                                                    │ │ │
│  │  │ 💡 I found 3 similar transactions in this case with the same     │ │ │
│  │  │ pattern. Want me to group them?                                   │ │ │
│  │  │                                                                    │ │ │
│  │  │ [Yes, group them] [Show similar] [Dismiss]                         │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Enhancement 5: Keyboard Shortcuts

**Purpose:** Power user navigation and actions

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ⌨️ KEYBOARD SHORTCUTS                                    Press [?] to toggle │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  NAVIGATION                          │  ACTIONS                               │
│  ──────────────────────────────────  │  ──────────────────────────────────   │
│                                      │                                        │
│  J / ↓     Next item                 │  M         Mark as Mirrored           │
│  K / ↑     Previous item             │  P         Mark as Personal           │
│  Enter     Open/Select               │  F         Flag for Review            │
│  Esc       Close/Cancel              │  A         Accept AI Suggestion       │
│  /         Focus search              │  R         Reject                     │
│                                      │  C         Add Comment                │
│  GO TO PAGES                         │  L         Link to Entity             │
│  ──────────────────────────────────  │                                        │
│                                      │  BULK ACTIONS                          │
│  G + D     Dashboard                 │  ──────────────────────────────────   │
│  G + C     Cases                     │                                        │
│  G + R     Reconciliation            │  Shift + A   Select All               │
│  G + E     Entity Analysis           │  Shift + M   Mark Selected as Mirror  │
│  G + A     Adjudication              │  Shift + F   Flag Selected            │
│  G + T     Timeline                  │  Shift + X   Clear Selection          │
│  G + V     Evidence Locker           │                                        │
│  G + P     Reports                   │  FRENLY AI                             │
│                                      │  ──────────────────────────────────   │
│  VIEWS                               │                                        │
│  ──────────────────────────────────  │  Space      Toggle Frenly             │
│                                      │  Ctrl+Enter Ask Frenly                │
│  1         List View                 │  Ctrl+L     Trace with Frenly         │
│  2         Grid View                 │                                        │
│  3         Graph View                │                                        │
│  H         Toggle Matched Pool       │                                        │
│  ?         Show this help            │                                        │
│                                      │                                        │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Enhancement 6: Asset Tracing

**Route:** `/assets`  
**Purpose:** Track physical assets purchased with diverted funds

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [🏠 Asset Tracing]                                          [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Subject: Budi Santoso (PM)                    Total Assets: Rp 2,450,000,000  │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🏠 REAL ESTATE                                          Rp 1,500,000,000 │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  📍 House - Menteng, Jakarta                              Rp 800,000,000 │ │
│  │     ├─ Purchase Date: 2024-02-15                                        │ │
│  │     ├─ Certificate: SHM No. 1234/Menteng                                │ │
│  │     ├─ Registered to: Siti Rahayu (Wife)                                │ │
│  │     └─ 💰 Funding Source:                                               │ │
│  │         ├─ Mandiri ****7823: Rp 500,000,000 (2024-02-14)               │ │
│  │         └─ BCA ****4589: Rp 300,000,000 (2024-02-15)                   │ │
│  │         🔗 [View Transactions] [View Certificate]                       │ │
│  │                                                                          │ │
│  │  📍 Apartment - PIK, Jakarta                              Rp 450,000,000 │ │
│  │     ├─ Purchase Date: 2024-03-20                                        │ │
│  │     ├─ Certificate: SHGB (via developer)                                │ │
│  │     ├─ Registered to: CV Siti Fashion                                   │ │
│  │     └─ 💰 Funding Source:                                               │ │
│  │         └─ PT ABC Holdings → CV Siti: Rp 450,000,000                   │ │
│  │         🔗 [View Transactions] [View Contract]                          │ │
│  │                                                                          │ │
│  │  📍 Land - Puncak, Bogor                                  Rp 250,000,000 │ │
│  │     ├─ Purchase Date: 2024-04-05                                        │ │
│  │     └─ Registered to: Andi Santoso (Brother)                            │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🚗 VEHICLES                                               Rp 650,000,000 │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  🚙 Toyota Alphard 2024                                   Rp 450,000,000 │ │
│  │     ├─ Purchase Date: 2024-01-25                                        │ │
│  │     ├─ Plate: B 1234 ABC                                                │ │
│  │     ├─ BPKB Name: Budi Santoso                                          │ │
│  │     └─ 💰 Cash payment from BCA ****4589                                │ │
│  │                                                                          │ │
│  │  🏍️ BMW R1250GS                                           Rp 150,000,000 │ │
│  │     ├─ Purchase Date: 2024-03-10                                        │ │
│  │     └─ Registered to: Budi Santoso                                      │ │
│  │                                                                          │ │
│  │  🚗 Honda HRV 2024                                        Rp 50,000,000  │ │
│  │     └─ Registered to: Siti Rahayu (Wife)                                │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 💎 OTHER ASSETS                                           Rp 300,000,000 │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  💎 Gold/Jewelry (estimated from purchases)               Rp 200,000,000 │ │
│  │     └─ Multiple purchases at jewelry stores (tracked)                   │ │
│  │                                                                          │ │
│  │  💼 Investments                                           Rp 100,000,000 │ │
│  │     ├─ Mutual funds: Rp 50,000,000                                      │ │
│  │     └─ Stocks: Rp 50,000,000                                            │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📊 ASSET SUMMARY                                                         │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Total Diverted Funds:      Rp 1,820,000,000                            │ │
│  │  Total Assets Traced:       Rp 2,450,000,000   ← Exceeds diversions!    │ │
│  │  Assets in Subject's Name:  Rp 600,000,000  (24.5%)                     │ │
│  │  Assets in Family Names:    Rp 1,850,000,000 (75.5%)                     │ │
│  │                                                                          │ │
│  │  ⚠️ Total assets EXCEED identified diversions by Rp 630M                │ │
│  │     Possible additional undetected fraud or prior funds                  │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📤 Export Asset Report] [🔗 Link to Beneficiary] [📄 Seizure Request]       │ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Enhancement 7: AI Training Mode

**Purpose:** Improve AI detection by learning from investigator decisions

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [🧠 Frenly AI Training]                                     [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 👮‍♀️ FRENLY LEARNING STATS                                                │ │
│  │                                                                          │ │
│  │  I've learned from your team's decisions! Here's my progress:            │ │
│  │                                                                          │ │
│  │  Accuracy This Month:  94.2%  ████████████████████████████████████░░░░  │ │
│  │  Accuracy Last Month:  89.5%  ████████████████████████████████░░░░░░░░  │ │
│  │                                                                          │ │
│  │  ✅ Correct Predictions:     1,247                                       │ │
│  │  ❌ Incorrect Predictions:     77                                        │ │
│  │  📚 Training Samples Used:  3,450                                        │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📈 PATTERN ACCURACY BY TYPE                                              │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Mirroring Detection      ████████████████████████████████████ 97%      │ │
│  │  Personal Diversion       ██████████████████████████████░░░░░░ 91%      │ │
│  │  Phantom Expenses         █████████████████████████████████░░░ 95%      │ │
│  │  Invoice Inflation        ████████████████████████░░░░░░░░░░░░ 82%      │ │
│  │  Related Party            ██████████████████████████████████░░ 93%      │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📝 PENDING FEEDBACK (Help Frenly Learn!)                                 │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  TX-0089: I flagged this as "mirroring" but you marked it "legitimate"  │ │
│  │           💬 Why was I wrong?                                            │ │
│  │           [It was a regular business payment]                           │ │
│  │           [Timing was coincidental]                                      │ │
│  │           [Other: _______________]                                       │ │
│  │                                                                          │ │
│  │  TX-0102: I missed this. You flagged as "personal diversion"            │ │
│  │           💬 What should I have looked for?                              │ │
│  │           [Recipient name matches employee]                              │ │
│  │           [Amount was unusually round]                                   │ │
│  │           [Other: _______________]                                       │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  👮‍♀️💬 "Every correction helps me get smarter! Thank you for teaching me!"   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Comprehensive Fraud Detection Methods (ACFE Fraud Tree)

Based on the **Association of Certified Fraud Examiners (ACFE) 2024 Report to the Nations**, the system should detect the following fraud categories:

### Category 1: Asset Misappropriation (89% of cases, median loss $120,000)

| Scheme | Description | Detection Method | Risk Score |
|--------|-------------|------------------|------------|
| **Skimming** | Theft of cash before recording | Compare POS/invoice totals vs bank deposits | 🔴 High |
| **Cash Larceny** | Theft after recording | Reconcile cash register to bank statements | 🔴 High |
| **Billing Schemes** | False invoices or shell companies | Vendor master file analysis, duplicate invoice detection | 🔴 High |
| **Check Tampering** | Forged or altered checks | Check sequence gaps, payee name analysis | 🔴 High |
| **Expense Reimbursement** | False or inflated expenses | Receipt vs bank statement matching, duplicate claims | 🟡 Med |
| **Payroll Fraud** | Ghost employees, inflated wages | Payroll vs HR records, bank account analysis | 🔴 High |
| **Inventory Theft** | Physical asset theft | Inventory counts vs purchase records | 🟡 Med |

**Frenly AI Detection Patterns:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 ASSET MISAPPROPRIATION PATTERNS                                             │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  1. SHELL COMPANY (Billing Scheme)                                             │
│     Pattern: Vendor has no web presence, PO Box address, same bank as employee │
│     Detection: Cross-reference vendor addresses with employee addresses        │
│     Red Flags: Round payments, no tax ID variations, sequential invoices       │
│                                                                                │
│  2. GHOST EMPLOYEE (Payroll Fraud)                                             │
│     Pattern: Salary deposited to account linked to existing employee           │
│     Detection: Bank account used by multiple "employees"                       │
│     Red Flags: No benefits claimed, no time logs, same address                 │
│                                                                                │
│  3. EXPENSE PADDING                                                            │
│     Pattern: Expense claim exists but bank shows no withdrawal                 │
│     Detection: Compare expense reports to bank statement transactions          │
│     Red Flags: Round amounts, weekend dates, duplicate receipts                │
│                                                                                │
│  4. CHECK KITING                                                               │
│     Pattern: Transfers between accounts to cover shortages                     │
│     Detection: Analyze inter-account transfers with short settlement times     │
│     Red Flags: End-of-month spikes, same amounts transferred back              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Category 2: Corruption (46% of cases, median loss $200,000)

| Scheme | Description | Detection Method | Risk Score |
|--------|-------------|------------------|------------|
| **Kickbacks** | Vendor pays employee for contracts | Compare employee purchases to personal accounts | 🔴 High |
| **Bid Rigging** | Collusion in bidding process | Analyze bid patterns, pricing similarities | 🔴 High |
| **Bribery** | Payments for favorable decisions | Track unusual vendor payments after contract awards | 🔴 High |
| **Conflict of Interest** | Undisclosed personal interests | Cross-reference employee family with vendors | 🔴 High |
| **Illegal Gratuities** | Gifts for future favors | Monitor employee lifestyle vs income | 🟡 Med |
| **Economic Extortion** | Coercion for payments | Analyze payment patterns under duress | 🟡 Med |

**Frenly AI Detection Patterns:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 CORRUPTION PATTERNS                                                         │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  1. KICKBACK DETECTION                                                         │
│     Pattern: After company pays vendor, vendor pays to employee-linked account │
│     Detection:                                                                 │
│     ├─ Company → Vendor (Invoice payment)                                     │
│     └─ Vendor → Employee's relative (within 7 days, 5-10% of payment)         │
│     Red Flags: Consistent percentage, timing correlation, family accounts     │
│                                                                                │
│  2. BID RIGGING                                                                │
│     Pattern: Same vendors win alternating contracts, similar bid amounts       │
│     Detection:                                                                 │
│     ├─ Vendor A wins Jan, Mar, May contracts                                  │
│     ├─ Vendor B wins Feb, Apr, Jun contracts                                  │
│     └─ Bid amounts suspiciously close (within 2-3%)                           │
│     Red Flags: Rotating winners, identical costing structures                 │
│                                                                                │
│  3. RELATED PARTY VENDOR                                                       │
│     Pattern: Vendor owned by employee's family, receiving premium contracts    │
│     Detection:                                                                 │
│     ├─ Company registry shows director: "Andi Santoso"                        │
│     └─ HR records show PM's brother: "Andi Santoso"                           │
│     Red Flags: No competitive bidding, above-market pricing                   │
│                                                                                │
│  4. LIFESTYLE MISMATCH                                                         │
│     Pattern: Employee assets exceed explainable income                         │
│     Detection: Bank withdrawals → Luxury purchases → Asset registry           │
│     Red Flags: Rp 50M salary but Rp 800M house purchase                       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Category 3: Financial Statement Fraud (5% of cases, median loss $766,000)

| Scheme | Description | Detection Method | Risk Score |
|--------|-------------|------------------|------------|
| **Fictitious Revenue** | Recording fake sales | Match invoices to actual bank receipts | ⬛ Critical |
| **Timing Manipulation** | Shifting revenue/expense periods | Analyze month-end entries, reversals | 🔴 High |
| **Concealed Liabilities** | Hiding debts off books | Compare bank loans to recorded liabilities | ⬛ Critical |
| **Improper Disclosure** | Omitting material information | Review related-party transactions | 🔴 High |
| **Inflated Assets** | Overstating inventory/receivables | Physical counts vs book values | 🔴 High |
| **Channel Stuffing** | Forcing inventory to distributors | Analyze sales spikes then returns | 🔴 High |

**Frenly AI Detection Patterns:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 FINANCIAL STATEMENT FRAUD PATTERNS                                          │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  1. FICTITIOUS REVENUE                                                         │
│     Pattern: Invoice recorded but no corresponding bank deposit                │
│     Detection:                                                                 │
│     ├─ Sales ledger: Rp 500M invoice to "PT Pelanggan Baru"                  │
│     └─ Bank statement: No Rp 500M deposit found within 60 days               │
│     Red Flags: New customers, round amounts, quarter-end timing               │
│                                                                                │
│  2. EARLY REVENUE RECOGNITION                                                  │
│     Pattern: Revenue recorded before goods delivered or services rendered      │
│     Detection:                                                                 │
│     ├─ Invoice date: Dec 28, 2024                                             │
│     └─ Delivery note: Jan 15, 2025                                            │
│     Red Flags: Year-end spikes, backdated documents                           │
│                                                                                │
│  3. UNDERSTATED EXPENSES                                                       │
│     Pattern: Expenses exist in bank but not in books                          │
│     Detection:                                                                 │
│     ├─ Bank statement: Multiple payments to "PT Supplier"                     │
│     └─ Expense ledger: No corresponding entries                               │
│     Red Flags: Missing accruals, delayed recording                            │
│                                                                                │
│  4. ROUND-TRIPPING                                                             │
│     Pattern: Two companies artificially inflate sales to each other            │
│     Detection:                                                                 │
│     ├─ Company A → Company B: Rp 1B "sale"                                    │
│     └─ Company B → Company A: Rp 950M "purchase" (same period)                │
│     Red Flags: Reciprocal transactions, similar amounts, no net benefit       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Category 4: Procurement Fraud (Specialized Detection)

| Scheme | Description | Detection Method | Risk Score |
|--------|-------------|------------------|------------|
| **Contract Splitting** | Breaking contracts to avoid approval limits | Analyze sequential contracts just under threshold | 🔴 High |
| **Specification Rigging** | Specs written for one vendor | Compare specs to winner capabilities | 🔴 High |
| **Phantom Vendor** | Vendor doesn't exist | Verify vendor registration, site visits | ⬛ Critical |
| **Duplicate Payments** | Same invoice paid twice | Invoice number analysis, amount matching | 🟡 Med |
| **Product Substitution** | Inferior goods delivered | Compare specifications to delivery notes | 🔴 High |
| **Price Inflation** | Overcharging on contracts | Benchmark pricing against market rates | 🔴 High |

**Frenly AI Detection Patterns:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 PROCUREMENT FRAUD PATTERNS                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  1. CONTRACT SPLITTING                                                         │
│     Pattern: Multiple contracts just under approval threshold                  │
│     Detection:                                                                 │
│     ├─ Threshold: Rp 100M requires director approval                          │
│     ├─ Contract 1: Rp 95M to PT ABC (Jan 5)                                   │
│     ├─ Contract 2: Rp 98M to PT ABC (Jan 6)                                   │
│     └─ Contract 3: Rp 92M to PT ABC (Jan 7)                                   │
│     Red Flags: Same vendor, consecutive dates, similar scope                  │
│                                                                                │
│  2. PHANTOM VENDOR                                                             │
│     Pattern: Vendor exists only on paper, no real business                     │
│     Detection:                                                                 │
│     ├─ Address: PO Box or virtual office                                      │
│     ├─ Phone: Leads to employee's mobile                                      │
│     ├─ Bank: Same branch as employee's personal account                       │
│     └─ Tax ID: Recently registered, no other transactions                     │
│     Red Flags: No website, no other customers, perfect invoices               │
│                                                                                │
│  3. DUPLICATE INVOICE PAYMENT                                                  │
│     Pattern: Same invoice paid multiple times                                  │
│     Detection:                                                                 │
│     ├─ Invoice INV-2024-0789: Paid Jan 15 (Rp 45M)                           │
│     └─ Invoice INV-2024-0789: Paid Feb 20 (Rp 45M) - DUPLICATE!              │
│     Red Flags: Same amount, same vendor, similar descriptions                 │
│                                                                                │
│  4. CHANGE ORDER ABUSE                                                         │
│     Pattern: Low bid wins, then inflated via change orders                     │
│     Detection:                                                                 │
│     ├─ Original contract: Rp 500M                                             │
│     ├─ Change orders: Rp 350M (70% increase!)                                 │
│     └─ Compare to rejected higher bids: Rp 700M                               │
│     Red Flags: Excessive changes, final cost exceeds competitor bids          │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Forensic Analysis Techniques

| Technique | Description | Application |
|-----------|-------------|-------------|
| **Benford's Law** | Statistical analysis of leading digits | Detect fabricated numbers |
| **Ratio Analysis** | Compare financial ratios to benchmarks | Identify anomalies |
| **Horizontal Analysis** | Year-over-year comparison | Spot unusual trends |
| **Vertical Analysis** | Line items as % of total | Find proportional anomalies |
| **Bank Statement Mining** | Extract patterns from transactions | Trace money flow |
| **Network Analysis** | Map entity relationships | Detect collusion rings |
| **Timing Analysis** | Analyze transaction timing | Detect round-tripping |

**Benford's Law Implementation:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 📊 BENFORD'S LAW ANALYSIS                                                      │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Expected Distribution (Natural Data):                                         │
│  1: 30.1% ████████████████████████████████                                    │
│  2: 17.6% ██████████████████                                                  │
│  3: 12.5% █████████████                                                       │
│  4:  9.7% ██████████                                                          │
│  5:  7.9% ████████                                                            │
│  6:  6.7% ███████                                                             │
│  7:  5.8% ██████                                                              │
│  8:  5.1% █████                                                               │
│  9:  4.6% █████                                                               │
│                                                                                │
│  ⚠️ ANOMALY DETECTED - Your Data Shows:                                        │
│  1: 15.2% ████████████████ (Expected 30.1%) ← TOO LOW!                        │
│  5: 22.4% ███████████████████████ (Expected 7.9%) ← TOO HIGH!                 │
│  9: 18.3% ███████████████████ (Expected 4.6%) ← TOO HIGH!                     │
│                                                                                │
│  👮‍♀️ Frenly says: "This distribution suggests possible fabrication.           │
│     Real expense data rarely starts with 5 or 9 this often!"                   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Red Flags Checklist (Behavioral)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 🚩 BEHAVIORAL RED FLAGS                                                        │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  EMPLOYEE INDICATORS                         ORGANIZATION INDICATORS          │
│  ─────────────────────────                   ─────────────────────────        │
│  ☐ Living beyond means                       ☐ Weak internal controls         │
│  ☐ Financial difficulties                   ☐ Frequent auditor changes        │
│  ☐ Unusually close vendor ties               ☐ Overriding management          │
│  ☐ Wheeler-dealer attitude                   ☐ Poor segregation of duties     │
│  ☐ Control issues / won't share              ☐ Lack of whistle-blower policy  │
│  ☐ Never takes vacation                      ☐ Aggressive revenue targets     │
│  ☐ Irritability / defensiveness              ☐ Related-party transactions     │
│  ☐ Addiction problems                        ☐ Complex corporate structure    │
│                                                                                │
│  DOCUMENTATION INDICATORS                    TRANSACTION INDICATORS           │
│  ─────────────────────────                   ─────────────────────────        │
│  ☐ Missing documents                         ☐ Round-amount payments          │
│  ☐ Altered records                           ☐ Year-end timing games          │
│  ☐ Handwriting similarities                  ☐ Unusual journal entries        │
│  ☐ Photocopies only (no originals)           ☐ Large write-offs               │
│  ☐ Sequential invoice numbers                ☐ Declining margins              │
│  ☐ Lack of supporting docs                   ☐ Accounts growing unreasonably  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Enhancement 8: Project Cost Analysis

**Route:** `/project-analysis`  
**Purpose:** Track project items and compare purchases against claimed expenses to detect budget fraud

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [📊 Project Cost Analysis]                                  [@] [▼ User]      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Project: Road Construction - Jl. Sudirman Extension        Budget: Rp 15.5B   │
│ Period: Jan 2024 - Jun 2024                                  Status: Active   │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📋 PROJECT BUDGET vs ACTUAL                                              │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Category         │ Budget      │ Claimed    │ Bank Actual │ Variance   │ │
│  │  ─────────────────┼─────────────┼────────────┼─────────────┼───────────│ │
│  │  Materials        │ Rp 8.0B     │ Rp 8.5B    │ Rp 6.2B     │ ⚠️ Rp 2.3B │ │
│  │  Labor            │ Rp 3.0B     │ Rp 3.2B    │ Rp 2.8B     │ ⚠️ Rp 0.4B │ │
│  │  Equipment Rental │ Rp 2.5B     │ Rp 2.8B    │ Rp 2.0B     │ ⚠️ Rp 0.8B │ │
│  │  Permits & Fees   │ Rp 0.5B     │ Rp 0.5B    │ Rp 0.5B     │ ✅ Match   │ │
│  │  Overhead         │ Rp 1.5B     │ Rp 1.8B    │ Rp 1.2B     │ ⚠️ Rp 0.6B │ │
│  │  ─────────────────┼─────────────┼────────────┼─────────────┼───────────│ │
│  │  TOTAL            │ Rp 15.5B    │ Rp 16.8B   │ Rp 12.7B    │ 🔴 Rp 4.1B │ │
│  │                                                                          │ │
│  │  🚨 ALERT: Claimed expenses exceed bank-verified payments by Rp 4.1B!   │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🏗️ MATERIAL ITEMS ANALYSIS                                               │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Item               │ Claimed Qty │ Invoice Qty │ Delivered │ Status    │ │
│  │  ───────────────────┼─────────────┼─────────────┼───────────┼──────────│ │
│  │  Cement (50kg bags) │   45,000    │   45,000    │  32,000   │ ⚠️ -13K   │ │
│  │  Steel Rebars (ton) │      850    │      850    │     720   │ ⚠️ -130   │ │
│  │  Asphalt (ton)      │    2,500    │    2,500    │   2,480   │ ✅ OK     │ │
│  │  Gravel (m³)        │   12,000    │   12,000    │   8,500   │ ⚠️ -3.5K  │ │
│  │  Sand (m³)          │    8,000    │    8,000    │   6,200   │ ⚠️ -1.8K  │ │
│  │                                                                          │ │
│  │  🔴 Material Shrinkage Detected!                                         │ │
│  │     Claimed: 45,000 bags cement @ Rp 85,000 = Rp 3.825B                  │ │
│  │     Delivered: Only 32,000 bags verified                                 │ │
│  │     Unaccounted: 13,000 bags = Rp 1.105B !                               │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 💰 PURCHASE vs EXPENSE RECONCILIATION                                    │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Date     │ Vendor          │ Invoice    │ Expense Claim │ Bank Payment │ │
│  │  ─────────┼─────────────────┼────────────┼───────────────┼─────────────│ │
│  │  Jan 15   │ PT Semen Indo   │ Rp 850M    │ Rp 850M       │ Rp 680M     │ │
│  │           │                 │            │               │ ⚠️ Paid 20% │ │
│  │           │                 │            │               │    less!    │ │
│  │           │                                                             │ │
│  │  Jan 22   │ CV Baja Kuat    │ Rp 1.2B    │ Rp 1.5B       │ Rp 1.0B     │ │
│  │           │                 │            │ ⚠️ Inflated!   │ ⚠️ Short!   │ │
│  │           │                                                             │ │
│  │  Feb 03   │ PT Aspal Jaya   │ Rp 625M    │ Rp 625M       │ Rp 625M     │ │
│  │           │                 │            │ ✅             │ ✅          │ │
│  │           │                                                             │ │
│  │  Feb 10   │ Ghost Vendor?   │ Rp 500M    │ Rp 500M       │ ❌ None!    │ │
│  │           │ CV Pasir Murah  │            │               │ No payment  │ │
│  │           │                 │            │               │ found!      │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📈 UNIT PRICE BENCHMARKING                                               │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Item             │ Market Price │ Your Price │ Variance │ Status      │ │
│  │  ─────────────────┼──────────────┼────────────┼──────────┼────────────│ │
│  │  Cement (50kg)    │ Rp 65,000    │ Rp 85,000  │ +30.7%   │ 🔴 Inflated │ │
│  │  Steel Rebar (kg) │ Rp 12,500    │ Rp 15,800  │ +26.4%   │ 🔴 Inflated │ │
│  │  Asphalt (ton)    │ Rp 4.5M      │ Rp 5.2M    │ +15.5%   │ 🟡 High     │ │
│  │  Gravel (m³)      │ Rp 285,000   │ Rp 320,000 │ +12.3%   │ 🟡 High     │ │
│  │  Sand (m³)        │ Rp 195,000   │ Rp 210,000 │ +7.7%    │ ✅ OK       │ │
│  │                                                                          │ │
│  │  👮‍♀️ Frenly says: "Cement prices are 30% above market! Combined with   │ │
│  │     13,000 missing bags, this looks like Price Inflation + Phantom      │ │
│  │     Delivery scheme. Total overcharge: Rp 1.8B"                          │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 👷 LABOR COST ANALYSIS                                                   │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  Worker Category    │ Claimed    │ Attendance │ Bank Payments │ Gap     │ │
│  │  ───────────────────┼────────────┼────────────┼───────────────┼────────│ │
│  │  Foremen (10)       │ Rp 15M/mo  │ 10 present │ Rp 150M       │ ✅     │ │
│  │  Skilled (50)       │ Rp 10M/mo  │ 45 present │ Rp 450M       │ ⚠️ 5   │ │
│  │  Unskilled (100)    │ Rp 5M/mo   │ 72 present │ Rp 360M       │ 🔴 28  │ │
│  │  Security (10)      │ Rp 6M/mo   │ 8 present  │ Rp 48M        │ ⚠️ 2   │ │
│  │                                                                          │ │
│  │  🚨 GHOST EMPLOYEES DETECTED: 35 workers on payroll not verified!       │ │
│  │     Unskilled labor: 100 claimed, only 72 on attendance records         │ │
│  │     Monthly leakage: 28 × Rp 5M = Rp 140M                               │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📤 Export Project Report] [📊 Trend Analysis] [🔗 Link to Case]             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Project Fraud Detection Rules:**

| Fraud Type | Detection Logic | Threshold |
|------------|------------------|-----------|
| **Price Inflation** | Compare unit price to market benchmark | >15% over market |
| **Phantom Delivery** | Claimed qty > Delivery note qty | Any shortage >5% |
| **Ghost Workers** | Payroll > Attendance records | Any discrepancy |
| **Kickback Indicator** | Invoice < Expense claim < Payment | See kickback pattern |
| **Duplicate Claims** | Same item charged to multiple projects | Any duplicate |
| **Substitute Materials** | Spec grade < Delivered grade | Any substitution |

**Data Sources Required:**

| Document | Data Points | Comparison |
|----------|-------------|------------|
| **Project Budget** | Line items, quantities, unit prices | Baseline |
| **Purchase Orders** | Vendor, items, agreed prices | vs Budget |
| **Invoices** | Claimed quantities, amounts | vs PO |
| **Delivery Notes** | Actual quantities received | vs Invoice |
| **Expense Claims** | Amounts submitted for reimbursement | vs Invoice |
| **Bank Statements** | Actual payments made | vs Claims |
| **Attendance Records** | Worker presence by date | vs Payroll |
| **Market Prices** | Current commodity prices | vs Purchases |

**Frenly AI Project Analysis:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 👮‍♀️ FRENLY'S PROJECT FRAUD SUMMARY                                            │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  I analyzed "Jl. Sudirman Extension" project and found:                        │
│                                                                                │
│  🔴 CRITICAL FINDINGS:                                                         │
│                                                                                │
│  1. MATERIAL LEAKAGE                                    Est. Loss: Rp 2.3B    │
│     ├─ 13,000 cement bags claimed but not delivered                           │
│     ├─ 130 tons steel missing from delivery records                           │
│     └─ 3,500 m³ gravel unaccounted for                                        │
│                                                                                │
│  2. PRICE INFLATION                                     Est. Loss: Rp 1.8B    │
│     ├─ Cement: +30.7% above market (Rp 85K vs Rp 65K)                        │
│     └─ Steel: +26.4% above market (Rp 15.8K vs Rp 12.5K)                     │
│                                                                                │
│  3. GHOST EMPLOYEES                                     Est. Loss: Rp 840M    │
│     ├─ 28 unskilled workers on payroll not in attendance                      │
│     └─ 6 months × Rp 140M monthly = Rp 840M leaked                           │
│                                                                                │
│  4. PHANTOM VENDOR                                      Est. Loss: Rp 500M    │
│     └─ CV Pasir Murah: Invoice exists, no bank payment found                  │
│                                                                                │
│  ─────────────────────────────────────────────────────────────────────────    │
│  TOTAL ESTIMATED FRAUD:                                 Rp 5.44 BILLION       │
│  ─────────────────────────────────────────────────────────────────────────    │
│                                                                                │
│  📋 Recommended Actions:                                                       │
│  1. Physical inventory count of remaining materials                           │
│  2. Verify attendance with site photos / biometric data                       │
│  3. Investigate CV Pasir Murah vendor registration                            │
│  4. Compare delivery notes to GPS truck data                                   │
│                                                                                │
│  [Generate Audit Report] [Create SAR] [Flag for Investigation]                 │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### Enhancement 9: Four Personas Expert Comments

**Purpose:** Provide contextual expert insights from 4 different perspectives throughout the investigation workflow

**The 4 Personas:**

| Persona | Role | Icon | Expertise | Comment Style |
|---------|------|------|-----------|---------------|
| **👮‍♀️ Frenly AI** | AI Assistant | Police officer avatar | Pattern detection, anomaly alerts | Friendly, proactive tips |
| **⚖️ Legal Advisor** | Legal Counsel | Scales of justice | Legal implications, evidence admissibility | Formal, cautionary |
| **📊 Forensic Accountant** | Financial Expert | Calculator/chart | Numbers, ratios, financial analysis | Technical, precise |
| **🔍 Senior Investigator** | Experienced Investigator | Magnifying glass | Case strategy, interrogation tips | Street-smart, practical |

**UI Layout - Transaction Detail View:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ TRANSACTION DETAIL VIEW                                                        │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  Transaction: TX-0045                                                          │
│  PT ABC → CV XYZ | Rp 480,000,000 | Jan 18, 2024                              │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🎭 EXPERT INSIGHTS                                      [Expand All ▼]  │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 👮‍♀️ FRENLY AI                                                      │ │ │
│  │  │ ────────────────────────────────────────────────────────────────── │ │ │
│  │  │ "This transaction matches the MIRRORING pattern! 96% of Rp 500M   │ │ │
│  │  │  received on Jan 15 was transferred out within 3 days. I've seen  │ │ │
│  │  │  this pattern 15 times in this case. Want me to group them?"      │ │ │
│  │  │                                           [Group Similar] [Dismiss] │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ ⚖️ LEGAL ADVISOR                                                   │ │ │
│  │  │ ────────────────────────────────────────────────────────────────── │ │ │
│  │  │ "CAUTION: To establish mens rea (criminal intent), you'll need    │ │ │
│  │  │  evidence that the PM knew CV XYZ was a shell company. Look for   │ │ │
│  │  │  emails or communication showing knowledge of relationship.       │ │ │
│  │  │                                                                    │ │ │
│  │  │  Evidence strength: ⚠️ CIRCUMSTANTIAL without direct proof"        │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 📊 FORENSIC ACCOUNTANT                                             │ │ │
│  │  │ ────────────────────────────────────────────────────────────────── │ │ │
│  │  │ "The 96% transfer ratio leaves exactly Rp 20M retained - this is  │ │ │
│  │  │  consistent with a 4% 'handling fee' pattern. I calculated:       │ │ │
│  │  │                                                                    │ │ │
│  │  │  • Avg retention: 4.02% (±0.3%) across 15 transactions            │ │ │
│  │  │  • Benford's Law: Leading digits show anomaly (p < 0.01)          │ │ │
│  │  │  • Total fee collected: Rp 340M (17 transactions)"                 │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 🔍 SENIOR INVESTIGATOR                                             │ │ │
│  │  │ ────────────────────────────────────────────────────────────────── │ │ │
│  │  │ "Follow the money trail. Key questions to ask:                    │ │ │
│  │  │                                                                    │ │ │
│  │  │  1. Who approved CV XYZ as a vendor? Get the approval chain.      │ │ │
│  │  │  2. Was there a tender process? If not, why?                      │ │ │
│  │  │  3. Check if PM's family has accounts at the same bank branch.    │ │ │
│  │  │                                                                    │ │ │
│  │  │  💡 TIP: Shell companies often share addresses. Cross-check."      │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Placement Map - Where Each Persona Appears:**

| Page | 👮‍♀️ Frenly | ⚖️ Legal | 📊 Accountant | 🔍 Investigator |
|------|------------|----------|---------------|-----------------|
| **Transaction Detail** | ✅ Pattern alerts | ✅ Evidence tips | ✅ Number analysis | ✅ Follow-up questions |
| **Reconciliation** | ✅ Match suggestions | ⚪ Optional | ✅ Variance analysis | ⚪ Optional |
| **Adjudication Queue** | ✅ Risk summary | ✅ Legal implications | ⚪ Optional | ✅ Decision guidance |
| **Entity Analysis** | ✅ Relationship mapping | ✅ Liability exposure | ⚪ Optional | ✅ Interview targets |
| **Project Cost Analysis** | ✅ Fraud detection | ⚪ Optional | ✅ Budget variance | ✅ Site visit tips |
| **Report Generator** | ⚪ Optional | ✅ SAR requirements | ✅ Calculation verify | ⚪ Optional |
| **Case Summary** | ✅ Case overview | ✅ Prosecution readiness | ✅ Total fraud estimate | ✅ Case strategy |

✅ = Always visible | ⚪ = Available on demand

**UI Layout Options:**

*Option A: Collapsible Side Panel*
```
┌─────────────────────────────────────┬──────────────────────┐
│                                     │ 🎭 EXPERT INSIGHTS   │
│         MAIN CONTENT                │ ─────────────────────│
│         (Transaction/Entity)        │ 👮‍♀️ Frenly: ...       │
│                                     │ ⚖️ Legal: ...        │
│                                     │ 📊 Accountant: ...   │
│                                     │ 🔍 Investigator: ... │
└─────────────────────────────────────┴──────────────────────┘
```

*Option B: Tabbed Comments*
```
┌────────────────────────────────────────────────────────────┐
│                     MAIN CONTENT                           │
├────────────────────────────────────────────────────────────┤
│ [👮‍♀️ Frenly] [⚖️ Legal] [📊 Accountant] [🔍 Investigator]   │
├────────────────────────────────────────────────────────────┤
│ Currently showing: Frenly AI comments...                   │
└────────────────────────────────────────────────────────────┘
```

*Option C: Floating Bubbles (Chat Heads)*
```
                                              ┌─────┐
                                              │ 👮‍♀️  │◄── Click to expand
                                              ├─────┤
                                              │ ⚖️  │
                                              ├─────┤
                                              │ 📊  │
                                              ├─────┤
                                              │ 🔍  │
                                              └─────┘
```

**Contextual Triggers - When Each Persona Activates:**

| Trigger | Which Personas Activate |
|---------|------------------------|
| **Mirroring Pattern Detected** | 👮‍♀️ Frenly, 📊 Accountant |
| **Related Party Found** | ⚖️ Legal, 🔍 Investigator |
| **Amount > Threshold** | 📊 Accountant, ⚖️ Legal |
| **Adjudication Required** | All 4 personas |
| **Evidence Weakness** | ⚖️ Legal, 🔍 Investigator |
| **Project Over Budget** | 📊 Accountant, 👮‍♀️ Frenly |
| **Preparing SAR** | ⚖️ Legal, 📊 Accountant |
| **Entity Network Complexity** | 👮‍♀️ Frenly, 🔍 Investigator |
| **Ghost Employee Detected** | 📊 Accountant, 🔍 Investigator |
| **Statute of Limitations Near** | ⚖️ Legal |

**Sample Comment Templates by Persona:**

| Persona | Comment Examples |
|---------|------------------|
| **👮‍♀️ Frenly AI** | "Hey! I spotted something interesting..." / "This matches a pattern I've seen before!" / "Want me to find similar transactions?" / "Good catch! This is 87% likely to be fraudulent." |
| **⚖️ Legal Advisor** | "LEGAL NOTE: Document the chain of custody." / "For court admissibility, ensure..." / "This may constitute [specific law violation]." / "⚠️ Statute of limitations: 18 months remaining." |
| **📊 Forensic Accountant** | "Statistical analysis shows..." / "Benford's Law deviation: 34.2% (significant)" / "Total exposure: Rp X.XX billion" / "Margin of error: ±2.3%" |
| **🔍 Senior Investigator** | "In my experience, this usually means..." / "Key questions to ask the suspect:" / "Don't forget to check..." / "💡 TIP: [practical advice]" |

**Case Summary - All Personas View:**
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ 📋 CASE SUMMARY: Project Sudirman Fraud Investigation                          │
│ Status: Under Investigation | Lead: Investigator Budi                         │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 👮‍♀️ FRENLY AI - CASE OVERVIEW                                            │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  "I've analyzed 2,345 transactions and found:                           │ │
│  │   • 127 suspicious transactions (5.4% of total)                         │ │
│  │   • 4 distinct fraud patterns detected                                   │ │
│  │   • 12 entities of interest in the network                              │ │
│  │   • Estimated fraud amount: Rp 8.7 billion                              │ │
│  │                                                                          │ │
│  │   Strongest pattern: MIRRORING (42 transactions, Rp 3.2B)               │ │
│  │   I'm 94% confident this is organized fraud."                           │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ ⚖️ LEGAL ADVISOR - PROSECUTION READINESS                                 │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  EVIDENCE ASSESSMENT:                                                    │ │
│  │  ├─ Documentary Evidence: ██████████░░ 85% complete                     │ │
│  │  ├─ Witness Statements:   ████████░░░░ 65% complete                     │ │
│  │  ├─ Expert Testimony:     ██████░░░░░░ 50% prepared                     │ │
│  │  └─ Chain of Custody:     ███████████░ 95% documented                   │ │
│  │                                                                          │ │
│  │  APPLICABLE LAWS:                                                        │ │
│  │  • UU No. 31/1999 - Anti-Corruption (max 20 years)                      │ │
│  │  • UU No. 8/2010 - Money Laundering (max 15 years)                      │ │
│  │  • KUHP Pasal 372 - Embezzlement (max 4 years)                          │ │
│  │                                                                          │ │
│  │  ⚠️ CAUTION: Mens rea evidence still weak for 3 subjects                │ │
│  │  ⏰ Statute of Limitations: 24 months remaining                          │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 📊 FORENSIC ACCOUNTANT - FINANCIAL SUMMARY                               │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  FRAUD QUANTIFICATION:                                                   │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │ Category            │ Amount         │ Confidence │ Evidence    │   │ │
│  │  ├─────────────────────┼────────────────┼────────────┼─────────────┤   │ │
│  │  │ Material Leakage    │ Rp 2.30B       │ 95%        │ Strong      │   │ │
│  │  │ Price Inflation     │ Rp 1.82B       │ 90%        │ Strong      │   │ │
│  │  │ Ghost Employees     │ Rp 0.84B       │ 85%        │ Moderate    │   │ │
│  │  │ Kickbacks (est.)    │ Rp 1.45B       │ 70%        │ Weak        │   │ │
│  │  │ Phantom Vendors     │ Rp 2.29B       │ 92%        │ Strong      │   │ │
│  │  ├─────────────────────┼────────────────┼────────────┼─────────────┤   │ │
│  │  │ TOTAL FRAUD         │ Rp 8.70B       │ 87% avg    │             │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                          │ │
│  │  Benford's Law Analysis: ⚠️ Significant deviation (p < 0.001)           │ │
│  │  Ratio Analysis: 7 of 12 ratios outside normal range                    │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐ │
│  │ 🔍 SENIOR INVESTIGATOR - CASE STRATEGY                                   │ │
│  ├──────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  PRIMARY SUSPECTS:                                                       │ │
│  │  1. Budi Santoso (Project Manager) - CENTRAL FIGURE                     │ │
│  │  2. Andi Wijaya (Procurement) - FACILITATOR                             │ │
│  │  3. Dewi Lestari (Finance) - POSSIBLE ACCOMPLICE                        │ │
│  │                                                                          │ │
│  │  RECOMMENDED NEXT STEPS:                                                 │ │
│  │  ☐ Interview Dewi first - weakest link, may cooperate                   │ │
│  │  ☐ Obtain Budi's personal bank statements                               │ │
│  │  ☐ Physical site inspection at project location                         │ │
│  │  ☐ Cross-check vendor addresses with residential records                │ │
│  │  ☐ Request phone records for kickback timing analysis                   │ │
│  │                                                                          │ │
│  │  💡 TIP: The 4% fee pattern suggests a prearranged kickback rate.       │ │
│  │  Look for communications mentioning "handling" or "processing" fees.    │ │
│  │                                                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  [📤 Export All Insights] [🖨️ Print Case Brief] [📧 Share with Team]           │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

| Phase | Features | Timeline |
|-------|----------|----------|
| **Phase 5A** | Location Tracking, Pattern Library | Week 9-10 |
| **Phase 5B** | Risk Scoring Engine, Keyboard Shortcuts | Week 11-12 |
| **Phase 5C** | Collaborative Annotations, Asset Tracing | Week 13-14 |
| **Phase 5D** | AI Training Mode, External Integrations | Week 15-16 |
| **Phase 6A** | ACFE Fraud Tree Detection (Asset Misappropriation) | Week 17-18 |
| **Phase 6B** | Corruption & Procurement Fraud Detection | Week 19-20 |
| **Phase 6C** | Financial Statement Fraud & Benford's Law | Week 21-22 |
| **Phase 6D** | Project Cost Analysis, Four Personas System | Week 23-24 |

---

## Conclusion

This comprehensive workflow document serves as the definitive blueprint for the Simple378 frontend application. It bridges the gap between the current implementation (which is already quite sophisticated) and the proposed ideal state.

**Current State:**
- ✅ 7 of 9 core pages implemented
- ✅ Excellent UI/UX with glassmorphism and animations
- ✅ Real-time features with WebSocket integration
- ✅ Strong accessibility foundation

**Next Steps:**
1. Prioritize Mapping page implementation (critical gap)
2. Enhance Ingestion for guided workflow
3. Build Meta Agent for contextual AI guidance
4. Add Financial Visualization for comprehensive reporting

By following this workflow specification, the development team has a clear roadmap from the current 85% implementation to 100% feature completion with world-class UX.

---

## Page Documentation Links

For detailed documentation on each individual page, see the following files in `docs/frontend/pages/`:

### Core Pages (Workflow Order)

| # | Page | Documentation | Route |
|---|------|---------------|-------|
| 1 | Login | [01_LOGIN.md](./pages/01_LOGIN.md) | `/login` |
| 2 | Case Management | [02_CASE_LIST.md](./pages/02_CASE_LIST.md) | `/cases` |
| 3 | Case Detail | [03_CASE_DETAIL.md](./pages/03_CASE_DETAIL.md) | `/cases/:id` |
| 4 | Ingestion & Mapping | [04_INGESTION.md](./pages/04_INGESTION.md) | `/ingestion` |
| 5 | Reconciliation | [06_RECONCILIATION.md](./pages/06_RECONCILIATION.md) | `/reconciliation` |
| 6 | Human Adjudication | [07_ADJUDICATION.md](./pages/07_ADJUDICATION.md) | `/adjudication` |
| 7 | Dashboard | [08_DASHBOARD.md](./pages/08_DASHBOARD.md) | `/dashboard` |
| 8 | Visualization | [09_VISUALIZATION.md](./pages/09_VISUALIZATION.md) | `/visualization` |
| 9 | Final Summary | [10_SUMMARY.md](./pages/10_SUMMARY.md) | `/summary` |

### Extended Pages (Bonus Features)

| Page | Documentation | Route |
|------|---------------|-------|
| Search Analytics | [SEARCH_ANALYTICS.md](./pages/SEARCH_ANALYTICS.md) | `/search-analytics` |
| Semantic Search | [SEMANTIC_SEARCH.md](./pages/SEMANTIC_SEARCH.md) | `/semantic-search` |

### Global Pages

| Page | Documentation | Access |
|------|---------------|--------|
| Settings | [SETTINGS.md](./pages/SETTINGS.md) | Header icon (⚙️) |
| Error Pages | [ERROR_PAGES.md](./pages/ERROR_PAGES.md) | Fallback routes |

### Implementation Resources

| Document | Purpose |
|----------|---------|
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Step-by-step implementation instructions |
| [pages/README.md](./pages/README.md) | Page documentation index |

---

**Document Version:** 1.1  
**Last Updated:** December 6, 2025  
**Maintainer:** Development Team
