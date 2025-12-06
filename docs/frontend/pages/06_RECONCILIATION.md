# 🔄 Reconciliation Page

> Match incoming data against existing records

**Route:** `/reconciliation`  
**File:** `src/pages/Reconciliation.tsx`

---

## Overview

The Reconciliation page compares ingested data with existing system records to identify matches, new entries, and conflicts. Users can configure matching algorithms and manually review discrepancies.

---

## Screenshot

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔄 Reconciliation                                 [Unmatched: 5]  [Pending: 2]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Match Configuration:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Algorithm: Fuzzy Match (Name) + Exact Match (Tax ID)                │   │
│  │ Threshold: ████████████░░░░░░ 80%                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                [▶️ Run]    │
│                                                                             │
│  ┌─────────────────────────┐ ┌─────────────────────────┐ ┌──────────────┐  │
│  │    MATCH RATE          │ │    NEW RECORDS          │ │  CONFLICTS   │  │
│  │                        │ │                         │ │              │  │
│  │  ████████████████░░    │ │  ██░░░░░░░░░░░░░░░░░   │ │  █░░░░░░░░░  │  │
│  │      85%               │ │      10%                │ │    5%        │  │
│  │   1,050 matched        │ │   123 new               │ │   62 review  │  │
│  └─────────────────────────┘ └─────────────────────────┘ └──────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ CONFLICTS REQUIRING REVIEW                                 [→ ADJ]    │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │ Record ID │ Source Name    │ System Name   │ Score │ Field      │ →  │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │ REC-001   │ John Smith     │ J. Smith      │  98%  │ Name       │ [→]│ │
│  │ REC-002   │ 1980-05-15     │ 05/15/1980    │  95%  │ DOB        │ [→]│ │
│  │ REC-003   │ PT ABC         │ PT ABC Corp   │  87%  │ Company    │ [→]│ │
│  │ REC-004   │ Jln Sudirman   │ Jl. Sudirman  │  82%  │ Address    │ [→]│ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  DRAG-AND-DROP MATCHING (Manual Override)                                   │
│  ┌───────────────────────────────┐  ↔  ┌───────────────────────────────┐   │
│  │ EXPENSES (Unmatched)          │     │ BANK TRANSACTIONS (Unmatched) │   │
│  │ ─────────────────────         │     │ ──────────────────────        │   │
│  │ ☐ Jan 15 - Vendor A - $500   │     │ ☐ Jan 15 - TRX-001 - $500     │   │
│  │ ☐ Jan 18 - Supplier B - $320 │     │ ☐ Jan 17 - TRX-002 - $320     │   │
│  │ ☐ Jan 20 - Office - $120     │     │ ☐ Jan 20 - TRX-003 - $120     │   │
│  └───────────────────────────────┘     └───────────────────────────────┘   │
│                                                                             │
│  [Export Results] [Archive] [→ Adjudication]                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Auto-Reconciliation | ✅ | Algorithm-based matching |
| Match Rate KPI | ✅ | Visual success indicator |
| Conflict Detection | ✅ | Identify discrepancies |
| Drag-and-Drop | ✅ | Manual transaction matching |
| Threshold Config | ✅ | Adjustable confidence level |
| Direct Link to ADJ | ✅ | One-click to adjudication |
| Export Results | ✅ | Download match report |
| **Multi-Currency** | 🚀 | *Proposed:* FX rate variance handling |
| **Mirror Matching** | 🚀 | *Proposed:* Inter-account elimination |
| **Recurring Logic** | 🚀 | *Proposed:* Subscription pattern detection |

---

## Match Configuration

### Matching Algorithms

| Algorithm | Description | Use Case |
|-----------|-------------|----------|
| **Exact Match** | 100% identical | Tax ID, Account Number |
| **Fuzzy Match** | Similar strings | Names, Addresses |
| **Phonetic** | Sound-alike matching | Names with variations |
| **Date Fuzzy** | Format tolerance | Different date formats |
| **Amount Range** | Within tolerance | Financial amounts ±5% |

### Confidence Threshold

The slider controls minimum confidence for auto-matching:

| Threshold | Behavior |
|-----------|----------|
| 95-100% | Very strict, few auto-matches |
| 80-94% | Balanced (recommended) |
| 60-79% | Permissive, more review needed |
| <60% | Too loose, manual review required |

### Advanced Weights & Rules

Customize how the matching score is calculated:

| Setting | Default | Description |
|---------|---------|-------------|
| **Description Weight** | 40% | Importance of text similarity |
| **Amount Weight** | 40% | Importance of exact amount match |
| **Date Weight** | 20% | Importance of date proximity |
| **Stop Words** | On | Ignore "Inc", "LLC", "The", "Corp" |
| **Weekend Logic** | Rolling | If Sat/Sun, look at nearest Mon/Fri |
| **Common ID Removal** | On | Strip "INV-", "TRX-", "#" prefixes |

---

## KPI Cards

| Metric | Description | Target |
|--------|-------------|--------|
| **Match Rate** | % successfully matched | >85% |
| **New Records** | Records not in system | <15% |
| **Conflicts** | Requires human review | <5% |

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `ReconciliationKPI` | Match rate visualization |
| `ConflictTable` | List of discrepancies |
| `TransactionRow` | Individual record display |
| `DragDropMatcher` | Manual matching interface |
| `ThresholdSlider` | Confidence adjustment |
| `ConfigPanel` | Algorithm settings |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/reconciliation/expenses` | Get expense records |
| GET | `/api/v1/reconciliation/transactions` | Get bank transactions |
| POST | `/api/v1/reconciliation/auto-reconcile` | Run auto-matching |
| POST | `/api/v1/reconciliation/match` | Create manual match |
| GET | `/api/v1/reconciliation/conflicts` | List conflicts |
| POST | `/api/v1/reconciliation/export` | Export results |

---

## State Management

```typescript
// Fetch expenses and transactions
const { data: expenses } = useQuery({
  queryKey: ['reconciliation', 'expenses'],
  queryFn: api.getExpenses,
});

const { data: transactions } = useQuery({
  queryKey: ['reconciliation', 'transactions'],
  queryFn: api.getTransactions,
});

// Threshold state
const [threshold, setThreshold] = useState(0.8);

// Drag-and-drop state
const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
```

---

---

## 🚀 Advanced Reconciliation Features (Proposed)

Handle complex financial scenarios beyond simple 1-to-1 matching.

### 1. 🔢 Many-to-One Grouping (Batch Payments)

Detects when a single bank withdrawal covers multiple invoices.

- **Scenario:** Bank shows -$5,000. System has Invoices for $2,000, $2,000, and $1,000.
- **Logic:** Combinatorial Sum Problem (Subset Sum) to find which combination of open invoices equals the transaction amount.
- **UI:** Groups the 3 invoices together and draws a bracket linking them to the single bank transaction.

### 2. ➗ Split Payments (One-to-Many)

Detects partial payments for a large invoice.

- **Scenario:** Invoice is $10,000. Bank shows two transfers of $5,000.
- **Logic:** Track "Remaining Balance" on invoices. Match multiple bank transactions to a single invoice entity.
- **Visuals:** Shows the Invoice as a "Container" filling up with each attached transaction.

### 3. 🧠 ML-Based "Ghost" Matching

Identifies matches where *no* common identifier exists, based on behavioral patterns.

- **Pattern:** "Vendor X usually charges $49.99 on the 15th."
- **Prediction:** If a $49.99 charge appears on the 15th with a generic description like "Service Charge", the AI suggests "Vendor X" with a 'High' confidence flag.

### 4. 🕰️ Temporal Tolerance Windows

Adjust matching logic based on payment methods.

- **Wire Transfers:** Match exact date adjacent.
- **Checks:** Allow 5-10 day delay between "Issue Date" and "Clearance Date".
- **Credit Cards:** Allow 1-3 day settlement lag.

### 5. 💱 Multi-Currency FX Matching

Handle variances caused by exchange rate fluctuations.

- **Scenario:** Invoice in USD ($1,000), Payment in EUR (€920).
- **Logic:** Lookup historical FX rate for transaction date.
- **Tolerance:** Allow ±1.5% variance for bank spreads/fees.

### 6. 🧾 Inter-Account "Nostro/Vostro" Mirroring

Eliminate internal transfers between own accounts (Net Zero impact).

- **Logic:** Match "Outflow Account A" with "Inflow Account B" within same day.
- **Action:** Auto-mark as "Internal Transfer" and exclude from P&L, or move to "Cash in Transit" if dates differ.

### 7. 🔄 Recurring Series Recognition

Detect regular subscription or lease payments.

- **Pattern:** Same Amount + Same Description + Monthly Interval (±3 days).
- **Action:** Auto-create a "Recurring Rule" (e.g., "Adobe Creative Cloud"). Future matches are auto-confirmed with 99% confidence.

### 8. ⚖️ Force Balancing (Suspense Accounts)

Handle minor discrepancies to close books fast.

- **Scenario:** Bank = $100.00, Invoice = $99.99 (Rounding error).
- **Logic:** If diff < $0.10, auto-post difference to "Exchange Gain/Loss" or "Rounding Expense".
- **Audit:** Flag for quarterly review but don't block monthly close.

---

## Drag-and-Drop Matching

Users can manually match records by dragging:

1. **Drag** an expense item
2. **Drop** on matching bank transaction
3. **Confirm** the match
4. Items move to "Matched" section

### Smart Grouping Drag

- Hold `Shift` to select multiple items to drag onto a single target (Many-to-One).
- Drag a transaction onto an "Open Invoice" to trigger a split payment dialog (One-to-Many).

---

## Conflict Resolution Flow

```
Conflict Detected
       │
       ▼
┌──────────────┐
│ View Details │──→ [→ Adjudication]
└──────────────┘
       │
       ▼
Human Decision
       │
   ┌───┴───┐
   ▼       ▼
Accept   Reject
Source   Source
```

---

## Performance

- Batch processing (1000 records at a time)
- Background job for large datasets
- Progress tracking via WebSocket
- Optimistic UI for manual matches

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Run reconciliation |
| `C` | Open config panel |
| `A` | Go to adjudication |
| `E` | Export results |

---

## Related Pages

- [Categorization](./05_TRANSACTION_CATEGORIZATION.md) - Previous step
- [Adjudication](./07_ADJUDICATION.md) - Next step
