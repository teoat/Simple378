# Example: Bug Fix Issue (Good for Copilot Agent)

## Title
Fix: Case list pagination shows incorrect page count

## Description
The case list pagination component displays "Page 1 of 1" even when there are multiple pages of cases. This occurs because the total count from the API is not being used correctly to calculate the number of pages.

## Problem
Users cannot navigate to additional pages of cases beyond the first page, making cases inaccessible.

## Steps to Reproduce
1. Ensure database has more than 20 cases (pagination is 20 per page)
2. Navigate to `/cases` 
3. Observe pagination shows "Page 1 of 1"
4. "Next" button is disabled even though more cases exist
5. API returns total count correctly in response

## Expected Behavior
- Pagination should show correct page count (e.g., "Page 1 of 3" when there are 50 cases)
- "Next" button should be enabled when not on last page
- "Previous" button should be enabled when not on first page
- Clicking "Next" should load the next page of cases

## Actual Behavior
- Pagination always shows "Page 1 of 1"
- "Next" button is always disabled
- Cannot access cases beyond the first 20

## Root Cause Analysis (if known)
Looking at the code, `CaseList.tsx` calculates pages as:
```typescript
const pageCount = Math.ceil(data.length / 20);
```

But `data.length` is always 20 (the current page size), not the total count. The API response includes `total` field which should be used instead.

## Affected Files
- `frontend/src/components/cases/CaseList.tsx` - Pagination calculation logic
- `frontend/src/hooks/useCases.ts` - May need to expose total count
- `frontend/src/components/cases/CasePagination.tsx` - Display logic

## Acceptance Criteria
- [ ] Pagination displays correct page count based on total cases
- [ ] Next button enabled when not on last page
- [ ] Previous button enabled when not on first page  
- [ ] Page number updates when navigating
- [ ] URL parameter (?page=2) updates with current page
- [ ] Unit tests added for pagination edge cases
- [ ] No regression in existing case list functionality

## Testing Requirements

### Unit Tests
Add to `frontend/src/components/cases/__tests__/CaseList.test.tsx`:
- Test pagination with 0 cases (should show "Page 1 of 1")
- Test pagination with exactly 20 cases (should show "Page 1 of 1") 
- Test pagination with 21 cases (should show "Page 1 of 2")
- Test pagination with 100 cases (should show correct count)
- Test Next button disabled on last page
- Test Previous button disabled on first page

### Manual Testing
- Create 50+ test cases in database
- Verify pagination navigation works
- Verify URL updates correctly
- Test keyboard navigation (Tab to buttons, Enter to activate)

## API Response Format
```json
{
  "items": [...],      // Array of 20 cases
  "total": 47,         // Total number of cases
  "page": 1,           // Current page
  "page_size": 20      // Items per page
}
```

## Additional Context
- Similar pagination works correctly in Evidence list (`EvidenceList.tsx`) - use as reference
- Pagination component is shared (`CasePagination.tsx`) so fix should work for both
- Backend API already returns correct total count

## Priority
**Medium** - Users can still access first 20 cases, but cannot see additional cases

## Labels
- `bug`
- `frontend`
- `good-first-issue`
- `copilot`

## Estimated Complexity
**Low** - Simple calculation fix, existing patterns to follow

---

**This is an example of a well-structured bug report suitable for GitHub Copilot coding agent.**

**Why this is good:**
✅ Clear reproduction steps  
✅ Root cause identified  
✅ Affected files listed  
✅ Specific acceptance criteria  
✅ Test requirements detailed  
✅ API format documented  
✅ Reference to similar working code  
✅ Priority and complexity assessed
