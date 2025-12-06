# 📁 Case List Page

> Browse and manage investigation cases

**Route:** `/cases`  
**File:** `src/pages/CaseList.tsx`

---

## Overview

The Case List page displays all investigation cases with filtering, sorting, and bulk action capabilities. Users can browse cases and navigate to detailed views.

---

## Screenshot

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📁 Cases                                   [+ New Case] [🔍 Search]        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [All] [Open] [In Progress] [Under Review] [Closed]     [Filter ▼] [Sort ▼]│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ ☐ │ Case ID        │ Subject        │ Risk │ Investigator │ Status   │ │
│  ├───┼────────────────┼────────────────┼──────┼──────────────┼──────────┤ │
│  │ ☐ │ CASE-2024-001  │ John Doe       │ 🔴95 │ Sarah K.     │ Progress │ │
│  │   │ Created: Jan 15│ Individual     │      │              │          │ │
│  ├───┼────────────────┼────────────────┼──────┼──────────────┼──────────┤ │
│  │ ☐ │ CASE-2024-002  │ PT ABC Ind.    │ 🟡65 │ Mike R.      │ Open     │ │
│  │   │ Created: Jan 14│ Company        │      │              │          │ │
│  ├───┼────────────────┼────────────────┼──────┼──────────────┼──────────┤ │
│  │ ☐ │ CASE-2024-003  │ Jane Smith     │ 🟢32 │ Unassigned   │ Open     │ │
│  │   │ Created: Jan 12│ Individual     │      │              │          │ │
│  ├───┼────────────────┼────────────────┼──────┼──────────────┼──────────┤ │
│  │ ☐ │ CASE-2024-004  │ CV XYZ Corp    │ 🔴88 │ John D.      │ Review   │ │
│  │   │ Created: Jan 10│ Company        │      │              │          │ │
│  └───┴────────────────┴────────────────┴──────┴──────────────┴──────────┘ │
│                                                                             │
│  ☐ Select All                           Showing 1-25 of 1,234              │
│  [Assign] [Change Status] [Export]            [◄ Prev] [1] [2] [3] [Next ►]│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Case Table | ✅ | Paginated list with key info |
| Status Tabs | ✅ | Filter by status |
| Advanced Filters | ✅ | Risk, date, investigator |
| Sorting | ✅ | Multiple columns |
| Bulk Selection | ✅ | Multi-select for actions |
| Quick Preview | ✅ | Hover for summary |
| Export | ✅ | CSV/Excel download |
| Real-time | ✅ | WebSocket updates |

---

## Filters

| Filter | Options |
|--------|---------|
| **Status** | All, Open, In Progress, Under Review, Closed |
| **Priority** | All, Low, Medium, High, Critical |
| **Risk Score** | Range slider (0-100) |
| **Investigator** | Dropdown of team members |
| **Date Created** | Date range picker |
| **Subject Type** | Individual, Company |

---

## Sorting Options

| Column | Directions |
|--------|------------|
| Case ID | A-Z, Z-A |
| Subject Name | A-Z, Z-A |
| Risk Score | High to Low, Low to High |
| Created Date | Newest, Oldest |
| Status | Custom order |

---

## Bulk Actions

When cases are selected:

| Action | Description |
|--------|-------------|
| **Assign** | Assign to investigator |
| **Change Status** | Update status in bulk |
| **Export** | Download selected cases |
| **Archive** | Move to archive |

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `DataTable` | Sortable table with pagination |
| `StatusTabs` | Status filter tabs |
| `FilterPanel` | Advanced filter controls |
| `CaseRow` | Individual case display |
| `BulkActions` | Action toolbar |
| `Pagination` | Page navigation |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/cases` | List cases with filters |
| POST | `/api/v1/cases` | Create new case |
| PUT | `/api/v1/cases/bulk` | Bulk update |
| GET | `/api/v1/cases/export` | Export cases |

**Query Parameters:**
```
?page=1
&per_page=25
&status=open
&priority=high
&risk_min=70
&risk_max=100
&investigator_id=...
&sort=risk_score
&order=desc
```

---

## State Management

```typescript
// URL state for filters
const [searchParams, setSearchParams] = useSearchParams();

// Fetch cases with React Query
const { data: cases, isLoading } = useQuery({
  queryKey: ['cases', filters],
  queryFn: () => api.getCases(filters),
});

// Selection state
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
```

---

## Row Actions

Clicking a row navigates to Case Detail. Hover reveals:

| Action | Description |
|--------|-------------|
| 👁️ View | Go to detail page |
| ✏️ Edit | Quick edit modal |
| 🗑️ Delete | Delete with confirmation |

---

## Performance

- Virtual scrolling for large lists
- Debounced search
- Paginated API calls
- Optimistic UI updates

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate rows |
| `Enter` | Open selected case |
| `Space` | Toggle selection |
| `Shift + Click` | Range select |

---

## Related Pages

- [Case Detail](./CASE_DETAIL.md) - View case details
- [Dashboard](./DASHBOARD.md) - Return to overview
