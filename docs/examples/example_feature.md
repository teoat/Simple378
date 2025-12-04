# Example: Feature Request (Good for Copilot Agent with Clear Specs)

## Title
Feature: Add case status filter dropdown to case list

## Description
Users need to filter the case list by status (Open, In Review, Closed) to quickly find relevant cases. Currently, all cases are shown together, making it difficult to focus on cases in a specific state.

## Problem Statement
As an investigator, I want to filter cases by status so that I can focus on cases requiring my attention without scrolling through completed cases.

## User Story
```
Given I am viewing the case list
When I select a status from the filter dropdown
Then I should see only cases with that status
And the URL should update to reflect my filter selection
And the filter should persist when I refresh the page
```

## Proposed Solution

### UI Design
Add a filter dropdown above the case list with the following:
- **Label:** "Status:"
- **Default option:** "All" (shows all cases)
- **Options:** 
  - All
  - Open (cases not yet reviewed)
  - In Review (cases being investigated)
  - Closed (completed cases)
- **Position:** Top right of case list, aligned with search bar (if exists)
- **Styling:** Use shadcn/ui Select component to match existing UI

### Visual Mockup
```
┌─────────────────────────────────────────────────────┐
│  Cases                        Status: [All ▼]        │
├─────────────────────────────────────────────────────┤
│  Case #123 - Expense Fraud           Open           │
│  Case #124 - Invoice Manipulation    In Review      │
│  Case #125 - Vendor Kickback        Closed          │
└─────────────────────────────────────────────────────┘
```

### Behavior
1. Dropdown displays all status options
2. Selecting a status immediately filters the list
3. URL updates to `?status=open` (or selected status)
4. If URL has status param on load, pre-select that option
5. Changing filter resets pagination to page 1
6. Filter state persists across navigation (URL-based)

## Affected Files

### New Files to Create
- `frontend/src/components/cases/CaseStatusFilter.tsx` - Filter dropdown component
- `frontend/src/components/cases/__tests__/CaseStatusFilter.test.tsx` - Unit tests

### Files to Modify
- `frontend/src/components/cases/CaseList.tsx` - Add filter to page layout
- `frontend/src/hooks/useCases.ts` - Add status parameter to API query
- `frontend/src/lib/api.ts` - Update cases endpoint call to include status filter
- `backend/app/api/v1/endpoints/cases.py` - Add status query parameter (if not exists)

## Acceptance Criteria

### Functionality
- [ ] Filter dropdown renders with all status options (All, Open, In Review, Closed)
- [ ] Selecting a status filters the case list to show only matching cases
- [ ] Selecting "All" shows all cases regardless of status
- [ ] URL updates with selected status (?status=open)
- [ ] On page load, filter pre-selects based on URL parameter
- [ ] Changing filter resets to page 1
- [ ] Filter state persists when navigating away and back

### Accessibility
- [ ] Filter is keyboard accessible (Tab to reach, Arrow keys to select, Enter to confirm)
- [ ] Dropdown has proper ARIA labels (`aria-label="Filter by status"`)
- [ ] Screen reader announces selected option
- [ ] Focus indicator visible on dropdown

### Visual Design
- [ ] Matches shadcn/ui Select component styling
- [ ] Aligns properly with case list header
- [ ] Mobile responsive (dropdown stacks on small screens)
- [ ] Loading state if cases are refetching

### Testing
- [ ] Unit tests for CaseStatusFilter component
- [ ] Tests for filter selection behavior
- [ ] Tests for URL parameter handling
- [ ] Tests for keyboard navigation
- [ ] Integration test for filtering with API
- [ ] No regression in existing case list tests

### Performance
- [ ] Filtering triggers only one API call
- [ ] No unnecessary re-renders
- [ ] Debounced if combined with search (future consideration)

## Technical Implementation Guide

### Component Structure
```typescript
// CaseStatusFilter.tsx
import { Select } from '@/components/ui/select';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'closed', label: 'Closed' },
];

export function CaseStatusFilter({ value, onChange }: Props) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      aria-label="Filter by status"
    >
      {statusOptions.map(option => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}
```

### URL Management
Use React Router's `useSearchParams`:
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const status = searchParams.get('status') || 'all';

const handleStatusChange = (newStatus: string) => {
  setSearchParams({ 
    status: newStatus === 'all' ? undefined : newStatus,
    page: '1' // Reset to first page
  });
};
```

### API Integration
```typescript
// useCases.ts
export function useCases(status?: string) {
  return useQuery({
    queryKey: ['cases', status],
    queryFn: () => api.getCases({ status }),
  });
}

// Backend endpoint
@router.get("/cases")
async def get_cases(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
):
    query = select(Case)
    if status and status != 'all':
        query = query.where(Case.status == status)
    # ... rest of implementation
```

## Testing Requirements

### Unit Tests
```typescript
// CaseStatusFilter.test.tsx
describe('CaseStatusFilter', () => {
  it('renders all status options', () => { });
  it('calls onChange when option selected', () => { });
  it('shows selected value', () => { });
  it('is keyboard accessible', () => { });
});

// CaseList.test.tsx (add to existing)
it('filters cases when status selected', () => { });
it('updates URL with status parameter', () => { });
it('loads with status from URL', () => { });
```

### Integration Tests
- Filter by each status and verify API called with correct parameter
- Verify filtered results display correctly
- Test URL parameter persistence

### Manual Testing Checklist
- [ ] Filter works with mouse
- [ ] Filter works with keyboard (Tab, Arrows, Enter)
- [ ] URL updates correctly
- [ ] Page refresh maintains filter
- [ ] Mobile responsive
- [ ] Works with screen reader

## API Specification

### Request
```
GET /api/v1/cases?status=open&page=1&limit=20
```

### Response
```json
{
  "items": [
    {
      "id": "123",
      "title": "Expense Fraud",
      "status": "open",
      ...
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

## Dependencies
- No new dependencies required
- Uses existing shadcn/ui Select component
- Uses existing React Router for URL management

## Related Issues/PRs
- #42 - Original request for filtering
- See Evidence list filtering as reference pattern

## Priority
**Medium** - Improves usability but not blocking

## Estimated Complexity
**Medium** - Multiple files, URL management, but follows existing patterns

## Labels
- `enhancement`
- `frontend`
- `good-for-copilot`
- `ui-component`

---

**This is an example of a well-structured feature request suitable for GitHub Copilot coding agent.**

**Why this is good:**
✅ Clear problem statement and user story  
✅ Detailed UI design with mockup  
✅ Specific behavior requirements  
✅ All affected files listed  
✅ Implementation guidance provided  
✅ Comprehensive acceptance criteria  
✅ Testing requirements specified  
✅ API specification documented  
✅ Technical examples included  
✅ Accessibility considered  
✅ Similar patterns referenced
