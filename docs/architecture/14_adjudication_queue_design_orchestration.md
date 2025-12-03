# Adjudication Queue Page Design Orchestration

## Overview
This document outlines the design orchestration for the Adjudication Queue page, a high-velocity interface for analysts to review and make decisions on fraud alerts and flags. The design focuses on speed, efficiency, context-rich decision-making, and premium glassmorphism aesthetics.

## Current State Analysis

### Existing Implementation
- **Location:** `frontend/pages/AdjudicationQueue.tsx`
- **Current Features:**
  - Basic queue list view
  - Simple card-based layout
  - Decision buttons (Approve, Reject, Escalate)
  - Integration with backend adjudication API
  - Basic styling with Tailwind CSS

### Gaps Identified
- No glassmorphism effects
- Limited context display
- No keyboard shortcuts
- Basic loading states
- No batch operations
- Limited filtering options
- No real-time queue updates
- No decision history view

## Design Goals

### 1. High-Velocity Triage
- **Inbox-Style Interface:** Queue of pending alerts with quick navigation
- **Keyboard Shortcuts:** Approve (A), Reject (R), Escalate (E), Next (→)
- **Quick Actions:** One-click decisions with minimal friction
- **Batch Operations:** Select and process multiple alerts

### 2. Context-Rich Decision Making
- **Split View:** Alert details alongside evidence and graph data
- **AI Reasoning:** Display AI-generated fraud indicators
- **Evidence Preview:** Quick access to supporting documents
- **Historical Context:** Previous decisions on similar cases

### 3. Visual Design
- **Glassmorphism:** Premium glass effects on cards and panels
- **Color Coding:** Risk levels, decision types, priority indicators
- **Animations:** Smooth transitions, micro-interactions
- **Responsive Design:** Optimized for desktop-first workflow

### 4. User Experience
- **Fast Navigation:** Keyboard-first design for power users
- **Progress Tracking:** Visual indicators of queue progress
- **Decision Confidence:** Require confidence level for decisions
- **Undo Capability:** Ability to reverse recent decisions

## Design Specifications

### 1. Layout Options

#### Option A: "The Triage Card" (Recommended)
```
┌─────────────────────────────────────────────────────────┐
│  Queue (12)        [Filter ▾]  [Batch Mode]  [Settings]│
├───────┬─────────────────────────────────────────────────┤
│       │  ┌───────────────────────────────────────────┐ │
│ List  │  │ Alert #12345                    Risk: 85  │ │
│ (3)   │  │ Subject: John Doe                         │ │
│       │  │ Triggered: Velocity Mismatch + Phantom    │ │
│ ┌───┐ │  ├───────────────────────────────────────────┤ │
│ │ 1 │ │  │ [Evidence] [Graph] [AI Reasoning]         │ │
│ └───┘ │  │                                           │ │
│ ┌───┐ │  │ [Evidence content area]                   │ │
│ │ 2 │ │  │                                           │ │
│ └───┘ │  └───────────────────────────────────────────┘ │
│ ┌───┐ │  ┌───────────────────────────────────────────┐ │
│ │ 3 │ │  │ [A] Approve  [R] Reject  [E] Escalate    │ │
│ └───┘ │  │ Confidence: ○ Low ◉ Medium ○ High        │ │
│       │  │ Comment: [Optional note...]               │ │
└───────┴──┴───────────────────────────────────────────────┘
```

**Features:**
- Compact alert list on left (shows 3-5 alerts)
- Large center card for current alert
- Quick action buttons with keyboard shortcuts
- Minimal context switching

#### Option B: "The Deep Dive"
```
┌─────────────────────────────────────────────────────────┐
│  Alert #12345 - John Doe                     Risk: 85  │
│  Triggered: Velocity Mismatch + Phantom Expense         │
├─────────────────────┬───────────────────────────────────┤
│  Transaction History│  Evidence & AI Reasoning          │
│  [Timeline graph]   │  ┌─────────────────────────────┐ │
│                     │  │ Document #1                 │ │
│  Entity Graph       │  │ [Thumbnail]                 │ │
│  [Network viz]      │  │ Confidence: 92%             │ │
│                     │  └─────────────────────────────┘ │
│                     │  AI Analysis:                    │
│                     │  • Pattern detected...           │
├─────────────────────┴───────────────────────────────────┤
│  Decision: ○ Approve ○ Reject ○ Escalate               │
│  Confidence: ○ Low ○ Medium ○ High                     │
│  Comment: [Required for Reject/Escalate]               │
│  [Submit Decision]                                      │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Full-screen alert view
- Split view with transaction history and evidence
- Detailed AI reasoning
- Required comments for certain decisions

**Recommendation:** Use **Option A** for primary workflow, with Option B available as "Detailed View" mode.

### 2. Alert Card Design

#### Compact List Item (Left Sidebar)
```css
backdrop-blur-md 
bg-white/5 dark:bg-slate-800/10
border-l-4 border-purple-500 /* Risk-based color */
hover:bg-white/10 dark:hover:bg-slate-800/20
transition-all duration-200
```

**Content:**
- Alert ID (small, muted)
- Subject name (bold)
- Risk score (numeric + color indicator)
- Triggered rules (icons or short text)
- Time in queue (relative time)

#### Main Alert Card (Center)
```css
backdrop-blur-xl 
bg-white/10 dark:bg-slate-900/20
border border-white/20 dark:border-slate-700/30
shadow-2xl shadow-purple-500/10
rounded-2xl
```

**Sections:**
- **Header:** Alert ID, Subject, Risk Score, Priority badge
- **Trigger Summary:** List of triggered rules with icons
- **Tabs:** Evidence, Graph, AI Reasoning, History
- **Footer:** Decision buttons and confidence selector

### 3. Decision Interface

#### Action Buttons
- **Approve:** Green button with checkmark icon
  - Keyboard: `A`
  - Styling: `bg-green-500/20 hover:bg-green-500/30 border-green-400/50`
- **Reject:** Red button with X icon
  - Keyboard: `R`
  - Styling: `bg-red-500/20 hover:bg-red-500/30 border-red-400/50`
- **Escalate:** Orange button with alert icon
  - Keyboard: `E`
  - Styling: `bg-orange-500/20 hover:bg-orange-500/30 border-orange-400/50`

#### Confidence Selector
- **Radio Buttons:** Low, Medium, High
- **Visual:** Glassmorphism radio group
- **Required:** Must select before submitting
- **Styling:** Active state with glow effect

#### Comment Field
- **Optional for Approve:** Comment is optional
- **Required for Reject/Escalate:** Must provide reason
- **Styling:** Glassmorphism textarea with character count
- **Validation:** Real-time validation with error messages

### 4. Context Panels

#### Evidence Tab
- **Document List:** Grid or list of evidence files
- **Thumbnail Previews:** Images and PDF previews
- **Quick View:** Click to expand in modal
- **Metadata:** File type, upload date, source
- **Styling:** Glassmorphism cards with hover effects

#### Graph Tab
- **Entity Network:** Interactive graph visualization
- **Zoom/Pan:** Mouse controls for navigation
- **Node Details:** Click nodes for details
- **Export:** Save graph as image
- **Styling:** Dark background with glowing edges

#### AI Reasoning Tab
- **Confidence Score:** Large, prominent display
- **Triggered Rules:** List with explanations
- **Pattern Analysis:** AI-generated insights
- **Similar Cases:** Links to related alerts
- **Styling:** Structured layout with icons and badges

#### History Tab
- **Previous Decisions:** Timeline of past decisions on this subject
- **Decision Maker:** User who made decision
- **Outcome:** Result of decision
- **Notes:** Comments from previous analysts
- **Styling:** Timeline layout with glassmorphism cards

### 5. Keyboard Shortcuts

#### Navigation
- `↑` / `↓` - Navigate alert list
- `Enter` - Open selected alert
- `Esc` - Close modals / Clear selection
- `/` - Focus search

#### Actions
- `A` - Approve alert
- `R` - Reject alert
- `E` - Escalate alert
- `N` - Next alert (auto-advance)
- `P` - Previous alert
- `Cmd/Ctrl + Z` - Undo last decision

#### Tabs
- `1` - Evidence tab
- `2` - Graph tab
- `3` - AI Reasoning tab
- `4` - History tab

### 6. Glassmorphism Implementation

#### Queue Container
```css
backdrop-blur-lg 
bg-white/5 dark:bg-slate-800/10
border border-white/10 dark:border-slate-700/20
shadow-xl shadow-blue-500/5
rounded-2xl
```

#### Alert List Item (Active)
```css
backdrop-blur-md 
bg-white/15 dark:bg-slate-800/25
border-l-4 border-purple-500
shadow-lg shadow-purple-500/20
```

#### Decision Button
```css
backdrop-blur-sm 
bg-green-500/20 dark:bg-green-500/20
border border-green-400/50
hover:bg-green-500/30
hover:shadow-lg hover:shadow-green-500/30
transition-all duration-200
```

#### Context Panel
```css
backdrop-blur-lg 
bg-white/5 dark:bg-slate-800/10
border border-white/10 dark:border-slate-700/20
rounded-xl
```

### 7. Animation Specifications

#### Alert Card Entrance
- **Type:** Slide in from right
- **Duration:** 300ms
- **Easing:** `ease-out`

#### Decision Submission
- **Type:** Scale down + fade out
- **Duration:** 400ms
- **Easing:** `ease-in`
- **Next Alert:** Slide in from right after current exits

#### List Item Selection
- **Type:** Background fade + border glow
- **Duration:** 150ms
- **Easing:** `ease-in-out`

#### Tab Switch
- **Type:** Fade out/in
- **Duration:** 200ms
- **Easing:** `ease-in-out`

#### Button Hover
- **Type:** Scale + glow
- **Duration:** 100ms
- **Easing:** `ease-in-out`

## Technical Implementation

### Components Structure

```
frontend/src/
├── components/
│   └── adjudication/
│       ├── AdjudicationQueue.tsx (enhanced)
│       ├── AlertList.tsx (new)
│       ├── AlertCard.tsx (new)
│       ├── AlertHeader.tsx (new)
│       ├── DecisionPanel.tsx (new)
│       ├── ConfidenceSelector.tsx (new)
│       ├── EvidenceTab.tsx (new)
│       ├── GraphTab.tsx (new)
│       ├── AIReasoningTab.tsx (new)
│       ├── HistoryTab.tsx (new)
│       └── KeyboardShortcuts.tsx (new)
└── pages/
    └── AdjudicationQueue.tsx (enhanced)
```

### Dependencies
Required dependencies (most already installed):
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `react-query` or `swr` - Data fetching
- `react-hotkeys-hook` - Keyboard shortcuts
- `react-force-graph` or `vis-network` - Graph visualization

### API Integration

#### Endpoints
- `GET /api/v1/adjudication/queue` - Get pending alerts
- `GET /api/v1/adjudication/{id}` - Get alert details
- `POST /api/v1/adjudication/{id}/decision` - Submit decision
- `PUT /api/v1/adjudication/{id}/undo` - Undo decision
- `GET /api/v1/adjudication/history` - Get decision history

#### WebSocket Events
- `alert_added` - New alert in queue
- `alert_assigned` - Alert assigned to user
- `alert_resolved` - Alert processed by another user
- `queue_updated` - Queue count changed

### State Management
- **Queue State:** List of pending alerts
- **Current Alert:** Selected alert details
- **Decision State:** Form state for decision
- **UI State:** Active tab, shortcuts enabled
- **WebSocket State:** Real-time queue updates

## Accessibility Requirements

### ARIA Labels
- All buttons must have descriptive labels
- Alert list must have proper list semantics
- Decision form must have proper form semantics
- Loading states must be announced

### Keyboard Navigation
- Full keyboard support for all actions
- Focus management for modals
- Keyboard shortcut hints visible
- Focus trap in decision panel

### Screen Reader Support
- Alert details clearly announced
- Decision options clearly described
- Confidence levels announced
- Submission feedback announced

### Color Contrast
- All text meets WCAG 2.1 AA (4.5:1)
- Decision buttons distinguishable
- Focus indicators clearly visible

## Implementation Checklist

### Phase 1: Queue List View
- [ ] Create alert list component
- [ ] Implement alert card (compact)
- [ ] Add risk color coding
- [ ] Apply glassmorphism styling
- [ ] Add selection state

### Phase 2: Main Alert Card
- [ ] Create main alert card component
- [ ] Implement header section
- [ ] Add trigger summary
- [ ] Apply glassmorphism styling
- [ ] Add animations

### Phase 3: Decision Interface
- [ ] Create decision panel component
- [ ] Implement action buttons
- [ ] Add confidence selector
- [ ] Add comment field
- [ ] Add validation logic

### Phase 4: Context Tabs
- [ ] Implement Evidence tab
- [ ] Implement Graph tab
- [ ] Implement AI Reasoning tab
- [ ] Implement History tab
- [ ] Add tab switching animations

### Phase 5: Keyboard Shortcuts
- [ ] Implement navigation shortcuts
- [ ] Implement action shortcuts
- [ ] Implement tab shortcuts
- [ ] Add shortcut hints overlay
- [ ] Add keyboard focus management

### Phase 6: Real-time Updates
- [ ] Integrate WebSocket for queue updates
- [ ] Add new alert notifications
- [ ] Implement optimistic updates
- [ ] Add error handling

### Phase 7: Advanced Features
- [ ] Implement batch mode
- [ ] Add undo functionality
- [ ] Add filter options
- [ ] Add queue statistics
- [ ] Add decision history view

### Phase 8: Accessibility
- [ ] Add ARIA labels
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Verify color contrast
- [ ] Add focus indicators

## Testing Considerations

### Functional Testing
- Test alert loading and navigation
- Verify decision submission
- Test keyboard shortcuts
- Verify validation logic
- Test real-time updates
- Verify undo functionality

### Visual Testing
- Verify glassmorphism effects
- Test animations and transitions
- Check responsive layouts
- Verify color coding
- Test hover effects

### Performance Testing
- Test with large queues (100+ alerts)
- Verify keyboard shortcut responsiveness
- Check animation performance
- Test WebSocket update frequency

### Accessibility Testing
- Test with screen readers
- Verify keyboard navigation
- Check ARIA announcements
- Verify color contrast

## Future Enhancements

### Potential Additions
- **Auto-Assignment:** Intelligent alert routing to analysts
- **SLA Tracking:** Time-based alerts for queue items
- **Bulk Import:** Import decisions from CSV
- **Analytics Dashboard:** Decision metrics and trends
- **Collaboration:** Multi-analyst review for high-risk alerts
- **Training Mode:** Practice mode with historical alerts
- **Mobile App:** Mobile-optimized adjudication interface
- **Voice Commands:** Voice-activated decisions

### Advanced Features
- **AI Assistance:** Suggested decisions based on patterns
- **Confidence Calibration:** Track analyst accuracy over time
- **Decision Templates:** Pre-filled comments for common scenarios
- **Custom Workflows:** Configurable decision flows
- **Integration:** Export decisions to external systems

## References

### Related Documents
- [UI Design Proposals](./04_ui_design_proposals.md) - General UI design guidelines
- [Case Management Design](./13_case_management_design_orchestration.md) - Case management patterns
- [Dashboard Design](./12_dashboard_page_design_orchestration.md) - Dashboard patterns
- [System Architecture](./01_system_architecture.md) - Overall system structure

### External Resources
- [React Hotkeys Hook](https://react-hotkeys-hook.vercel.app/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Vis Network](https://visjs.github.io/vis-network/docs/network/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Implementation Status
**Status:** Pending
**Date:** 2025-12-04

This design orchestration document is ready for implementation.
