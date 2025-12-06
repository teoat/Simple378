# Frontend Development Guidelines & Best Practices
**Date:** 2025-12-04  
**Purpose:** Comprehensive documentation for frontend development standards

---

## Table of Contents
1. [Testing Guidelines](#testing-guidelines)
2. [Performance Optimization](#performance-optimization)
3. [Edge Case Handling](#edge-case-handling)
4. [Keyboard Shortcut Standards](#keyboard-shortcut-standards)
5. [ARIA and Accessibility](#aria-and-accessibility)
6. [Focus Management](#focus-management)
7. [Glassmorphism Standards](#glassmorphism-standards)
8. [Animation Complexity](#animation-complexity)

---

## Testing Guidelines

### Unit Testing
**Framework:** Vitest + React Testing Library

#### Component Testing Standards
```typescript
// Example: Testing a glassmorphism component
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('should render with glassmorphism styling', () => {
    render(<StatCard title="Test" value={100} icon={Icon} />);
    const card = screen.getByText('Test').closest('div');
    expect(card).toHaveClass('backdrop-blur-xl');
  });

  it('should animate on value change', async () => {
    const { rerender } = render(<StatCard title="Test" value={100} icon={Icon} />);
    rerender(<StatCard title="Test" value={200} icon={Icon} />);
    // Assert animation triggered
  });
});
```

#### Integration Testing
```typescript
// Example: Testing keyboard shortcuts
import { renderHook } from '@testing-library/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { fireEvent } from '@testing-library/react';

test('keyboard shortcut triggers action', () => {
  const mockAction = vi.fn();
  renderHook(() => useHotkeys('a', mockAction));
  
  fireEvent.keyDown(document, { key: 'a' });
  expect(mockAction).toHaveBeenCalled();
});
```

#### E2E Testing Critical Flows
**Framework:** Playwright

**Critical Flows to Test:**
1. **Login Flow**
   - Valid credentials → Dashboard
   - Invalid credentials → Error message
   - Password visibility toggle
   
2. **Adjudication Flow**
   - Alert selection
   - Decision submission (A/R/E keys)
   - Navigation (arrow keys)
   - Real-time updates

3. **Case Management Flow**
   - Search with `/` shortcut
   - Case detail navigation
   - Tab switching

```typescript
// Example: E2E test for adjudication
test('complete adjudication flow', async ({ page }) => {
  await page.goto('/adjudication');
  
  // Wait for alerts to load
  await page.waitForSelector('[data-testid="alert-card"]');
  
  // Test keyboard shortcut
  await page.keyboard.press('a');
  
  // Verify decision submitted
  await expect(page.locator('.toast')).toContainText('Approved');
});
```

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const EntityGraph = lazy(() => import('./components/visualizations/EntityGraph'));
const FinancialSankey = lazy(() => import('./components/visualizations/FinancialSankey'));

// Usage with Suspense
<Suspense fallback={<GraphSkeleton />}>
  <EntityGraph />
</Suspense>
```

### Virtualization for Large Lists
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function CaseList({ cases }: { cases: Case[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: cases.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <CaseRow case={cases[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Image Optimization
```typescript
// Use native lazy loading
<img src={url} loading="lazy" alt="Evidence file" />

// Responsive images
<img
  src={url}
  srcSet={`${url}?w=400 400w, ${url}?w=800 800w, ${url}?w=1200 1200w`}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Evidence"
/>
```

### Memoization
```typescript
// Memoize expensive calculations
const sortedCases = useMemo(() => {
  return cases.sort((a, b) => b.risk_score - a.risk_score);
}, [cases]);

// Memoize callbacks
const handleDecision = useCallback((decision: string) => {
  submitDecisionMutation.mutate({ analysisId, decision });
}, [analysisId, submitDecisionMutation]);
```

---

## Edge Case Handling

### Network Errors
```typescript
function Component() {
  const { data, isError, error, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isError) {
    return (
      <ErrorBoundary>
        <div className="error-container">
          <p>Failed to load data: {error.message}</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      </ErrorBoundary>
    );
  }
}
```

### Empty States
```typescript
// Comprehensive empty state
if (!data || data.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <EmptyIcon className="w-16 h-16 text-slate-400 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        No alerts found
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
        There are no pending alerts to review
      </p>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
        Refresh
      </button>
    </div>
  );
}
```

### Concurrency  Issues
```typescript
// Prevent duplicate submissions
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return;
  
  setIsSubmitting(true);
  try {
    await submitData();
  } finally {
    setIsSubmitting(false);
  }
};
```

### Race Conditions
```typescript
// Cancel previous requests
const abortControllerRef = useRef<AbortController>();

useEffect(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = new AbortController();
  
  fetch(url, { signal: abortControllerRef.current.signal })
    .then(handleResponse)
    .catch((err) => {
      if (err.name !== 'AbortError') {
        handleError(err);
      }
    });
    
  return () => abortControllerRef.current?.abort();
}, [url]);
```

---

## Keyboard Shortcut Standards

### Global Application Shortcuts
```typescript
// Standard shortcuts across all pages
const GLOBAL_SHORTCUTS = {
  'ctrl+k': 'Open command palette',
  '?': 'Show help/shortcuts',
  'esc': 'Close modal/clear search',
};
```

### Page-Specific Shortcuts
```typescript
// Adjudication Queue
const ADJUDICATION_SHORTCUTS = {
  'a': 'Approve alert',
  'r': 'Reject alert',
  'e': 'Escalate alert',
  'j': 'Next alert',
  'k': 'Previous alert',
  'arrowdown': 'Next alert',
  'arrowup': 'Previous alert',
};

// Case List
const CASE_LIST_SHORTCUTS = {
  '/': 'Focus search',
  'n': 'New case',
  'r': 'Refresh list',
};

// Dashboard
const DASHBOARD_SHORTCUTS = {
  '1-4': 'Navigate to stat card',
  'r': 'Refresh data',
  'e': 'Export dashboard',
};
```

### Implementation Pattern
```typescript
import { useHotkeys } from 'react-hotkeys-hook';

function Component() {
  // Single action shortcut
  useHotkeys('a', () => handleAction(), { enabled: canPerformAction });
  
  // Multiple shortcuts for same action
  useHotkeys('arrowdown, j', navigateNext);
  
  // With options
  useHotkeys('/', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  }, { enableOnFormTags: false });
  
  // Show help overlay
  useHotkeys('shift+?', showShortcutsHelp);
}
```

### Visual Hints
```typescript
// Keyboard shortcut hint component
function KeyboardHint({ shortcut, label }: Props) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
        {shortcut}
      </kbd>
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
}
```

---

## ARIA and Accessibility

### Complete ARIA Implementation Pattern
```typescript
// Button with proper ARIA
<button
  aria-label="Approve case"
  aria-describedby="approve-help-text"
  aria-pressed={isApproved}
  onClick={handleApprove}
>
  Approve
</button>
<span id="approve-help-text" className="sr-only">
  Keyboard shortcut: A
</span>

// Form with error linking
<input
  id="email"
  aria-label="Email address"
  aria-describedby={emailError ? "email-error" : undefined}
  aria-invalid={!!emailError}
/>
{emailError && (
  <p id="email-error" className="text-red-500" role="alert">
    {emailError}
  </p>
)}

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {alertCount} new alerts
</div>
```

### Chart Accessibility
```typescript
// Accessible chart implementation
<div
  role="img"
  aria-label={`Bar chart showing ${data.length} risk categories. ${highRiskCount} cases are high risk.`}
>
  <BarChart data={data} />
  
  {/* Screen reader table alternative */}
  <table className="sr-only">
    <caption>Risk Distribution Data</caption>
    <thead>
      <tr>
        <th>Risk Level</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      {data.map(item => (
        <tr key={item.id}>
          <td>{item.riskLevel}</td>
          <td>{item.count}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## Focus Management

### Modal Focus Trap
```typescript
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    }

    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
```

### Focus Indicators
```css
/* Custom focus indicators */
.focus-visible:focus {
  outline: 2px solid theme('colors.blue.500');
  outline-offset: 2px;
}

/* Remove default outline, add custom ring */
button:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: theme('colors.blue.500');
  ring-offset: 2px;
}
```

---

## Glassmorphism Standards

### Tier 1: Premium Glassmorphism
**Use for:** Primary cards, modals, featured sections
```css
.premium-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    0 0 1px 0 rgba(255, 255, 255, 0.5) inset;
}
```

### Tier 2: Standard Glassmorphism
**Use for:** Cards, panels, secondary elements
```css
.standard-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.1);
}
```

### Tier 3: Subtle Glassmorphism
**Use for:** Overlays, tooltips, subtle backgrounds
```css
.subtle-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### Implementation Example
```typescript
// Consistent glassmorphism component
function GlassCard({ tier = 'standard', children, className }: Props) {
  const glassClasses = {
    premium: 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-purple-500/20',
    standard: 'bg-white/5 backdrop-blur-lg border-white/10 shadow-xl',
    subtle: 'bg-white/3 backdrop-blur-md border-white/5 shadow-lg',
  };

  return (
    <div className={cn(glassClasses[tier], 'rounded-2xl', className)}>
      {children}
    </div>
  );
}
```

---

##Animation Complexity

### Level 1: Simple Animations
**Use for:** Basic transitions, hover states
```typescript
// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
>
```

### Level 2: Moderate Animations
**Use for:** Page transitions, card interactions
```typescript
// Slide + fade
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
```

### Level 3: Complex Animations
**Use for:** Featured interactions, special effects
```typescript
// Pulse with shadow
const pulseControls = useAnimation();

pulseControls.start({
  scale: [1, 1.05, 1],
  boxShadow: [
    '0 25px 50px -12px rgba(139, 92, 246, 0.1)',
    '0 25px 50px -12px rgba(139, 92, 246, 0.3)',
    '0 25px 50px -12px rgba(139, 92, 246, 0.1)',
  ],
  transition: { duration: 0.6, ease: 'easeInOut' }
});
```

### Stagger Animations
```typescript
function AnimatedList({ items }: Props) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## Conclusion

These guidelines ensure consistency across the Simple378 frontend application. All new features should follow these patterns to maintain code quality, accessibility, and user experience standards.

**Last Updated:** 2025-12-04  
**Maintained By:** Frontend Team  
**Review Schedule:** Quarterly
