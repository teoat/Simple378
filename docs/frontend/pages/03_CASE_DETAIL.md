# 🔎 Case Detail Page

> Deep dive into individual investigation cases

**Route:** `/cases/:id`  
**File:** `src/pages/CaseDetail.tsx`

---

## Overview

The Case Detail page provides comprehensive information about a single investigation case, including subject details, transactions, documents, timeline, and analysis results.

---

## Screenshot

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ◄ Back to Cases                                         [⚡ Actions ▼]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CASE-2024-001: John Doe Investigation                                     │
│  ─────────────────────────────────────────────────────────────              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Subject: John Doe              Status: [In Progress ▼]             │   │
│  │ Type: Individual               Priority: 🔴 High                    │   │
│  │ Risk Score: ████████████████████░░░░ 92/100                        │   │
│  │ Assigned: Sarah Kim            Created: Jan 15, 2024               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Overview] [Transactions] [Documents] [Timeline] [Graph] [Notes]          │
│  ───────────────────────────────────────────────────────────────────       │
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ 💰 FINANCIAL SUMMARY               │  │ 🔍 DETECTED PATTERNS        │  │
│  │                                     │  │                             │  │
│  │ Total Transactions: 234             │  │ • Mirroring (15x) - 🔴 95   │  │
│  │ Total Volume: Rp 8.7B               │  │ • Round-trip (3x) - 🟡 72   │  │
│  │ Flagged: 45 transactions            │  │ • Velocity (8x) - 🟢 45    │  │
│  │ Date Range: Jan 1 - Dec 31          │  │                             │  │
│  │                                     │  │ [View All Patterns]         │  │
│  └─────────────────────────────────────┘  └─────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 📊 KEY TRANSACTIONS                                                   │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │ Date       │ Description         │ Amount      │ Risk │ Pattern      │ │
│  │ 2024-01-15 │ Transfer to CV XYZ  │ Rp 480M     │ 🔴95 │ MIRRORING    │ │
│  │ 2024-01-18 │ Transfer to PT ABC  │ Rp 320M     │ 🔴92 │ MIRRORING    │ │
│  │ 2024-01-20 │ Payment to vendor   │ Rp 50M      │ 🟡65 │ -            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Case Header | ✅ | Subject info, risk bar, status |
| Tabbed Navigation | ✅ | Multiple content sections |
| Transaction List | ✅ | Filterable transaction table |
| Document Viewer | ✅ | View attached documents |
| Timeline | ✅ | Chronological events |
| Entity Graph | ✅ | Relationship visualization |
| Notes | ✅ | Investigator notes |
| AI Insights | ✅ | Frenly AI panel |

---

## Tabs

### Overview Tab
- Subject information
- Financial summary
- Detected patterns
- Key metrics

### Transactions Tab
- Full transaction list
- Filter by date, amount, pattern
- Export functionality
- Click to see detail

### Documents Tab
- Uploaded files
- Preview documents
- OCR results
- Upload new files

### Timeline Tab
- Chronological event view
- Transaction history
- Investigation actions
- System events

### Graph Tab
- Entity relationship visualization
- Node: subjects, accounts, vendors
- Edge: transactions, relationships
- Interactive (zoom, pan, click)

### Notes Tab
- Investigator notes
- Team annotations
- AI-generated insights
- Add/edit notes

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `CaseHeader` | Title, status, actions |
| `RiskBar` | Visual risk score |
| `TabNavigation` | Tab switcher |
| `TransactionTable` | Transaction list |
| `DocumentList` | File viewer |
| `TimelineView` | Event timeline |
| `EntityGraph` | Network visualization |
| `NotesPanel` | Notes and annotations |
| `FrenlyPanel` | AI insights |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/cases/:id` | Get case details |
| PUT | `/api/v1/cases/:id` | Update case |
| GET | `/api/v1/cases/:id/transactions` | List transactions |
| GET | `/api/v1/cases/:id/documents` | List documents |
| GET | `/api/v1/cases/:id/timeline` | Get timeline |
| GET | `/api/v1/cases/:id/graph` | Get entity graph |
| POST | `/api/v1/cases/:id/notes` | Add note |

---

## Actions Menu

| Action | Description |
|--------|-------------|
| **Assign Investigator** | Change assignment |
| **Change Status** | Update case status |
| **Generate Report** | Create summary report |
| **Run Analysis** | Re-run fraud detection |
| **Close Case** | Close with resolution |
| **Export** | Download case data |

---

## State Management

```typescript
// Fetch case data
const { data: caseData } = useQuery({
  queryKey: ['case', caseId],
  queryFn: () => api.getCase(caseId),
});

// Tab state
const [activeTab, setActiveTab] = useState('overview');

// URL sync for tab
useEffect(() => {
  const tab = searchParams.get('tab') || 'overview';
  setActiveTab(tab);
}, [searchParams]);
```

---

## Performance

- Lazy load tabs (only fetch when selected)
- Virtual scrolling for large lists
- Graph rendered with WebGL
- Document preview on demand

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-6` | Switch tabs |
| `E` | Edit case |
| `N` | Add note |
| `Esc` | Back to list |


---

## 🚀 Investigative Heuristics (Proposed)

Augmenting human intuition with machine precision.

### 1. 🕸️ Snowball Search (Network Expansion)
Automatically suggests related entities based on heuristic links.
- **Rule:** "If Subject traded with X > 5 times, and X shares phone with Y -> Suggest adding Y to case."
- **Benefit:** Uncovers hidden collusion rings without manual queries.

### 2. ⏳ Timeline Gap Analysis
Identifies logical inconsistencies in the data trail.
- **Alert:** "Data Missing: Zero activity for 45 days in high-traffic account (Probability < 1%)."
- **Action:** Prompts investigator to request missing statements.

### 3. 👤 Behavioral Deviation
Compares subject actions against their own baseline or peer groups.
- **Metric:** "Spending Velocity is 400% above 12-month average."

---

## Related Pages

- [Case List](./02_CASE_LIST.md) - Return to list
- [Adjudication](./07_ADJUDICATION.md) - Review alerts
