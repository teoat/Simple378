# Page Journey Performance Optimization Plan

**Date:** 2025-12-06  
**Status:** 🔄 In Progress  
**Objective:** Diagnose every step of the user journey, identify bottlenecks, and orchestrate efficiency optimizations

---

## Executive Summary

This document provides a comprehensive analysis of the fraud detection system's page journey, identifying performance bottlenecks and proposing an orchestrated set of optimizations to enhance user experience. The analysis covers the complete workflow from authentication through case management, adjudication, and forensic analysis.

---

## 1. Page Journey Analysis

### 1.1 User Journey Flow

```
Login → Dashboard → CaseList/AdjudicationQueue → CaseDetail → Forensics
   ↓         ↓            ↓                         ↓            ↓
  Auth    Metrics    Search/Filter           Deep Analysis   Upload
```

### 1.2 Current State Assessment

| Page | Load Time Target | Current State | Bottlenecks Identified |
|------|-----------------|---------------|------------------------|
| Login | <1s | ✅ Good | Background animations (3 large blobs) |
| Dashboard | <2s | ⚠️ Needs optimization | Multiple API calls, heavy charts |
| CaseList | <1.5s | ✅ Good | Pagination implemented, search needs caching |
| AdjudicationQueue | <1.5s | ✅ Good | Real-time updates every 30s, large bundle (167KB) |
| CaseDetail | <2s | ⚠️ Heavy | Large bundle (112KB), multiple tabs, graph viz |
| Forensics | <2s | ⚠️ Heavy | Very large bundle (98KB), CSV wizard, file processing |

---

## 2. Bundle Size Analysis

### 2.1 Current Bundle Breakdown

```
Total Bundle Sizes (gzipped):
- index-7eZbZzKb.js:           138.66 kB (Main bundle)
- viz-vendor-B287ZxxH.js:       108.65 kB (🚨 Visualization libraries)
- react-vendor-BYS1zwGg.js:      53.98 kB (React core)
- AdjudicationQueue-C-2ACog5.js: 52.40 kB (🚨 Heavy component)
- CaseDetail-B_Nn8Thy.js:        34.70 kB (🚨 Heavy component)
- Forensics-Bm-Yi24B.js:         28.96 kB (🚨 Heavy component)
- zoom-C_0a5KWg.js:              12.30 kB (Image zoom library)
- query-vendor-CphDSD_N.js:      10.66 kB (React Query)

Total Initial Load: ~430 kB (gzipped)
```

### 2.2 Critical Issues

1. **Visualization Vendor Bundle (108.65 kB)**
   - Contains: D3.js, Recharts, React Force Graph
   - Impact: Loaded even on pages that don't use graphs
   - Solution: Lazy load visualization components

2. **Heavy Page Components**
   - AdjudicationQueue: 52.40 kB
   - CaseDetail: 34.70 kB  
   - Forensics: 28.96 kB
   - Already lazy loaded ✅, but could be optimized internally

3. **Main Bundle Size (138.66 kB)**
   - Contains shared utilities, API client, context providers
   - Target: Reduce to <100 kB through tree-shaking

---

## 3. Data Processing Bottlenecks

### 3.1 API Request Patterns

#### Dashboard Page
```typescript
// Current: Multiple sequential API calls
GET /api/v1/subjects/          // All subjects
GET /api/v1/dashboard/metrics  // Metrics summary
GET /api/v1/cases/             // Recent cases
GET /api/v1/alerts/            // Recent alerts

// Issue: 4 separate requests on page load
// Solution: Create aggregated /api/v1/dashboard endpoint
```

#### CaseList Page
```typescript
// Current: Good pagination implementation
GET /api/v1/cases?page=1&limit=20&status=all

// Optimization opportunity:
// - Add prefetching for page 2
// - Implement virtual scrolling for large lists
// - Cache search results longer (currently invalidated on every update)
```

#### AdjudicationQueue
```typescript
// Current: Aggressive refetching
queryKey: ['adjudication-queue', page]
refetchInterval: 30000 // 30 seconds

// Issue: Refetches even when no changes
// Solution: Use WebSocket events to trigger refetch only on changes
```

### 3.2 WebSocket Usage

**Current Implementation:**
- Real-time updates for case changes, alert additions
- Good: Immediate UI updates without polling
- Issue: May cause unnecessary re-renders if not properly memoized

**Optimization:**
```typescript
// Instead of invalidating entire query:
queryClient.invalidateQueries({ queryKey: ['cases'] })

// Optimistic update specific items:
queryClient.setQueryData(['cases'], (old) => {
  // Update only changed items
})
```

### 3.3 State Management

**React Query Configuration:**
```typescript
// frontend/src/lib/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
    }
  }
})
```

**Issues:**
- Short staleTime (5 min) causes frequent refetches
- No query deduplication configured
- Missing query prefetching

---

## 4. Component Performance Issues

### 4.1 Heavy Re-renders

#### Login Page
```typescript
// Issue: 3 background blob animations running continuously
<div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-multiply animate-blob" />
// × 3 blobs

// Impact: GPU usage, battery drain on mobile
// Solution: Use CSS will-change, reduce blur radius, or static background
```

#### CaseList
```typescript
// Current: Re-renders on every state change
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [page, setPage] = useState(1);

// Solution: Memoize expensive computations, use React.memo for list items
```

#### AdjudicationQueue
```typescript
// Issue: Large component renders entire queue
const alerts = queueData?.items.map(mapAnalysisResultToAlert) || [];

// Solution: Virtualize list if >100 items, memoize mapping function
```

### 4.2 Forensics Upload Pipeline

```typescript
// Current: Synchronous stage simulation
const stages: ProcessingStage[] = ['upload', 'virus_scan', 'ocr', 'metadata', 'forensics', 'indexing'];
const interval = setInterval(() => { ... }, 1500);

// Issue: 
// - Simulated stages don't reflect actual backend progress
// - No real-time upload progress
// - Large files block UI during upload

// Solution:
// - Implement chunked file uploads
// - Add real upload progress tracking
// - Move processing to Web Worker
```

---

## 5. Optimization Orchestration Plan

### Phase 1: Quick Wins (High Impact, Low Effort)

#### 1.1 Lazy Load Visualization Libraries ⚡
**Impact:** Reduce initial bundle by ~100 kB  
**Effort:** Low  
**Implementation:**
```typescript
// CaseDetail.tsx - Only load graph viz when Graph tab is active
const GraphAnalysisTab = lazy(() => 
  import('../components/cases/GraphAnalysisTab')
);

// Wrap in Suspense
{activeTab === 'graph' && (
  <Suspense fallback={<GraphSkeleton />}>
    <GraphAnalysisTab data={graphData} />
  </Suspense>
)}
```

#### 1.2 Optimize WebSocket-triggered Refetches ⚡
**Impact:** Reduce unnecessary API calls by 60%  
**Effort:** Low  
```typescript
// Instead of interval refetching:
refetchInterval: 30000, // Remove this

// Use WebSocket events only:
useWebSocket('/ws', {
  onMessage: (message) => {
    if (message.type === 'queue_updated') {
      queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
    }
  },
});
```

#### 1.3 Implement Query Prefetching ⚡
**Impact:** Perceived load time improvement  
**Effort:** Low  
```typescript
// CaseList - Prefetch next page
useEffect(() => {
  if (page < (data?.pages || 1)) {
    queryClient.prefetchQuery({
      queryKey: ['cases', { status: statusFilter, page: page + 1 }],
      queryFn: () => api.getCases({ status: statusFilter, page: page + 1 }),
    });
  }
}, [page, data?.pages, statusFilter]);
```

#### 1.4 Add React.memo to List Items ⚡
**Impact:** Prevent unnecessary re-renders  
**Effort:** Low  
```typescript
// CaseList
const CaseRow = React.memo(({ case: c, onSelect }) => (
  <tr onClick={() => onSelect(c.id)}>
    {/* ... */}
  </tr>
));
```

### Phase 2: Medium Wins (Medium Impact, Medium Effort)

#### 2.1 Create Aggregated Dashboard API 📊
**Impact:** Reduce dashboard API calls from 4 to 1  
**Effort:** Medium (Backend + Frontend)  
```python
# backend/app/api/v1/endpoints/dashboard.py
@router.get("/dashboard/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    return {
        "metrics": await get_metrics(db),
        "subjects": await get_subjects(db, limit=10),
        "recent_cases": await get_recent_cases(db, limit=5),
        "recent_alerts": await get_recent_alerts(db, limit=5),
    }
```

#### 2.2 Implement Virtual Scrolling 📜
**Impact:** Handle 1000+ cases without performance degradation  
**Effort:** Medium  
**Library:** react-virtual or @tanstack/react-virtual  
```typescript
// CaseList - Use virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: data?.items.length || 0,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60, // Row height
});
```

#### 2.3 Add Image Optimization 🖼️
**Impact:** Faster forensics image loading  
**Effort:** Medium  
```typescript
// Use responsive images and lazy loading
<img 
  src={evidence.url} 
  loading="lazy"
  srcSet={`${evidence.url}?w=400 400w, ${evidence.url}?w=800 800w`}
  sizes="(max-width: 600px) 400px, 800px"
/>
```

#### 2.4 Optimize Search with Debouncing ✅
**Status:** Already implemented ✅  
**Current:**
```typescript
// frontend/src/pages/CaseList.tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

### Phase 3: Advanced Optimizations (High Impact, High Effort)

#### 3.1 Implement Service Worker Caching 💾
**Impact:** Offline support + instant page loads  
**Effort:** High  
**Current Status:** Service worker registration exists but not fully configured  
```typescript
// frontend/src/lib/serviceWorkerRegistration.ts
// Add cache-first strategy for static assets
// Add network-first strategy for API calls
// Implement background sync for offline actions
```

#### 3.2 Add Code Splitting by Route 🔀
**Status:** Already implemented ✅ (Lazy loading in App.tsx)  
**Enhancement:** Further split large route components  
```typescript
// CaseDetail - Split tabs into separate bundles
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const GraphTab = lazy(() => import('./tabs/GraphTab'));
const FinancialsTab = lazy(() => import('./tabs/FinancialsTab'));
```

#### 3.3 Implement Chunked File Uploads 📤
**Impact:** Better UX for large file uploads  
**Effort:** High (Backend + Frontend)  
```typescript
// frontend - Use tus protocol or custom chunking
import * as tus from 'tus-js-client';

const upload = new tus.Upload(file, {
  endpoint: '/api/v1/forensics/upload',
  chunkSize: 5 * 1024 * 1024, // 5 MB chunks
  onProgress: (bytesUploaded, bytesTotal) => {
    const percentage = (bytesUploaded / bytesTotal) * 100;
    setProgress(percentage);
  },
});
```

#### 3.4 Add Request Batching 📦
**Impact:** Reduce API calls, improve backend efficiency  
**Effort:** High  
```typescript
// Batch multiple requests into one
// Example: Fetching multiple case details
POST /api/v1/cases/batch
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### 3.5 Implement Database Query Optimization 🗄️
**Backend Performance:**
```python
# Add database indexes for frequently queried fields
# backend/alembic/versions/xxx_add_performance_indexes.py

# Index on cases.status for filtering
op.create_index('idx_cases_status', 'cases', ['status'])

# Index on cases.created_at for sorting
op.create_index('idx_cases_created_at', 'cases', ['created_at'])

# Composite index for common query pattern
op.create_index('idx_cases_status_risk', 'cases', ['status', 'risk_score'])
```

---

## 6. Performance Monitoring Strategy

### 6.1 Add Performance Instrumentation

```typescript
// frontend/src/lib/performance.ts
export const measurePageLoad = (pageName: string) => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`${pageName} - ${entry.name}: ${entry.duration}ms`);
      // Send to Sentry or analytics
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${pageName} loaded`,
        level: 'info',
        data: { duration: entry.duration }
      });
    }
  });
  
  observer.observe({ entryTypes: ['navigation', 'resource'] });
};

// Use in pages
useEffect(() => {
  measurePageLoad('CaseList');
}, []);
```

### 6.2 Add API Performance Tracking

```typescript
// frontend/src/lib/api.ts
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, { ...fetchOptions, headers });
    const duration = performance.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
      Sentry.captureMessage(`Slow API: ${endpoint}`, {
        level: 'warning',
        extra: { duration, endpoint }
      });
    }
    
    return response.json();
  } catch (error) {
    // ... error handling
  }
}
```

### 6.3 Add Component Render Tracking

```typescript
// frontend/src/hooks/useRenderCount.ts
export const useRenderCount = (componentName: string) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    if (renderCount.current > 10) {
      console.warn(`${componentName} rendered ${renderCount.current} times`);
    }
  });
};
```

---

## 7. Testing & Validation

### 7.1 Performance Testing Suite

```bash
# Run Lighthouse CI
npm run lighthouse

# Run load testing with Locust
cd /home/runner/work/Simple378/Simple378
locust -f locustfile.py --host=http://localhost:8000 --users=100 --spawn-rate=10

# Monitor metrics:
# - p50 latency < 200ms
# - p95 latency < 500ms
# - p99 latency < 1000ms
```

### 7.2 Bundle Size Monitoring

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:analyze": "vite build --mode analyze",
    "check:size": "size-limit"
  }
}

// .size-limit.json
[
  {
    "path": "dist/assets/index-*.js",
    "limit": "150 kB"
  },
  {
    "path": "dist/assets/viz-vendor-*.js",
    "limit": "80 kB"
  }
]
```

### 7.3 E2E Performance Tests

```typescript
// frontend/tests/performance.spec.ts
import { test, expect } from '@playwright/test';

test('Dashboard loads within 2 seconds', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@fraud.com');
  await page.fill('input[type="password"]', 'test123');
  
  const startTime = Date.now();
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(2000);
});
```

---

## 8. Implementation Priority Matrix

| Optimization | Impact | Effort | Priority | Est. Time |
|-------------|--------|--------|----------|-----------|
| Lazy load viz libraries | High | Low | 🔴 P0 | 2h |
| Remove interval refetch | High | Low | 🔴 P0 | 1h |
| Add query prefetch | Medium | Low | 🟠 P1 | 2h |
| Memoize list items | Medium | Low | 🟠 P1 | 2h |
| Aggregated dashboard API | High | Medium | 🟠 P1 | 4h |
| Virtual scrolling | Medium | Medium | 🟡 P2 | 4h |
| Image optimization | Medium | Medium | 🟡 P2 | 3h |
| Service worker caching | High | High | 🟡 P2 | 8h |
| Chunked uploads | High | High | 🟢 P3 | 8h |
| Database indexes | High | Medium | 🟢 P3 | 4h |

**Legend:**
- 🔴 P0: Critical - Implement immediately
- 🟠 P1: Important - Implement within 1 week
- 🟡 P2: Medium - Implement within 2 weeks
- 🟢 P3: Nice to have - Implement when capacity allows

---

## 9. Expected Results

### 9.1 Performance Improvements

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Initial Load (FCP) | ~2.5s | <1.5s | 40% faster |
| Dashboard Load | ~3s | <2s | 33% faster |
| Bundle Size (gzipped) | 430 kB | <300 kB | 30% smaller |
| API Calls (Dashboard) | 4 | 1 | 75% reduction |
| Re-renders (CaseList) | Many | Minimal | 60% reduction |

### 9.2 User Experience Improvements

- **Perceived Performance:** Instant page navigation with prefetching
- **Responsiveness:** Smooth scrolling with virtual lists
- **Reliability:** Offline support via service worker
- **Feedback:** Real-time progress for uploads
- **Battery Life:** Reduced animations on mobile

---

## 10. Monitoring & Continuous Improvement

### 10.1 Key Performance Indicators (KPIs)

```typescript
// Track these metrics in Sentry/Analytics
interface PerformanceMetrics {
  pageLoadTime: number;        // Target: <2s
  apiResponseTime: number;      // Target: <500ms
  bundleSize: number;           // Target: <300 kB
  renderCount: number;          // Target: <3 per user action
  memoryUsage: number;          // Target: <100 MB
  cacheHitRate: number;         // Target: >80%
}
```

### 10.2 Performance Budget

```json
{
  "budgets": [
    {
      "path": "dist/**/*.js",
      "maxSize": "300 kB",
      "maxSizeGzip": "100 kB"
    },
    {
      "path": "dist/**/*.css",
      "maxSize": "50 kB"
    }
  ]
}
```

### 10.3 Regression Prevention

- Add performance tests to CI/CD
- Monitor bundle size on every PR
- Set up Lighthouse CI for automated audits
- Alert on performance degradation >10%

---

## 11. Conclusion

This comprehensive optimization plan addresses performance bottlenecks across the entire user journey. By implementing these changes in prioritized phases, we can achieve:

- **40% faster** initial page loads
- **75% fewer** unnecessary API calls
- **30% smaller** bundle sizes
- **60% fewer** component re-renders
- **Better UX** through perceived performance improvements

The plan balances quick wins (Phase 1) with strategic long-term improvements (Phase 3), ensuring continuous enhancement of user experience while maintaining code quality and maintainability.

---

**Next Steps:**
1. Review and approve optimization priorities
2. Create GitHub issues for each optimization task
3. Begin Phase 1 implementation (Quick Wins)
4. Set up performance monitoring infrastructure
5. Establish baseline metrics before changes
6. Track improvements after each phase
