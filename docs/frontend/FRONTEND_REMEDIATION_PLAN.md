# Frontend Remediation Action Plan

**Status:** Ready for Implementation
**Complexity:** MEDIUM (6 blocking issues + architectural improvements)
**Timeline:** 2-3 weeks to production ready

---

## Phase 1: Critical Fixes (2-3 hours) 🔴

Must complete before proceeding with other work.

### Issue 1: Fix SemanticSearch.tsx JSX Parse Error

**File:** `src/pages/SemanticSearch.tsx`
**Line:** ~645
**Action:** Find and fix unclosed PageErrorBoundary tag

**Steps:**
1. Open `src/pages/SemanticSearch.tsx`
2. Go to end of file (line 645-650)
3. Search for `</PageErrorBoundary>`
4. Verify it's properly closed
5. Remove any trailing characters (like `%`)
6. Save and test with `npm run lint`

**Verification:**
```bash
cd frontend
npm run lint
# Should show 0 errors (or only 2 remaining 'any' errors)
```

---

### Issue 2: Fix Explicit `any` Types in serviceWorkerRegistration.ts

**File:** `src/lib/serviceWorkerRegistration.ts`
**Lines:** 99, 116, 129, 142
**Action:** Replace `any` with proper types

**Script to help identify:**
```bash
grep -n "any" src/lib/serviceWorkerRegistration.ts | head -10
```

**Fixes needed:**
```typescript
// BEFORE (Line 99)
const onSuccess = (registration: any) => {

// AFTER
interface ServiceWorkerReg {
  installing?: ServiceWorker | null;
  waiting?: ServiceWorker | null;
  active?: ServiceWorker | null;
  scope: string;
}

const onSuccess = (registration: ServiceWorkerReg): void => {

// BEFORE (Line 116)
const onError = (error: any) => {

// AFTER
interface ServiceWorkerRegistrationError extends Error {
  message: string;
  code?: string;
  status?: number;
}

const onError = (error: ServiceWorkerRegistrationError): void => {
```

**Verification:**
```bash
npm run lint
# Check: serviceWorkerRegistration.ts errors should drop from 4 to 0
```

---

### Issue 3: Fix Implicit `any` in SearchAnalytics.tsx

**File:** `src/pages/SearchAnalytics.tsx`
**Line:** 140
**Action:** Add proper type to handleChartDataChange parameter

**Find the code:**
```bash
grep -n "handleChartDataChange" src/pages/SearchAnalytics.tsx
```

**Fix:**
```typescript
// BEFORE
const handleChartDataChange = (data: any) => {
  // ...
};

// AFTER
interface AnalyticsChartData {
  timestamp: string;
  count: number;
  value?: number;
  label?: string;
}

const handleChartDataChange = (data: AnalyticsChartData[]): void => {
  // ...
};
```

**Verification:**
```bash
npm run lint
# Check: SearchAnalytics.tsx error count should drop
```

---

## Phase 2: Enable Build (1 hour)

Once Phase 1 complete:

```bash
cd frontend

# Run lint to confirm all errors fixed
npm run lint

# Run TypeScript check
npx tsc --noEmit

# Build to verify
npm run build

# If successful:
echo "✅ Build succeeds!"
```

**Expected output:**
```
✅ All checks pass
✅ Build succeeds
```

---

## Phase 3: Type Safety Improvements (1 day)

### Task 1: Expand API Types

**File:** `src/types/api.ts`
**Action:** Add missing type definitions for all API endpoints

**Current state:** Basic types exist, incomplete coverage

**Create comprehensive types:**

```typescript
// Add these interfaces to src/types/api.ts

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface DashboardMetrics {
  active_cases: number;
  high_risk_subjects: number;
  pending_reviews: number;
  system_load: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'alert' | 'decision' | 'import' | 'match';
  message: string;
  timestamp: string;
  user: string;
  metadata?: Record<string, unknown>;
}

export interface Subject {
  id: string;
  subject_name: string;
  risk_score: number;
  status: 'active' | 'closed' | 'under_review';
  created_at: string;
  updated_at?: string;
  assigned_to: string;
  description?: string;
}

export interface AnalysisResult {
  id: string;
  subject_id: string;
  status: string;
  risk_score: number;
  created_at: string;
  updated_at?: string;
  adjudication_status: 'pending' | 'flagged' | 'reviewed';
  decision?: 'approved' | 'rejected' | 'under_review';
  reviewer_notes?: string;
  reviewer_id?: string;
  indicators: Indicator[];
}

export interface Indicator {
  id: string;
  type: string;
  confidence: number;
  evidence: Record<string, unknown>;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'matched' | 'unmatched' | 'pending';
  account?: string;
  metadata?: Record<string, unknown>;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'matched' | 'unmatched' | 'pending';
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface MatchRecord {
  id: string;
  expense_id: string;
  transaction_id: string;
  confidence: number;
  created_at: string;
  status: 'confirmed' | 'pending' | 'rejected';
  created_by?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'analyst' | 'reviewer' | 'admin';
  department?: string;
  created_at: string;
  last_login?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
  email_digest: 'daily' | 'weekly' | 'never';
  timezone: string;
}

// WebSocket message types
export type WebSocketMessageType =
  | 'alert_added'
  | 'decision_made'
  | 'batch_complete'
  | 'error'
  | 'ping'
  | 'pong';

export interface WebSocketMessage<T = Record<string, unknown>> {
  type: WebSocketMessageType;
  payload: T;
  timestamp?: string;
  correlation_id?: string;
}

// Specific WebSocket message payloads
export interface AlertAddedPayload {
  alert_id: string;
  subject_id: string;
  risk_score: number;
  triggered_rules: string[];
}

export interface DecisionMadePayload {
  analysis_id: string;
  decision: string;
  reviewer_id: string;
  timestamp: string;
}

export interface BatchCompletePayload {
  batch_id: string;
  total_items: number;
  processed: number;
  failed: number;
}
```

**Verification:**
```bash
npx tsc --noEmit
# Should compile with no errors
```

---

### Task 2: Update API client with types

**File:** `src/lib/api.ts`
**Action:** Use new types in API responses

**Changes:**
```typescript
// BEFORE
export const api = {
  getDashboardMetrics: () =>
    request<{
      active_cases: number;
      high_risk_subjects: number;
      pending_reviews: number;
      system_load: number;
    }>('/dashboard/metrics'),

// AFTER
import type { 
  DashboardMetrics, 
  PaginatedResponse, 
  Subject,
  // ... other types
} from '../types/api';

export const api = {
  getDashboardMetrics: () =>
    request<DashboardMetrics>('/dashboard/metrics'),
    
  getCases: (params?: CaseFilterParams) => {
    const searchParams = new URLSearchParams();
    // ... build params
    return request<PaginatedResponse<Subject>>(
      `/subjects?${searchParams.toString()}`
    );
  },
  
  // ... update all endpoints
};
```

---

## Phase 4: Component Refactoring (2-3 days)

### Task 1: Break Down SemanticSearch.tsx (647 lines)

**Current structure:**
```
SemanticSearch.tsx (monolithic)
  - Search interface
  - Query builder
  - Results display
  - Help content
  - Search history
  - Templates
  - Analytics panel
```

**Target structure:**
```
src/pages/SemanticSearch.tsx (300 lines)
  ├── useSemanticSearch.ts (custom hook)
  ├── components/SearchInterface.tsx (100 lines)
  ├── components/QueryBuilder.tsx (150 lines)
  ├── components/ResultsList.tsx (120 lines)
  ├── components/HelpPanel.tsx (100 lines)
  ├── components/SearchHistory.tsx (80 lines)
  ├── components/SavedTemplates.tsx (80 lines)
  └── components/AnalyticsPanel.tsx (100 lines)
```

**Steps:**

1. Create `src/components/search/useSemanticSearch.ts` (extract search logic)
2. Create `src/components/search/SearchInterface.tsx` (extract UI)
3. Create `src/components/search/QueryBuilder.tsx` (extract query logic)
4. Create `src/components/search/ResultsList.tsx` (extract results)
5. Create `src/components/search/HelpPanel.tsx` (extract help content)
6. Update `src/pages/SemanticSearch.tsx` to use components

**Benefits:**
- Each file <150 lines (testable)
- Reusable components
- Easier to maintain
- Better performance (can lazy load panels)

---

### Task 2: Break Down CaseList.tsx (443 lines)

**Current structure:**
```
CaseList.tsx (monolithic)
  - Filtering
  - Sorting
  - Pagination
  - Case list display
  - Bulk actions
```

**Target structure:**
```
src/pages/CaseList.tsx (200 lines)
├── components/CaseFilters.tsx (100 lines) [EXISTS]
├── components/CaseTable.tsx (120 lines) [NEW]
├── components/CasePagination.tsx (60 lines) [NEW]
└── useCaseList.ts (100 lines) [NEW]
```

---

### Task 3: Break Down CaseDetail.tsx (356 lines)

**Current structure:**
```
CaseDetail.tsx (monolithic)
  - Case information
  - Timeline
  - Related cases
  - Actions
```

**Target structure:**
```
src/pages/CaseDetail.tsx (150 lines)
├── components/CaseInfo.tsx (100 lines)
├── components/CaseTimeline.tsx (100 lines)
├── components/RelatedCases.tsx (80 lines)
└── useCaseDetail.ts (100 lines)
```

---

## Phase 5: Error Handling & Reliability (1-2 days)

### Task 1: Add Request Timeout Handling

**File:** `src/lib/api.ts`
**Action:** Add timeout to fetch requests

```typescript
// Create timeout helper
function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const { timeout, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout || timeoutMs);

  return fetch(url, {
    ...fetchOptions,
    signal: controller.signal,
  })
    .finally(() => clearTimeout(timeoutId));
}

// Use in request function
try {
  response = await fetchWithTimeout(url, {
    ...fetchOptions,
    timeout: 30000,
  });
} catch (error) {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out after 30 seconds',
        0,
        'Timeout',
        null
      );
    }
  }
  // ... other error handling
}
```

---

### Task 2: Add 401 Auto-Logout

**File:** `src/lib/api.ts`
**Action:** Trigger logout when authentication fails

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  
  // Handle unauthorized - trigger logout
  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';  // or use navigate hook
    throw new ApiError('Session expired', 401, 'Unauthorized', errorData);
  }
  
  throw new ApiError(
    errorData.detail || `HTTP ${response.status} error`,
    response.status,
    response.statusText,
    errorData
  );
}
```

---

### Task 3: Add Retry Logic

**File:** `src/lib/api.ts` or new `src/lib/api-retry.ts`
**Action:** Implement exponential backoff for transient failures

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const statusCode = (error as any)?.status;

      // Don't retry on client errors (4xx) except 408/429
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        if (statusCode !== 408 && statusCode !== 429) {
          throw error;
        }
      }

      // Calculate backoff delay with jitter
      if (attempt < maxAttempts - 1) {
        const delay = Math.min(
          initialDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
          30000
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Use in api.ts
export const api = {
  getCases: (params?: Record<string, unknown>) =>
    retryWithBackoff(
      () => request<PaginatedResponse<Subject>>(`/subjects`),
      3  // retry up to 3 times
    ),
  // ... other endpoints
};
```

---

### Task 4: Fix useWebSocket Types

**File:** `src/hooks/useWebSocket.ts`
**Action:** Replace generic `any` with union types

```typescript
// BEFORE
interface WebSocketMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

// AFTER
import type {
  AlertAddedPayload,
  DecisionMadePayload,
  BatchCompletePayload,
  WebSocketMessage as ApiWebSocketMessage,
} from '../types/api';

type WebSocketMessage =
  | { type: 'alert_added'; payload: AlertAddedPayload }
  | { type: 'decision_made'; payload: DecisionMadePayload }
  | { type: 'batch_complete'; payload: BatchCompletePayload }
  | { type: 'error'; payload: { message: string; code?: string } }
  | { type: 'ping' | 'pong'; payload: { timestamp: string } };
```

---

## Phase 6: Testing (2-3 days)

### Priority 1: Critical Path Tests

**Create `src/__tests__/` directory structure:**

```
src/__tests__/
├── auth/
│   └── AuthContext.test.tsx (100 lines)
├── api/
│   └── api.test.ts (200 lines)
├── hooks/
│   ├── useWebSocket.test.ts (150 lines)
│   └── useTheme.test.ts (50 lines)
├── pages/
│   ├── AdjudicationQueue.test.tsx (150 lines)
│   ├── Reconciliation.test.tsx (100 lines)
│   └── CaseDetail.test.tsx (100 lines)
└── components/
    ├── reconciliation/TransactionRow.test.tsx (80 lines)
    └── adjudication/AlertCard.test.tsx (80 lines)
```

**Test 1: AuthContext.test.tsx**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import * as api from '../lib/api';

jest.mock('../lib/api');

describe('AuthContext', () => {
  it('should login successfully', async () => {
    (api.login as jest.Mock).mockResolvedValue({
      access_token: 'test-token'
    });

    const TestComponent = () => {
      const { login, isAuthenticated } = useAuth();
      return (
        <>
          <button onClick={() => login('test@example.com', 'password')}>
            Login
          </button>
          <span>{isAuthenticated ? 'Logged in' : 'Not logged in'}</span>
        </>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Logged in')).toBeInTheDocument();
    });
  });

  it('should logout and clear token', async () => {
    // ... test logout
  });

  it('should validate token on mount', async () => {
    // ... test token validation
  });
});
```

---

### Priority 2: Integration Tests

```typescript
// src/__tests__/api/api.test.ts
describe('API Client', () => {
  it('should retry on timeout', async () => {
    // Test timeout handling
  });

  it('should logout on 401 response', async () => {
    // Test 401 auto-logout
  });

  it('should include auth token in requests', async () => {
    // Test token header
  });

  it('should handle network errors', async () => {
    // Test network error handling
  });
});

// src/__tests__/hooks/useWebSocket.test.ts
describe('useWebSocket', () => {
  it('should connect to WebSocket', async () => {
    // Test connection
  });

  it('should handle messages', async () => {
    // Test message handling
  });

  it('should reconnect on disconnect', async () => {
    // Test reconnection
  });

  it('should stop heartbeat on disconnect', async () => {
    // Test heartbeat cleanup
  });
});
```

---

## Phase 7: Bundle Optimization (1 day)

### Task 1: Analyze bundle

```bash
cd frontend

# Build with analysis
npm run build -- --analyzer

# Review bundle composition
```

### Task 2: Remove unused dependencies

**Actions:**
```bash
# Check axios usage
grep -r "import.*axios" src/

# If no usage found:
npm uninstall axios

# Check react-force-graph-2d usage
grep -r "react-force-graph-2d" src/

# If minimal usage, remove:
npm uninstall react-force-graph-2d
```

### Task 3: Optimize charts

```bash
# Keep only recharts (remove victory if exists)
npm ls | grep -i victory
npm uninstall victory  # if found

# Result: ~150KB savings
```

---

## Phase 8: Accessibility Audit (2-3 days)

### Task 1: Accessibility Scan

```bash
# Install accessibility checker
npm install --save-dev @axe-core/react

# Run scan
npx axe-scan .
```

### Task 2: Fix High Priority Issues

**Checklist:**
- [ ] All interactive elements have ARIA labels
- [ ] Focus management in modals
- [ ] Keyboard navigation (Tab, Escape, Enter)
- [ ] Color contrast ≥ 4.5:1 (text)
- [ ] Form validation messages announced
- [ ] Images have alt text
- [ ] Skip navigation links present

**Example fixes:**

```typescript
// BEFORE - not accessible
<button onClick={handleDelete}>Delete</button>

// AFTER - accessible
<button
  onClick={handleDelete}
  aria-label="Delete this case"
  aria-describedby="delete-help"
>
  Delete
</button>
<span id="delete-help" className="sr-only">
  This action cannot be undone
</span>
```

---

## Timeline & Dependencies

```
Week 1:
  Day 1: Phase 1 (Critical fixes) - 3 hours
  Day 2: Phase 2 (Enable build) + Phase 3 (Type safety) - 6 hours  
  Day 3-4: Phase 4 (Component refactoring) - 2 days
  Day 5: Phase 5 (Error handling) - 1 day

Week 2:
  Day 6-7: Phase 6 (Testing) - 2 days
  Day 8: Phase 7 (Bundle optimization) - 1 day

Week 3:
  Day 9-10: Phase 8 (Accessibility) - 2 days
  Day 11: Integration & validation - 1 day
  Day 12: Staging deployment - 0.5 day
  Day 13+: Production deployment - 0.5 day

Total: ~13 business days
```

---

## Success Criteria

### Build & Compilation ✅
- [ ] `npm run lint` passes (0 errors)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors in IDE

### Type Safety ✅
- [ ] All API responses typed
- [ ] No explicit `any` types
- [ ] <5% lines with `@ts-expect-error`
- [ ] `noImplicitAny: true` in tsconfig

### Testing ✅
- [ ] >50% code coverage
- [ ] All critical paths tested
- [ ] E2E tests pass
- [ ] No test warnings

### Performance ✅
- [ ] Bundle size <1MB
- [ ] Gzip <350KB
- [ ] LCP <2.5s
- [ ] FID <100ms

### Accessibility ✅
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation working
- [ ] Screen reader support
- [ ] Color contrast ≥4.5:1

### Security ✅
- [ ] No hardcoded secrets
- [ ] CORS headers correct
- [ ] CSP headers implemented
- [ ] No XSS vulnerabilities

---

## Rollback Plan

If issues arise during implementation:

1. **Feature branch:** All work on `feature/frontend-fixes` branch
2. **Daily backups:** Commit after each phase completes
3. **Staging first:** Test all changes on staging before production
4. **Gradual rollout:** Use canary deployment (Phase 4)

---

## Next Steps

1. **Approve this plan** with team
2. **Allocate resources** (1-2 developers for 2-3 weeks)
3. **Start Phase 1** immediately (blocking issues)
4. **Setup** feature branch and CI pipeline
5. **Track progress** with milestones
6. **Review** after each phase

**Ready to begin:** ✅ Yes

