# 📁 Case Management Guide

> Creating and managing investigation cases

---

## Overview

Cases are the core unit of investigation in Simple378. Each case represents a subject under investigation with associated transactions, documents, and analysis results.

---

## Case Lifecycle

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────┐
│  Open   │ ──► │ In Progress  │ ──► │  Under      │ ──► │ Closed │
│         │     │              │     │  Review     │     │        │
└─────────┘     └──────────────┘     └─────────────┘     └────────┘
```

---

## Creating a Case

### Method 1: From Dashboard
1. Click **[📂 New Case]** button
2. Fill in subject details
3. Add initial documents
4. Click **Create Case**

### Method 2: From Search Results
1. Search for a subject
2. Click **[Create Case]** on result
3. Case prefilled with subject info

### Required Information

| Field | Description | Required |
|-------|-------------|----------|
| Subject Name | Person or company name | ✅ |
| Subject Type | Individual / Company | ✅ |
| External ID | Reference number | ❌ |
| Priority | Low / Medium / High / Critical | ✅ |
| Description | Initial notes | ❌ |

---

## Case List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📁 Cases                                   [+ New Case] [🔍 Filter ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [All] [Open] [In Progress] [Under Review] [Closed]                    │
│                                                                         │
│  ┌───┬──────────────────┬─────────┬──────┬────────────┬──────────────┐ │
│  │   │ Case             │ Subject │ Risk │ Investigator │ Status     │ │
│  ├───┼──────────────────┼─────────┼──────┼────────────┼──────────────┤ │
│  │ ☐ │ CASE-2024-001    │ John D. │ 🔴 95│ Sarah K.   │ In Progress  │ │
│  │ ☐ │ CASE-2024-002    │ Acme Co │ 🟡 65│ Mike R.    │ Open         │ │
│  │ ☐ │ CASE-2024-003    │ Jane S. │ 🟢 32│ Unassigned │ Open         │ │
│  └───┴──────────────────┴─────────┴──────┴────────────┴──────────────┘ │
│                                                                         │
│  Showing 1-25 of 1,234 cases                    [◄ Prev] [1] [2] [3 ►] │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Filtering Options

| Filter | Options |
|--------|---------|
| Status | All, Open, In Progress, Under Review, Closed |
| Priority | All, Low, Medium, High, Critical |
| Risk Score | Range slider (0-100) |
| Investigator | Dropdown of team members |
| Date Range | Created within date range |

### Sorting Options

- Case ID (ascending/descending)
- Subject name (A-Z, Z-A)
- Risk score (highest/lowest)
- Created date (newest/oldest)

---

## Case Detail View

### Tabs

| Tab | Content |
|-----|---------|
| **Overview** | Subject info, risk summary, key metrics |
| **Transactions** | All financial transactions |
| **Documents** | Uploaded evidence files |
| **Timeline** | Chronological event history |
| **Graph** | Entity relationship visualization |
| **Notes** | Investigator notes and comments |

### Overview Tab

```
┌─────────────────────────────────────────────────────────────────┐
│ CASE-2024-001                                    [⚡ Actions ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Subject: John Doe                                              │
│  Type: Individual                                               │
│  Status: In Progress                                            │
│  Risk Score: ██████████████████░░ 95/100                       │
│  Assigned To: Sarah Kim                                         │
│                                                                 │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐      │
│  │ 💰 Total Value │ │ 🔍 Patterns    │ │ 📄 Documents   │      │
│  │ Rp 2.5 B       │ │ 4 detected     │ │ 12 uploaded    │      │
│  └────────────────┘ └────────────────┘ └────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Case Actions

### Assign Investigator
1. Click **[⚡ Actions]** menu
2. Select **Assign Investigator**
3. Choose team member
4. Add optional note

### Change Status
1. Use status dropdown
2. Add status change reason
3. System logs the change

### Generate Report
1. Click **[Generate Report]**
2. Choose report type (Summary, Full, SAR)
3. Download PDF

### Close Case
1. Click **[Close Case]**
2. Select resolution type:
   - Fraud Confirmed
   - No Fraud Found
   - Insufficient Evidence
   - Referred to Authorities
3. Add closing notes

---

## Bulk Actions

Select multiple cases with checkboxes:

- **Assign All** - Assign to one investigator
- **Change Status** - Update status in bulk
- **Export** - Download case data
- **Archive** - Move to archive

---

## Related

- [Adjudication](./ADJUDICATION.md)
- [Fraud Detection](./FRAUD_DETECTION.md)
