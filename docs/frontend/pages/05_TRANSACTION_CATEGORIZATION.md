# 🏷️ Transaction Categorization

> Classify and label raw bank transactions for accurate financial reporting

**Route:** `/categorization`
**File:** `src/pages/TransactionCategorization.tsx`

---

## Overview

The Transaction Categorization page is the dedicated workspace for labeling raw bank transactions. It uses AI suggestions and user-defined rules to assign expense categories (e.g., "Operational", "Travel", "Project-Specific") to imported bank statement lines. This step is crucial for accurate Cashflow Analysis and Fraud Detection.

---

## Screenshot

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
│  │☐ │ 2024-10-05 │ STARBUCKS #2204            │ $ 8.40      │ ☕ Meals  [▼]││
│  │☐ │ 2024-10-06 │ DIGITALOCEAN *HOSTING      │ $ 45.00     │ 💻 IT/Ops [▼]││
│  │☐ │ 2024-10-06 │ TRANSFER TO ACC 8829       │ $ 500.00    │ 🔄 Transfer[▼]││
│  │☐ │ 2024-10-07 │ HOTEL IBIS STYLES          │ $ 120.00    │ [ Select ]   ││
│  └──┴────────────┴────────────────────────────┴─────────────┴──────────────┘│
│                                                                             │
│  BATCH ACTION: 1 Selected                                                   │
│  ┌──────────────────────────┐                                               │
│  │ Set Category to: Travel  │  [ Apply ]                                    │
│  └──────────────────────────┘                                               │
│                                                                             │
│  🏷️ CATEGORIES                                                               │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────┐ │
│  │ 🚗 Travel     │ │ ☕ Meals      │ │ 💻 IT/Ops     │ │ 🏗️ Project Mat.  │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ └──────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Smart Classification** | ✅ | AI suggests categories based on vendor name and history |
| **Rule Engine** | ✅ | Create "If/Then" rules (e.g., "Contains 'AWS' = Software") |
| **Bulk Editing** | ✅ | Select multiple rows and apply a single category |
| **Split Transactions** | 🔲 | Divide one payment into multiple categories |
| **Exclusion Logic** | ✅ | Mark transactions as "Personal" or "Ignore" |
| **Project Assignment** | ✅ | Link specific expenses to Case IDs |

---

## 🧠 Fraud Science & Logic Rules

This page applies automated **Forensic Logic** to flag transactions *during* the categorization process, ensuring auditors investigate suspicious patterns immediately.

### 1. Geospatial Validation ("The 500km Rule")
**Logic:** *If a project is in Jakarta, why are we buying 'Cement' in Bali (1,000km away)?*
* **Trigger:** Transaction Location vs. Project Geofence > 500km.
* **Action:** Flag as `⚠️ Potential Personal Expense` or `⚠️ Diversion`.
* **Hypothesis:** "This person is 500km from the location of the project. If they transferred money to another person here, they might be assigned to do something unrelated to the project."

### 2. Assignment vs. Expense Check ("The Surplus Check")
**Logic:** *We gave Employee A $10,000 for 'Site Operations'. They submitted $12,000 in receipts.*
* **Trigger:** Total Expenses > Total Assigned Funds (Advance).
* **Action:** Flag `⚠️ Overspending / Unassigned Claims`.
* **Question:** "Could the expenses be more than the money assigned? If so, is it a legitimate reimbursement or a manufactured claim?"

### 3. Circular Flow Detection
**Logic:** *Money goes out to Vendor A and returns from Employee B.*
* **Trigger:** Payment to Entity X followed by Receipt from Employee Y (who is related to X).
* **Action:** Flag `🚨 Potential Kickback`.

---

## Categorization Logic

### 1. Auto-Rules (First Pass)
The system runs strictly defined user rules first.
*   *Example:* `If description contains "Payroll", set Category = "Salaries".`

### 2. AI/ML Suggestions (Second Pass)
For unmatched items, the system uses fuzzy matching and historical patterns.
*   *Example:* "We see you categorized 'Amzn Mktp' as 'Office Supplies' last time. Do you want to do that again?"

### 3. Manual Review (Final Pass)
The user reviews uncertain items (highlighted in yellow) and confirms or corrects them.

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `TransactionTable` | Main grid for viewing and editing data |
| `CategoryDropdown` | Selectable list of taxonomy tags |
| `RuleBuilderModal` | Interface to create new "If/Then" logic |
| `BulkActionToolbar` | Floating bar for multi-select operations |
| `SuggestionCard` | AI prompt showing confidence score |

---

## Data Model

```typescript
type CategoryType = 'OPERATIONAL' | 'PERSONAL' | 'PROJECT' | 'TRANSFER';

interface Category {
  id: string;
  name: string; // e.g., "Travel"
  type: CategoryType;
  color: string;
}

interface TransactionRule {
  id: string;
  pattern: string; // e.g., "UBER*"
  targetCategoryId: string;
  priority: number;
}
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/categories` | Fetch all available categories |
| POST | `/api/v1/categories` | Create a new custom category |
| PATCH | `/api/v1/transactions/batch-categorize` | Update multiple transactions |
| GET | `/api/v1/categorization/rules` | Get automation rules |
| POST | `/api/v1/categorization/rules` | Create a new auto-rule |

---

## Related Pages

* [Ingestion](./04_INGESTION.md) - Previous step (Import Data)
* [Reconciliation](./06_RECONCILIATION.md) - Next step (Match & Verify)
