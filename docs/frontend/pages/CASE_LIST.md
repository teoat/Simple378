# Case List Page

**Route:** `/cases`  
**Component:** `src/pages/CaseList.tsx`  
**Status:** ✅ Implemented

---

## Overview

The Case List page provides a comprehensive view of all fraud investigation cases. It enables analysts to search, filter, sort, and manage cases efficiently with bulk operations support and real-time updates.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header: "Case Management"                              [+ New Case]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 [Search cases...                        ]   [ Status ▼ ]     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ☐ │ Case ID ↕│ Subject       │ Risk Score│ Status  │ Analyst   │   │
│  ├───┼──────────┼───────────────┼───────────┼─────────┼───────────┤   │
│  │ ☐ │ #1234    │ Acme Corp     │ ████  85  │ Active  │ J. Smith  │   │
│  │ ☐ │ #1233    │ XYZ Holdings  │ ███   65  │ Pending │ A. Jones  │   │
│  │ ☐ │ #1232    │ Tech Inc      │ ██    45  │ Active  │ M. Brown  │   │
│  │ ☐ │ #1231    │ Global Ltd    │ █████ 92  │ Escalated│ L. Lee   │   │
│  │ ☐ │ #1230    │ Smith & Co    │ █     25  │ Closed  │ P. White  │   │
│  └───┴──────────┴───────────────┴───────────┴─────────┴───────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Delete Selected]     ◀ 1 2 3 4 5 ▶    Showing 1-10 of 247     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### CaseSearch (`components/cases/CaseSearch.tsx`)
Search input with debounce and search mode toggle.

**Props:**
```typescript
interface CaseSearchProps {
  value: string;
  onChange: (value: string) => void;
  searchMode: 'db' | 'meilisearch';
  onSearchModeChange: (mode: 'db' | 'meilisearch') => void;
}
```

**Features:**
- Debounced input (300ms delay)
- Toggle between database and Meilisearch
- Keyboard shortcut: `/` to focus

### CaseFilters (`components/cases/CaseFilters.tsx`)
Filter controls for case status, risk level, and date range.

**Props:**
```typescript
interface CaseFiltersProps {
  status: CaseStatus | 'all';
  riskLevel: RiskLevel | 'all';
  dateRange: { start?: Date; end?: Date };
  onFilterChange: (filters: FilterState) => void;
}
```

### QuickPreview (`components/cases/QuickPreview.tsx`)
Hover card showing case summary.

**Props:**
```typescript
interface QuickPreviewProps {
  caseId: string;
  position: { x: number; y: number };
}
```

### StatusBadge (`components/cases/StatusBadge.tsx`)
Visual indicator for case status.

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'escalated' | 'closed' | 'archived';
  size?: 'sm' | 'md' | 'lg';
}
```

### RiskBar (`components/cases/RiskBar.tsx`)
Visual risk score indicator.

**Props:**
```typescript
interface RiskBarProps {
  score: number;
  showLabel?: boolean;
}
```

### CaseListSkeleton (`components/cases/CaseListSkeleton.tsx`)
Loading state placeholder.

---

## Features

### Search Functionality
- **Database Search:** Traditional SQL search (LIKE queries)
- **Meilisearch:** Full-text search with typo tolerance, instant results
- **Search Fields:** Case ID, subject name, description, analyst name

### Filtering
| Filter | Options |
|--------|---------|
| Status | All, Active, Pending, Escalated, Closed, Archived |
| Risk Level | All, Critical (≥90), High (70-89), Medium (40-69), Low (<40) |
| Date Range | Custom date picker (created date) |
| Analyst | Dropdown of team members |

### Sorting
**Sortable Columns:**
- Case ID (default: descending)
- Subject name
- Risk score
- Status
- Created date
- Last updated

### Bulk Actions
- **Select All:** Checkbox in header
- **Delete Selected:** Bulk case deletion with confirmation
- **Export Selected:** Download case data as CSV
- **Assign Analyst:** Bulk reassignment

### Pagination
- **Page Size:** 10, 25, 50, 100 items per page
- **Navigation:** First, Previous, Page Numbers, Next, Last
- **Jump to Page:** Direct page number input

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `Esc` | Clear search, deselect all |
| `ArrowUp/Down` | Navigate rows (when table focused) |
| `Enter` | Open selected case |
| `Delete` | Delete selected (with confirmation) |

---

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  CaseList   │────▶│  useQuery    │────▶│ GET /api/v1/    │
│  Component  │     │  (cases)     │     │ cases           │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                   │
       │                   ▼
       │            ┌──────────────┐
       │            │  Query Params │
       │            │  - page       │
       │            │  - per_page   │
       │            │  - search     │
       │            │  - status     │
       │            │  - sort_by    │
       │            │  - sort_order │
       │            └──────────────┘
       │
       │            ┌──────────────┐     ┌─────────────────┐
       └───────────▶│  WebSocket   │────▶│ case:created    │
                    │  Connection  │     │ case:updated    │
                    └──────────────┘     └─────────────────┘
```

---

## API Integration

### List Cases Endpoint
```typescript
GET /api/v1/cases?page=1&per_page=10&status=active&sort_by=created_at&sort_order=desc

Response (200):
{
  "items": [
    {
      "id": "case_1234",
      "case_number": "1234",
      "subject_name": "Acme Corp",
      "subject_id": "subj_567",
      "risk_score": 85,
      "status": "active",
      "analyst": {
        "id": "user_789",
        "name": "J. Smith"
      },
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-06T08:30:00Z"
    }
  ],
  "total": 247,
  "page": 1,
  "per_page": 10,
  "total_pages": 25
}
```

### Search Cases (Meilisearch)
```typescript
GET /api/v1/cases/search?q=acme&page=1&per_page=10

Response (200):
{
  "hits": [...],
  "query": "acme",
  "processingTimeMs": 12,
  "total": 5
}
```

### Bulk Delete
```typescript
DELETE /api/v1/cases/bulk
Content-Type: application/json

Request:
{
  "case_ids": ["case_1234", "case_1235"]
}

Response (200):
{
  "deleted_count": 2
}
```

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Table Semantics | Proper `<table>`, `<thead>`, `<tbody>` structure |
| Sort Indicators | `aria-sort` on sortable columns |
| Row Selection | `aria-selected` on selected rows |
| Live Regions | `aria-live` for search results count |
| Focus Management | Focus trap in bulk action dialogs |
| Screen Reader | Descriptive column headers, status announcements |

---

## Responsive Behavior

| Breakpoint | Layout Change |
|------------|---------------|
| ≥1280px | Full table with all columns |
| ≥1024px | Hide analyst column |
| ≥768px | Card-based layout, key info only |
| <768px | Stacked cards, expandable details |

---

## Performance Optimizations

- **Virtual Scrolling:** For large datasets (>100 items)
- **Query Caching:** React Query with 60-second stale time
- **Debounced Search:** 300ms delay before API call
- **Memoized Rows:** Prevent unnecessary re-renders
- **Optimistic Updates:** Immediate UI feedback on mutations

---

## Testing

### Unit Tests
- Search input debouncing
- Filter state management
- Sorting logic
- Pagination controls

### E2E Tests
- Full search flow (both modes)
- Filter combination scenarios
- Bulk selection and deletion
- Navigation to case detail

---

## Related Files

```
frontend/src/
├── pages/CaseList.tsx
├── components/cases/
│   ├── CaseSearch.tsx
│   ├── CaseFilters.tsx
│   ├── QuickPreview.tsx
│   ├── StatusBadge.tsx
│   ├── RiskBar.tsx
│   ├── CaseListSkeleton.tsx
│   └── NewCaseModal.tsx
└── lib/
    └── api.ts                    # API client
```

---

## Future Enhancements

- [ ] Saved search/filter presets
- [ ] Column visibility customization
- [ ] Case comparison view (side-by-side)
- [ ] Inline editing for status changes
- [ ] Advanced search syntax (AND, OR, exact match)
- [ ] Export to Excel with formatting
