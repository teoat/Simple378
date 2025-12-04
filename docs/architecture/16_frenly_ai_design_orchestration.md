# Frenly AI Meta Agent Design Orchestration

## Overview
This document outlines the design orchestration for "Frenly AI", a meta agent that serves as an intelligent, contextual assistant available at the top right of all authenticated pages (excluding authentication pages). Frenly AI provides proactive suggestions, contextual help, workflow guidance, and integrates with the existing AIAssistant for deeper conversations. It acts as the primary entry point for AI assistance throughout the application.

## Current State Analysis

### Existing Implementation
- **Location:** `frontend/src/components/ai/AIAssistant.tsx`
- **Current Features:**
  - Floating button in bottom-right corner
  - Basic chat interface
  - Integration with `/ai/chat` API endpoint
  - Simple message history
  - Fixed-size chat window (380px × 500px)
- **Current Behavior:**
  - Only visible when opened
  - No contextual awareness
  - No proactive suggestions
  - Generic chat interface
  - Always in bottom-right corner

### Gaps Identified
- No contextual awareness of current page or user workflow
- No proactive suggestions or alerts
- No workflow guidance or tips
- Fixed position in bottom-right (not top-right)
- No integration with page-specific actions
- Basic UI without glassmorphism or premium styling
- No quick action shortcuts
- No awareness of user's current tasks or priorities

## Design Goals

### 1. Positioning and Visibility
- **Top-Right Placement:** Floating button in top-right corner, accessible on all authenticated pages
- **Persistent Presence:** Always visible but unobtrusive when minimized
- **Page-Aware:** Adapts behavior and suggestions based on current page context
- **Exclusion:** Not shown on authentication pages (Login, etc.)

### 2. Contextual Intelligence
- **Page Awareness:** Understands current page context (Dashboard, Case Detail, Adjudication Queue, etc.)
- **Proactive Suggestions:** Provides timely, relevant suggestions based on user workflow
- **Workflow Guidance:** Offers tips and guidance for current tasks
- **Task Awareness:** Understands user's current priorities and pending tasks

### 3. User Experience
- **Quick Access:** Minimal click distance to access AI assistance
- **Seamless Integration:** Opens full AIAssistant component for deeper conversations
- **Glassmorphism Design:** Premium visual design consistent with application theme
- **Smooth Animations:** Polished transitions and micro-interactions

### 4. Functionality
- **Quick Tips:** Contextual tips and suggestions in collapsed state
- **Proactive Alerts:** Important notifications (e.g., "3 high-priority cases need review")
- **Quick Actions:** Fast shortcuts to common tasks
- **Full Chat:** Integration with existing AIAssistant for extended conversations

## Design Specifications

### 1. Component Structure

#### FrenlyAI Component (New)
- **Location:** `frontend/src/components/ai/FrenlyAI.tsx`
- **Role:** Meta agent wrapper that provides contextual intelligence and quick access
- **Integration:** Wraps or integrates with existing `AIAssistant` component

#### Component Hierarchy
```
FrenlyAI (new)
├── FrenlyAIButton (collapsed state)
│   ├── Avatar/Icon
│   ├── Notification Badge (for proactive alerts)
│   └── Pulse Animation (for new suggestions)
├── FrenlyAIPanel (expanded state - quick view)
│   ├── Contextual Header
│   ├── Proactive Suggestions
│   ├── Quick Actions
│   └── "Open Full Chat" Button
└── AIAssistant (existing - full chat interface)
```

### 2. Positioning and Layout

#### Floating Button (Collapsed State)
- **Position:** `fixed top-6 right-6 z-50`
- **Size:** 56px × 56px (desktop), 48px × 48px (mobile)
- **Appearance:**
  - Circular button with glassmorphism
  - AI avatar/icon with subtle glow
  - Notification badge for alerts (top-right corner of button)
  - Pulse animation when new suggestions available
- **Responsive:**
  - Desktop: `top-6 right-6`
  - Tablet: `top-4 right-4`
  - Mobile: `top-4 right-4` (smaller size)

#### Expanded Panel (Quick View)
- **Position:** Fixed, anchored to top-right
- **Size:** 320px × auto (max-height: 600px)
- **Location:** Below the button, aligned to right edge
- **Layout:**
  - Contextual header with page name
  - Scrollable content area
  - Actions footer

#### Full Chat Window
- **Integration:** Uses existing `AIAssistant` component
- **Trigger:** "Open Full Chat" button in expanded panel
- **Behavior:** Replaces quick view with full chat interface

### 3. Glassmorphism Implementation

#### Floating Button
- **Backdrop Blur:** `backdrop-blur-xl` (24px blur)
- **Background:** 
  - Light mode: `bg-gradient-to-br from-purple-500/20 to-cyan-500/20` with `backdrop-blur-xl`
  - Dark mode: `bg-gradient-to-br from-purple-500/30 to-cyan-500/30` with `backdrop-blur-xl`
- **Border:** 
  - `border border-purple-400/30 dark:border-cyan-400/30`
  - Optional: Animated gradient border
- **Shadow:** `shadow-2xl shadow-purple-500/20 dark:shadow-cyan-500/20`
- **Glow Effect:** Subtle pulsing glow for attention

#### Expanded Panel
- **Backdrop Blur:** `backdrop-blur-xl`
- **Background:**
  - Light mode: `bg-white/10` with `backdrop-blur-xl`
  - Dark mode: `bg-slate-900/20` with `backdrop-blur-xl`
- **Border:** `border border-white/20 dark:border-slate-700/30`
- **Shadow:** `shadow-2xl shadow-purple-500/10 dark:shadow-cyan-500/10`
- **Rounded Corners:** `rounded-2xl`

#### Notification Badge
- **Position:** Absolute, top-right corner of button
- **Size:** 20px × 20px
- **Style:** 
  - `bg-red-500` with glow effect
  - White text/number
  - Pulsing animation when new

### 4. Contextual Intelligence

#### Page-Specific Contexts

##### Dashboard Page
- **Suggestions:**
  - "You have 5 high-priority cases that need attention"
  - "Weekly activity shows a 20% increase in alerts"
  - "3 cases are awaiting your review"
- **Quick Actions:**
  - "Start new investigation"
  - "Review pending cases"
  - "View system health"

##### Case Detail Page
- **Suggestions:**
  - "This case has 12 related transactions"
  - "Risk score increased 15 points this week"
  - "Similar cases suggest potential structuring pattern"
- **Quick Actions:**
  - "Run deep analysis"
  - "View entity graph"
  - "Generate report"

##### Adjudication Queue Page
- **Suggestions:**
  - "You have 8 alerts in queue"
  - "Average review time: 3 minutes per alert"
  - "2 alerts match known fraud patterns"
- **Quick Actions:**
  - "Review next alert"
  - "Batch approve low-risk alerts"
  - "Request additional context"

##### Case List Page
- **Suggestions:**
  - "Your search returned 45 results"
  - "12 cases match your filter criteria"
  - "3 cases updated in the last hour"
- **Quick Actions:**
  - "Create new case"
  - "Apply common filters"
  - "Export results"

##### Reconciliation Page
- **Suggestions:**
  - "5 transactions need manual matching"
  - "Auto-match confidence: 87%"
  - "3 variances exceed threshold"
- **Quick Actions:**
  - "Run auto-reconciliation"
  - "Review variances"
  - "Export reconciliation report"

##### Forensics Page
- **Suggestions:**
  - "Last upload processed successfully"
  - "2 documents awaiting analysis"
  - "Upload supports PDF, CSV, and images"
- **Quick Actions:**
  - "Upload new files"
  - "View processing queue"
  - "Check analysis results"

### 5. Proactive Suggestions

#### Suggestion Types
1. **Task Reminders:**
   - Pending tasks requiring attention
   - Overdue items
   - High-priority alerts

2. **Trend Alerts:**
   - Significant changes in metrics
   - Pattern detection
   - Anomaly warnings

3. **Workflow Tips:**
   - Best practices for current page
   - Keyboard shortcuts
   - Efficiency suggestions

4. **Contextual Insights:**
   - Related information
   - Suggested next steps
   - Relevant data points

#### Suggestion Display
- **Card Format:** Each suggestion in a glassmorphism card
- **Visual Hierarchy:** Icons, titles, and brief descriptions
- **Actions:** Clickable to expand or execute action
- **Animation:** Fade in with stagger effect

### 6. Quick Actions

#### Action Types
- **Page-Specific Actions:** Actions relevant to current page
- **Global Actions:** Common actions available anywhere
- **Navigation Actions:** Quick links to related pages

#### Action Display
- **Button Format:** Glassmorphism buttons with icons
- **Grid Layout:** 2 columns for actions
- **Hover Effects:** Scale and glow animations
- **Click Behavior:** Execute action or navigate

### 7. Integration with AIAssistant

#### Entry Point
- **Button:** "Open Full Chat" button in expanded panel
- **Transition:** Smooth animation to full chat interface
- **Context Preservation:** Pass current page context to chat

#### Context Passing
- **Page Context:** Current page/route information
- **Entity Context:** Current case/subject ID (if applicable)
- **User Intent:** User's current task or goal

#### Chat Enhancement
- **Contextual Prompt:** Pre-fill with context if available
- **Suggested Questions:** Show contextual question prompts
- **Quick Responses:** Suggested responses based on context

### 8. Notification Badge

#### Display Logic
- **Show When:**
  - New proactive suggestions available
  - Important alerts requiring attention
  - Pending tasks count
- **Hide When:**
  - No pending notifications
  - User has dismissed all suggestions

#### Badge Content
- **Number:** Count of pending items (1-99, "99+" for more)
- **Dot:** Simple indicator when no specific count

### 9. Animations and Transitions

#### Button States
- **Idle:** Subtle glow pulse
- **Hover:** Scale to 1.1, enhanced glow
- **Active:** Scale to 0.95, brief flash
- **Notification Pulse:** Periodic pulse when new items

#### Panel Transitions
- **Open:** Slide down + fade in from top-right
- **Close:** Slide up + fade out to top-right
- **Duration:** 300ms with ease-out easing

#### Suggestion Animations
- **Entrance:** Fade in + slide up (staggered)
- **Hover:** Scale to 1.02, subtle glow
- **Dismiss:** Fade out + scale down

### 10. Responsive Design

#### Desktop (> 1024px)
- **Button Position:** `top-6 right-6`
- **Button Size:** 56px × 56px
- **Panel Width:** 320px
- **Panel Max Height:** 600px

#### Tablet (640px - 1024px)
- **Button Position:** `top-4 right-4`
- **Button Size:** 48px × 48px
- **Panel Width:** 300px
- **Panel Max Height:** 500px

#### Mobile (< 640px)
- **Button Position:** `top-4 right-4`
- **Button Size:** 44px × 44px
- **Panel Width:** Full width minus margins (280px max)
- **Panel Max Height:** 400px
- **Full Chat:** Full screen overlay

## Technical Implementation

### Components Structure

```
frontend/src/
├── components/
│   └── ai/
│       ├── FrenlyAI.tsx (new - main component)
│       ├── FrenlyAIButton.tsx (new - collapsed button)
│       ├── FrenlyAIPanel.tsx (new - expanded quick view)
│       ├── ContextualSuggestions.tsx (new - suggestions display)
│       ├── QuickActions.tsx (new - action buttons)
│       ├── AIAssistant.tsx (existing - full chat, enhanced)
│       └── hooks/
│           └── useFrenlyAIContext.ts (new - context detection)
```

### Dependencies
All required dependencies are already installed:
- `framer-motion` - For animations
- `lucide-react` - For icons
- `react-router-dom` - For route detection
- `@tanstack/react-query` - For data fetching
- `tailwindcss` - For styling

### API Integration

#### New Endpoints (To Be Implemented)
- `GET /api/v1/ai/suggestions` - Get contextual suggestions
  - Query params: `page`, `entity_id` (optional)
  - Response: List of suggestions with actions
  
- `GET /api/v1/ai/context/{page}` - Get page-specific context
  - Response: Contextual data for current page

#### Existing Endpoints
- `POST /api/v1/ai/chat` - Chat message endpoint (existing)
- `GET /api/v1/ai/investigate/{subject_id}` - Investigation endpoint (existing)

### Context Detection Hook

```typescript
// frontend/src/components/ai/hooks/useFrenlyAIContext.ts
export function useFrenlyAIContext() {
  const location = useLocation();
  const { id } = useParams();
  
  return {
    currentPage: detectPageFromRoute(location.pathname),
    entityId: id,
    routeParams: useParams(),
    // ... other context data
  };
}
```

### CSS Classes Reference

#### Glassmorphism Button
```css
backdrop-blur-xl
bg-gradient-to-br from-purple-500/20 to-cyan-500/20 dark:from-purple-500/30 dark:to-cyan-500/30
border border-purple-400/30 dark:border-cyan-400/30
shadow-2xl shadow-purple-500/20 dark:shadow-cyan-500/20
rounded-full
hover:scale-110
transition-all duration-300
```

#### Glassmorphism Panel
```css
backdrop-blur-xl
bg-white/10 dark:bg-slate-900/20
border border-white/20 dark:border-slate-700/30
shadow-2xl shadow-purple-500/10 dark:shadow-cyan-500/10
rounded-2xl
```

#### Suggestion Card
```css
backdrop-blur-lg
bg-white/5 dark:bg-slate-800/10
border border-white/10 dark:border-slate-700/20
rounded-xl
hover:scale-[1.02]
hover:border-purple-400/50
transition-all duration-200
```

## Color Scheme

### Primary Colors
- **Primary Purple:** `#8b5cf6` (Purple-500)
- **Primary Cyan:** `#06b6d4` (Cyan-500)
- **Background Overlay:** Semi-transparent with backdrop blur

### Accent Colors
- **Notification Badge:** Red-500 (`#ef4444`)
- **Success:** Green-500 (`#22c55e`)
- **Warning:** Amber-500 (`#f59e0b`)
- **Info:** Blue-500 (`#3b82f6`)

### Gradient Definitions
- **Button Gradient:** `from-purple-500/20 to-cyan-500/20`
- **Glow Effect:** `shadow-purple-500/20 dark:shadow-cyan-500/20`

## Accessibility Requirements

### ARIA Labels
- Button must have descriptive `aria-label` ("Open Frenly AI Assistant")
- Panel must have `role="dialog"` and `aria-label`
- Suggestions must have appropriate ARIA labels
- Notification badge must announce count to screen readers

### Keyboard Navigation
- Tab order: Button → Suggestions → Quick Actions → Full Chat button
- Enter/Space to open/close panel
- Escape to close panel
- Arrow keys to navigate suggestions (optional)

### Screen Reader Support
- Notification badge count announced
- Suggestions announced when panel opens
- State changes announced (opened/closed)
- Context information provided

### Color Contrast
- All text must meet WCAG 2.1 AA standards (4.5:1)
- Notification badge must have sufficient contrast
- Focus indicators clearly visible

## Implementation Checklist

### Phase 1: Component Foundation
- [ ] Create `FrenlyAI.tsx` main component
- [ ] Create `FrenlyAIButton.tsx` with glassmorphism styling
- [ ] Implement basic open/close state management
- [ ] Add positioning (top-right, fixed)
- [ ] Ensure exclusion from authentication pages

### Phase 2: Context Detection
- [ ] Create `useFrenlyAIContext.ts` hook
- [ ] Implement page detection from routes
- [ ] Extract entity IDs from route params
- [ ] Create context data structure

### Phase 3: Expanded Panel
- [ ] Create `FrenlyAIPanel.tsx` component
- [ ] Implement panel layout with glassmorphism
- [ ] Add contextual header based on current page
- [ ] Implement smooth open/close animations
- [ ] Add responsive sizing

### Phase 4: Contextual Suggestions
- [ ] Create `ContextualSuggestions.tsx` component
- [ ] Implement suggestion card design
- [ ] Add page-specific suggestion logic
- [ ] Implement suggestion fetching (mock initially)
- [ ] Add suggestion animations

### Phase 5: Quick Actions
- [ ] Create `QuickActions.tsx` component
- [ ] Implement action button design
- [ ] Add page-specific actions
- [ ] Implement action handlers
- [ ] Add hover effects

### Phase 6: Notification Badge
- [ ] Implement badge component
- [ ] Add notification counting logic
- [ ] Implement pulse animation
- [ ] Add screen reader announcements
- [ ] Handle badge visibility

### Phase 7: AIAssistant Integration
- [ ] Enhance `AIAssistant.tsx` to accept context
- [ ] Implement "Open Full Chat" button in panel
- [ ] Add context passing to chat interface
- [ ] Implement smooth transition animation
- [ ] Add contextual prompt suggestions

### Phase 8: Proactive Features
- [ ] Implement proactive suggestion detection
- [ ] Add suggestion fetching from API (when available)
- [ ] Create suggestion priority system
- [ ] Implement suggestion dismissal
- [ ] Add suggestion refresh logic

### Phase 9: Backend API (Future)
- [ ] Create `/api/v1/ai/suggestions` endpoint
- [ ] Create `/api/v1/ai/context/{page}` endpoint
- [ ] Implement suggestion generation logic
- [ ] Add context-aware AI responses
- [ ] Create suggestion caching

### Phase 10: Animations and Polish
- [ ] Add button hover animations
- [ ] Implement panel entrance/exit animations
- [ ] Add suggestion stagger animations
- [ ] Implement notification pulse animation
- [ ] Optimize animation performance

### Phase 11: Accessibility
- [ ] Add ARIA labels to all components
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Verify color contrast ratios
- [ ] Add focus indicators

### Phase 12: Responsive Design
- [ ] Test desktop layout (> 1024px)
- [ ] Test tablet layout (640px - 1024px)
- [ ] Test mobile layout (< 640px)
- [ ] Adjust sizes and positioning per breakpoint
- [ ] Test touch interactions on mobile

## Testing Considerations

### Functional Testing
- Test button visibility on authenticated pages
- Test button exclusion on authentication pages
- Test panel open/close functionality
- Test context detection across different pages
- Test suggestion display and actions
- Test quick actions execution
- Test AIAssistant integration
- Test notification badge display logic

### Visual Testing
- Verify glassmorphism effects in light/dark mode
- Test animations and transitions
- Verify responsive layouts
- Check visual hierarchy
- Test hover effects

### Performance Testing
- Test animation performance (60fps target)
- Verify no layout shifts on open/close
- Test suggestion loading performance
- Optimize re-renders
- Test with many suggestions

### Accessibility Testing
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test keyboard navigation
- Verify ARIA announcements
- Check color contrast ratios
- Test focus management

### Browser Testing
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

### Advanced Features
- **AI-Powered Suggestions:** Use LLM to generate contextual suggestions
- **Learning System:** Learn from user interactions to improve suggestions
- **Multi-Language Support:** Localized suggestions and interface
- **Customization:** Allow users to configure suggestion preferences
- **Voice Input:** Voice commands for quick actions
- **Keyboard Shortcuts:** Custom shortcuts to open/close and interact

### Integration Enhancements
- **Calendar Integration:** Suggest tasks based on deadlines
- **Notification Integration:** Aggregate all notifications in one place
- **Search Integration:** Quick search from Frenly AI panel
- **Workflow Templates:** Quick access to common workflow templates

### Analytics
- **Usage Tracking:** Track which suggestions are most useful
- **A/B Testing:** Test different suggestion strategies
- **User Feedback:** Allow users to rate suggestions
- **Performance Metrics:** Track response times and user satisfaction

## References

### Related Documents
- [AI Orchestration Spec](./06_ai_orchestration_spec.md) - AI architecture and workflows
- [UI Design Proposals](./04_ui_design_proposals.md) - General UI design guidelines
- [Dashboard Page Design](./12_dashboard_page_design_orchestration.md) - Design patterns reference
- [Authentication Page Design](./11_auth_page_design_orchestration.md) - Page exclusion patterns

### External Resources
- [Glassmorphism Design Guide](https://www.figma.com/community/file/1011914019641886509)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Backdrop Blur](https://tailwindcss.com/docs/backdrop-blur)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

