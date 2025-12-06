# Dashboard Page

**Route:** `/dashboard`  
**Component:** `src/pages/Dashboard.tsx`  
**Status:** ✅ Implemented

---

## Overview

The Dashboard is the primary landing page for authenticated users, providing a high-level overview of fraud detection system status, key metrics, and recent activity. It serves as the command center for analysts to quickly assess the current state of investigations.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header: "Dashboard"                                    [+ New Case]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Active Cases│ │ High Risk   │ │ Pending     │ │ System      │       │
│  │     247     │ │    12       │ │ Reviews: 34 │ │ Load: 45%   │       │
│  │   ↑ 12%     │ │   ↓ 3%      │ │   ↑ 8%      │ │ Normal      │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                                         │
│  ┌────────────────────────────────┐ ┌────────────────────────────────┐  │
│  │     Risk Distribution          │ │      Weekly Activity           │  │
│  │                                │ │                                │  │
│  │    ████ Critical: 5%          │ │          ____                  │  │
│  │    ████████ High: 15%         │ │     ____/    \____             │  │
│  │    ████████████ Medium: 40%   │ │    /              \            │  │
│  │    ████████████████ Low: 40%  │ │   Mon Tue Wed Thu Fri          │  │
│  │                                │ │                                │  │
│  └────────────────────────────────┘ └────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Recent Activity                                                  │   │
│  │ ────────────────────────────────────────────────────────────────│   │
│  │ 🔴 High-risk case #1234 flagged for review           2 min ago  │   │
│  │ ✅ Case #1189 approved by J. Smith                   15 min ago │   │
│  │ 📤 New file uploaded to case #1201                   1 hour ago │   │
│  │ 🔍 Investigation started on subject "XYZ Corp"       2 hours ago│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### StatCard (`components/dashboard/StatCard.tsx`)
Displays individual metric with trend indicator.

**Props:**
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    label?: string;
  };
  icon?: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical';
  loading?: boolean;
}
```

### RiskDistributionChart (`components/dashboard/RiskDistributionChart.tsx`)
Horizontal bar chart showing risk level distribution.

**Props:**
```typescript
interface RiskDistributionProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}
```

### WeeklyActivityChart (`components/dashboard/WeeklyActivityChart.tsx`)
Line chart displaying activity trends over the past week.

**Props:**
```typescript
interface WeeklyActivityProps {
  data: {
    day: string;
    cases: number;
    alerts: number;
  }[];
}
```

### RecentActivity (`components/dashboard/RecentActivity.tsx`)
Scrollable list of recent system events.

**Props:**
```typescript
interface ActivityItem {
  id: string;
  type: 'case_created' | 'case_updated' | 'alert' | 'decision' | 'upload';
  message: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
```

### DashboardSkeleton (`components/dashboard/DashboardSkeleton.tsx`)
Loading state placeholder component.

---

## Features

### Real-time Updates
The dashboard uses WebSocket connections to receive live updates:
- New case notifications
- Metric changes
- Alert triggers
- Decision notifications

**WebSocket Events:**
```typescript
// Incoming events
'metrics:update'      // Updated dashboard metrics
'case:created'        // New case created
'case:updated'        // Case status changed
'alert:triggered'     // New alert in queue
```

### Key Metrics
| Metric | Description | Update Frequency |
|--------|-------------|------------------|
| Active Cases | Total open investigations | Real-time |
| High Risk Subjects | Subjects with risk score ≥80 | Real-time |
| Pending Reviews | Alerts awaiting adjudication | Real-time |
| System Load | Current processing capacity | Every 30s |

### Quick Actions
- **New Case Button:** Opens `NewCaseModal` for creating investigations
- **Click on StatCard:** Navigate to filtered list (e.g., high-risk cases)
- **Activity Item Click:** Navigate to relevant case or alert

---

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Dashboard  │────▶│  useQuery    │────▶│ GET /api/v1/    │
│  Component  │     │  (metrics)   │     │ dashboard/stats │
└─────────────┘     └──────────────┘     └─────────────────┘
       │
       │            ┌──────────────┐     ┌─────────────────┐
       └───────────▶│  WebSocket   │────▶│ Real-time       │
                    │  Connection  │     │ Updates         │
                    └──────────────┘     └─────────────────┘
```

---

## API Integration

### Dashboard Stats Endpoint
```typescript
GET /api/v1/dashboard/stats

Response (200):
{
  "active_cases": 247,
  "high_risk_subjects": 12,
  "pending_reviews": 34,
  "system_load": 45,
  "trends": {
    "active_cases": { "direction": "up", "percentage": 12 },
    "high_risk_subjects": { "direction": "down", "percentage": 3 },
    "pending_reviews": { "direction": "up", "percentage": 8 }
  }
}
```

### Risk Distribution Endpoint
```typescript
GET /api/v1/dashboard/risk-distribution

Response (200):
{
  "distribution": [
    { "level": "critical", "count": 12, "percentage": 5 },
    { "level": "high", "count": 37, "percentage": 15 },
    { "level": "medium", "count": 99, "percentage": 40 },
    { "level": "low", "count": 99, "percentage": 40 }
  ]
}
```

### Activity Feed Endpoint
```typescript
GET /api/v1/dashboard/activity?limit=10

Response (200):
{
  "activities": [
    {
      "id": "act_123",
      "type": "case_created",
      "message": "High-risk case #1234 flagged for review",
      "timestamp": "2025-12-06T12:00:00Z",
      "severity": "high",
      "link": "/cases/1234"
    }
  ]
}
```

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| Live Regions | `aria-live="polite"` for metric updates |
| Chart Alt Text | Descriptive `aria-label` on chart containers |
| Keyboard Nav | Tab through all interactive elements |
| Focus Indicators | Visible focus rings on all clickable elements |
| Color Contrast | WCAG AA compliant color combinations |
| Screen Reader | Trend changes announced (e.g., "12% increase") |

---

## Responsive Behavior

| Breakpoint | Layout Change |
|------------|---------------|
| ≥1280px (xl) | 4-column stats grid, 2-column charts |
| ≥1024px (lg) | 4-column stats, 2-column charts |
| ≥768px (md) | 2-column stats, stacked charts |
| <768px (sm) | Single column layout, stacked everything |

---

## Performance Optimizations

- **React Query Caching:** 30-second stale time for dashboard metrics
- **Lazy Loading:** Charts loaded only when in viewport
- **Memoization:** StatCard components memoized to prevent re-renders
- **WebSocket Debouncing:** Updates batched to prevent excessive re-renders

---

## Testing

### Unit Tests
- StatCard rendering with various props
- Trend indicator direction and percentage
- Loading skeleton display

### E2E Tests
- Dashboard loads with metrics
- Real-time update handling
- Navigation from activity feed items
- New case modal interaction

---

## Related Files

```
frontend/src/
├── pages/Dashboard.tsx
├── components/dashboard/
│   ├── StatCard.tsx
│   ├── StatCard.test.tsx
│   ├── RiskDistributionChart.tsx
│   ├── WeeklyActivityChart.tsx
│   ├── RecentActivity.tsx
│   └── DashboardSkeleton.tsx
└── lib/
    ├── api.ts                    # API client
    └── websocket.ts              # WebSocket connection
```

---

## Future Enhancements

- [ ] Customizable dashboard widgets (drag-and-drop)
- [ ] Date range selector for activity chart
- [ ] Export dashboard report as PDF
- [ ] Personalized metric preferences
- [ ] Alert threshold configuration
- [ ] AI-powered insights summary
