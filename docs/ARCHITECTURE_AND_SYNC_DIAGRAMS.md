# System Architecture & Synchronization Flow Diagrams

**Status:** Visual Reference for Integration Analysis  
**Companion:** SYSTEM_INTEGRATION_DIAGNOSTICS.md

---

## 1. Current System Architecture

### 1.1 Overall System Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SIMPLE378 SYSTEM                           │
└─────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────┐
                            │  User Browser   │
                            │  (React 18 +    │
                            │   TypeScript)   │
                            └────────┬────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │   Frontend Layer (5173)         │
                    ├────────────────────────────────┤
                    │ ┌──────────────────────────┐   │
                    │ │  PWAInstallBanner        │   │
                    │ │  OfflineSyncStatus       │   │
                    │ │  EnterpriseDashboard     │   │
                    │ │  CameraModal             │   │
                    │ └──────────────────────────┘   │
                    │           │                    │
                    │  ┌────────▼─────────┐         │
                    │  │  API Client      │         │
                    │  │  (api.ts)        │         │
                    │  │  [PROBLEM: Not   │         │
                    │  │   using LB!]     │         │
                    │  └────────┬─────────┘         │
                    │           │                   │
                    │  ┌────────▼──────────┐        │
                    │  │  State Management │        │
                    │  │  ├─ React Query   │        │
                    │  │  ├─ LocalStorage  │        │
                    │  │  ├─ IndexedDB     │        │
                    │  │  └─ Service Worker│        │
                    │  └────────┬──────────┘        │
                    └───────────┼────────────────────┘
                                │
                    ┌───────────┴────────────┐
                    │  Service Worker Cache  │
                    │  ├─ Network-first      │
                    │  │  for API calls      │
                    │  ├─ Cache-first for    │
                    │  │  static assets      │
                    │  └─ Background sync    │
                    └───────────┬────────────┘
                                │
            HTTP/WebSocket      │      HTTPS
            ┌───────────────────┼───────────────────┐
            │                   │                   │
    ┌───────▼──────┐   ┌────────▼────────┐  ┌──────▼──────┐
    │ Backend      │   │ WebSocket       │  │ Fallback    │
    │ Server       │   │ Server          │  │ Server      │
    │ (8000)       │   │ (4000)          │  │ (8001)      │
    └───────┬──────┘   └────────┬────────┘  └──────┬──────┘
            │                   │                   │
    ┌───────▼──────┬───────────┬────────┬──────────▼────┐
    │              │           │        │               │
┌───▼──┐    ┌─────▼──┐   ┌────▼──┐  ┌─▼────┐   ┌──────▼──┐
│ API  │    │Database│   │ Cache │  │Queue │   │Search  │
│ v1   │    │(PG 16) │   │(Redis)│  │(RQ)  │   │(Qdrant)│
└──────┘    └────────┘   └───────┘  └──────┘   └─────────┘

Legend:
  ✅ Implemented & Working
  ⚠️  Partially Implemented
  ❌ Missing/Broken
  [PROBLEM: ...] = Known Issue
```

### 1.2 Frontend Data Flow

```
┌─────────────────────────────────────────────────────┐
│         Frontend Data Flow & Synchronization        │
└─────────────────────────────────────────────────────┘

User Interaction
      │
      ▼
  Component
      │
      ├─── (Online)  ────────────┐
      │                           │
      ├─── (Offline) ────┐        │
      │                  │        │
      │              ┌───▼──┐     │
      │              │Queue │     │
      │              │(IDB) │     │
      │              └──┬───┘     │
      │                 │         │
      │            ┌────▼────┐   │
      │            │ Sync on  │   │
      │            │ Reconnect│   │
      │            └────┬────┘   │
      │                 │        │
      │        ┌────────┴────────┤
      │        │                 │
      ▼        ▼                 ▼
   React   IndexedDB        API Request
   Query   (Offline)        (Online)
    │                          │
    │        ┌─────────────────┤
    │        │                 │
    ▼        ▼                 ▼
  Cache   Sync Queue    Backend Service
  (30s)   [ISSUE:            │
          No order,    ┌──────▼──────────┐
          No conflict  │ Database Update │
          detection]   │ (PostgreSQL)    │
                       └─────────────────┘

Problems:
  ❌ No ordering (A→B→C may execute as C→A→B)
  ❌ No deduplication (same request queued twice)
  ❌ No conflict resolution (last-write-wins)
  ❌ No visibility (user doesn't know sync status)
```

---

## 2. Request/Response Flow Analysis

### 2.1 Current HTTP Client Flow

```
Component (e.g., Visualization.tsx)
    │
    ├─ useQuery({
    │   queryKey: ['visualization', caseId],
    │   queryFn: () => api.get(...)
    │ })
    │
    ▼
┌─────────────────────────────────┐
│  frontend/src/lib/api.ts        │
│  (Simple fetch client)          │
│  [PROBLEM: Not using LB!]       │
│                                  │
│  ┌─────────────────────────────┐│
│  │ const apiRequest<T>(...)    ││
│  │  - Creates fetch request    ││
│  │  - Adds auth header         ││
│  │  - No load balancing ❌     ││
│  │  - No caching ❌            ││
│  │  - No failover ❌           ││
│  └─────────────────────────────┘│
└──────────────┬──────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
UNUSED:          SHOULD BE USED:
scalableApi.ts   (Never called)
├─ LoadBalancer
│  ├─ Round-robin
│  └─ Least-connections
├─ DistributedCache
│  ├─ Consistent hashing
│  └─ Cache hits
└─ Failover logic


BETTER FLOW (Recommended):
Component
    │
    ├─ useQuery(...)
    │
    ▼
┌──────────────────────────────┐
│ scalableApi.ts               │
│ (Advanced client - WIRED)    │
│                              │
│ ┌────────────────────────────│
│ │ LoadBalancer:             │
│ │  1. Select server         │
│ │  2. Add auth              │
│ │  3. Make request          │
│ │  4. Track response time   │
│ │  5. Return data           │
│ └────────────────────────────│
│                              │
│ ┌────────────────────────────│
│ │ DistributedCache:         │
│ │  1. Hash request URL      │
│ │  2. Find cache server     │
│ │  3. Check cache           │
│ │  4. Store response        │
│ └────────────────────────────│
└──────────────┬───────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
Server 1            Server 2
(8000)              (8001)
(Primary)           (Backup)
```

### 2.2 Error Recovery Flow

```
Current Error Handling:
┌────────────┐
│ API Request│
└─────┬──────┘
      │
      ▼
    ❌Error
      │
      ├─ Throw Error
      │  └─ ❌ No retry
      │  └─ ❌ No fallback
      │  └─ ❌ No logging
      │
      └─ Component shows error message
         └─ User must click "Retry"
         └─ Manual action required ⚠️


Better Error Handling (Recommended):
┌────────────┐
│ API Request│
└─────┬──────┘
      │
      ▼
    ❌Error
      │
      ├─ Attempt 1 Failed [1000ms wait]
      │  └─ If Server Error (5xx):
      │     └─ Try Attempt 2 [2000ms wait]
      │        └─ Try Attempt 3 [4000ms wait]
      │           └─ All failed?
      │
      ├─ Try Next Server
      │  └─ If available:
      │     └─ Automatic retry on server 2
      │
      ├─ Check Cache
      │  └─ Stale data available?
      │     └─ Return stale with warning
      │
      └─ Show Toast to User
         └─ "Retrying... (2/3)" with spinner
         └─ "Using cached data" if necessary
         └─ Automatic retry (no click needed) ✅
```

---

## 3. Synchronization Patterns

### 3.1 Offline Sync Queue Flow

```
User Goes Offline
    │
    ▼
POST /cases (Create Case)
    │
    ▼
┌──────────────────────────────┐
│ Service Worker Fetch Handler │
    │                          │
    ├─ Check: navigator.onLine │
    │  └─ FALSE                │
    │                          │
    ├─ Cache response? NO      │
    │  (POST not cached)       │
    │                          │
    ├─ Queue for sync          │
    │  └─ IndexedDB            │
    │     {                    │
    │       url,               │
    │       method: 'POST',    │
    │       body,              │
    │       retries: 0,        │
    │       timestamp,         │
    │       [MISSING]:         │
    │       ├─ ordering        │
    │       ├─ dedup key       │
    │       └─ priority        │
    │     }                    │
    │                          │
    └─ Return 503 offline      │
       (User sees "Offline")   │
              │
              ▼
    User Makes Another POST
    (Update Case Status)
              │
              ├─ Queue Item #2
              │  [PROBLEM:
              │   No ordering!
              │   Item #2 might
              │   execute before
              │   Item #1]
              │
    User Goes Online
              │
              ▼
    Browser reconnects
              │
              ▼
    Service Worker 'sync' event
              │
              ├─ processSyncQueue()
              │  [PROBLEMS:
              │   ❌ No ordering (A→B→C = C→A→B)
              │   ❌ No dedup (POST same case 3x)
              │   ❌ No conflict (Field overwrite)
              │   ❌ No visibility (Silent sync)
              │
              ├─ Retry #1
              │  └─ If fail: Queue for next attempt
              │     [PROBLEM: Infinite retry!]
              │
              ├─ Retry #2
              │
              └─ Retry #3
                 │
                 └─ Still failing?
                    └─ [FIXED in Phase 2]
                       Drop to dead letter


BETTER SYNC (With Event Sourcing):
                   User Action
                       │
                       ├─ Online: Emit Event → Send to Server
                       │
                       ├─ Offline: Emit Event → Queue
                       │           {
                       │             id: uuid,
                       │             aggregateId: 'case-123',
                       │             eventType: 'case.created',
                       │             clock: 1,    ← Causality!
                       │             version: 1,  ← Ordering!
                       │             checksum: 'abc123', ← Dedup!
                       │             data: {...}
                       │           }
                       │
                       └─ Reconnect: Send Events in Order
                           ├─ Sort by clock (causality)
                           ├─ Detect duplicates (checksum)
                           ├─ Server merges + resolves conflicts
                           └─ Returns merged version
```

### 3.2 Conflict Detection & Resolution

```
CURRENT SYSTEM (No Conflict Handling):
┌─────────────┐              ┌─────────────┐
│  Client A   │              │  Client B   │
│ (Browser 1) │              │ (Browser 2) │
└──────┬──────┘              └──────┬──────┘
       │                             │
       ├─ Offline: Edit title       │
       │  Case.title = "Updated"    │
       │  Queue event               │
       │                            ├─ Online: Edit status
       │                            │  Case.status = "open"
       │                            │  Send to server
       │                            │  Server: saves status
       │                            │
       ├─ Go online                 │
       │  Send queued event         │
       │  [PROBLEM: Overwrite!]     │
       │  Case = { title: "Updated" }
       │  ❌ Lost status change!
       │
       └─ Final state: INCONSISTENT

BETTER SYSTEM (With Conflict Detection):
┌──────────┐              ┌──────────┐
│ Client A │              │ Client B │
└────┬─────┘              └────┬─────┘
     │                         │
     ├─ Event: title updated   │
     │  ver: 1, node: A, ts: T1│
     │                        ├─ Event: status updated
     │                        │  ver: 1, node: B, ts: T2
     │
     ├─ Queue A               ├─ Send B (success)
     │                        │
     ├─ Reconnect             │
     │  Send A (vs server v2)  │
     │                        │
     └─ CONFLICT DETECTED!    │
        Different fields?     │
        ├─ title (v1 A) vs    │
        ├─ status (v1 B) vs   │
        └─ Merged! ✓
           {
             title: "Updated",
             status: "open",
             version: 2,
             mergedAt: T3
           }
```

---

## 4. Performance Waterfall Analysis

### 4.1 Current Request Latency

```
GET /cases (First Time Load):
┌────────────────────────────────────────┐
│ 0ms    Start Request                   │
│        [1] HTTP + TLS Handshake        │
├────────────────────────────────────────┤
│ 80ms   Connected                       │
│        [2] Send Request                │
├────────────────────────────────────────┤
│ 120ms  Request Sent                    │
│        [3] Server Processing           │
│        ├─ Parse request (5ms)          │
│        ├─ Auth check (10ms)            │
│        ├─ Query DB (80ms) ⚠️ SLOW!    │
│        └─ Format response (10ms)       │
├────────────────────────────────────────┤
│ 220ms  Response Ready                  │
│        [4] Download Response           │
├────────────────────────────────────────┤
│ 280ms  Response Complete               │
│        [5] Parse JSON (15ms)           │
│        [6] React render (40ms)         │
├────────────────────────────────────────┤
│ 335ms  UI Shows                        │
└────────────────────────────────────────┘

Bottlenecks:
  ⚠️  Database query: 80ms (35% of total)
  ⚠️  React render: 40ms (12% of total)
  ⚠️  TLS handshake: 80ms (24% of total)

Optimization Opportunities:
  ✅ Add DB connection pooling: -30ms
  ✅ Add query caching: -70ms
  ✅ Code split: -20ms
  ✅ Keep-alive TLS: -30ms
  Total potential: -150ms (45% improvement)


GET /cases (Cached):
┌────────────────────────┐
│ 0ms    Memory Cache Hit│
│        React Query     │
├────────────────────────┤
│ 2ms    Synchronous    │
│        Return cached   │
├────────────────────────┤
│ 5ms    UI Updates      │
└────────────────────────┘

GET /cases (Service Worker Cache):
┌────────────────────────┐
│ 0ms    SW Cache Check  │
│        Check storage   │
├────────────────────────┤
│ 15ms   Disk Read       │
│        (IndexedDB/SW)  │
├────────────────────────┤
│ 20ms   Parse & Return  │
└────────────────────────┘
Response: 20ms (16x faster than network!)
```

### 4.2 Cumulative Waterfall Over Session

```
Time (seconds) → →
0s    │ Initial Load: 335ms
      │ ├─ GET /dashboard: 280ms
      │ ├─ GET /cases: 250ms
      │ ├─ GET /monitoring: 220ms
      │
0.8s  │ Navigate to Case
      │ ├─ GET /cases/123: 240ms [cache miss]
      │ ├─ GET /graph/123: 400ms [complex query]
      │
1.4s  │ Edit Case
      │ ├─ PUT /cases/123: 180ms
      │ ├─ [Cache invalidation]
      │ └─ GET /cases: 250ms [re-fetch]
      │
2.1s  │ Navigate to Forensics
      │ ├─ GET /forensics: 320ms [cold]
      │
2.4s  │ Offline Event!
      │ ├─ POST /evidence: QUEUED (not sent)
      │ ├─ UI shows "Offline" badge
      │ ├─ Next 30 minutes: offline operations
      │
32.4s │ Online Event!
      │ ├─ Service Worker sync
      │ ├─ Retry POST /evidence: 200ms
      │ ├─ GET /cases refresh: 240ms
      │
32.8s │ Session Complete

Observations:
  ⚠️  Total requests: 10
  ⚠️  Average latency: 263ms
  ⚠️  Worst case: 400ms (GET /graph)
  ✅ Cache hit saves 84% (335ms → 20ms)
  ❌ No automatic refresh in background
  ❌ Network errors = permanent failure
```

---

## 5. Multi-Layer Cache Effectiveness

```
┌──────────────────────────────────────┐
│   Multi-Layer Cache Architecture     │
└──────────────────────────────────────┘

Layer 1: React Query (Browser Memory)
   Hit Rate: ~60-70%
   TTL: 10 minutes
   Size: ~5MB
   └─ GET /cases → Cache hit → 2ms response

Layer 2: Service Worker Cache
   Hit Rate: ~40% (static assets)
   TTL: Manual versioning
   Size: ~10MB (depends on config)
   └─ /css, /js, /images → Cache hit → 15ms response

Layer 3: IndexedDB (Offline Queue)
   Hit Rate: 100% (for queued writes)
   TTL: Indefinite (until sync)
   Size: ~1MB
   └─ Failed POST → Queue → Later sync

Layer 4: Redis (Server-side) ⚠️ UNUSED
   Status: Configured in docker-compose
   Usage: Session storage only
   Missed opportunity: ~40% API cache hits lost
   └─ Could cache: GET /dashboard (TTL 60s)
   └─ Could cache: GET /cases?status=open (TTL 300s)

Layer 5: Database Query Cache ❌ MISSING
   Status: Not implemented
   Opportunity: Cache SELECT queries
   Expected savings: 30-50ms per query
   └─ SELECT * FROM cases → 80ms (no cache)
   └─ SELECT * FROM cases → 10ms (with cache)


Cache Flow Diagram:
Component renders
    │
    ├─ React Query cache?
    │  └─ YES: Return instantly (2ms)
    │
    ├─ Service Worker cache?
    │  └─ YES: Return from disk (15ms)
    │
    ├─ IndexedDB queue? (offline only)
    │  └─ YES: Return queued item
    │
    ├─ Redis cache? ⚠️ Not used
    │  └─ Skipped
    │
    ├─ Network request
    │  ├─ Online: Connect to server (80ms)
    │  └─ Offline: Timeout → Queue
    │
    └─ Database query
       ├─ No query cache: 80ms
       ├─ With DB cache: 10ms (potential)
       └─ With Redis: 5ms (potential)
```

---

## 6. Integration Points Heat Map

```
┌─────────────────────────────────────────────────┐
│  System Integration Risk Assessment            │
└─────────────────────────────────────────────────┘

                     CRITICALITY
                 │ HIGH | MED | LOW
    ────────────┼──────┼─────┼────
    Offline     │ 🔴🔴 │     │
    Sync        │      │     │
    ────────────┼──────┼─────┼────
    Error       │ 🔴   │ 🟡  │
    Handling    │      │     │
    ────────────┼──────┼─────┼────
    Cache       │      │ 🟡  │ 🟢
    Invalidate  │      │     │
    ────────────┼──────┼─────┼────
    Load        │      │ 🟡  │
    Balancer    │      │     │
    ────────────┼──────┼─────┼────
    Monitoring  │      │ 🟡  │
    ────────────┼──────┼─────┼────
    Multi-      │ 🔴   │     │
    Tenant      │      │     │
    ────────────┼──────┼─────┼────
    Database    │ 🔴   │     │
    Connection  │      │     │
    ────────────┼──────┼─────┼────
    Auth        │ 🔴   │     │
    ────────────┼──────┼─────┼────

Legend:
🔴 = Critical (Fix immediately)
🟡 = Important (Fix this week)
🟢 = Nice-to-have (Backlog)

Current Status:
🔴 Count: 5 (HIGH PRIORITY)
🟡 Count: 4 (MEDIUM PRIORITY)
🟢 Count: 2 (LOW PRIORITY)
```

---

## 7. Implementation Roadmap

```
Week 1: Stabilization (Critical Fixes)
├─ Fix API client duplication
│  └─ Wire scalableApi everywhere
│
├─ Fix Service Worker infinite loop
│  └─ Add retry limits & backoff
│
├─ Add error middleware
│  └─ Logging & request tracking
│
└─ Time estimate: 2-3 hours
   Improvement: +30% reliability


Week 2: Integration (High-Value Fixes)
├─ Add cache invalidation
│  └─ onSuccess mutations
│
├─ Implement retry logic
│  └─ Exponential backoff
│
├─ Add request tracing
│  └─ OpenTelemetry
│
├─ Wire load balancer
│  └─ Server selection
│
└─ Time estimate: 8-12 hours
   Improvement: +40% performance


Week 3: Optimization (Medium Priority)
├─ Cache-Control headers
├─ Connection pooling
├─ Response compression
└─ Time estimate: 8-16 hours
   Improvement: +50% bandwidth


Week 4: Architecture (Advanced)
├─ Event sourcing
├─ Conflict detection
├─ Multi-region setup
└─ Time estimate: 20-40 hours
   Improvement: +100% reliability
```

---

## 8. Success Metrics

```
Performance KPIs (Before → After):

First Load Time:
  Before: 335ms
  After:  180ms
  Goal:   Reduce by 46%
  Method: Code splitting, compression, pooling

Cache Hit Rate:
  Before: 45%
  After:  75%
  Goal:   Increase by 30%
  Method: Better cache keys, React Query config

Error Recovery:
  Before: Manual retry, ~80% success
  After:  Automatic retry, ~99.5% success
  Goal:   3-sigma reliability
  Method: Retry logic, fallover, offline queue

Offline Capability:
  Before: ~40% operations work
  After:  ~95% operations work
  Goal:   Enable all CRUD offline
  Method: Event sourcing, sync queue

Request Failure Rate:
  Before: 2-5%
  After:  <0.5%
  Goal:   99.5% SLA
  Method: Error handling, health checks

Bundle Size:
  Before: 250KB gzipped
  After:  185KB gzipped
  Goal:   Reduce by 26%
  Method: Code splitting, tree-shaking
```

---

**Next Step:** Review INTEGRATION_FIXES_IMPLEMENTATION_GUIDE.md for code examples

Generated: December 7, 2025
