# Visualization Page Navigation Guide

**Last Updated:** 2025-12-07  
**Status:** ✅ Implemented

---

## Overview

The Financial Visualization page provides comprehensive interactive financial charts and data visualizations for fraud detection analysis. This guide explains how to access and navigate the visualization features.

---

## Accessing Visualization

### Method 1: From Case Detail Page (Primary)

1. Navigate to **Cases** from the sidebar
2. Click on any case to open the Case Detail page
3. In the header, click the **purple "Visualization" button** next to the AI Assistant button
4. You will be taken to `/visualization/{caseId}` with full financial analysis

**Visual Location:**
```
[← Back] Case Name [Status]          [Visualization] [AI Assistant] [Share] [...]
```

### Method 2: Direct URL Navigation

If you know the case ID, you can navigate directly:
```
http://localhost:5173/visualization/{caseId}
```

For example:
```
http://localhost:5173/visualization/123e4567-e89b-12d3-a456-426614174000
```

---

## Visualization Page Features

Once on the visualization page, you'll see:

### Header Section
- **Page Title:** "Financial Visualization"
- **Case Context:** "Case {caseId} - Interactive financial analysis and fraud detection"
- **Action Buttons:**
  - 🔄 Refresh - Reload visualization data
  - 📤 Share - Share visualization (coming soon)
  - 💾 Export - Export reports as PDF/CSV

### KPI Cards (Top Section)
Four summary cards displaying:
1. **Total Inflow** (Green) - All incoming transactions
2. **Total Outflow** (Red) - All outgoing transactions
3. **Net Cashflow** (Blue) - Surplus or deficit
4. **Suspect Items** (Amber) - Flagged transactions

### Tab Navigation
Switch between different analysis views:

#### 1. 💸 Cashflow Analysis Tab
- Comprehensive cashflow breakdown
- Income vs. expense categorization
- Mirror transaction detection
- Project transaction calculation
- Waterfall chart visualization

#### 2. 📅 Milestone Tracker Tab
- Project phase management
- Fund release milestones
- Completion tracking
- Phase control panel for marking milestones complete

#### 3. 🚨 Fraud Detection Tab
- Risk indicators and flags
- Anomaly detection results
- Peer benchmark comparison
- Risk score breakdown

#### 4. 🔗 Network & Flow Tab
- Entity relationship graph
- Transaction flow visualization
- Network analysis
- Interactive graph exploration

---

## Navigation Flow Diagram

```
Dashboard
   │
   ├─→ Cases List
   │      │
   │      └─→ Case Detail Page
   │             │
   │             ├─→ [Visualization Button] → Visualization Page
   │             │                               │
   │             │                               ├─→ Cashflow Tab
   │             │                               ├─→ Milestones Tab
   │             │                               ├─→ Fraud Detection Tab
   │             │                               └─→ Network & Flow Tab
   │             │
   │             ├─→ Overview Tab
   │             ├─→ Analysis Tab
   │             ├─→ Evidence Library Tab
   │             ├─→ Timeline Tab
   │             └─→ Predictive Analytics Tab
   │
   └─→ Other Pages...
```

---

## User Workflow Example

**Scenario:** Investigating a case for financial fraud

1. **Start:** Login to Simple378
2. **Navigate:** Click "Cases" in sidebar → Select case "John Doe Construction"
3. **Case Detail:** Review overview and risk score (e.g., 75/100)
4. **Open Visualization:** Click purple "Visualization" button in header
5. **Analyze Cashflow:** Review Total Inflow ($100K), Outflow ($50K), Net ($50K)
6. **Check Fraud Flags:** Switch to "Fraud Detection" tab → See 3 high-risk indicators
7. **Review Milestones:** Switch to "Milestone Tracker" → Check project phase completion
8. **Explore Network:** Switch to "Network & Flow" → View entity relationships
9. **Export Report:** Click "Export" → Download PDF with findings
10. **Return:** Use browser back button or navigate back to Cases

---

## Keyboard Shortcuts

*Coming soon*

- `Alt + V` - Open visualization from case detail
- `Tab` - Navigate between tabs
- `Ctrl/Cmd + E` - Export current view
- `Ctrl/Cmd + R` - Refresh data

---

## Troubleshooting

### "Error loading data" message

**Possible causes:**
1. Invalid case ID in URL
2. Case doesn't have financial data yet
3. Backend API is not responding
4. No transactions associated with the case

**Solutions:**
- Verify the case ID is correct
- Check that transactions have been ingested for this case
- Ensure backend is running (`http://localhost:8000/health`)
- Check browser console for detailed error messages

### "No data to display" in charts

**Causes:**
- Case exists but has no transactions
- Transactions lack required categorization data

**Solutions:**
- Ingest transaction data for the case first
- Verify transaction data includes amounts and dates
- Check that categorization logic has run

### Visualization button not appearing

**Causes:**
- Using older version of the application
- JavaScript not loaded properly

**Solutions:**
- Hard refresh the page (Ctrl/Cmd + Shift + R)
- Clear browser cache
- Update to latest version

---

## API Endpoints Used

The visualization page calls these backend endpoints:

1. **Main Financial Data:**
   ```
   GET /api/v1/cases/{caseId}/financials
   ```
   Returns: cashflow, income/expense breakdown, milestones, fraud indicators

2. **Graph Data:**
   ```
   GET /api/v1/graph/{caseId}
   ```
   Returns: nodes and links for network visualization

3. **Milestone Management:**
   ```
   GET /api/v1/milestones/{milestoneId}
   PATCH /api/v1/milestones/{milestoneId}/status
   ```

---

## Related Documentation

- [Case Management](./frontend/pages/03_CASE_DETAIL.md) - Case detail page features
- [Visualization Implementation](./VISUALIZATION_README.md) - Technical details
- [Financial Analysis](./frontend/pages/08_VISUALIZATION.md) - Feature specifications
- [API Documentation](./api/README.md) - Backend API reference

---

**Maintained by:** Development Team  
**Questions?** Contact the dev team or check the GitHub issues
