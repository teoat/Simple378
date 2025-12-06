# Case List Design Proposal - Advanced Table Experience

## Overview
A reimagined case management interface focusing on information architecture, advanced filtering, and seamless multi-tasking capabilities.

---

## 🎯 Design Goals

1. **Instant Scanning** - Identify critical cases in <2 seconds
2. **Efficient Filtering** - Multi-dimensional filters without cognitive overload
3. **Bulk Operations** - Manage dozens of cases simultaneously
4. **Contextual Details** - Preview without losing place
5. **Zero Friction** - Keyboard shortcuts for power users

---

## 🏗️ Layout Structure

### Page Anatomy

```
┌────────────────────────────────────────────────────────────────┐
│ [Header Bar: Title + Quick Actions + View Switcher]           │
├────────────────────────────────────────────────────────────────┤
│ [Command Bar: Search + Smart Filters + Saved Views]           │
├────────────────────────────────────────────────────────────────┤
│ [Quick Stats Bar: Counts + Distribution + Team Load]          │
├────────────────────────────────────────────────────────────────┤
│ ┌───────────┬──────────────────────────────────────────────┐ │
│ │  Filters  │  Data Table                                  │ │
│ │  Panel    │  ┌─────────────────────────────────────────┐│ │
│ │  (240px)  │  │ □ ID | Subject | Status | Risk | Date  ││ │
│ │           │  ├─────────────────────────────────────────┤│ │
│ │ Status    │  │ Row data with progressive disclosure... ││ │
│ │ Priority  │  │ ...                                     ││ │
│ │ Assignee  │  └─────────────────────────────────────────┘│ │
│ │ Date      │                                              │ │
│ │ Custom    │  [Pagination + Bulk Actions Bar]            │ │
│ └───────────┴──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Design

### 1. **Advanced Command Bar**

**Current Issues:**
- Basic text search only
- Filters hidden in dropdown
- No search suggestions
- No saved searches

**Redesigned Command Bar:**

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Search cases, subjects, or IDs...          [Advanced ▾]  │
│                                                               │
│ Suggestions:                                                 │
│ 🔍 High risk cases assigned to me                           │
│ 🔍 Cases updated in last 24 hours                           │
│ 📌 Saved: Q4 Reconciliation Review                          │
│ 📊 Filter: Status=Open AND Risk>7                           │
└──────────────────────────────────────────────────────────────┘
```

**Features:**

**1. Smart Search with Natural Language:**
```
Input: "high risk cases from last week"
→ Parses to: risk_score >= 7 AND created_at >= '2025-11-29'
```

**2. Search Syntax Support:**
```
status:open priority:high assigned:@me
created:>7d risk:>8 subject:"John Doe"
```

**3. Recent Searches (Persistent):**
```javascript
const recentSearches = useLocalStorage('case_searches', []);

// Format with relative time
"Cases updated today" - 2m ago
"Unassigned high-risk" - 1h ago  
"Team review queue" - 3h ago
```

**4. Saved Views (Shareable):**
```
My Active Cases
Team Dashboard View (5 users)
Executive Summary
End-of-Month Review
```

### 2. **Smart Filter System**

**Current Issues:**
- Single-select dropdowns
- No filter combinations
- Can't see active filters
- No filter presets

**Redesigned Filter Panel:**

```
┌─────────────────────────┐
│ FILTERS            [×]  │
├─────────────────────────┤
│                         │
│ Status ▾                │
│ ☑ Open (127)           │
│ ☑ In Review (45)       │
│ ☐ Closed (892)         │
│ ☐ Archived (3,421)     │
│                         │
│ Risk Score  [●────] 7  │
│ 0 ────────────────── 10│
│                         │
│ Date Range             │
│ ○ Today                │
│ ● Last 7 days          │
│ ○ Last 30 days         │
│ ○ Custom range...      │
│                         │
│ Assigned To            │
│ [Search team...]       │
│ ☑ Me (23)              │
│ ☑ Sarah Johnson (15)   │
│ ☐ Unassigned (8)       │
│                         │
│ Tags                   │
│ 🏷️ fraud (45)          │
│ 🏷️ urgent (12)         │
│ 🏷️ review (67)         │
│                         │
├─────────────────────────┤
│ [Clear All] [Apply]    │
└─────────────────────────┘

Active: 3 filters
Status: Open, In Review
Risk: ≥ 7
Date: Last 7 days
```

**Implementation Details:**

**Filter State Management:**
```typescript
interface FilterState {
  status: string[];
  riskScore: { min: number; max: number };
  dateRange: { from: Date; to: Date };
  assignedTo: string[];
  tags: string[];
  customFields: Record<string, any>;
}

// URL sync for shareability
const filters = useQueryParams<FilterState>();
// example.com/cases?status=open,review&risk=7-10&date=7d
```

**Smart Filter Chips:**
```
┌────────────────────────────────────────────────┐
│ Status: Open, In Review [×]                    │
│ Risk Score: 7-10 [×]                           │
│ Last 7 days [×]                                │
│ Assigned: Me, Sarah [×]              Clear All │
└────────────────────────────────────────────────┘
```

### 3. **Data Table - Enhanced Grid**

**Current Issues:**
- Fixed columns (not customizable)
- No inline editing
- Poor mobile experience
- No density options

**Redesigned Table:**

```
┌──────────────────────────────────────────────────────────────────┐
│ ☐ ID ↕    Subject ↕         Status ↕   Risk ↕   Updated ↕  ⋮    │
├──────────────────────────────────────────────────────────────────┤
│ ☐ #2847  John Smith          🔴 Open    ⚠️ 9    2m ago      ⋮    │
│          Suspicious transfer  →Review                            │
│          $15,200 • 3 flags   [Quick Actions: Assign | Review]   │
├──────────────────────────────────────────────────────────────────┤
│ ☐ #2846  Acme Corp           🟡 Review  ⚠️ 7    15m ago     ⋮    │
│          Multiple invoices                                       │
│          €45,000 • 8 items   [Quick Actions: Approve | Flag]    │
├──────────────────────────────────────────────────────────────────┤
│ ☐ #2845  Jane Doe            🟢 Closed  ℹ️ 3    1h ago      ⋮    │
│          Resolved - False +   Cleared                            │
│          $2,100              [Quick Actions: Reopen | Archive]   │
└──────────────────────────────────────────────────────────────────┘
```

**Advanced Features:**

**1. Column Customization:**
```
Right-click header → Column Options

┌─────────────────────────┐
│ ☑ Case ID               │
│ ☑ Subject               │
│ ☑ Status                │
│ ☑ Risk Score            │
│ ☑ Last Updated          │
│ ☐ Created Date          │
│ ☐ Assigned To           │
│ ☐ Evidence Count        │
│ ☐ Transaction Amount    │
│ ☐ Tags                  │
│                         │
│ [Reset] [Save as View] │
└─────────────────────────┘
```

**2. Density Settings:**
```
Compact:  Row height 48px, smaller fonts
Standard: Row height 64px (default)
Relaxed:  Row height 80px, more spacing
```

**3. Row Expansion (Progressive Disclosure):**
```
Click row to expand:

┌────────────────────────────────────────────────────────────┐
│ ☑ #2847  John Smith  🔴 Open  ⚠️ 9  2m ago              × │
├────────────────────────────────────────────────────────────┤
│ Details                                                     │
│ Subject ID: 550e8400-e29b-41d4-a716-446655440000          │
│ Amount: $15,200.00                                         │
│ Flagged: Unusual transaction pattern                       │
│                                                             │
│ Timeline                                                    │
│ ● 2m ago    Status changed: Open                          │
│ ● 15m ago   Evidence added: bank_statement.pdf            │
│ ● 1h ago    Case created by AI System                     │
│                                                             │
│ Quick Actions                                               │
│ [Assign to Me] [Mark High Priority] [Add Note]            │
└────────────────────────────────────────────────────────────┘
```

**4. Inline Editing:**
```
Double-click cell to edit:

Status: [Dropdown: Open ▾]
         → In Review
         → Awaiting Info
         → Closed

Risk:   [Slider: ●────────] 8

Tags:   [fraud] [×] [urgent] [×] + Add tag
```

### 4. **Bulk Actions System**

**Current Issues:**
- Limited bulk operations
- No confirmation
- Can't undo
- Slow for large selections

**Redesigned Bulk Actions:**

```
Selection Active: 23 cases selected

┌────────────────────────────────────────────────────────────┐
│ [Deselect All]                                             │
│                                                             │
│ Bulk Actions:                                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │ Assign   │ │ Update   │ │ Export   │ │ More ▾   │      │
│ │ to Team  │ │ Status   │ │ to CSV   │ │          │      │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│ More Actions:                                               │
│ • Add tags to 23 cases                                      │
│ • Change priority level                                     │
│ • Merge into investigation                                  │
│ • Generate summary report                                   │
│ • Schedule review                                           │
└────────────────────────────────────────────────────────────┘
```

**Smart Bulk Operations:**

**1. Conditional Actions (Context-Aware):**
```
If selected cases have status "Open":
  Show: "Move to Review" button
  
If selected cases assigned to different people:
  Show: "Reassign All" option
  
If selected cases > 50:
  Warn: "Large batch operation - will process in background"
```

**2. Progress Tracking:**
```
Processing 23 cases...
████████████░░░░░░░░ 65% (15/23)

✓ Case #2847 updated
✓ Case #2846 updated
⚠ Case #2845 skipped (locked by another user)
```

**3. Undo System:**
```
┌────────────────────────────────────────────┐
│ ✓ 23 cases updated to "In Review"         │
│ [Undo] [Dismiss]                      5s   │
└────────────────────────────────────────────┘
```

### 5. **Quick Preview Drawer**

**Current Issues:**
- Must navigate away to see details
- Lose table position
- Can't compare cases
- Slow context switching

**Redesigned Quick Preview:**

```
Hover/Click row → Drawer slides from right

┌──────────────────────────────────────────┐
│ Case #2847                           [×] │
├──────────────────────────────────────────┤
│ 🔴 Open • ⚠️ Risk: 9 • Created 2h ago   │
│                                           │
│ SUBJECT                                   │
│ John Smith                                │
│ ID: 550e8400-e29b-41d4-a716-446655440000│
│                                           │
│ TRANSACTION                               │
│ Amount: $15,200.00                        │
│ Date: Dec 5, 2025 14:30                  │
│ Type: Wire Transfer                       │
│                                           │
│ FLAGS (3)                                 │
│ ⚠️ Unusual transaction pattern           │
│ ⚠️ High-risk jurisdiction                │
│ ⚠️ After-hours activity                  │
│                                           │
│ EVIDENCE (4 files)                        │
│ 📄 bank_statement.pdf       2.3 MB       │
│ 📄 transaction_log.xlsx     856 KB       │
│ 📷 invoice_scan.jpg         1.1 MB       │
│ 📄 notes.txt                12 KB        │
│                                           │
│ TIMELINE                                  │
│ [View full timeline →]                   │
│                                           │
│ ┌──────────┐ ┌──────────┐               │
│ │ Review   │ │ Assign   │               │
│ │ Case     │ │ to Me    │               │
│ └──────────┘ └──────────┘               │
└──────────────────────────────────────────┘
```

**Features:**
- **Resizable:** Drag left edge to resize (320-800px)
- **Pinnable:** Keep open while scrolling table
- **Multi-preview:** Open multiple drawers (tabs)
- **Keyboard:** `→` to open, `←` to close, `Tab` to navigate

---

## 🎨 Visual Design Elements

### Status Indicators

**Visual Language:**
```
🔴 Open          Red circle     #ef4444
🟡 In Review     Yellow circle  #f59e0b  
🔵 Awaiting Info Blue circle    #3b82f6
🟢 Closed        Green circle   #10b981
⚫ Archived      Gray circle    #6b7280
```

**With Text:**
```
Open       ← Bold, red-600
In Review  ← Bold, yellow-600
Closed     ← Regular, green-600
```

### Risk Score Visualization

**Numerical + Visual:**
```
Risk 0-3:  ℹ️ Low       Green bar
Risk 4-6:  ⚠️ Medium    Yellow bar
Risk 7-8:  ⚠️ High      Orange bar
Risk 9-10: 🔴 Critical  Red bar (pulsing)

┌──────────────┐
│ Risk: 9      │
│ ████████░░ 9 │ ← Gradient bar
│ Critical     │
└──────────────┘
```

### Date Formatting

**Relative Time (Smart):**
```
< 1 minute:  "Just now"
< 60 mins:   "Xm ago"
< 24 hours:  "Xh ago"
< 7 days:    "X days ago"
< 30 days:   "MMM DD"
> 30 days:   "MMM DD, YYYY"
```

**Hover shows absolute:**
```
"2h ago" → Tooltip: "Dec 6, 2025 at 2:30 PM PST"
```

---

## ⌨️ Keyboard Shortcuts

### Navigation
```
↑ ↓           Navigate rows
Enter         Open case detail
Space         Select/deselect row
Ctrl+A        Select all
Ctrl+D        Deselect all
Esc           Clear selection
```

### Actions
```
Ctrl+F        Focus search
Ctrl+K        Command palette
N             New case
E             Edit selected
D             Delete selected
R             Refresh table
```

### View
```
1-5           Switch density (1=compact, 5=relaxed)
Ctrl+[        Collapse filter panel
Ctrl+]        Expand filter panel
F             Toggle fullscreen
```

---

## 📱 Mobile Responsive Design

### Card-Based Mobile View

```
┌─────────────────────────────────┐
│ 🔍 Search cases...              │
│ [Filters: 3 active ▾]           │
├─────────────────────────────────┤
│                                  │
│ ┌────────────────────────────┐ │
│ │ #2847 • 2m ago             │ │
│ │ John Smith                 │ │
│ │ 🔴 Open  ⚠️ Risk: 9        │ │
│ │ Suspicious transfer         │ │
│ │ $15,200                    │ │
│ │ [Review] [Assign]          │ │
│ └────────────────────────────┘ │
│                                  │
│ ┌────────────────────────────┐ │
│ │ #2846 • 15m ago            │ │
│ │ Acme Corp                  │ │
│ │ 🟡 Review  ⚠️ Risk: 7      │ │
│ │ Multiple invoices           │ │
│ │ €45,000                    │ │
│ │ [Approve] [Flag]           │ │
│ └────────────────────────────┘ │
│                                  │
│ [Load More ↓]                   │
└─────────────────────────────────┘
```

**Mobile Features:**
- Swipe right: Quick actions menu
- Swipe left: Archive/Delete
- Pull to refresh
- Infinite scroll (virtual)
- Bottom sheet for filters

---

## 🎯 Advanced Features

### 1. **Saved Views & Workspaces**

```
┌─────────────────────────────────────┐
│ MY VIEWS                      [+ ] │
├─────────────────────────────────────┤
│ 📌 My Active Cases (23)            │
│ 🔥 High Priority (8)               │
│ 👥 Team Queue (45)                 │
│ 📅 This Week (127)                 │
│ ⭐ Starred (5)                     │
│                                     │
│ SHARED VIEWS                        │
│ 👔 Executive Dashboard (Sarah)     │
│ 📊 Q4 Review (Team Lead)           │
└─────────────────────────────────────┘
```

**View Sharing:**
- Generate shareable link
- Set permissions (view-only, can-edit)
- Track view usage analytics

### 2. **Command Palette (Power Users)**

```
Press Ctrl+K

┌─────────────────────────────────────┐
│ 🔍 Type a command...                │
├─────────────────────────────────────┤
│ Recent                               │
│ → Go to case #2847                  │
│ → Filter by high risk               │
│                                      │
│ Actions                              │
│ ⚡ Create new case                  │
│ ⚡ Bulk update status               │
│ ⚡ Export to CSV                    │
│                                      │
│ Navigation                           │
│ 🏠 Go to Dashboard                  │
│ 📊 Go to Analytics                  │
│ ⚙️ Go to Settings                  │
└─────────────────────────────────────┘
```

### 3. **Smart Sorting & Grouping**

```
Group by: Status ▾

┌─────────────────────────────────┐
│ 🔴 OPEN (127 cases)             │
│ ├─ #2847 John Smith             │
│ ├─ #2843 Acme Corp              │
│ └─ ... 125 more                 │
│                                  │
│ 🟡 IN REVIEW (45 cases)         │
│ ├─ #2846 Jane Doe               │
│ └─ ... 44 more                  │
│                                  │
│ 🟢 CLOSED (892 cases)           │
│ └─ [Collapsed - click to view] │
└─────────────────────────────────┘
```

**Group Options:**
- Status
- Risk Level
- Assigned To
- Date (Today, This Week, This Month)
- Custom Fields

### 4. **Comparison Mode**

```
Select 2+ cases → [Compare]

┌──────────────────────────────────────────────┐
│ COMPARE 3 CASES                          [×] │
├──────────────────────────────────────────────┤
│             #2847        #2846      #2845   │
│ Subject     John Smith   Acme Corp  Jane Doe│
│ Status      Open         Review     Closed  │
│ Risk        9 🔴         7 🟡       3 ℹ️    │
│ Amount      $15,200      €45,000    $2,100  │
│ Flags       3            8           0       │
│ Evidence    4 files      2 files    1 file  │
│ Created     2h ago       1d ago     2d ago  │
│                                              │
│ Common Patterns:                             │
│ • All involve wire transfers                 │
│ • Similar transaction times                  │
│                                              │
│ [Merge Cases] [Create Investigation]        │
└──────────────────────────────────────────────┘
```

---

## 🚀 Performance Optimizations

### Virtual Scrolling
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: cases.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 64, // row height
  overscan: 10, // render extra rows for smooth scrolling
});

// Only renders visible rows + overscan
// Handles 10,000+ rows smoothly
```

### Infinite Loading
```typescript
const { 
  data, 
  fetchNextPage, 
  hasNextPage 
} = useInfiniteQuery({
  queryKey: ['cases', filters],
  queryFn: ({ pageParam = 1 }) => 
    api.getCases({ page: pageParam, ...filters }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});

// Auto-fetch when scrolling near bottom
useEffect(() => {
  if (inView && hasNextPage) {
    fetchNextPage();
  }
}, [inView]);
```

### Debounced Search
```typescript
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    setSearchQuery(value);
  }, 300),
  []
);
```

---

## ♿ Accessibility Features

### ARIA Labels
```html
<table 
  role="grid" 
  aria-label="Case list"
  aria-rowcount={totalCases}
  aria-colcount={visibleColumns.length}
>
  <thead>
    <tr role="row">
      <th 
        role="columnheader" 
        aria-sort="ascending"
        tabindex="0"
      >
        Case ID
      </th>
    </tr>
  </thead>
</table>
```

### Keyboard Navigation
```typescript
const handleKeyDown = (e: KeyboardEvent, rowIndex: number) => {
  switch(e.key) {
    case 'ArrowUp':
      focusRow(rowIndex - 1);
      break;
    case 'ArrowDown':
      focusRow(rowIndex + 1);
      break;
    case 'Enter':
      openCase(cases[rowIndex]);
      break;
    case ' ':
      toggleSelection(cases[rowIndex]);
      break;
  }
};
```

### Screen Reader Announcements
```html
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  {`Showing ${visibleCases.length} of ${totalCases} cases. 
    ${selectedCases.length} selected.`}
</div>
```

---

## 📊 Success Metrics

### Performance Targets
- Initial load: <800ms
- Filter application: <200ms
- Sort operation: <150ms
- Row selection: <50ms
- Smooth 60fps scrolling

### UX Metrics
- Time to find case: <5 seconds
- Bulk action success rate: >98%
- Filter usage: 80% of users
- Keyboard shortcut adoption: 35%

---

This design transforms the case list from a basic table into a powerful, efficient case management hub that scales from 10 to 10,000 cases without sacrificing usability or performance.
