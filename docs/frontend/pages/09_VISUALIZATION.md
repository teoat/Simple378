# 📈 Visualization Page

> Financial analysis and data visualization

**Route:** `/visualization`  
**File:** `src/pages/FinancialVisualization.tsx` (to be created)

---

## Overview

The Visualization page provides interactive financial charts and data visualizations. Users can explore cash flow trends, expense breakdowns, balance sheet summaries, and receive AI-generated insights about financial patterns.

---

## 💸 Cashflow Balance View (NEW)

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
│    ─────────────────────────────────────────                        │
│    = Net Project Transactions 💼                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Cashflow Balance Screenshot

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
│  │  │ Rp 5.2B    │  │ -Rp 1.8B   │  │ -Rp 850M   │  │ = Rp 2.55B │    │   │
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
│  │ │ ▶ Bank A → Bank B       │ │ │ │ ▶ Food & Dining     Rp 45M    │ │   │
│  │ │   Rp 800M               │ │ │ │ ▶ Shopping          Rp 120M   │ │   │
│  │ │ ▶ Bank B → Bank A       │ │ │ │ ▶ Entertainment     Rp 85M    │ │   │
│  │ │   Rp 600M               │ │ │ │ ▶ Utilities         Rp 65M    │ │   │
│  │ │ ▶ Wallet → Bank         │ │ │ │ ▶ Travel (Personal) Rp 180M   │ │   │
│  │ │   Rp 400M               │ │ │ │ ▶ Healthcare        Rp 95M    │ │   │
│  │ │                         │ │ │ │ ▶ Other Personal    Rp 260M   │ │   │
│  │ │ ───────────────────     │ │ │ │ ─────────────────────────────  │ │   │
│  │ │ Total:     Rp 1.8B      │ │ │ │ Total:             Rp 850M    │ │   │
│  │ │ (Excluded from proj.)   │ │ │ │ (Excluded from project)       │ │   │
│  │ └─────────────────────────┘ │ │ └─────────────────────────────────┘ │   │
│  │                             │ │                                     │   │
│  │ ┌─────────────────────────┐ │ │ ┌─────────────────────────────────┐ │   │
│  │ │ 💵 INCOME SOURCES       │ │ │ │ 💼 OPERATIONAL EXPENSES         │ │   │
│  │ │ ─────────────────────── │ │ │ │ ───────────────────────────────│ │   │
│  │ │ ▶ Salary/Revenue        │ │ │ │ ▶ Staff Payroll    Rp 680M    │ │   │
│  │ │   Rp 3.2B               │ │ │ │ ▶ Office Rent      Rp 250M    │ │   │
│  │ │ ▶ Investment Returns    │ │ │ │ ▶ Software/SaaS    Rp 180M    │ │   │
│  │ │   Rp 450M               │ │ │ │ ▶ Marketing        Rp 220M    │ │   │
│  │ │ ▶ Loan Disbursement     │ │ │ │ ▶ Legal/Compliance Rp 150M    │ │   │
│  │ │   Rp 1.5B               │ │ │ │ ▶ Vendors/Supplies Rp 320M    │ │   │
│  │ │                         │ │ │ │ ─────────────────────────────  │ │   │
│  │ │ Total:     Rp 5.15B     │ │ │ │ Total:            Rp 1.8B     │ │   │
│  │ └─────────────────────────┘ │ │ └─────────────────────────────────┘ │   │
│  │                             │ │                                     │   │
│  │ ┌─────────────────────────┐ │ │ ┌─────────────────────────────────┐ │   │
│  │ │ 🔀 EXTERNAL TRANSFERS   │ │ │ │ 🏗️ PROJECT-SPECIFIC EXPENSES   │ │   │
│  │ │ ─────────────────────── │ │ │ │ ───────────────────────────────│ │   │
│  │ │ ▶ Foreign Remittance    │ │ │ │ ▶ Case 201-C Consulting        │ │   │
│  │ │   Rp 250M               │ │ │ │   Rp 450M                      │ │   │
│  │ │ ▶ Wire Transfers        │ │ │ │ ▶ Case 205-A Licenses          │ │   │
│  │ │   Rp 180M               │ │ │ │   Rp 120M                      │ │   │
│  │ │                         │ │ │ │ ▶ Case 198-B Equipment         │ │   │
│  │ │ Total:     Rp 430M      │ │ │ │   Rp 180M                      │ │   │
│  │ └─────────────────────────┘ │ │ │ ─────────────────────────────  │ │   │
│  │                             │ │ │ Total (Project):  Rp 750M     │ │   │
│  │                             │ │ └─────────────────────────────────┘ │   │
│  └─────────────────────────────┘ └─────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📈 WATERFALL BREAKDOWN                                              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │    Rp 5.2B │████████████████████████████████████████████████│ Total │   │
│  │            │░░░░░░░░░░░░░░░░                                │-1.8B  │   │
│  │    Rp 3.4B │████████████████████████████████                │       │   │
│  │            │░░░░░░░░░░                                      │-850M  │   │
│  │    Rp 2.55B│██████████████████████████                      │ = Proj│   │
│  │                                                                      │   │
│  │    Legend: ████ = Retained   ░░░░ = Excluded/Deducted               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                         [📄 Export Report] [📊 Download CSV]               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cashflow Balance Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `CashflowSummaryBar` | Top-level KPIs showing Total → Mirror → Personal → Project | Top section |
| `BankStatementPanel` | Left panel with bank categories | Left split |
| `ExpenseCategoryPanel` | Right panel with expense breakdown | Right split |
| `MirrorTransactionCard` | Highlights internal transfers to exclude | Bank Panel (first) |
| `PersonalExpenseCard` | Personal spending breakdown | Expense Panel (first) |
| `OperationalExpenseCard` | Business operations costs | Expense Panel |
| `ProjectExpenseCard` | Case/project specific costs | Expense Panel |
| `WaterfallChart` | Visual flow from Total → Project | Bottom section |

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

### API Endpoints (Cashflow Balance)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/visualization/cashflow-summary` | Get cashflow totals and breakdown |
| GET | `/api/v1/visualization/mirror-transactions` | Get internal transfer list |
| GET | `/api/v1/visualization/expense-categories` | Get categorized expenses |
| GET | `/api/v1/visualization/project-transactions` | Get calculated project costs |
| POST | `/api/v1/visualization/recategorize` | Manually adjust category |

### State Management (Cashflow Balance)

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
```

### Categorization Rules

The system uses these rules to auto-categorize transactions:

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

// Project Transaction = Total - (Mirror + Personal)
const calculateProjectTransactions = (summary: CashflowSummary): number => {
  return summary.totalCashflow - summary.mirrorTransactions - summary.personalExpenses;
};
```

---

## ⏳ Phase & Milestone Tracker (NEW)

The **Phase & Milestone Tracker** manages the project lifecycle based on fund release milestones (e.g., Down Payment, Progress Payments, Final Handover). It provides a system for users to **mark phases as complete**, triggering the next stage of funding.

### Core Workflows

1. **Define Milestones:** Set up Down Payment, Progress 1, Progress 2, etc.
2. **Track Spend vs Release:** Compare actual expenses against the released funds for each phase.
3. **Mark Completion:** Users explicitly mark a phase as "Complete" to trigger the next stage of funding.

### Milestone Tracker Screenshot

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏁 Project Progress & Fund Release       [Case: Case 201-C ▼]  [+ Add Phase]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  PROJECT LIFELINE: 65% Complete                                       │  │
│  │                                                                       │  │
│  │  1. DOWN PAYMENT    2. PROGRESS #1     3. PROGRESS #2     5. HANDOVER │  │
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

### Components

| Component | Purpose |
|-----------|---------|
| `MilestoneStepper` | Visual chain of phases (Down Payment → Handover) with status indicators |
| `PhaseControlPanel` | Action area to **mark phases complete**, upload proof, and trigger releases |
| `FundUtilizationBar` | Progress bar showing `Spent / Released Amount` for the current phase |
| `BurnUpChart` | Graph comparing cumulative spend against stepped fund releases |

### API Endpoints (Milestone Management)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/projects/{id}/milestones` | Get all milestones and statuses |
| POST | `/api/v1/projects/{id}/milestones` | Create a new milestone (e.g., "First Progress") |
| PATCH | `/api/v1/milestones/{id}/status` | **Update status** (e.g., `ACTIVE` → `COMPLETED`) |
| POST | `/api/v1/milestones/{id}/release-funds` | Trigger fund release for a milestone |

### Data Model

```typescript
type MilestoneType = 'DOWN_PAYMENT' | 'PROGRESS' | 'HANDOVER' | 'RETENTION';

interface Milestone {
  id: string;
  name: string; // "Termin 1", "Down Payment"
  type: MilestoneType;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED' | 'PAID';
  amountReleased: number;
  actualSpend: number;
  deliverables: Deliverable[];
}
```

---

## �️‍♂️ Fraud Detection & Anomaly Comparison (NEW)

This view provides dedicated tools to **"compare to find fraud"**, highlighting discrepancies between the current project's spending and established baselines.

### Comparison Logic to Detect Fraud

1. **Baseline Variance:** "This Phase 2 foundation cost **40% more** than the average of our last 10 similar projects."
2. **Vendor Price Analysis:** "Vendor X charges $50/unit, while the market average is $35/unit."
3. **Timing Anomalies:** "Funds were released for 'Roof' before 'Foundation' was marked complete."

### Fraud Detection Screenshot

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

| Component | Purpose |
|-----------|---------|
| `RiskFlagList` | Prioritized list of detected anomalies (High/Med/Low) |
| `PeerBenchmarkChart` | Comparison of this project's KPIs vs similar historical projects |
| `OutlierScatterPlot` | Visual detection of pricing anomalies (e.g., high price for standard items) |
| `AnomalyDetailModal` | Drill-down view to investigate a specific red flag |

### API Endpoints (Fraud Analytics)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/analytics/fraud-flags/{caseId}` | Get list of detected anomalies |
| GET | `/api/v1/analytics/benchmarks` | Get peer comparison statistical data |
| GET | `/api/v1/analytics/vendor-outliers` | Get scatter plot data for vendor pricing |
| POST | `/api/v1/analytics/flags/resolve` | Mark a flag as "False Positive" or "Confirmed" |

---

## 📊 General Dashboard Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📈 Financial Visualization                Filters: [Date ▼] [Type ▼] [⟳]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐     │
│  │ 💰 CASH FLOW     │  │ 📊 BALANCE SHEET │  │ 📈 P&L SUMMARY       │     │
│  │                  │  │                  │  │                      │     │
│  │   ↑ +Rp 2.4B    │  │  Ratio: 1.8:1   │  │  Net: +Rp 850M      │     │
│  │   (15% growth)   │  │  ✓ Healthy      │  │  (12% margin)        │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ BALANCE SHEET BREAKDOWN (Treemap)                                     │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │ ┌─────────────────────────────┬────────────────────┬─────────────────┐│ │
│  │ │                             │                    │                 ││ │
│  │ │      ASSETS                 │   LIABILITIES      │  EQUITY         ││ │
│  │ │       67%                   │      25%           │   8%            ││ │
│  │ │                             │                    │                 ││ │
│  │ │  ┌──────────┬──────────┐   │  ┌──────────────┐  │                 ││ │
│  │ │  │ Cash     │Receivable│   │  │ Payables     │  │                 ││ │
│  │ │  │  45%     │   22%    │   │  │    25%       │  │                 ││ │
│  │ │  └──────────┴──────────┘   │  └──────────────┘  │                 ││ │
│  │ └─────────────────────────────┴────────────────────┴─────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌──────────────────────────────────────────┬────────────────────────────┐ │
│  │ MONTHLY EXPENSE TREND (24 months)         │ 🤖 AI INSIGHT             │ │
│  ├──────────────────────────────────────────┤                           │ │
│  │                                          │ "The 35% spike in March   │ │
│  │    ▲                           ▲         │  is due to Phase A costs  │ │
│  │   ╱ ╲       ▲                 ╱ ╲        │  in Case 201-C ($450K     │ │
│  │  ╱   ╲     ╱ ╲               ╱   ╲       │  external consulting)     │ │
│  │ ╱     ╲   ╱   ╲   ▲         ╱     ╲      │  and Case 205-A ($120K    │ │
│  │╱       ╲─╱     ╲─╱ ╲───────╱       ╲─    │  software licenses)."     │ │
│  │                                          │                           │ │
│  │ J F M A M J J A S O N D J F M A M J J A  │ [Ask Follow-up Question]  │ │
│  └──────────────────────────────────────────┴────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ EXPENSE BY CATEGORY (Pie)                                             │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │     ██████████████████  Operations (45%)                              │ │
│  │     ████████████        Personnel (28%)                               │ │
│  │     ██████              Technology (15%)                              │ │
│  │     ████                Marketing (8%)                                │ │
│  │     ██                  Other (4%)                                    │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                  [📄 Export PDF] [📊 Download Data]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| KPI Cards | ✅ | Cash flow, balance sheet, P&L |
| Balance Sheet Treemap | 🔲 | Interactive asset/liability view |
| Expense Trend Chart | ✅ | Line chart over time |
| Category Breakdown | ✅ | Pie/donut chart |
| AI Insights Panel | 🔲 | Contextual explanations |
| Interactive Charts | ✅ | Hover tooltips, click to drill |
| Date Range Filter | ✅ | Select time period |
| Export | ✅ | PDF report, CSV data |
| **Burn Rate Sim** | 🚀 | *Proposed:* Day Zero prediction |
| **What-Impact** | 🚀 | *Proposed:* Variable adjustment sliders |
| **Vendor Stress Test** | 🚀 | *Proposed:* Supply chain risk sim |

---

## Chart Types

### Treemap (Balance Sheet)

- Hierarchical view of financial structure
- Click to drill down into categories
- Color-coded by health indicators

### Line Chart (Trends)

- Monthly/quarterly data points
- Hover for exact values
- Click to see transactions

### Pie/Donut (Categories)

- Expense distribution
- Interactive segments
- Legend with percentages

### Bar Chart (Comparison)

- Side-by-side comparisons
- Budget vs Actual
- Year-over-year

---

## KPI Cards

| Card | Metric | Good Indicator |
|------|--------|----------------|
| **Cash Flow** | Net cash position | Positive, growing |
| **Balance Sheet** | Asset/Liability ratio | >1.5 |
| **P&L Summary** | Net profit margin | >10% |
| **Operating Costs** | Month-over-month change | Stable/decreasing |

---

## AI Insights

The AI panel provides contextual analysis:

- **Anomaly Detection:** Highlights unusual patterns
- **Trend Explanation:** Why metrics changed
- **Recommendations:** Suggested actions
- **Drill-Down Questions:** Ask for more detail

Example prompts:
- "Why did expenses spike in March?"
- "Compare Q1 vs Q2 performance"
- "What's driving the increase in receivables?"

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `KPICard` | Summary metrics |
| `TreemapChart` | Hierarchical view |
| `LineChart` | Trend visualization |
| `PieChart` | Category breakdown |
| `AIInsightPanel` | Contextual analysis |
| `DateRangePicker` | Filter controls |
| `ExportButton` | Download options |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/visualization/kpis` | Get KPI data |
| GET | `/api/v1/visualization/balance-sheet` | Get balance sheet data |
| GET | `/api/v1/visualization/expenses` | Get expense trends |
| GET | `/api/v1/visualization/categories` | Get category breakdown |
| POST | `/api/v1/visualization/ai-insight` | Request AI analysis |
| GET | `/api/v1/visualization/export` | Generate PDF report |

---

## State Management

```typescript
// Fetch KPI data
const { data: kpis } = useQuery({
  queryKey: ['visualization', 'kpis', dateRange],
  queryFn: () => api.getKPIs(dateRange),
});

// Fetch chart data
const { data: expenses } = useQuery({
  queryKey: ['visualization', 'expenses', dateRange],
  queryFn: () => api.getExpenseTrend(dateRange),
});

// AI insight state
const [aiQuestion, setAiQuestion] = useState('');
const { data: insight, mutate: askAI } = useMutation({
  mutationFn: (question: string) => api.getAIInsight(question),
});
```

---

## Filter Options

| Filter | Options |
|--------|---------|
| **Date Range** | Last 30 days, Quarter, Year, Custom |
| **Category** | All, Operations, Personnel, Technology |
| **Entity** | All cases, Specific case |
| **View** | Monthly, Quarterly, Yearly |

---

## Chart Interactivity

| Interaction | Result |
|-------------|--------|
| **Hover** | Show tooltip with values |
| **Click** | Drill down to transactions |
| **Drag** | Select date range |
| **Scroll** | Zoom in/out |
| **Double-click** | Reset view |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `P` | Export PDF |
| `D` | Download data |
| `R` | Refresh data |
| `Esc` | Close drill-down |

---

## Performance

- Charts rendered with WebGL (via D3/Recharts)
- Data aggregated on server
- Lazy-load detail views
- Cached query results

---

## 🧠 Proposed: Logical Deduction Views

These additional visualization concepts rely on **deductive logic** to uncover deeper, non-obvious fraud patterns.

### 1. 🕸️ Entity Link Analysis (The "Kickback Hunter")

**Logical Deduction:** *"If Person A approves payments to Vendor B, and Vendor B frequently transfers money to Person A (or their spouse), a conflict of interest exists."*

- **View:** Node-Link Graph (Force Directed).
- **Nodes:** People, Vendors, Bank Accounts, Addresses.
- **Edges:** Financial Transactions, Shared Metadata (e.g., "Same Phone Number").
- **Key Patterns:**
  - **Circular Flow:** Entity A → Entity B → Entity A (Money wash).
  - **Hub & Spoke:** One seemingly unrelated person receiving small amounts from many vendors.

### 2. 🗺️ Geospatial Geofencing (The "Project Boundary")

**Logical Deduction:** *"Project expenses should occur near the project site. Gas/Meals > 50km away are likely personal."*

- **View:** Map interface with specific "Project Zones".
- **Logic:**
  - Define `Project Coordinates` (lat/long).
  - Calculate distance for every transaction location.
  - **Mark as Anomaly** if `Distance > Threshold` (e.g., 20km).
- **Deduction:** High volume of spending in "Resort City" while Project is in "Industrial Zone".

### 3. 📅 Temporal Behavioral Heatmap

**Logical Deduction:** *"Corporate operational spending matches business hours. 'Office Supplies' bought at 11 PM on a Sunday are suspicious."*

- **View:** Heatmap Grid (X-Axis: Days of Week, Y-Axis: Hours of Day).
- **Logic:**
  - **Business Hours:** Mon-Fri, 9am-6pm.
  - **Anomaly:** High-value transactions in "Off-hours" cells.
  - **Frequency:** Sudden bursts of transactions (structuring) just before monthly close.

### 4. 📈 Invoice Sequence Forensics (The "Shell Company" Detector)

**Logical Deduction:** *"Legitimate vendors have multiple clients. If their invoice numbers to us are perfectly sequential (e.g., #001, #002, #003) over months, we are their only customer."*

- **View:** Scatter Plot (X-Axis: Date, Y-Axis: Invoice Number).
- **Logic:**
  - **Normal Vendor:** Gap in numbers (e.g., #105 today, #350 next week).
  - **Shell Company:** Linear 45-degree line (e.g., #101, #102, #103).
- **Deduction:** A "perfect straight line" slope indicates high risk of a shell entity created solely to bill this project.

### 5. 📊 Threshold Avoidance Histogram (The "Structuring" Detector)

**Logical Deduction:** *"If the manager approval limit is $5,000, fraudsters will split a $12,000 expense into three payments of $4,000 or $4,999 to bypass review."*

- **View:** Histogram of Transaction Amounts (Bin size: $100).
- **Logic:**
  - Mark key policy thresholds (e.g., $5k, $10k).
  - **Anomaly:** A statistical "cliff" or abnormal spike in the bin *just below* the threshold (e.g., $4,900-$4,999).
- **Deduction:** High frequency of transactions at 99% of the limit proves "Intent to Evade Control".

### 6. 👯 Shared Attribute Overlap (The "Ghost" Detector)

**Logical Deduction:** *"Employees and Vendors are distinct. If an Employee shares a Bank Account or Address with a Vendor, it is fraud."*

- **View:** Venn Diagram or Overlap Matrix.
- **Logic:**
  - **Datasets:** Employee PII vs Vendor Master Data.
  - **Match Keys:** Phone Number, Bank Account #, Tax ID, Physical Address.
- **Deduction:** Any non-zero intersection between "Employee Personal Info" and "Vendor Payment Info" is an immediate red flag.

---

## 🔮 Scenario Planning & Simulation (Forward-Looking)

While forensics looks back, simulation helps avoid future crises by modeling "What-If" scenarios.

### 1. 🔥 Burn Rate Simulator
Predicts the exact "Day Zero" when funds will deplete based on current acceleration.
- **Deduction:** "Spending velocity increased 15% this month. At this rate, Phase 2 funds run out on **Oct 12th** (3 weeks early)."
- **Action:** Triggers an early warning to request a budget variance or slow down purchasing.

### 2. 🔀 "What-If" Impact Analysis
Interactive sliders to adjust key variables and see the ripple effect on the project.
- **Scenario:** "What if we delay Phase 3 by 20 days?"
- **Outcome:** "Cash pooling interest drops by $2k, but we avoid a liquidity crunch in November."
- **Scenario:** "What if inflation raises materials cost by 8%?"
- **Outcome:** "Project margin drops below the safe threshold of 12%."

### 3. 📉 Vendor Dependency Risk
Simulates the collapse of a key node in the supply chain.
- **Simulation:** "If Vendor X goes bankrupt..."
- **Impact:** "We lose 40% of our 'Steel' supply. Replacement Vendor Y is 15% more expensive."

---

## Related Pages

- [Dashboard](./08_DASHBOARD.md) - Previous step
- [Summary](./10_SUMMARY.md) - Next step
