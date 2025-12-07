# Ingestion Page Launch Issues - Diagnosis Report

## Date: 2025-12-07
## Status: Issues Identified and Documented

---

## Executive Summary

The ingestion page (`/ingestion`) fails to launch properly due to multiple backend API dependencies that fail when the backend is not running or improperly configured. The page lacks proper error handling for backend failures, resulting in a stuck "Loading..." state.

---

## Issues Identified

### 1. **Critical: Hard Dependency on Backend API** (Priority: HIGH)
**Symptom:** Page stuck on "Loading..." indefinitely  
**Root Cause:** The `Ingestion.tsx` component makes API calls on mount that are required for rendering:
- `/api/v1/subjects?limit=100` - Fetches subjects for dropdown
- WebSocket connection attempts to `/api/v1/ws`

**Evidence:**
```
[ERROR] Failed to load resource: the server responded with a status of 500 (Internal Server Error) @ /api/v1/subjects?limit=100
[ERROR] WebSocket connection to 'ws://localhost:5173/api/v1/ws?token=mock-token-123' failed
```

**Impact:** Users cannot access the ingestion page if the backend is down or not configured

---

### 2. **No Error Boundaries for API Failures** (Priority: HIGH)
**Symptom:** Silent failures with no user feedback  
**Root Cause:** React Query calls don't have proper error states displayed to users

**Code Location:** `frontend/src/pages/Ingestion.tsx` lines 69-72
```typescript
const { data: subjectsData } = useQuery({
  queryKey: ['subjects'],
  queryFn: () => subjectsApi.getSubjects({ limit: 100 }),
});
```

**Missing:** Error handling UI, retry logic, or fallback states

---

### 3. **AuthContext Validates Token on Every Page Load** (Priority: MEDIUM)
**Symptom:** Authentication check delays page render
**Root Cause:** `AuthContext.tsx` calls `/auth/me` to validate tokens on mount

**Code Location:** `frontend/src/context/AuthContext.tsx` lines 106-117

**Impact:** Adds latency and additional backend dependency

---

### 4. **Backend Not Production-Ready for Development** (Priority: MEDIUM)
**Issues Found:**
1. No simple `npm run dev` equivalent for backend
2. Database migrations required but not automated
3. No seed data script integration
4. Missing dependency: `aiosqlite` not in requirements.txt
5. ENV validation too strict for development (rejects test keys)

**Evidence:**
```python
ValidationError: 1 validation error for Settings
SECRET_KEY
  Value error, SECRET_KEY must be changed from default value in production
```

---

### 5. **No Graceful Degradation** (Priority: MEDIUM)
**Symptom:** UI doesn't work in offline/development mode  
**Desired Behavior:** Show cached data, allow manual subject ID entry, or show helpful error message

**Current:** Nothing loads, page appears broken

---

## Reproduction Steps

1. Clone repository
2. `cd frontend && npm install && npm run dev`
3. Navigate to `http://localhost:5173/ingestion`
4. Observe: Stuck on loading screen
5. Check console: Multiple 500 errors from API calls

---

## Root Cause Analysis

The ingestion page was designed with the assumption that:
1. Backend is always running
2. Database is initialized
3. Auth tokens are always valid
4. Network is reliable

**Reality:** Development environments often have:
- Backend not running
- Database not seeded
- Invalid/expired tokens
- Network issues

---

## Recommended Fixes

### Immediate (Quick Wins)
1. ✅ Add error states to React Query calls
2. ✅ Show user-friendly error messages when backend is unavailable
3. ✅ Add retry logic with exponential backoff
4. ✅ Allow manual subject ID entry as fallback
5. ✅ Add loading skeletons instead of blank page

### Short-term (1-2 days)
6. ⏳ Create development backend startup script
7. ⏳ Add `aiosqlite` to requirements.txt
8. ⏳ Auto-run migrations on backend start (dev mode)
9. ⏳ Seed test data automatically in dev mode
10. ⏳ Add ENV=development bypass for strict validation

### Long-term (1 week+)
11. 📋 Implement service worker for offline support
12. 📋 Cache subject list in localStorage
13. 📋 Add backend health check before API calls
14. 📋 Implement progressive enhancement pattern

---

## Testing Recommendations

### Unit Tests
- Test Ingestion component in error states
- Mock failed API responses
- Test retry logic

### Integration Tests
- Test with backend down
- Test with database empty
- Test with network delays

### E2E Tests
- Full ingestion workflow happy path
- Error recovery scenarios
- Offline mode behavior

---

## Files Affected

### Frontend
- `frontend/src/pages/Ingestion.tsx` - Main component
- `frontend/src/context/AuthContext.tsx` - Auth validation
- `frontend/src/hooks/useWebSocket.tsx` - WebSocket connection
- `frontend/src/lib/api.ts` - API request handling

### Backend
- `backend/app/core/config.py` - ENV validation
- `backend/requirements.txt` - Missing dependencies
- `backend/seed_data.py` - Not integrated into dev workflow
- `backend/alembic/` - Migrations not automated

---

## Security Considerations

- ⚠️ Tokens stored in localStorage (known issue, documented)
- ⚠️ No rate limiting on ingestion endpoints
- ⚠️ File upload validation needs review
- ✅ CORS properly configured
- ✅ CSP headers in place

---

## Performance Impact

Current implementation issues:
- Multiple API calls on page load
- No request deduplication
- No caching strategy
- WebSocket reconnection storms

---

## Conclusion

The ingestion page has **architectural issues** that prevent it from launching in development environments without a fully configured backend. The fixes are straightforward and should prioritize error handling and graceful degradation.

**Estimated effort:** 4-8 hours for immediate fixes, 2-3 days for complete solution.

---

## Screenshots

### Current State (Backend Down)
![Ingestion Page Loading](https://github.com/user-attachments/assets/699d1fb2-d7ee-4f0b-bbad-3923063caf57)

### Console Errors
```
[ERROR] Failed to load resource: 500 @ /api/v1/subjects?limit=100
[ERROR] WebSocket connection failed
[ERROR] WS Error: Event
```

---

## Next Actions

1. Implement error handling in Ingestion.tsx
2. Add development backend startup documentation
3. Fix missing dependencies
4. Add integration tests
5. Document workarounds for developers

---

**Prepared by:** GitHub Copilot Agent  
**Date:** 2025-12-07  
**Version:** 1.0
