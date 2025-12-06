# 📊 Dashboard Page

> System overview and key metrics

**Route:** `/`  
**File:** `src/pages/Dashboard.tsx`

---

## Overview

The Dashboard is the main landing page after login, providing a comprehensive overview of the investigation system's status, metrics, and recent activity.

---

## Screenshot

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 Dashboard                                            [🔔] [👤 Admin ▼]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 📁 Total     │  │ ⚠️ High Risk │  │ ⏳ Pending   │  │ ✅ Resolved  │   │
│  │ Cases        │  │ Subjects     │  │ Reviews      │  │ Today        │   │
│  │              │  │              │  │              │  │              │   │
│  │    1,234     │  │      45      │  │     127      │  │      23      │   │
│  │   +12 today  │  │   +3 today   │  │  -15 today   │  │  +23 today   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────┐  ┌──────────────────────────┐   │
│  │ 📈 Case Activity (30 Days)            │  │ 🔥 Recent Activity       │   │
│  │                                       │  │                          │   │
│  │   ▁▃▅▇█▇▅▃▁▂▄▆█▇▅▃▂▁▃▅▇█▇▅▃▁▂▄▆    │  │ • Case #123 reviewed     │   │
│  │   |-------|-------|-------|-------|  │  │   by John - 2 min ago   │   │
│  │  Week 1  Week 2  Week 3  Week 4      │  │ • New alert detected     │   │
│  │                                       │  │   Risk: 92 - 5 min ago   │   │
│  └───────────────────────────────────────┘  │ • Case #456 closed       │   │
│                                             │   by Jane - 12 min ago   │   │
│  ┌───────────────────────────────────────┐  └──────────────────────────┘   │
│  │ 🥧 Risk Distribution                  │                                 │
│  │                                       │  ┌──────────────────────────┐   │
│  │        ■ Critical (5%)                │  │ 🎯 Quick Actions         │   │
│  │      ■■■ High (15%)                   │  │                          │   │
│  │    ■■■■■ Medium (35%)                 │  │ [📂 New Case]            │   │
│  │  ■■■■■■■ Low (45%)                    │  │ [📤 Upload Documents]    │   │
│  │                                       │  │ [🔍 Search]              │   │
│  └───────────────────────────────────────┘  └──────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Metrics Cards | ✅ | Total cases, high risk, pending, resolved |
| Activity Chart | ✅ | 30-day case volume trend |
| Risk Distribution | ✅ | Pie chart by risk level |
| Recent Activity | ✅ | Real-time activity feed |
| Quick Actions | ✅ | Shortcuts to common tasks |
| Real-time Updates | ✅ | WebSocket for live data |
| **Pipeline Health Monitor** | 🚀 | *Proposed:* Track status of all workflow pages |
| **Data Quality Alerts** | 🚀 | *Proposed:* Upstream issue warnings |
| **Cross-Page KPI Cards** | 🚀 | *Proposed:* Sync metrics from all pages |

---

## Metrics Cards

| Card | Data Source | Click Action |
|------|-------------|--------------|
| **Total Cases** | Aggregate count | Go to Case List |
| **High Risk Subjects** | Risk score > 80 | Filter high-risk |
| **Pending Reviews** | Adjudication queue | Go to Adjudication |
| **Resolved Today** | Closed in 24h | Filter resolved |

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `MetricCard` | Stat display with delta |
| `ActivityChart` | Recharts area chart |
| `RiskPieChart` | Recharts pie chart |
| `ActivityFeed` | Scrollable list |
| `QuickActions` | Action buttons |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/dashboard/metrics` | Fetch metrics |
| GET | `/api/v1/dashboard/activity` | Fetch activity feed |
| WS | `/ws` | Real-time updates |

---

## Data Structure

```typescript
interface DashboardMetrics {
  total_cases: number;
  total_cases_delta: number;
  high_risk_subjects: number;
  high_risk_delta: number;
  pending_reviews: number;
  pending_delta: number;
  resolved_today: number;
}

interface ActivityItem {
  id: string;
  type: 'case_reviewed' | 'alert_detected' | 'case_closed';
  message: string;
  user?: string;
  timestamp: string;
}
```

---

## State Management

```typescript
// Fetch dashboard data
const { data: metrics } = useQuery({
  queryKey: ['dashboard', 'metrics'],
  queryFn: api.getDashboardMetrics,
  refetchInterval: 30000, // Refresh every 30s
});

// Real-time updates via WebSocket
useWebSocket((message) => {
  if (message.type === 'metrics_updated') {
    queryClient.invalidateQueries(['dashboard']);
  }
});
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G + D` | Go to Dashboard (from anywhere) |
| `G + C` | Go to Cases |
| `G + A` | Go to Adjudication |
| `/` | Focus search |

---
---

## 🚀 Advanced Features (Proposed)

### 1. 🔗 Pipeline Health Monitor

Real-time status tracking for the entire data workflow, identifying bottlenecks and completion stages.

**Visual Design:**

```text
┌──────────────────────────────────────────────────────────────┐
│ 📊 SYSTEM PIPELINE STATUS                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ① Ingestion    ✅ 1,245 records   Last: 2 hrs ago         │
│  ② Categorize   ⚠️  89% complete   127 pending              │
│  ③ Reconcile    ✅ 94% match rate  45 conflicts             │
│  ④ Adjudicate   🔴 12 pending      Action required          │
│  ⑤ Visualize    ✅ Ready           Charts updated            │
│                                                              │
│  [View Bottlenecks] [Download Report] [Force Sync]          │
└──────────────────────────────────────────────────────────────┘
```

**Status Indicators:**
- ✅ **Healthy**: All processes complete, data synced
- ⚠️ **Warning**: Minor delays or incomplete processing
- 🔴 **Critical**: Blocking issues requiring immediate action

**Metrics Tracked:**

| Page | Metric | Source Endpoint |
|------|--------|----------------|
| Ingestion | Record count, last upload | `/api/v1/ingestion/stats` |
| Categorization | % complete, pending count | `/api/v1/categorization/stats` |
| Reconciliation | Match rate, conflicts | `/api/v1/reconciliation/kpis` |
| Adjudication | Queue size, avg resolution time | `/api/v1/adjudication/queue` |
| Visualization | Last refresh timestamp | `/api/v1/visualization/status` |

### 2. 🚨 Data Quality Alerts

Proactive warnings when upstream issues block downstream features.

**Alert Types:**

| Alert | Trigger Condition | Recommended Action |
|-------|------------------|-------------------|
| **Categorization Incomplete** | >10% uncategorized transactions | Review and bulk-assign categories |
| **Reconciliation Stalled** | >50 unmatched items for >24h | Manual review in Reconciliation page |
| **Forensic BS Unavailable** | Categorization <85% complete | Complete categorization first |
| **Visualization Outdated** | Last sync >4 hours ago | Trigger manual refresh |
| **Adjudication Backlog** | Queue >100 items | Assign additional reviewers |

**Alert Display:**

```text
┌──────────────────────────────────────────────────────────────┐
│ ⚠️ DATA QUALITY ALERTS (3 Active)                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔴 CRITICAL: Forensic Balance Sheet unavailable            │
│     → 127 transactions (15%) remain uncategorized           │
│     [Go to Categorization] [Review Items]                   │
│                                                              │
│  ⚠️ WARNING: Reconciliation stalled for 26 hours           │
│     → 45 unmatched items require manual review              │
│     [Open Reconciliation] [Assign Reviewer]                 │
│                                                              │
│  ℹ️ INFO: Visualization charts last updated 3.5 hrs ago    │
│     → Sync pending from Reconciliation                      │
│     [Refresh Now] [View Details]                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3. 🎯 Cross-Page KPI Aggregation

Unified metrics pulled from all workflow pages in real-time.

**Aggregated KPI Cards:**

| KPI Card | Formula | Data Sources |
|----------|---------|--------------|
| **Data Completeness** | (Categorized / Total) × 100% | Ingestion + Categorization |
| **Match Efficiency** | (Matched / Total) × 100% | Reconciliation |
| **Review Velocity** | Avg decisions per hour | Adjudication |
| **System Throughput** | Records processed end-to-end | All pages |

**WebSocket Event Synchronization:**

The Dashboard subscribes to real-time events from all pages:

```typescript
// Subscribe to cross-page events
wsClient.on('reconciliation.match_complete', (data) => {
  updatePipelineStatus('reconciliation', data.match_rate);
  invalidateQueries(['dashboard', 'pipeline']);
});

wsClient.on('categorization.batch_updated', (data) => {
  updatePipelineStatus('categorization', data.completion_pct);
  checkDataQualityAlerts();
});

wsClient.on('adjudication.decision_made', (data) => {
  decrementQueueCount();
  updateReviewVelocity(data.time_taken);
});

wsClient.on('ingestion.file_processed', (data) => {
  updatePipelineStatus('ingestion', data.record_count);
  triggerDownstreamRefresh();
});
```

### 4. 📈 Metric Drift Detection

Flags slow, subtle degradation in system performance or risk profile.

- **Scenario:** Average Risk Score increases from 45 to 60 over 3 months.
- **Alert:** "System Drift Warn: Global Risk Score +15 points in Q1."

### 5. ⚡ Spike Detection (Attack Monitor)

Identifies sudden bursts of activity indicative of data dumps or attacks.

- **Trigger:** >300% increase in 'New Alerts' within 1 hour.
- **Action:** Triggers 'System Lockdown' protocol recommendation.

---

## Refresh Behavior

- Auto-refresh every 30 seconds
- WebSocket for instant updates
- Manual refresh button available

---

## Related Pages

- [Case List](./02_CASE_LIST.md) - View all cases
- [Adjudication](./07_ADJUDICATION.md) - Review pending alerts
