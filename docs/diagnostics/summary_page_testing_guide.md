# Summary Page - Manual Testing Guide

## Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend dev server running on `http://localhost:5173`
- At least one case/subject in the database with ID (e.g., from CaseList)

---

## Test Case 1: Basic Page Load

### Steps
1. Navigate to Case List page (`/cases`)
2. Note a case ID from the list (e.g., `550e8400-e29b-41d4-a716-446655440000`)
3. Navigate directly to `/summary/{case_id}` in the browser
   - Example: `http://localhost:5173/summary/550e8400-e29b-41d4-a716-446655440000`

### Expected Results
- ✅ Page loads without JavaScript errors (check browser console)
- ✅ Loading spinner appears briefly
- ✅ Success banner displays with case status
- ✅ Three pipeline cards appear (Ingestion, Reconciliation, Adjudication)
- ✅ **Key Findings section displays with AI-generated findings** ⭐ (CRITICAL)
- ✅ Four chart embeds appear in a grid
- ✅ PDF Generator sidebar appears
- ✅ Action buttons appear at the bottom

### What to Check
**Key Findings Section** (Critical for this fix):
- Should display "Key Findings" header with "AI Generated" badge
- Should show findings with icons (pattern, amount, confirmation, etc.)
- Each finding should have:
  - Severity indicator (high/medium/low with colored border)
  - Description text
  - Evidence badges (if applicable)
- Hover over a finding should show edit icon (if editable=true)

**Browser Console** (Most Important):
- ❌ Should NOT see: `Cannot read property 'findings' of undefined`
- ❌ Should NOT see: `data.findings is undefined`
- ❌ Should NOT see any TypeScript/React errors
- ✅ Should see: Network request to `/api/v1/summary/{case_id}` with 200 OK

---

## Test Case 2: API Response Validation

### Steps
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/summary/{case_id}`
4. Find the request to `/api/v1/summary/{case_id}`
5. Click on it and view the Response

### Expected Response Structure
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "dataQuality": 99.8,
  "daysToResolution": 5,
  "ingestion": {
    "records": 1250,
    "files": 8,
    "completion": 100.0,
    "status": "complete"
  },
  "reconciliation": {
    "matchRate": 94.2,
    "newRecords": 890,
    "rejected": 45,
    "status": "complete"
  },
  "adjudication": {
    "resolved": 12,
    "totalAlerts": 12,
    "avgTime": "8.3 min",
    "status": "complete"
  },
  "findings": [  // ⭐ CRITICAL: This field must be present
    {
      "id": "finding_abc12345",
      "type": "pattern",
      "severity": "high",
      "description": "Identified 10 high-risk patterns involving multiple entities",
      "evidence": ["...", "...", "..."]
    },
    // ... more findings
  ]
}
```

### Validation Checklist
- ✅ Response status is 200 OK
- ✅ `findings` field is present (not null, not undefined)
- ✅ `findings` is an array
- ✅ Each finding has: `id`, `type`, `severity`, `description`, `evidence`
- ✅ Field names use camelCase (dataQuality, daysToResolution, NOT data_quality)
- ✅ All enum values match expected types:
  - `status`: "success" | "partial" | "failed"
  - `severity`: "high" | "medium" | "low"
  - `type`: "pattern" | "amount" | "confirmation" | "false_positive" | "recommendation"

---

## Test Case 3: Findings Edit Mode (If Editable)

### Steps
1. On the summary page, check if `editable` prop is true in FinalSummary.tsx (line 193)
2. Hover over a finding in the Key Findings section
3. Click the edit icon (pencil) that appears
4. Modify the description text
5. Click "Save"

### Expected Results
- ✅ Edit icon appears on hover
- ✅ Clicking edit shows textarea with current description
- ✅ Can modify text
- ✅ Save button is clickable
- ✅ After save, description updates (local state)
- ⚠️ **Note:** Backend save not fully implemented yet (stub)

---

## Test Case 4: Archive Functionality

### Steps
1. On summary page, click "Archive Case" button at bottom
2. Confirm if prompted
3. Wait for success toast

### Expected Results
- ✅ Archive button is clickable
- ✅ API request sent to `POST /api/v1/summary/{case_id}/archive`
- ✅ Success toast appears: "Case archived successfully"
- ✅ Navigates back to `/cases` page

---

## Test Case 5: PDF Generation

### Steps
1. On summary page, go to PDF Generator sidebar (right side)
2. Select a template (e.g., "Standard Report")
3. Click "Generate PDF" button

### Expected Results
- ✅ Button is clickable
- ✅ API request sent to `POST /api/v1/summary/{case_id}/report`
- ✅ Success toast appears: "Generated {template} report"
- ⚠️ **Note:** Actual PDF download not implemented yet (returns mock URL)

---

## Test Case 6: Copy Link

### Steps
1. On summary page, click "Copy Link" button at bottom
2. Check clipboard

### Expected Results
- ✅ Button is clickable
- ✅ Success toast appears: "Link copied to clipboard"
- ✅ Clipboard contains current page URL
- ✅ Can paste URL into new tab and page loads

---

## Test Case 7: Error Handling

### Steps
1. Navigate to `/summary/invalid-uuid-format`
2. Navigate to `/summary/00000000-0000-0000-0000-000000000000` (non-existent case)

### Expected Results
**Invalid UUID**:
- ✅ Backend returns 400 Bad Request
- ✅ Frontend shows error toast: "Failed to load case summary"
- ✅ Page shows error state (not crash)

**Non-existent Case**:
- ✅ Backend returns 404 Not Found
- ✅ Frontend shows error toast
- ✅ Page shows error state

---

## Test Case 8: Dark Mode

### Steps
1. On summary page, toggle dark mode (if available in app)
2. Verify all components

### Expected Results
- ✅ Success banner has dark variant
- ✅ Pipeline cards have dark backgrounds
- ✅ Key Findings section has dark theme
- ✅ Charts adapt to dark mode
- ✅ All text is readable
- ✅ No white flashes or contrast issues

---

## Known Limitations (Not Bugs)

These are documented as future enhancements:
- ⚠️ Email functionality is a stub (shows toast, doesn't send email)
- ⚠️ Edit findings saves locally but doesn't persist to backend yet
- ⚠️ PDF generation returns mock URL, doesn't generate actual PDF
- ⚠️ Keyboard shortcuts not implemented (P, A, E, C)
- ⚠️ Print styles not implemented (@media print)

---

## Regression Testing

After verifying the fix, also check:
- ✅ Case List page still works
- ✅ Case Detail page still works
- ✅ Navigation between pages works
- ✅ Authentication still works
- ✅ No new console errors on other pages

---

## Quick API Test (Using curl)

```bash
# Replace with actual case UUID from your database
CASE_ID="550e8400-e29b-41d4-a716-446655440000"
TOKEN="your-jwt-token"

# Test summary endpoint
curl -X GET \
  "http://localhost:8000/api/v1/summary/${CASE_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq .

# Check that findings field exists
curl -X GET \
  "http://localhost:8000/api/v1/summary/${CASE_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.findings'

# Should output array of findings, NOT null
```

---

## Success Criteria

✅ **Fix is verified if:**
1. Summary page loads without JavaScript errors
2. API response includes `findings` field with array of findings
3. Key Findings section renders on the page
4. All sub-components render correctly
5. No TypeScript errors in browser console
6. No Python errors in backend logs

❌ **Fix failed if:**
1. Page crashes on load
2. `findings` field missing from API response
3. "Cannot read property 'findings' of undefined" error
4. Key Findings section doesn't appear
5. Any TypeScript/React errors in console

---

## Reporting Issues

If you find any issues during testing:
1. Take screenshot of browser console errors
2. Note the exact steps to reproduce
3. Capture network request/response (DevTools Network tab)
4. Check backend logs for errors
5. Document expected vs actual behavior
