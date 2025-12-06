# 📊 Dashboard Page

> System overview and key metrics

**Route:** `/`  
**File:** `src/pages/Dashboard.tsx`

---

## Overview

The Dashboard is the main landing page after login, providing a comprehensive overview of the investigation system's status, metrics, and recent activity.

---

## Screenshot

```
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

## Refresh Behavior

- Auto-refresh every 30 seconds
- WebSocket for instant updates
- Manual refresh button available

---

## Related Pages

- [Case List](./CASE_LIST.md) - View all cases
- [Adjudication](./ADJUDICATION.md) - Review pending alerts
