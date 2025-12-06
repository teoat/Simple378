# Reconciliation Page

**Route:** `/reconciliation`  
**Component:** `src/pages/Reconciliation.tsx`  
**Status:** ✅ Implemented

---

## Overview

The Reconciliation page provides a tool for matching internal expense records with external bank transactions. It supports both manual drag-and-drop matching and AI-powered automatic reconciliation based on configurable confidence thresholds.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header: "Transaction Reconciliation"                                    │
│ Confidence Threshold: [═══════●═══] 85%    [🤖 Auto-Reconcile]         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Upload Bank Statement                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📁 Drop CSV/Excel file here or click to browse                  │   │
│  │     Supported: .csv, .xlsx, .xls                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├──────────────────────────────┬──────────────────────────────────────────┤
│                              │                                          │
│  Internal Expenses           │  Bank Transactions                       │
│  ────────────────────        │  ────────────────────                    │
│                              │                                          │
│  ┌────────────────────────┐  │  ┌────────────────────────┐              │
│  │ 📋 Invoice #1234       │  │  │ 🏦 Bank Ref: TXN-789  │              │
│  │ Acme Supplies          │  │  │ ACME SUPPLY CO        │              │
│  │ $5,250.00              │  │  │ $5,250.00             │              │
│  │ Dec 1, 2025            │◀═══▶│ Dec 2, 2025           │              │
│  │ ✅ Matched             │  │  │ ✅ Matched            │              │
│  └────────────────────────┘  │  └────────────────────────┘              │
│                              │                                          │
│  ┌────────────────────────┐  │  ┌────────────────────────┐              │
│  │ 📋 Invoice #1235       │  │  │ 🏦 Bank Ref: TXN-790  │              │
│  │ Tech Services Inc      │  │  │ TECH SERVICES         │              │
│  │ $12,800.00             │  │  │ $12,800.00            │              │
│  │ Dec 3, 2025            │  │  │ Dec 4, 2025           │              │
│  │ ⏳ Unmatched           │  │  │ ⏳ Unmatched          │              │
│  └────────────────────────┘  │  └────────────────────────┘              │
│                              │                                          │
│  ┌────────────────────────┐  │  ┌────────────────────────┐              │
│  │ 📋 Invoice #1236       │  │  │ 🏦 Bank Ref: TXN-791  │              │
│  │ Office Rent            │  │  │ PROPERTY MGMT LLC     │              │
│  │ $3,500.00              │  │  │ $3,500.00             │              │
│  │ Dec 5, 2025            │  │  │ Dec 5, 2025           │              │
│  │ ⏳ Unmatched           │  │  │ ⏳ Unmatched          │              │
│  └────────────────────────┘  │  └────────────────────────┘              │
│                              │                                          │
└──────────────────────────────┴──────────────────────────────────────────┘
│                                                                         │
│ Summary: 15 Matched | 8 Unmatched Expenses | 5 Unmatched Transactions  │
│                                                  [💾 Save] [📊 Export]  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### ConfidenceSlider
Adjustable threshold for auto-reconciliation confidence.

**Props:**
```typescript
interface ConfidenceSliderProps {
  value: number; // 0-100
  onChange: (value: number) => void;
  disabled?: boolean;
}
```

### FileUploadZone
Drag-and-drop area for bank statement uploads.

**Props:**
```typescript
interface FileUploadZoneProps {
  onUpload: (file: File) => void;
  acceptedFormats: string[];
  maxSize?: number; // in bytes
}
```

### ReconciliationList
Scrollable draggable list of items.

**Props:**
```typescript
interface ReconciliationListProps {
  items: ReconciliationItem[];
  type: 'expense' | 'transaction';
  onDragStart: (item: ReconciliationItem) => void;
  onDrop: (targetItem: ReconciliationItem) => void;
}
```

### ReconciliationItem
Individual expense or transaction card.

**Props:**
```typescript
interface ReconciliationItemProps {
  item: ReconciliationItem;
  status: 'matched' | 'unmatched' | 'suggested';
  draggable?: boolean;
  matchedWith?: ReconciliationItem;
}
```

### MatchSummary
Statistics panel showing reconciliation progress.

---

## Features

### File Upload
- **Supported Formats:** CSV, XLSX, XLS
- **Column Mapping:** Wizard to map file columns to required fields
- **Validation:** Data type checking, required field validation
- **Preview:** Sample rows before import

### Manual Matching
1. **Drag-and-Drop:** Drag expense to corresponding transaction
2. **Click-to-Match:** Select expense, then click matching transaction
3. **Visual Feedback:** Connected items linked visually
4. **Undo:** Unmatch with single click

### Auto-Reconciliation
AI-powered matching based on:
- **Amount:** Exact or fuzzy match within tolerance
- **Date:** Proximity matching (± configurable days)
- **Description:** NLP-based entity name matching
- **Reference:** Invoice number extraction

**Confidence Levels:**
| Level | Score | Treatment |
|-------|-------|-----------|
| High | ≥ 90% | Auto-matched |
| Medium | 70-89% | Suggested match |
| Low | < 70% | Manual review required |

### Match Validation
- **Amount Tolerance:** Configurable (e.g., ± $0.50)
- **Date Range:** Configurable (e.g., ± 3 days)
- **Duplicate Detection:** Warns if transaction already matched

---

## Data Flow

```
┌─────────────────┐     ┌──────────────┐     ┌―――――――――――――――――――┐
│  Reconciliation │────▶│  useQuery    │────▶│ GET /api/v1/       │
│    Component    │     │  (expenses)  │     │ reconciliation/    │
└─────────────────┘     └──────────────┘     │ expenses           │
        │                                    └―――――――――――――――――――┘
        │
        │               ┌──────────────┐     ┌―――――――――――――――――――┐
        └──────────────▶│  useMutation │────▶│ POST /api/v1/      │
                        │  (upload)    │     │ reconciliation/    │
                        └──────────────┘     │ upload             │
                                             └―――――――――――――――――――┘
        │
        │               ┌──────────────┐     ┌―――――――――――――――――――┐
        └──────────────▶│  useMutation │────▶│ POST /api/v1/      │
                        │  (match)     │     │ reconciliation/    │
                        └──────────────┘     │ match              │
                                             └―――――――――――――――――――┘
```

---

## API Integration

### Get Expenses
```typescript
GET /api/v1/reconciliation/expenses?status=unmatched&page=1

Response (200):
{
  "items": [
    {
      "id": "exp_123",
      "invoice_number": "1234",
      "vendor": "Acme Supplies",
      "amount": 5250.00,
      "currency": "USD",
      "date": "2025-12-01",
      "status": "unmatched",
      "matched_transaction_id": null
    }
  ],
  "total": 23,
  "matched_count": 15,
  "unmatched_count": 8
}
```

### Upload Bank Statement
```typescript
POST /api/v1/reconciliation/upload
Content-Type: multipart/form-data

Response (200):
{
  "id": "upload_456",
  "filename": "december_statement.csv",
  "transactions_count": 47,
  "parsed_rows": 47,
  "errors": []
}
```

### Get Transactions
```typescript
GET /api/v1/reconciliation/transactions?upload_id=upload_456&status=unmatched

Response (200):
{
  "items": [
    {
      "id": "txn_789",
      "reference": "TXN-789",
      "description": "ACME SUPPLY CO",
      "amount": 5250.00,
      "currency": "USD",
      "date": "2025-12-02",
      "status": "unmatched"
    }
  ]
}
```

### Auto-Reconcile
```typescript
POST /api/v1/reconciliation/auto
Content-Type: application/json

Request:
{
  "confidence_threshold": 85,
  "amount_tolerance": 0.50,
  "date_range_days": 3
}

Response (200):
{
  "matches": [
    {
      "expense_id": "exp_123",
      "transaction_id": "txn_789",
      "confidence": 94.5,
      "matched_by": "auto"
    }
  ],
  "suggestions": [
    {
      "expense_id": "exp_124",
      "transaction_id": "txn_790",
      "confidence": 78.2
    }
  ],
  "unmatched_expenses": 3,
  "unmatched_transactions": 2
}
```

### Manual Match
```typescript
POST /api/v1/reconciliation/match
Content-Type: application/json

Request:
{
  "expense_id": "exp_124",
  "transaction_id": "txn_790"
}

Response (200):
{
  "matched": true,
  "expense_id": "exp_124",
  "transaction_id": "txn_790"
}
```

### Unmatch
```typescript
DELETE /api/v1/reconciliation/match/:expense_id

Response (200):
{
  "unmatched": true
}
```

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Drag-and-Drop | Keyboard alternative (Tab, Enter to select, Space to drop) |
| Slider | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Lists | `role="list"` with proper list item semantics |
| Match Status | `aria-label` describing match state |
| File Upload | Screen reader announcements for upload progress |

---

## Responsive Behavior

| Breakpoint | Layout Change |
|------------|---------------|
| ≥1280px | Side-by-side columns (50% / 50%) |
| ≥1024px | Side-by-side with smaller cards |
| ≥768px | Stacked: Upload, Expenses, Transactions |
| <768px | Single column, collapsible sections |

---

## Testing

### Unit Tests
- Confidence slider behavior
- Match/unmatch logic
- File upload validation

### E2E Tests
- Complete reconciliation workflow
- Auto-reconcile with various thresholds
- Drag-and-drop matching
- Export functionality

---

## Related Files

```
frontend/src/
├── pages/Reconciliation.tsx
├── components/reconciliation/
│   ├── ConfidenceSlider.tsx
│   ├── FileUploadZone.tsx
│   ├── ReconciliationList.tsx
│   ├── ReconciliationItem.tsx
│   ├── MatchSummary.tsx
│   └── ColumnMappingWizard.tsx
└── lib/
    └── api.ts
```

---

## Future Enhancements

- [ ] Bank API integration (Open Banking)
- [ ] Multi-file upload (multiple statements)
- [ ] Recurring transaction patterns
- [ ] Category-based matching rules
- [ ] Variance reporting
- [ ] Historical reconciliation audit trail
- [ ] Split transaction matching (one-to-many)
