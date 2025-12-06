# Financial Visualization

**Route:** `/visualization`  
**Component:** `src/pages/FinancialVisualization.tsx`  
**Status:** ✅ Implemented (Core) | 🚧 In Progress (Advanced) | 📋 Planned (Simulation)

---

## Overview

The Financial Visualization page provides comprehensive interactive financial charts and data visualizations for fraud detection analysis. Users can explore cash flow trends, expense breakdowns, balance sheet summaries, milestone tracking, and receive AI-generated insights about financial patterns and anomalies.

**Key Features:**

- 💸 **Cashflow Balance Analysis** - Split-view categorization of transactions

- 🏁 **Phase & Milestone Tracking** - Project lifecycle and fund release management
- 🕵️‍♂️ **Fraud Detection** - Anomaly comparison and peer benchmarking
- 📊 **Interactive Charts** - Entity graphs, timelines, heatmaps
- 🤖 **AI Insights** - Contextual pattern explanations
- 📈 **Scenario Simulation** - Burn rate and what-if analysis (planned)

---

## Layout

### Desktop View (≥1024px)


```text

┌──────────────────────────────────────────────────────────────────────┐
│  📈 Financial Visualization    [Date Range ▼] [Case ▼] [Export ▼]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  📊 KPI SUMMARY                                                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │ Cash Flow│  │ Balance  │  │ P&L      │  │ Burn Rate│       │ │
│  │  │ +Rp 2.4B │  │ 1.8:1    │  │ +Rp 850M │  │ Normal   │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐  │
│  │  💸 CASHFLOW BALANCE       │  │  🏁 MILESTONE TRACKER        │  │
│  │  ─────────────────────────│  │  ──────────────────────────│  │
│  │  [Split view with bank    │  │  [Phase progress stepper   │  │
│  │   statements vs expenses] │  │   with completion actions] │  │
│  └────────────────────────────┘  └──────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐  │
│  │  🕵️‍♂️ FRAUD DETECTION      │  │  📊 TREND CHARTS             │  │
│  │  ─────────────────────────│  │  ──────────────────────────│  │
│  │  [Anomaly comparison      │  │  [Line charts, pie charts, │  │
│  │   and risk flags]         │  │   treemap visualizations]  │  │
│  └────────────────────────────┘  └──────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  🤖 AI INSIGHTS & RECOMMENDATIONS                              │ │
│  │  [Contextual analysis and pattern explanations]               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 💸 Cashflow Balance View

This visualization displays a **split-view cashflow balance** that clearly separates bank statement categories from expense categories, ultimately calculating the **true project transactions**.

### Key Formula

```text
┌─────────────────────────────────────────────────────────────────────┐
│  🎯 PROJECT TRANSACTIONS CALCULATION                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    Total Cashflow (Bank Statements)                                 │
│         − Mirror Transactions (Internal Transfers)                  │
│         − Personal Expenses                                         │
│    ─────────────────────────────────────                        │
│    = Net Project Transactions 💼                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Cashflow Balance Interface

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 💸 Cashflow Balance Analysis              [Date Range ▼] [Case ▼] [⟳ Sync] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📊 TOTAL CASHFLOW SUMMARY                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │ 💰 Total   │  │ 🔄 Mirror  │  │ 🏠 Personal│  │ 💼 Project │    │   │
│  │  │ Cashflow   │  │ Transactions│  │ Expenses   │  │ Transactions│   │   │
│  │  │            │  │            │  │            │  │            │    │   │
│  │  │ $5.2M      │  │ -$1.8M     │  │ -$850K     │  │ = $2.55M   │    │   │
│  │  │            │  │ (34.6%)    │  │ (16.3%)    │  │ (49.1%)    │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐ ┌─────────────────────────────────────┐   │
│  │ 🏦 BANK STATEMENTS          │ │ 📋 EXPENSE CATEGORIES               │   │
│  │ (Source of Funds)           │ │ (Outflow Classification)            │   │
│  ├─────────────────────────────┤ ├─────────────────────────────────────┤   │
│  │                             │ │                                     │   │
│  │ ┌─────────────────────────┐ │ │ ┌─────────────────────────────────┐ │   │
│  │ │ 🔄 MIRROR TRANSACTIONS  │ │ │ │ 🏠 PERSONAL EXPENSES            │ │   │
│  │ │ ─────────────────────── │ │ │ │ ───────────────────────────────│ │   │
│  │ │ ▶ Bank A → Bank B       │ │ │ │ ▶ Food & Dining     $45K      │ │   │
│  │ │   $800K                 │ │ │ │ ▶ Shopping          $120K     │ │   │
│  │ │ ▶ Bank B → Bank A       │ │ │ │ ▶ Entertainment     $85K      │ │   │
│  │ │   $600K                 │ │ │ │ ▶ Utilities         $65K      │ │   │
│  │ │ ▶ Wallet → Bank         │ │ │ │ ▶ Travel (Personal) $180K     │ │   │
│  │ │   $400K                 │ │ │ │ ▶ Healthcare        $95K      │ │   │
│  │ │                         │ │ │ │ ▶ Other Personal    $260K     │ │   │
│  │ │ ───────────────────     │ │ │ │ ─────────────────────────────  │ │   │
│  │ │ Total:     $1.8M        │ │ │ │ Total:             $850K      │ │   │
│  │ │ (Excluded from proj.)   │ │ │ │ (Excluded from project)       │ │   │
│  │ └─────────────────────────┘ │ │ └─────────────────────────────────┘ │   │
│  │                             │ │                                     │   │
│  │ ┌─────────────────────────┐ │ │ ┌─────────────────────────────────┐ │   │
│  │ │ 💵 INCOME SOURCES       │ │ │ │ 💼 OPERATIONAL EXPENSES         │ │   │
│  │ │ ─────────────────────── │ │ │ │ ───────────────────────────────│ │   │
│  │ │ ▶ Salary/Revenue        │ │ │ │ ▶ Staff Payroll    $680K      │ │   │
│  │ │   $3.2M                 │ │ │ │ ▶ Office Rent      $250K      │ │   │
│  │ │ ▶ Investment Returns    │ │ │ │ ▶ Software/SaaS    $180K      │ │   │
│  │ │   $450K                 │ │ │ │ ▶ Marketing        $220K      │ │   │
│  │ │ ▶ Loan Disbursement     │ │ │ │ ▶ Legal/Compliance $150K      │ │   │
│  │ │   $1.5M                 │ │ │ │ ▶ Vendors/Supplies $320K      │ │   │
│  │ │                         │ │ │ │ ─────────────────────────────  │ │   │
│  │ │ Total:     $5.15M       │ │ │ │ Total:            $1.8M       │ │   │
│  │ └─────────────────────────┘ │ │ └─────────────────────────────────┘ │   │
│  │                             │ │                                     │   │
│  │ ┌─────────────────────────┐ │ │ ┌─────────────────────────────────┐ │   │
│  │ │ 🔀 EXTERNAL TRANSFERS   │ │ │ │ 🏗️ PROJECT-SPECIFIC EXPENSES   │ │   │
│  │ │ ─────────────────────── │ │ │ │ ───────────────────────────────│ │   │
│  │ │ ▶ Foreign Remittance    │ │ │ │ ▶ Case 201-C Consulting        │ │   │
│  │ │   $250K                 │ │ │ │   $450K                        │ │   │
│  │ │ ▶ Wire Transfers        │ │ │ │ ▶ Case 205-A Licenses          │ │   │
│  │ │   $180K                 │ │ │ │   $120K                        │ │   │
│  │ │                         │ │ │ │ ▶ Case 198-B Equipment         │ │   │
│  │ │ Total:     $430K        │ │ │ │   $180K                        │ │   │
│  │ └─────────────────────────┘ │ │ │ ─────────────────────────────  │ │   │
│  │                             │ │ │ Total (Project):  $750K       │ │   │
│  │                             │ │ └─────────────────────────────────┘ │   │
│  └─────────────────────────────┘ └─────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📈 WATERFALL BREAKDOWN                                              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │    $5.2M │████████████████████████████████████████████████│ Total   │   │
│  │          │░░░░░░░░░░░░░░░░                                │-1.8M    │   │
│  │    $3.4M │████████████████████████████████                │         │   │
│  │          │░░░░░░░░░░                                      │-850K    │   │
│  │    $2.55M│██████████████████████████                      │ = Proj  │   │
│  │                                                                      │   │
│  │    Legend: ████ = Retained   ░░░░ = Excluded/Deducted               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                         [📄 Export Report] [📊 Download CSV]               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cashflow Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| `CashflowSummaryBar` | Top-level KPIs showing Total → Mirror → Personal → Project | ✅ Implemented |
| `BankStatementPanel` | Left panel with bank categories | 🚧 In Progress |
| `ExpenseCategoryPanel` | Right panel with expense breakdown | 🚧 In Progress |
| `MirrorTransactionCard` | Highlights internal transfers to exclude | 🚧 In Progress |
| `PersonalExpenseCard` | Personal spending breakdown | 🚧 In Progress |
| `OperationalExpenseCard` | Business operations costs | 🚧 In Progress |
| `ProjectExpenseCard` | Case/project specific costs | 🚧 In Progress |
| `WaterfallChart` | Visual flow from Total → Project | 📋 Planned |

### Bank Statement Categories

| Category | Description | Treatment |
|----------|-------------|-----------|
| **🔄 Mirror Transactions** | Internal transfers between owned accounts | **Excluded** from project |
| **💵 Income Sources** | Salary, revenue, investment returns, loans | Counted in Total |
| **🔀 External Transfers** | Wire transfers, remittances | Evaluated per case |

### Expense Categories

| Category | Description | Treatment |
|----------|-------------|-----------|
| **🏠 Personal Expenses** | Food, shopping, entertainment, personal travel | **Excluded** from project |
| **💼 Operational Expenses** | Staff, rent, software, marketing, legal | Business operations |
| **🏗️ Project-Specific** | Case-related consulting, licenses, equipment | **Core project costs** |

### Categorization Logic

```typescript
// Mirror Transaction Detection
const isMirrorTransaction = (tx: Transaction): boolean => {
  return (
    tx.counterpartyType === 'OWN_ACCOUNT' ||
    tx.description.match(/transfer.*between.*accounts/i) ||
    tx.tags.includes('internal_transfer')
  );
};

// Personal Expense Detection
const isPersonalExpense = (tx: Transaction): boolean => {
  const personalCategories = [
    'FOOD_DINING', 'SHOPPING', 'ENTERTAINMENT',
    'PERSONAL_TRAVEL', 'HEALTHCARE', 'PERSONAL_OTHER'
  ];
  return personalCategories.includes(tx.category);
};

// Project Transaction Calculation
const calculateProjectTransactions = (summary: CashflowSummary): number => {
  return summary.totalCashflow - summary.mirrorTransactions - summary.personalExpenses;
};
```

---

## 🏁 Phase & Milestone Tracker

The **Phase & Milestone Tracker** manages the project lifecycle based on fund release milestones (e.g., Down Payment, Progress Payments, Final Handover). It provides a system for users to **mark phases as complete**, triggering the next stage of funding.

### Core Workflows

1. **Define Milestones:** Set up Down Payment, Progress 1, Progress 2, etc.
2. **Track Spend vs Release:** Compare actual expenses against the released funds for each phase
3. **Mark Completion:** Users explicitly mark a phase as "Complete" to trigger the next stage of funding

### Milestone Tracker Interface

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏁 Project Progress & Fund Release       [Case: Case 201-C ▼]  [+ Add Phase]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  PROJECT LIFELINE: 65% Complete                                       │  │
│  │                                                                       │  │
│  │  1. DOWN PAYMENT    2. PROGRESS #1     3. PROGRESS #2     4. HANDOVER │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────┐ │  │
│  │  │   ✅ PAID   │───▶│   ✅ PAID   │───▶│   ⌛ ACTIVE │───▶│ 🔒 LOCK │ │  │
│  │  │ Released:   │    │ Released:   │    │ Release:    │    │ Release:│ │  │
│  │  │ $50,000     │    │ $100,000    │    │ $100,000    │    │ $50,000 │ │  │
│  │  └─────────────┘    └─────────────┘    └──────┬──────┘    └─────────┘ │  │
│  │                                               │                       │  │
│  └───────────────────────────────────────────────┼───────────────────────┘  │
│                                                  ▼                          │
│  ┌───────────────────────────────────────────────┬───────────────────────┐  │
│  │ 📍 CURRENT PHASE: PROGRESS #2 (Construction)  │ 🛠️ PHASE ACTIONS      │  │
│  ├───────────────────────────────────────────────┤                       │  │
│  │                                               │ [ Mark as Complete ]  │  │
│  │  Status:      IN PROGRESS (Due: Oct 15)       │                       │  │
│  │  Funds avail: $100,000                        │ * Requires approval   │  │
│  │  Spent so far: $75,400  (75.4%)               │ * Releases next fund  │  │
│  │  Remaining:   $24,600                         │                       │  │
│  │                                               │ ───────────────────── │  │
│  │  Utilization Rate:                            │                       │  │
│  │  [██████████████░░░░░]                        │ 📎 Upload Evidence    │  │
│  │                                               │ 📝 Add Phase Note     │  │
│  │  Key Deliverables:                            │                       │  │
│  │  [x] Foundation laid                          │                       │  │
│  │  [x] Framework erected                        │                       │  │
│  │  [ ] Roof installed                           │                       │  │
│  │                                               │                       │  │
│  └───────────────────────────────────────────────┴───────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 📉 SPEND VELOCITY (Actual vs Planned)                                 │  │
│  │                                                                       │  │
│  │   $ │       / Actual Spend                                            │  │
│  │     │      /                                                          │  │
│  │     │     /   ___ Planned Releases (Steps)                            │  │
│  │     │    / __|                                                        │  │
│  │   0 └---^-|--|-----------------------------------------------------   │  │
│  │        DP P1 P2                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Milestone Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| `MilestoneStepper` | Visual chain of phases with status indicators | 📋 Planned |
| `PhaseControlPanel` | Action area to mark phases complete, upload proof | 📋 Planned |
| `FundUtilizationBar` | Progress bar showing Spent / Released Amount | ✅ Implemented |
| `BurnUpChart` | Graph comparing cumulative spend vs stepped releases | 📋 Planned |
| `DeliverableChecklist` | Track phase-specific completion criteria | 📋 Planned |

### Milestone Data Model

```typescript
type MilestoneType = 'DOWN_PAYMENT' | 'PROGRESS' | 'HANDOVER' | 'RETENTION';
type MilestoneStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED' | 'PAID';

interface Milestone {
  id: string;
  name: string; // "Termin 1", "Down Payment"
  type: MilestoneType;
  status: MilestoneStatus;
  amountReleased: number;
  actualSpend: number;
  dueDate: Date;
  deliverables: Deliverable[];
  evidence: Document[];
}

interface Deliverable {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  approvedBy?: string;
}
```

---

## 🕵️‍♂️ Fraud Detection & Anomaly Comparison

This view provides dedicated tools to **"compare to find fraud"**, highlighting discrepancies between the current project's spending and established baselines.

### Comparison Logic to Detect Fraud

1. **Baseline Variance:** "This Phase 2 foundation cost **40% more** than the average of our last 10 similar projects."
2. **Vendor Price Analysis:** "Vendor X charges $50/unit, while the market average is $35/unit."
3. **Timing Anomalies:** "Funds were released for 'Roof' before 'Foundation' was marked complete."

### Fraud Detection Interface

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🕵️‍♂️ FRAUD & ANOMALY DETECTION               [Case 201-C ▼] [Sensitivity ▼]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────┐  │
│  │ 🚩 RISK FLAGS FOUND: 3 High, 2 Med  │  │ 📊 PEER COMPARISON (Cost)    │  │
│  ├─────────────────────────────────────┤  ├──────────────────────────────┤  │
│  │                                     │  │ $150k │         ● You        │  │
│  │ 🛑 HIGH RISK                        │  │       │                      │  │
│  │ 1. [Invoice #992] Duplicate Amount  │  │ $100k │       ●   ●          │  │
│  │    Exact match with Invoice #840    │  │       │     ●   ●   ●        │  │
│  │    (Potential Double Billing)       │  │ $50k  │   ●   ● ●            │  │
│  │                                     │  │       │                      │  │
│  │ 🛑 HIGH RISK                        │  │    0  └───────┴───────┴───   │  │
│  │ 2. [Vendor: Apex Build] Price Spike │  │        Case A  Case B  Case C│  │
│  │    Unit cost 45% > Market Rate      │  │                              │  │
│  │                                     │  │ Analysis: This case is in    │  │
│  │ ⚠️ MEDIUM RISK                      │  │ the 95th percentile (High).  │  │
│  │ 3. [Phase 2] Early Release          │  │                              │  │
│  │    Released 5 days before Sched.    │  │                              │  │
│  └─────────────────────────────────────┘  └──────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 🔍 VENDOR OUTLIER ANALYSIS (Scatter Plot: Price vs Quantity)          │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  Price/Unit                                                           │  │
│  │    ↑                                          🔴 Outlier (Invoice #99)│  │
│  │    │           ● (Normal Cluster)                                     │  │
│  │    │          ●●●                                                     │  │
│  │    │         ●●●●●                                                    │  │
│  │    │          ●●●           ●                                         │  │
│  │    │                                                                  │  │
│  │    └───────────────────────────────────────────────────→ Quantity     │  │
│  │                                                                       │  │
│  │  [ View Invoice Details ]  [ Mark as Investigated ]                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Fraud Analysis Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| `RiskFlagList` | Prioritized list of detected anomalies (High/Med/Low) | 📋 Planned |
| `PeerBenchmarkChart` | Comparison of this project's KPIs vs similar historical projects | 📋 Planned |
| `OutlierScatterPlot` | Visual detection of pricing anomalies | 📋 Planned |
| `AnomalyDetailModal` | Drill-down view to investigate a specific red flag | 📋 Planned |

---

## 📊 General Dashboard & Charts

### KPI Summary Cards

```text
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ 💰 CASH FLOW     │  │ 📊 BALANCE SHEET │  │ 📈 P&L SUMMARY       │
│                  │  │                  │  │                      │
│   ↑ +$2.4M      │  │  Ratio: 1.8:1   │  │  Net: +$850K        │
│   (15% growth)   │  │  ✓ Healthy      │  │  (12% margin)        │
└──────────────────┘  └──────────────────┘  └──────────────────────┘
```

| Card | Metric | Good Indicator |
|------|--------|----------------|
| **Cash Flow** | Net cash position | Positive, growing |
| **Balance Sheet** | Asset/Liability ratio | >1.5 |
| **P&L Summary** | Net profit margin | >10% |
| **Operating Costs** | Month-over-month change | Stable/decreasing |

### Chart Types Implemented


#### 1. Entity Relationship Graph ✅


**Location:** Case Detail Page - Graph Tab  
**Technology:** React Flow

**Features:**

- Interactive node-based graph

- Progressive loading (depth-based expansion)
- Multiple node types: Subject, Account, Bank
- Edge weight indicates transaction amount
- Click to expand neighbors


#### 2. Dashboard Charts ✅


**Location:** Dashboard Page  
**Technology:** Recharts

**Chart Types:**

- Bar Chart: Cases by status distribution

- Line Chart: Case creation trends over time
- Pie Chart: Risk level distribution
- Area Chart: Alert trends


#### 3. Timeline Visualization ✅


**Location:** Case Detail Page - Timeline Tab

**Features:**

- Scrollable timeline with date markers

- Event clustering by date
- Transaction details on hover
- Filtering by event type


#### 4. Balance Sheet Treemap 📋


**Status:** Planned

**Features:**

- Hierarchical view of financial structure

- Click to drill down into categories
- Color-coded by health indicators

---

## 🧠 Advanced Logical Deduction Views (Proposed)

These additional visualization concepts rely on **deductive logic** to uncover deeper, non-obvious fraud patterns.

### 1. 🕸️ Entity Link Analysis (The "Kickback Hunter")

**Logical Deduction:** *"If Person A approves payments to Vendor B, and Vendor B frequently transfers money to Person A (or their spouse), a conflict of interest exists."*

- **View:** Node-Link Graph (Force Directed)
- **Nodes:** People, Vendors, Bank Accounts, Addresses
- **Edges:** Financial Transactions, Shared Metadata (e.g., "Same Phone Number")
- **Key Patterns:**
  - **Circular Flow:** Entity A → Entity B → Entity A (Money wash)
  - **Hub & Spoke:** One seemingly unrelated person receiving small amounts from many vendors

### 2. 🗺️ Geospatial Geofencing (The "Project Boundary")

**Logical Deduction:** *"Project expenses should occur near the project site. Gas/Meals > 50km away are likely personal."*

- **View:** Map interface with specific "Project Zones"
- **Logic:**
  - Define `Project Coordinates` (lat/long)
  - Calculate distance for every transaction location
  - **Mark as Anomaly** if `Distance > Threshold` (e.g., 20km)
- **Deduction:** High volume of spending in "Resort City" while Project is in "Industrial Zone"

### 3. 📅 Temporal Behavioral Heatmap

**Logical Deduction:** *"Corporate operational spending matches business hours. 'Office Supplies' bought at 11 PM on a Sunday are suspicious."*

- **View:** Heatmap Grid (X-Axis: Days of Week, Y-Axis: Hours of Day)
- **Logic:**
  - **Business Hours:** Mon-Fri, 9am-6pm
  - **Anomaly:** High-value transactions in "Off-hours" cells
- **Frequency:** Sudden bursts of transactions (structuring) just before monthly close

### 4. 📈 Invoice Sequence Forensics (The "Shell Company" Detector)

**Logical Deduction:** *"Legitimate vendors have multiple clients. If their invoice numbers to us are perfectly sequential (e.g., #001, #002, #003) over months, we are their only customer."*

- **View:** Scatter Plot (X-Axis: Date, Y-Axis: Invoice Number)
- **Logic:**
  - **Normal Vendor:** Gap in numbers (e.g., #105 today, #350 next week)
  - **Shell Company:** Linear 45-degree line (e.g., #101, #102, #103)

### 5. 📊 Threshold Avoidance Histogram (The "Structuring" Detector)

**Logical Deduction:** *"If the manager approval limit is $5,000, fraudsters will split a $12,000 expense into three payments of $4,000 or $4,999 to bypass review."*

- **View:** Histogram of Transaction Amounts (Bin size: $100)
- **Logic:**
  - Mark key policy thresholds (e.g., $5k, $10k)
  - **Anomaly:** Statistical "cliff" or abnormal spike in the bin *just below* the threshold
- **Deduction:** High frequency of transactions at 99% of limit proves "Intent to Evade Control"

### 6. 👯 Shared Attribute Overlap (The "Ghost" Detector)

**Logical Deduction:** *"Employees and Vendors are distinct. If an Employee shares a Bank Account or Address with a Vendor, it is fraud."*

- **View:** Venn Diagram or Overlap Matrix
- **Logic:**
  - **Datasets:** Employee PII vs Vendor Master Data
  - **Match Keys:** Phone Number, Bank Account #, Tax ID, Physical Address
- **Deduction:** Any non-zero intersection between "Employee Personal Info" and "Vendor Payment Info" is an immediate red flag

---

## 🔮 Scenario Planning & Simulation (Proposed)

While forensics looks back, simulation helps avoid future crises by modeling "What-If" scenarios.

### 1. 🔥 Burn Rate Simulator

Predicts the exact "Day Zero" when funds will deplete based on current acceleration.

**Deduction:** "Spending velocity increased 15% this month. At this rate, Phase 2 funds run out on **Oct 12th** (3 weeks early)."

**Action:** Triggers an early warning to request a budget variance or slow down purchasing.

### 2. 🔀 "What-If" Impact Analysis

Interactive sliders to adjust key variables and see the ripple effect on the project.

**Scenario Examples:**

- "What if we delay Phase 3 by 20 days?"

- "What if inflation raises materials cost by 8%?"

**Outcomes:**

- Cash pooling interest impact

- Project margin threshold warnings

### 3. 📉 Vendor Dependency Risk

Simulates the collapse of a key node in the supply chain.

**Simulation:** "If Vendor X goes bankrupt..."

**Impact:** "We lose 40% of our 'Steel' supply. Replacement Vendor Y is 15% more expensive."

---

## Components

### Core Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| `KPICard` | Summary metrics display | ✅ Implemented |
| `TreemapChart` | Hierarchical balance sheet view | 📋 Planned |
| `LineChart` | Trend visualization | ✅ Implemented |
| `PieChart` | Category breakdown | ✅ Implemented |
| `AIInsightPanel` | Contextual AI analysis | ✅ Implemented |
| `DateRangePicker` | Time period filter controls | ✅ Implemented |
| `ExportButton` | PDF/CSV download options | ✅ Implemented |

### Cashflow Balance Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| `CashflowSummaryBar` | Top-level KPI metrics | ✅ Implemented |
| `BankStatementPanel` | Bank transaction categorization | 🚧 In Progress |
| `ExpenseCategoryPanel` | Expense breakdown panel | 🚧 In Progress |
| `WaterfallChart` | Visual flow diagram | 📋 Planned |

### Milestone Components (Tracking)

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| `MilestoneStepper` | Phase progress visualization | 📋 Planned |
| `PhaseControlPanel` | Phase action controls | 📋 Planned |
| `FundUtilizationBar` | Spend progress indicator | ✅ Implemented |
| `BurnUpChart` | Cumulative spend vs releases | 📋 Planned |

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| KPI Cards | ✅ Implemented | Cash flow, balance sheet, P&L summary |
| Entity Relationship Graph | ✅ Implemented | Interactive node-based network |
| Timeline Visualization | ✅ Implemented | Chronological event view |
| Expense Trend Charts | ✅ Implemented | Line charts over time |
| Category Breakdown | ✅ Implemented | Pie/donut charts |
| AI Insights Panel | ✅ Implemented | Contextual explanations |
| Interactive Charts | ✅ Implemented | Hover tooltips, click to drill |
| Date Range Filter | ✅ Implemented | Time period selection |
| Export Functionality | ✅ Implemented | PDF report, CSV data |
| **Cashflow Balance View** | 🚧 In Progress | Bank vs expense categorization |
| **Milestone Tracker** | 📋 Planned | Phase management system |
| **Fraud Detection** | 📋 Planned | Anomaly comparison tools |
| **Balance Sheet Treemap** | 📋 Planned | Hierarchical financial view |
| **Burn Rate Simulator** | 📋 Planned | Day Zero prediction |
| **What-If Analysis** | 📋 Planned | Variable adjustment sliders |
| **Vendor Stress Test** | 📋 Planned | Supply chain risk sim |

---

## API Integration

### Cashflow Balance

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/visualization/cashflow-summary` | Get cashflow totals and breakdown |
| GET | `/api/v1/visualization/mirror-transactions` | Get internal transfer list |
| GET | `/api/v1/visualization/expense-categories` | Get categorized expenses |
| GET | `/api/v1/visualization/project-transactions` | Get calculated project costs |
| POST | `/api/v1/visualization/recategorize` | Manually adjust transaction category |

### Milestone Management

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/projects/{id}/milestones` | Get all milestones and statuses |
| POST | `/api/v1/projects/{id}/milestones` | Create a new milestone |
| PATCH | `/api/v1/milestones/{id}/status` | Update milestone status |
| POST | `/api/v1/milestones/{id}/release-funds` | Trigger fund release |

### Fraud Analytics

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/analytics/fraud-flags/{caseId}` | Get list of detected anomalies |
| GET | `/api/v1/analytics/benchmarks` | Get peer comparison statistical data |
| GET | `/api/v1/analytics/vendor-outliers` | Get scatter plot data for vendor pricing |
| POST | `/api/v1/analytics/flags/resolve` | Mark a flag as "False Positive" or "Confirmed" |

### General Visualization

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/visualization/kpis` | Get KPI summary data |
| GET | `/api/v1/visualization/balance-sheet` | Get balance sheet hierarchical data |
| GET | `/api/v1/visualization/expenses` | Get expense trends over time |
| GET | `/api/v1/visualization/categories` | Get category breakdown |
| POST | `/api/v1/visualization/ai-insight` | Request AI analysis for specific pattern |
| GET | `/api/v1/visualization/export` | Generate PDF report |

---

## State Management

```typescript
// Cashflow balance state
interface CashflowBalanceState {
  totalCashflow: number;
  mirrorTransactions: number;
  personalExpenses: number;
  projectTransactions: number; // calculated
  
  bankCategories: BankCategory[];
  expenseCategories: ExpenseCategory[];
}

// React Query hooks
const { data: cashflow } = useQuery({
  queryKey: ['visualization', 'cashflow', dateRange, caseId],
  queryFn: () => api.getCashflowSummary(dateRange, caseId),
});

const { data: mirrorTx } = useQuery({
  queryKey: ['visualization', 'mirror-transactions', dateRange],
  queryFn: () => api.getMirrorTransactions(dateRange),
});

// Calculated project transactions
const projectTransactions = useMemo(() => {
  if (!cashflow) return 0;
  return cashflow.total - cashflow.mirrorTransactions - cashflow.personalExpenses;
}, [cashflow]);

// Milestone state
const { data: milestones } = useQuery({
  queryKey: ['projects', projectId, 'milestones'],
  queryFn: () => api.getProjectMilestones(projectId),
});

// Fraud analytics state
const { data: fraudFlags } = useQuery({
  queryKey: ['analytics', 'fraud-flags', caseId],
  queryFn: () => api.getFraudFlags(caseId),
});
```

---

## AI Insights Integration

The AI panel provides contextual analysis integrated with Frenly AI:

### Capabilities

- **Anomaly Detection:** Highlights unusual patterns in visualizations
- **Trend Explanation:** Explains why metrics changed
- **Recommendations:** Suggests actions based on data
- **Drill-Down Questions:** Users can ask follow-up questions

### Example Prompts

- "Why did expenses spike in March?"
- "Compare Q1 vs Q2 performance"
- "What's driving the increase in receivables?"
- "Explain the Phase 2 cost overrun"
- "Show me similar fraud patterns in historical data"

### Integration

```typescript
const { data: insight, mutate: askAI } = useMutation({
  mutationFn: (question: string) => api.getAIInsight({
    question,
    context: 'visualization',
    chartData: currentChartData,
    caseId: selectedCase?.id
  }),
});
```

---

## Chart Interactivity

| Interaction | Result |
|-------------|--------|
| **Hover** | Show tooltip with exact values |
| **Click** | Drill down to transactions |
| **Drag** | Select custom date range |
| **Scroll** | Zoom in/out on chart |
| **Double-click** | Reset to default view |
| **Right-click** | Context menu (export, annotate) |

---

## Filter Options

| Filter | Options |
|--------|---------|
| **Date Range** | Last 30 days, Quarter, Year, Custom range |
| **Category** | All, Operations, Personnel, Technology, etc. |
| **Entity** | All cases, Specific case, Multiple cases |
| **View** | Monthly, Quarterly, Yearly aggregation |
| **Risk Level** | All, High risk only, Medium+, etc. |

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Keyboard Navigation | Tab through charts, Enter to select |
| Screen Reader | ARIA labels on all chart elements |
| Color Contrast | WCAG AA compliant color schemes |
| Focus Indicators | Clear visual focus states |
| Alternative Text | Descriptive alt text for all visuals |
| Keyboard Shortcuts | `F` fullscreen, `P` print, `D` download |

---

## Performance Optimization

### Current Implementation

- ✅ **WebGL Rendering** - Charts use GPU acceleration via Recharts/D3
- ✅ **Server-side Aggregation** - Data pre-aggregated on backend
- ✅ **Lazy Loading** - Detail views loaded on demand
- ✅ **Query Caching** - React Query caches API responses
- ✅ **Memoization** - Expensive calculations cached

### Recommended Optimizations

```typescript
// Virtual scrolling for large datasets
import { FixedSizeList } from 'react-window';

// Debounce filter changes
const debouncedFilter = useDeBounce(filterValue, 300);

// Progressive chart loading
const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: ['chart-data', filters],
  queryFn: ({ pageParam = 0 }) => api.getChartData(pageParam, filters),
});
```

---

## Testing

### Unit Tests

- ✅ KPI calculation logic
- ✅ Chart data transformation
- ✅ Filter application
- ✅ Export functionality

### Integration Tests

- ✅ API endpoint integration
- ✅ Real-time data updates
- ✅ Multi-chart synchronization

### E2E Tests

- Date range selection flow
- Chart interaction (hover, click, drill-down)
- Export PDF/CSV
- AI insight requests

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen chart view |
| `P` | Trigger print/PDF export |
| `D` | Download data as CSV |
| `R` | Refresh all data |
| `Esc` | Close drill-down/modal |
| `←/→` | Navigate between time periods |
| `+/-` | Zoom in/out on charts |

---

## Related Files

```text

frontend/src/
├── pages/
│   └── FinancialVisualization.tsx      # Main page (planned)
├── components/visualization/
│   ├── KPICard.tsx                     # Summary metrics
│   ├── LineChart.tsx                   # Trend visualization
│   ├── PieChart.tsx                    # Category breakdown
│   ├── TreemapChart.tsx                # Balance sheet (planned)
│   ├── AIInsightPanel.tsx              # AI analysis
│   ├── CashflowSummaryBar.tsx          # Cashflow KPIs (planned)
│   ├── BankStatementPanel.tsx          # Bank categories (planned)
│   ├── ExpenseCategoryPanel.tsx        # Expense breakdown (planned)
│   ├── WaterfallChart.tsx              # Flow diagram (planned)
│   ├── MilestoneStepper.tsx            # Phase tracker (planned)
│   └── FraudDetectionPanel.tsx         # Anomaly view (planned)
└── lib/
    └── api.ts                           # API integration

backend/
├── app/api/v1/endpoints/
│   ├── visualization.py                 # Visualization endpoints
│   ├── analytics.py                     # Fraud analytics
│   └── projects.py                      # Milestone management
└── app/services/
    ├── cashflow_analyzer.py             # Cashflow categorization
    ├── fraud_detector.py                # Anomaly detection
    └── milestone_tracker.py             # Phase management
```

---

## Future Enhancements

### Phase 1: Core Implementation (Immediate)

- [ ] Create FinancialVisualization.tsx page with full layout
- [ ] Implement cashflow balance split-view system
- [ ] Build milestone tracker with phase management
- [ ] Add fraud detection panels and anomaly comparison
- [ ] Integrate Recharts for interactive visualizations
- [ ] Connect AI insights panel to Frenly AI
- [ ] Add real-time WebSocket data updates
- [ ] Implement export functionality (PDF/CSV)
- [ ] Build interactive filters and date range controls
- [ ] Optimize performance with virtual scrolling and lazy loading
- [ ] Ensure responsive design and accessibility compliance
- [ ] Create comprehensive testing suite

### Phase 2: Advanced Features (Q1 2026)

- [ ] 3D graph visualization for complex networks
- [ ] Time-based animation (replay transactions)
- [ ] Clustering algorithms (community detection)
- [ ] Comparative graphs (before/after intervention)
- [ ] Geospatial visualization on maps
- [ ] Scenario simulation with burn rate prediction
- [ ] What-if analysis sliders for variable adjustment
- [ ] Vendor stress testing and dependency risk modeling

### Phase 3: Deduction & Intelligence (Q2 2026)

- [ ] Sankey diagrams for flow-of-funds analysis
- [ ] Network analysis metrics dashboard
- [ ] ML-powered layout optimization
- [ ] Real-time streaming data visualization
- [ ] Collaborative annotation tools
- [ ] Entity link analysis (kickback detection)
- [ ] Geospatial geofencing for expense validation
- [ ] Temporal behavioral heatmaps
- [ ] Invoice sequence forensics (shell company detection)
- [ ] Threshold avoidance histogram analysis
- [ ] Shared attribute overlap detection

### Phase 4: Predictive Analytics (Q3 2026)

- [ ] Advanced logical deduction views
- [ ] Predictive fraud pattern recognition
- [ ] Automated anomaly alerting
- [ ] Risk scoring model visualization
- [ ] Compliance monitoring dashboards
- [ ] Multi-entity portfolio analysis
- [ ] Historical trend extrapolation
- [ ] Benchmarking against industry standards

---

## Related Documentation

- [Reconciliation](./07_RECONCILIATION.md) - Previous step
- [Summary Reports](./09_SUMMARY.md) - Next step
- [Cases](./03_CASES.md) - Entity graph integration
- [Dashboard](./02_DASHBOARD.md) - KPI charts
- [Frenly AI Assistant](./10_FRENLY_AI_ASSISTANT.md) - AI insights integration
- [Adjudication Queue](./06_ADJUDICATION_QUEUE.md) - Risk scoring visualization

---

**Maintained by:** Antigravity Agent  
**Last Updated:** December 6, 2025  
**Version:** 2.0.0
