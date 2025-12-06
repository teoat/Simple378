# Case Detail Page

**Route:** `/cases/:id`  
**Component:** `src/pages/CaseDetail.tsx`  
**Status:** ✅ Implemented

---

## Overview

The Case Detail page provides an in-depth view of a specific fraud investigation case. It presents comprehensive case information through multiple specialized tabs, enabling analysts to review evidence, analyze relationships, track timelines, and examine financial flows.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Back to Cases                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Subject: Acme Corporation                                        │   │
│  │ Case #1234 │ Risk: ████████░░ 85 │ Status: 🟢 Active            │   │
│  │                                                                  │   │
│  │ [✏️ Edit] [📥 Download] [⚠️ Escalate] [✅ Approve]              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Overview] [Graph] [Timeline] [Financials] [Evidence]           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                    Tab Content Area                              │   │
│  │                                                                  │   │
│  │    (Content changes based on selected tab)                       │   │
│  │                                                                  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tabs Overview

### 1. Overview Tab
Primary summary view with key case information.

```
┌────────────────────────────────────────────────────────────────┐
│ Case Summary                              Key Metrics          │
│ ──────────────────────────                ──────────────────── │
│ Description: Suspicious wire              Total Value: $1.2M   │
│ transfers exceeding normal                Transactions: 47     │
│ business patterns...                      Risk Indicators: 5   │
│                                           Days Open: 12        │
│ ┌──────────────────────────────┐                              │
│ │ Recent Activity               │  ┌─────────────────────────┐│
│ │ • File uploaded - 2h ago      │  │ AI Insights            ││
│ │ • Note added - 5h ago         │  │ ────────────────────── ││
│ │ • Risk score updated - 1d     │  │ Pattern: Layering      ││
│ │ • Case created - 12d ago      │  │ Confidence: 87%        ││
│ └──────────────────────────────┘  │ Recommendation: Escalate││
│                                   └─────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

### 2. Graph Analysis Tab
Interactive network visualization of entity relationships.

```
┌────────────────────────────────────────────────────────────────┐
│ Entity Relationship Graph                                      │
│                                                                │
│                    [Person A]                                  │
│                   /    |    \                                  │
│            [Company X] │ [Company Y]                           │
│                 |      │      |                                │
│            [Account 1] │ [Account 2]                           │
│                   \    │    /                                  │
│                   [Transaction Hub]                            │
│                                                                │
│ ────────────────────────────────────────────────────────────── │
│ [Zoom +] [Zoom -] [Reset] [Export]    Legend: 🔵 Person       │
│                                                🟢 Company     │
│                                                🟡 Account     │
└────────────────────────────────────────────────────────────────┘
```

### 3. Timeline Tab
Chronological event history.

```
┌────────────────────────────────────────────────────────────────┐
│ Case Timeline                    [Filter: All ▼] [Sort ▼]     │
│                                                                │
│ Dec 6, 2025                                                    │
│ ├─ 10:30 AM  📤 Document uploaded "Bank Statement Nov.pdf"     │
│ └─ 08:15 AM  📝 Note added by J. Smith                         │
│                                                                │
│ Dec 5, 2025                                                    │
│ ├─ 04:00 PM  ⚠️ Risk score increased: 78 → 85                 │
│ ├─ 02:30 PM  🔍 AI analysis completed                          │
│ └─ 09:00 AM  👤 Case assigned to A. Jones                      │
│                                                                │
│ Nov 25, 2025                                                   │
│ └─ 11:00 AM  🆕 Case created from alert #5678                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 4. Financials Tab
Financial flow visualization with Sankey diagram.

```
┌────────────────────────────────────────────────────────────────┐
│ Financial Flow Analysis                                        │
│                                                                │
│ Source          →         Intermediary      →      Destination │
│                                                                │
│ Bank A ═══════════════╗                                        │
│          $500K       ╠══════════ Shell Co ══════════╗          │
│ Bank B ═══════════════╝                 ║           ║          │
│               $300K                     ║      $750K ║          │
│                                         ║           ╚═══ Bank X │
│ Wire ════════════════════════════════════╝                     │
│         $250K                             $250K                │
│                                                    ═══╗        │
│                                                       ╚═ Bank Y│
│                                                                │
│ ────────────────────────────────────────────────────────────── │
│ Total Inflow: $1,050,000          Total Outflow: $1,000,000   │
│ Suspicious Transactions: 12        Missing Amount: $50,000     │
└────────────────────────────────────────────────────────────────┘
```

### 5. Evidence Tab
Document management and file uploads.

```
┌────────────────────────────────────────────────────────────────┐
│ Evidence Documents                          [+ Upload File]    │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Drop files here or click to browse                        │  │
│ │                                                            │  │
│ │ Supported: PDF, DOCX, XLSX, PNG, JPG (max 50MB)           │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ Uploaded Files (8)                                             │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 📄 Bank_Statement_Nov.pdf        2.1 MB    Dec 6, 2025   │  │
│ │ 📊 Transaction_Analysis.xlsx     850 KB    Dec 5, 2025   │  │
│ │ 🖼️ Receipt_Scan.jpg              1.5 MB    Dec 4, 2025   │  │
│ │ 📄 Contract_Agreement.pdf        3.2 MB    Dec 3, 2025   │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Components

### EntityGraph (`components/graphs/EntityGraph.tsx`)
Force-directed graph visualization using D3.js or vis-network.

**Props:**
```typescript
interface EntityGraphProps {
  caseId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
}
```

### Timeline (`components/cases/Timeline.tsx`)
Event timeline component.

**Props:**
```typescript
interface TimelineProps {
  events: TimelineEvent[];
  onEventClick?: (eventId: string) => void;
}
```

### FinancialSankey (`components/charts/FinancialSankey.tsx`)
Sankey diagram for financial flows.

**Props:**
```typescript
interface FinancialSankeyProps {
  flows: FinancialFlow[];
  highlightSuspicious?: boolean;
}
```

---

## Features

### Case Actions
| Action | Description | Permission |
|--------|-------------|------------|
| Edit | Modify case details | Analyst, Admin |
| Download | Export case report (PDF) | All |
| Escalate | Escalate to supervisor | Analyst |
| Approve | Mark case as reviewed | Supervisor, Admin |
| Archive | Move to archive | Admin |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `1` | Switch to Overview tab |
| `2` | Switch to Graph tab |
| `3` | Switch to Timeline tab |
| `4` | Switch to Financials tab |
| `5` | Switch to Evidence tab |
| `e` | Edit case |
| `d` | Download report |
| `Esc` | Go back to case list |

### Real-time Updates
- Case status changes
- New evidence uploads
- Note additions
- Risk score updates

---

## API Integration

### Get Case Detail
```typescript
GET /api/v1/cases/:id

Response (200):
{
  "id": "case_1234",
  "case_number": "1234",
  "subject": {
    "id": "subj_567",
    "name": "Acme Corporation",
    "type": "company"
  },
  "risk_score": 85,
  "status": "active",
  "description": "Suspicious wire transfers...",
  "created_at": "2025-11-25T11:00:00Z",
  "updated_at": "2025-12-06T10:30:00Z",
  "analyst": {
    "id": "user_789",
    "name": "J. Smith"
  },
  "metrics": {
    "total_value": 1200000,
    "transaction_count": 47,
    "risk_indicators": 5,
    "days_open": 12
  }
}
```

### Get Case Graph
```typescript
GET /api/v1/cases/:id/graph

Response (200):
{
  "nodes": [
    { "id": "n1", "type": "person", "label": "John Doe", "properties": {} }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "type": "owns" }
  ]
}
```

### Get Case Timeline
```typescript
GET /api/v1/cases/:id/timeline

Response (200):
{
  "events": [
    {
      "id": "evt_123",
      "type": "document_upload",
      "message": "Document uploaded",
      "timestamp": "2025-12-06T10:30:00Z",
      "actor": "J. Smith"
    }
  ]
}
```

### Upload Evidence
```typescript
POST /api/v1/cases/:id/evidence
Content-Type: multipart/form-data

Response (201):
{
  "id": "file_456",
  "filename": "document.pdf",
  "size": 2100000,
  "mime_type": "application/pdf",
  "uploaded_at": "2025-12-06T10:30:00Z"
}
```

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Tab Navigation | ARIA tabs pattern with `role="tablist"` |
| Graph Navigation | Keyboard controls for node selection |
| Timeline | Semantic time elements, screen reader announcements |
| File Upload | Accessible drop zone with keyboard support |
| Focus Management | Focus restored after modal close |

---

## Responsive Behavior

| Breakpoint | Layout Change |
|------------|---------------|
| ≥1280px | Full layout with side panels |
| ≥1024px | Stacked sections, full graph |
| ≥768px | Tabs become scrollable, graph simplified |
| <768px | Single column, expandable sections |

---

## Testing

### Unit Tests
- Tab switching logic
- Action button visibility by permission
- Graph node/edge rendering

### E2E Tests
- Complete case viewing flow
- Evidence upload
- Tab navigation
- Action execution (edit, escalate)

---

## Related Files

```
frontend/src/
├── pages/CaseDetail.tsx
├── components/cases/
│   ├── Timeline.tsx
│   ├── CaseHeader.tsx
│   └── CaseActions.tsx
├── components/graphs/
│   └── EntityGraph.tsx
├── components/charts/
│   └── FinancialSankey.tsx
└── lib/
    └── api.ts
```

---

## Future Enhancements

- [ ] Collaborative annotations on graphs
- [ ] Timeline filtering by event type
- [ ] Financial anomaly highlighting
- [ ] Side-by-side case comparison
- [ ] AI-generated case summary
- [ ] Document preview without download
- [ ] Case linking for related investigations
