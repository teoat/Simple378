# 📊 Dashboard Guide

> Understanding your investigation dashboard

---

## Overview

The Dashboard is your command center for monitoring the Simple378 fraud detection system. It provides real-time metrics, recent activity, and quick access to critical actions.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 Dashboard                                            [🔔] [👤 User ▼]   │
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
│  │ 🎯 Quick Actions                      │                                 │
│  │                                       │                                 │
│  │ [📂 New Case] [📤 Upload] [🔍 Search] │                                 │
│  └───────────────────────────────────────┘                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Metrics Cards

### Total Cases
- Shows all cases in the system
- Green/red indicator for daily change
- Click to go to Case List

### High Risk Subjects
- Subjects with risk score > 80
- Red alert if increasing
- Click to filter high-risk cases

### Pending Reviews
- Alerts awaiting adjudication
- Target: Reduce to zero daily
- Click to go to Adjudication Queue

### Resolved Today
- Cases closed in last 24 hours
- Productivity indicator
- Click to see resolved cases

---

## Charts

### Case Activity Chart
- 30-day trend of case volume
- Hover for daily breakdown
- Click to drill down

### Risk Distribution
- Pie chart of risk levels
- Categories: Low, Medium, High, Critical
- Click segment to filter

---

## Recent Activity Feed

Real-time updates including:
- 🔔 New alerts detected
- ✅ Cases resolved
- 👤 Investigator assignments
- 📄 Documents uploaded

---

## Quick Actions

| Action | Description |
|--------|-------------|
| **New Case** | Create investigation case |
| **Upload** | Ingest documents |
| **Search** | Semantic search |
| **Reports** | Generate summary reports |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G + D` | Go to Dashboard |
| `G + C` | Go to Cases |
| `G + A` | Go to Adjudication |
| `/` | Focus search |

---

## Related

- [Case Management](./CASE_MANAGEMENT.md)
- [Adjudication](./ADJUDICATION.md)
