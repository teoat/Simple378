# 🔄 Reconciliation Guide

> Matching expenses with bank transactions

---

## Overview

The Reconciliation page helps you match internal expense records with external bank transactions to identify discrepancies and potential fraud.

---

## Interface Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔄 Reconciliation                              Progress: 76% matched        │
├──────────────────────┬────────────────────┬─────────────────────────────────┤
│ EXPENSES             │ MATCHING AREA      │ BANK TRANSACTIONS               │
├──────────────────────┼────────────────────┼─────────────────────────────────┤
│                      │                    │                                 │
│ 📄 Unmatched: 24     │   Drop here to     │ 🏦 Unmatched: 31               │
│                      │   create match     │                                 │
│ ┌──────────────────┐ │                    │ ┌─────────────────────────────┐ │
│ │ EXP-001          │ │ ┌──────────────┐  │ │ TRX-ABC123                  │ │
│ │ Vendor: PT ABC   │─┼─│ MATCHED PAIR │──┼─│ From: PT ABC                │ │
│ │ Rp 50,000,000    │ │ │   ✅ 100%    │  │ │ Rp 50,000,000               │ │
│ │ 2024-01-15       │ │ └──────────────┘  │ │ 2024-01-15                  │ │
│ └──────────────────┘ │                    │ └─────────────────────────────┘ │
│                      │                    │                                 │
│ ┌──────────────────┐ │                    │ ┌─────────────────────────────┐ │
│ │ EXP-002          │ │                    │ │ TRX-DEF456                  │ │
│ │ Vendor: CV XYZ   │ │   ⚠️ Drag items   │ │ From: CV XYZ                │ │
│ │ Rp 25,000,000    │ │   to match them   │ │ Rp 24,500,000               │ │
│ │ 2024-01-16       │ │                    │ │ 2024-01-17                  │ │
│ │ 🟡 Similar found │ │                    │ │ 🟡 Possible match           │ │
│ └──────────────────┘ │                    │ └─────────────────────────────┘ │
│                      │                    │                                 │
└──────────────────────┴────────────────────┴─────────────────────────────────┘
```

---

## How to Match

### Manual Matching

1. **Find expense** in left panel
2. **Drag** expense card
3. **Drop** on matching bank transaction
4. **Confirm** the match

### Auto-Reconciliation

1. Click **[🤖 Auto-Match]** button
2. Set confidence threshold (default: 85%)
3. Review suggested matches
4. Accept or reject each suggestion

---

## Match Status

| Status | Icon | Meaning |
|--------|------|---------|
| **Perfect Match** | ✅ | Exact amount, date, vendor |
| **Partial Match** | 🟡 | Minor discrepancy |
| **Mismatch** | ⚠️ | Significant difference |
| **Unmatched** | ⚪ | No match found |

---

## Discrepancy Types

### Amount Variance
```
Expense:     Rp 50,000,000
Bank:        Rp 48,500,000
Difference:  Rp  1,500,000 (3%)
```

**Possible causes:**
- Bank fees
- Currency conversion
- Partial payment
- 🔴 Fraud indicator

### Date Variance
```
Expense Date:  2024-01-15
Bank Date:     2024-01-18
Difference:    3 days
```

**Possible causes:**
- Processing delay
- Weekend/holiday
- Backdating
- 🔴 Fraud indicator

### Vendor Mismatch
```
Expense Vendor:  PT ABC Industries
Bank Payee:      ABC Corp
Similarity:      75%
```

**Possible causes:**
- Abbreviated name
- Parent company
- 🔴 Shell company

---

## Filtering Options

| Filter | Options |
|--------|---------|
| **Status** | All, Matched, Unmatched, Disputed |
| **Date Range** | Custom range picker |
| **Amount Range** | Min/max amount |
| **Vendor** | Search by name |

---

## Bulk Operations

### Select Multiple
- Click checkbox on items
- Or use **Shift+Click** for range

### Available Actions
- **Match All Selected** - Create matches for selected pairs
- **Unmatch** - Remove existing matches
- **Flag for Review** - Mark as suspicious
- **Export** - Download discrepancy report

---

## Red Flags

Watch for these indicators:

| Flag | Description |
|------|-------------|
| 🔴 **Ghost Expense** | Expense with no bank payment |
| 🔴 **Inflated Amount** | Expense > Bank payment |
| 🔴 **Multiple Matches** | One expense, many payments |
| 🔴 **Delayed Match** | >30 day payment gap |
| 🔴 **Unknown Vendor** | Vendor not in approved list |

---

## Reports

### Reconciliation Summary
- Total matched/unmatched
- Variance summary
- Top discrepancies

### Export Options
- **CSV** - Raw data
- **PDF** - Formatted report
- **Excel** - With analysis

---

## Related

- [Case Management](./CASE_MANAGEMENT.md)
- [Fraud Detection](./FRAUD_DETECTION.md)
