# Case Management Page Design Orchestration

## Overview
This document outlines the design orchestration for the Case Management page, the central hub for browsing, searching, and managing investigation cases. The design focuses on efficient data browsing, detailed case views, glassmorphism effects, and seamless integration with backend services.

## Current State Analysis

### Existing Implementation
- **Location:** `frontend/src/pages/CaseManagement.tsx` (to be created)
- **Current Features:**
  - No dedicated case management page exists yet
  - Case data is available via backend API (`/api/v1/cases`)
  - Basic case model with ID, subject, risk score, status, timestamps

### Gaps Identified
- No case list view
- No case detail view
- No search/filter functionality
- No integration with Meilisearch
- No real-time case updates
- No case creation/editing UI

## Design Goals

### 1. Case List View
- **Data Grid:** Sortable, filterable table with pagination
- **Visual Hierarchy:** Risk heat bars, status badges, priority indicators
- **Quick Preview:** Hover cards showing case summary
- **Bulk Actions:** Select multiple cases for batch operations

### 2. Case Detail View
- **Comprehensive Overview:** Subject profile, risk score, status, timeline
- **Tabbed Navigation:** Overview, Graph, Timeline, Files, Notes
- **Real-time Updates:** WebSocket integration for live case updates
- **Action Buttons:** Edit, Close, Escalate, Export

### 3. Visual Design
- **Glassmorphism:** Apply to cards, modals, and containers
- **Premium Aesthetics:** Depth, shadows, gradients, animations
- **Color Coding:** Risk levels, status types, priority levels
- **Responsive Design:** Optimized for all screen sizes

### 4. User Experience
- **Fast Search:** Integration with Meilisearch for instant results
- **Smart Filters:** Multi-criteria filtering with saved filter sets
- **Keyboard Shortcuts:** Quick navigation and actions
- **Accessibility:** ARIA labels, keyboard navigation, screen reader support

## Design Specifications

### 1. Case List View

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [Search Bar]                    [New Case] [Filters]  │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐ │
│  │ Case ID │ Subject │ Risk │ Status │ Updated │ ⋮ │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ #12345  │ John D. │ ████ │ Active │ 2h ago  │ ⋮ │ │
│  │ #12346  │ Jane S. │ ██   │ Closed │ 1d ago  │ ⋮ │ │
│  └───────────────────────────────────────────────────┘ │
│  [Pagination]                                           │
└─────────────────────────────────────────────────────────┘
```

#### Data Grid Features
- **Columns:**
  - Case ID (clickable link)
  - Subject Name/Entity
  - Risk Score (visual heat bar + numeric)
  - Status (badge with color coding)
  - Last Updated (relative time)
  - Actions (dropdown menu)
- **Sorting:** Click column headers to sort
- **Filtering:** Multi-select filters for status, risk range, date range
- **Pagination:** 20/50/100 items per page

#### Risk Heat Bar
- **Visual:** Horizontal bar with gradient fill
- **Color Scheme:**
  - Low (0-30): Green gradient
  - Medium (31-60): Yellow gradient
  - High (61-80): Orange gradient
  - Critical (81-100): Red gradient
- **Styling:** Glassmorphism background with glowing effect
- **Animation:** Smooth fill animation on load

#### Status Badges
- **Active:** Blue badge with pulse animation
- **Under Review:** Yellow badge
- **Escalated:** Red badge with glow
- **Closed:** Gray badge
- **Archived:** Slate badge

#### Quick Preview (Hover Card)
- **Trigger:** Hover over case row for 500ms
- **Content:**
  - Subject avatar/icon
  - Risk score with trend
  - Recent activity summary
  - Quick action buttons
- **Styling:** Glassmorphism card with backdrop blur
- **Animation:** Fade in with slide up (200ms)

### 2. Case Detail View

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Cases                    [Edit] [Close] [⋮] │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Avatar] Subject Name          Risk: 85 ████    │   │
│  │          Status: Active        Updated: 2h ago  │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  [Overview] [Graph] [Timeline] [Files] [Notes]         │
├─────────────────────────────────────────────────────────┤
│  [Tab Content Area]                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Header Section
- **Subject Profile:**
  - Avatar with gradient background
  - Name/Entity identifier
  - Risk score with visual indicator
  - Status badge
  - Last updated timestamp
- **Action Buttons:**
  - Edit (pencil icon)
  - Close Case (check icon)
  - Escalate (alert icon)
  - Export (download icon)
  - More actions (dropdown)
- **Styling:** Glassmorphism card with enhanced depth

#### Tab Navigation
- **Overview Tab:**
  - Key statistics (total alerts, evidence count, timeline events)
  - AI-generated case summary
  - Recent alerts and flags
  - Related entities preview
- **Graph Tab:**
  - Full-screen interactive entity graph
  - Network visualization of connections
  - Zoom, pan, node selection
  - Export graph as image
- **Timeline Tab:**
  - Vertical timeline of all case events
  - Filterable by event type
  - Expandable event details
  - Real-time updates
- **Files Tab:**
  - Grid view of uploaded evidence
  - Thumbnail previews
  - File metadata (size, type, upload date)
  - Download/view actions
- **Notes Tab:**
  - Rich text editor for case notes
  - Markdown support
  - Collaborative editing (future)
  - Version history

### 3. Search and Filter

#### Search Bar
- **Position:** Top of case list
- **Features:**
  - Instant search with Meilisearch
  - Search by case ID, subject name, notes
  - Autocomplete suggestions
  - Recent searches
- **Styling:** Glassmorphism input with search icon
- **Keyboard:** Focus on `/` key press

#### Filter Panel
- **Trigger:** Filter button or keyboard shortcut
- **Filters:**
  - Status (multi-select)
  - Risk Range (slider)
  - Date Range (date picker)
  - Assigned To (user select)
  - Tags (multi-select)
- **Saved Filters:** Save and load filter presets
- **Styling:** Glassmorphism sidebar or modal
- **Animation:** Slide in from right

### 4. Glassmorphism Implementation

#### Case List Container
```css
backdrop-blur-lg 
bg-white/5 dark:bg-slate-800/10
border border-white/10 dark:border-slate-700/20
shadow-xl shadow-blue-500/5
rounded-2xl
```

#### Case Card (Detail View Header)
```css
backdrop-blur-xl 
bg-white/10 dark:bg-slate-900/20
border border-white/20 dark:border-slate-700/30
shadow-2xl shadow-purple-500/10
rounded-2xl
```

#### Data Grid Row (Hover)
```css
hover:backdrop-blur-sm
hover:bg-white/5 dark:hover:bg-slate-800/10
transition-all duration-200
```

#### Quick Preview Card
```css
backdrop-blur-xl 
bg-white/15 dark:bg-slate-900/25
border border-white/30 dark:border-slate-700/40
shadow-2xl shadow-blue-500/20
rounded-xl
```

### 5. Animation Specifications

#### Page Load
- **Type:** Staggered fade in
- **Duration:** 400ms per element
- **Stagger:** 50ms delay
- **Easing:** `ease-out`

#### Row Hover
- **Type:** Background fade + scale
- **Duration:** 150ms
- **Easing:** `ease-in-out`

#### Quick Preview
- **Type:** Fade in + slide up
- **Duration:** 200ms
- **Easing:** `ease-out`

#### Tab Switch
- **Type:** Fade out/in with slide
- **Duration:** 300ms
- **Easing:** `ease-in-out`

#### Risk Bar Fill
- **Type:** Width animation
- **Duration:** 600ms
- **Easing:** `ease-out`

## Technical Implementation

### Components Structure

```
frontend/src/
├── components/
│   └── cases/
│       ├── CaseList.tsx (new)
│       ├── CaseCard.tsx (new)
│       ├── CaseDetail.tsx (new)
│       ├── CaseHeader.tsx (new)
│       ├── CaseTabs.tsx (new)
│       ├── RiskBar.tsx (new)
│       ├── StatusBadge.tsx (new)
│       ├── QuickPreview.tsx (new)
│       ├── CaseSearch.tsx (new)
│       └── CaseFilters.tsx (new)
└── pages/
    └── CaseManagement.tsx (new)
```

### Dependencies
Required dependencies (most already installed):
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `react-query` or `swr` - Data fetching
- `date-fns` - Date formatting
- Additional: `@tanstack/react-table` (for advanced data grid)

### API Integration

#### Endpoints
- `GET /api/v1/cases` - List cases with pagination/filters
- `GET /api/v1/cases/{id}` - Get case details
- `POST /api/v1/cases` - Create new case
- `PUT /api/v1/cases/{id}` - Update case
- `DELETE /api/v1/cases/{id}` - Delete/archive case
- `GET /api/v1/search/cases` - Search via Meilisearch

#### WebSocket Events
- `case_updated` - Case data changed
- `case_created` - New case added
- `case_deleted` - Case removed
- `alert_added` - New alert for case

### State Management
- **Local State:** Component-level state for UI interactions
- **Server State:** React Query for API data caching
- **WebSocket State:** Real-time updates via context
- **Filter State:** URL params for shareable filter states

## Accessibility Requirements

### ARIA Labels
- All interactive elements must have descriptive labels
- Data grid must have proper table semantics
- Status badges must have accessible text
- Loading states must be announced

### Keyboard Navigation
- Tab through case list rows
- Enter to open case detail
- Arrow keys for grid navigation
- Keyboard shortcuts for common actions
- Focus trap in modals

### Screen Reader Support
- Table headers properly announced
- Row data clearly described
- Status changes announced
- Loading/error states communicated

### Color Contrast
- All text meets WCAG 2.1 AA (4.5:1)
- Risk colors distinguishable
- Focus indicators clearly visible

## Implementation Checklist

### Phase 1: Case List View
- [ ] Create `CaseList` component with data grid
- [ ] Implement sorting and pagination
- [ ] Add risk heat bars
- [ ] Add status badges
- [ ] Apply glassmorphism styling
- [ ] Add hover effects

### Phase 2: Search and Filter
- [ ] Create search bar component
- [ ] Integrate with Meilisearch
- [ ] Implement filter panel
- [ ] Add saved filter functionality
- [ ] Add keyboard shortcuts

### Phase 3: Quick Preview
- [ ] Create hover card component
- [ ] Implement hover delay logic
- [ ] Add preview content
- [ ] Apply glassmorphism styling
- [ ] Add animations

### Phase 4: Case Detail View
- [ ] Create case detail page
- [ ] Implement header section
- [ ] Create tab navigation
- [ ] Implement Overview tab
- [ ] Implement Graph tab
- [ ] Implement Timeline tab
- [ ] Implement Files tab
- [ ] Implement Notes tab

### Phase 5: Real-time Updates
- [ ] Integrate WebSocket for case updates
- [ ] Add update indicators
- [ ] Implement optimistic updates
- [ ] Add error handling

### Phase 6: Actions and Interactions
- [ ] Implement case creation modal
- [ ] Add edit functionality
- [ ] Add close/archive actions
- [ ] Add export functionality
- [ ] Add bulk actions

### Phase 7: Accessibility
- [ ] Add ARIA labels
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Verify color contrast
- [ ] Add focus indicators

## Testing Considerations

### Functional Testing
- Test case list loading and pagination
- Verify search functionality
- Test filter combinations
- Verify case detail views
- Test real-time updates
- Verify CRUD operations

### Visual Testing
- Verify glassmorphism effects
- Test animations and transitions
- Check responsive layouts
- Verify color coding
- Test hover effects

### Performance Testing
- Test with large datasets (1000+ cases)
- Verify search performance
- Check animation performance
- Test WebSocket update frequency

### Accessibility Testing
- Test with screen readers
- Verify keyboard navigation
- Check ARIA announcements
- Verify color contrast

## Future Enhancements

### Potential Additions
- **Kanban View:** Drag-and-drop case board
- **Bulk Import:** CSV/Excel import for cases
- **Advanced Search:** Boolean operators, saved searches
- **Case Templates:** Pre-configured case types
- **Collaboration:** Multi-user case assignment
- **Notifications:** Case update alerts
- **Analytics:** Case metrics dashboard
- **Export:** PDF/Excel export of case data

### Advanced Features
- **AI Suggestions:** Recommended actions based on case data
- **Duplicate Detection:** Identify similar cases
- **Auto-assignment:** Rule-based case routing
- **SLA Tracking:** Time-based alerts for case resolution
- **Audit Trail:** Complete history of case changes

## References

### Related Documents
- [UI Design Proposals](./04_ui_design_proposals.md) - General UI design guidelines
- [Dashboard Design](./12_dashboard_page_design_orchestration.md) - Dashboard patterns
- [Authentication Design](./11_auth_page_design_orchestration.md) - Auth patterns
- [System Architecture](./01_system_architecture.md) - Overall system structure

### External Resources
- [TanStack Table Documentation](https://tanstack.com/table/v8)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Meilisearch Documentation](https://docs.meilisearch.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Implementation Status
**Status:** Pending
**Date:** 2025-12-04

This design orchestration document is ready for implementation.
