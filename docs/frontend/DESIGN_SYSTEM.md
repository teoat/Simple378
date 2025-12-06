# Design System - Complete Guide

## Overview
A comprehensive design system for the AntiGravity fraud detection platform ensuring consistency, accessibility, and scalability across all interfaces.

---

## 🎨 Foundation

### Design Principles

#### 1. Clarity Over Complexity
- **Every element should have a clear purpose**
- Remove unnecessary decoration
- Use white space generously
- Progressive disclosure for complex information

#### 2. Consistency is King
- Reusable components across all pages
- Predictable interaction patterns
- Unified visual language
- Consistent naming conventions

#### 3. Accessibility First
- WCAG 2.1 AA minimum standard
- Keyboard navigation for all functions
- Screen reader compatibility
- Sufficient color contrast (4.5:1 for text)
- Motion can be reduced/disabled

#### 4. Performance Matters
- Fast initial load (<2s)
- Smooth 60fps animations
- Optimized images and assets
- Lazy loading for heavy components
- Virtual scrolling for long lists

#### 5. Data-Driven Design
- Show data in context
- Provide actionable insights
- Real-time updates where valuable
- Clear data visualization
- Export capabilities

---

## 🎨 Visual Language

### Color System

#### Primary Palette
```css
/* Blues - Primary brand, CTAs, interactive elements */
--blue-50:  #eff6ff;
--blue-100: #dbeafe;
--blue-200: #bfdbfe;
--blue-300: #93c5fd;
--blue-400: #60a5fa;
--blue-500: #3b82f6;  /* Primary */
--blue-600: #2563eb;  /* Primary hover */
--blue-700: #1d4ed8;
--blue-800: #1e40af;
--blue-900: #1e3a8a;
--blue-950: #172554;
```

#### Semantic Colors
```css
/* Success - Positive actions, confirmations */
--green-50:  #f0fdf4;
--green-100: #dcfce7;
--green-500: #10b981;  /* Success */
--green-600: #059669;  /* Success hover */
--green-900: #14532d;

/* Warning - Caution, needs attention */
--amber-50:  #fffbeb;
--amber-100: #fef3c7;
--amber-500: #f59e0b;  /* Warning */
--amber-600: #d97706;  /* Warning hover */
--amber-900: #78350f;

/* Error - Critical issues, destructive actions */
--red-50:  #fef2f2;
--red-100: #fee2e2;
--red-500: #ef4444;  /* Error */
--red-600: #dc2626;  /* Error hover */
--red-900: #7f1d1d;

/* Info - Informational, neutral highlights */
--cyan-50:  #ecfeff;
--cyan-100: #cffafe;
--cyan-500: #06b6d4;  /* Info */
--cyan-600: #0891b2;  /* Info hover */
--cyan-900: #164e63;

/* Purple - Premium features, AI/ML */
--purple-50:  #faf5ff;
--purple-100: #f3e8ff;
--purple-500: #a855f7;  /* AI/ML */
--purple-600: #9333ea;  /* AI/ML hover */
--purple-900: #581c87;
```

#### Neutral Palette
```css
/* Grays - Text, backgrounds, borders */
--slate-50:  #f8fafc;  /* Lightest bg */
--slate-100: #f1f5f9;  /* Card bg */
--slate-200: #e2e8f0;  /* Border */
--slate-300: #cbd5e1;  /* Border hover */
--slate-400: #94a3b8;  /* Placeholder text */
--slate-500: #64748b;  /* Disabled text */
--slate-600: #475569;  /* Secondary text */
--slate-700: #334155;  /* Body text */
--slate-800: #1e293b;  /* Headings */
--slate-900: #0f172a;  /* Primary text */
--slate-950: #020617;  /* Darkest */
```

#### Usage Guidelines

**Primary Actions:**
```css
.btn-primary {
  background: var(--blue-600);
  color: white;
}
.btn-primary:hover {
  background: var(--blue-700);
}
```

**Destructive Actions:**
```css
.btn-danger {
  background: var(--red-600);
  color: white;
}
.btn-danger:hover {
  background: var(--red-700);
}
```

**Status Indicators:**
```css
.status-success { color: var(--green-600); }
.status-warning { color: var(--amber-600); }
.status-error { color: var(--red-600); }
.status-info { color: var(--cyan-600); }
```

**AI/ML Features:**
```css
.ai-feature {
  background: linear-gradient(135deg, var(--purple-500), var(--blue-500));
  color: white;
}
```

### Typography

#### Font Family
```css
/* Primary font stack */
--font-sans: 'Inter var', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 
             'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;

/* Monospace for code */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 
             'Monaco', 'Courier New', monospace;

/* Tabular numbers for data */
--font-tabular: 'Inter var', system-ui;
font-variant-numeric: tabular-nums;
```

#### Type Scale
```css
/* Display - Hero sections, major headings */
--text-5xl: 64px / 1.0 / -0.02em  /* 64px, tight line-height, tight tracking */
--text-4xl: 56px / 1.1 / -0.02em
--text-3xl: 48px / 1.2 / -0.01em

/* Headings - Section headers */
--text-2xl: 32px / 1.3 / 0
--text-xl:  24px / 1.4 / 0
--text-lg:  18px / 1.5 / 0

/* Body - Primary content */
--text-base: 16px / 1.6 / 0       /* Default */
--text-sm:   14px / 1.6 / 0       /* Secondary */
--text-xs:   12px / 1.5 / 0.01em  /* Captions, labels */
```

#### Font Weights
```css
--font-thin:       100;
--font-light:      300;
--font-regular:    400;  /* Body text */
--font-medium:     500;  /* UI elements */
--font-semibold:   600;  /* Subheadings */
--font-bold:       700;  /* Headings */
--font-extrabold:  800;
--font-black:      900;
```

#### Usage Examples

**Page Title:**
```css
h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
  color: var(--slate-900);
  line-height: 1.2;
}
```

**Section Header:**
```css
h2 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--slate-800);
  line-height: 1.4;
}
```

**Body Text:**
```css
p {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  color: var(--slate-700);
  line-height: 1.6;
}
```

**Caption:**
```css
.caption {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--slate-500);
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
```

### Spacing Scale

#### Base Unit: 4px
```css
--space-0:   0;
--space-px:  1px;
--space-0-5: 2px;   /* 0.5 * 4px */
--space-1:   4px;   /* 1 * 4px */
--space-1-5: 6px;   /* 1.5 * 4px */
--space-2:   8px;   /* 2 * 4px */
--space-3:   12px;  /* 3 * 4px */
--space-4:   16px;  /* 4 * 4px - Base unit */
--space-5:   20px;  /* 5 * 4px */
--space-6:   24px;  /* 6 * 4px */
--space-8:   32px;  /* 8 * 4px */
--space-10:  40px;  /* 10 * 4px */
--space-12:  48px;  /* 12 * 4px */
--space-16:  64px;  /* 16 * 4px */
--space-20:  80px;  /* 20 * 4px */
--space-24:  96px;  /* 24 * 4px */
--space-32:  128px; /* 32 * 4px */
```

#### Usage Guidelines

**Component Padding:**
- Small buttons: `padding: var(--space-2) var(--space-4);` (8px 16px)
- Medium buttons: `padding: var(--space-3) var(--space-6);` (12px 24px)
- Large buttons: `padding: var(--space-4) var(--space-8);` (16px 32px)
- Cards: `padding: var(--space-6);` (24px all sides)
- Modal/Panel: `padding: var(--space-8);` (32px all sides)

**Spacing Between Elements:**
- Tight grouping: `gap: var(--space-2);` (8px)
- Related elements: `gap: var(--space-4);` (16px)
- Sections: `gap: var(--space-8);` (32px)
- Major sections: `gap: var(--space-16);` (64px)

### Border Radius

```css
/* Rounded corners */
--radius-none: 0;
--radius-sm:   4px;   /* Buttons, inputs */
--radius-md:   8px;   /* Cards */
--radius-lg:   12px;  /* Panels */
--radius-xl:   16px;  /* Large containers */
--radius-2xl:  24px;  /* Hero sections */
--radius-3xl:  32px;  /* Extra large */
--radius-full: 9999px; /* Pills, circles */
```

### Shadows & Elevation

#### Shadow Scale
```css
/* Subtle shadows for depth */
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07), 
              0 1px 3px rgba(0, 0, 0, 0.06);
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.10), 
              0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.15), 
              0 10px 10px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);

/* Inner shadow */
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);

/* No shadow */
--shadow-none: 0 0 0 rgba(0, 0, 0, 0);

/* Colored shadows for emphasis */
--shadow-blue:   0 10px 20px rgba(59, 130, 246, 0.20);
--shadow-green:  0 10px 20px rgba(16, 185, 129, 0.20);
--shadow-purple: 0 10px 20px rgba(168, 85, 247, 0.20);
```

#### Elevation Layers
```
Layer 0 (Base):      No shadow - Background
Layer 1 (Raised):    shadow-sm - Cards on surface
Layer 2 (Floating):  shadow-md - Dropdowns, tooltips
Layer 3 (Overlay):   shadow-lg - Modals, drawers
Layer 4 (Highest):   shadow-xl - Notifications
```

#### Usage Examples
```css
.card {
  box-shadow: var(--shadow-md);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.modal {
  box-shadow: var(--shadow-xl);
}

.btn-primary:focus {
  box-shadow: var(--shadow-blue);
}
```

---

## 🧩 Components

### Buttons

#### Variants

**Primary:**
```tsx
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg 
                   hover:bg-blue-700 active:bg-blue-800
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   transition-colors duration-200
                   font-medium text-sm shadow-sm">
  Primary Action
</button>
```

**Secondary:**
```tsx
<button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg
                   hover:bg-slate-200 active:bg-slate-300
                   focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                   transition-colors duration-200
                   font-medium text-sm">
  Secondary Action
</button>
```

**Destructive:**
```tsx
<button className="px-6 py-3 bg-red-600 text-white rounded-lg
                   hover:bg-red-700 active:bg-red-800
                   focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                   transition-colors duration-200
                   font-medium text-sm shadow-sm">
  Delete
</button>
```

**Ghost:**
```tsx
<button className="px-6 py-3 text-slate-700 rounded-lg
                   hover:bg-slate-100 active:bg-slate-200
                   focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                   transition-colors duration-200
                   font-medium text-sm">
  Ghost Action
</button>
```

**Link:**
```tsx
<button className="text-blue-600 hover:text-blue-700 underline
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   transition-colors duration-200
                   font-medium text-sm">
  Link Action
</button>
```

#### Sizes
```tsx
// Small
<button className="px-3 py-1.5 text-xs">Small</button>

// Medium (default)
<button className="px-4 py-2 text-sm">Medium</button>

// Large
<button className="px-6 py-3 text-base">Large</button>

// Extra Large
<button className="px-8 py-4 text-lg">Extra Large</button>
```

#### States
```tsx
// Loading
<button disabled className="opacity-75 cursor-wait">
  <Spinner className="mr-2" />
  Loading...
</button>

// Disabled
<button disabled className="opacity-50 cursor-not-allowed">
  Disabled
</button>

// With Icon
<button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</button>
```

### Inputs

#### Text Input
```tsx
<div className="space-y-1">
  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
    Email Address
  </label>
  <input
    type="email"
    id="email"
    className="w-full px-4 py-2 border border-slate-300 rounded-lg
               focus:ring-2 focus:ring-blue-500 focus:border-transparent
               placeholder:text-slate-400
               disabled:bg-slate-50 disabled:text-slate-500
               transition-colors duration-200"
    placeholder="you@example.com"
  />
  <p className="text-xs text-slate-500">
    We'll never share your email
  </p>
</div>
```

#### With Error
```tsx
<input
  className="w-full px-4 py-2 border border-red-500 rounded-lg
             focus:ring-2 focus:ring-red-500 focus:border-transparent"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" className="text-sm text-red-600 mt-1">
  Please enter a valid email address
</p>
```

#### Select
```tsx
<select className="w-full px-4 py-2 border border-slate-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white">
  <option>Select an option</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

#### Checkbox
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="w-4 h-4 text-blue-600 border-slate-300 rounded
               focus:ring-2 focus:ring-blue-500"
  />
  <span className="text-sm text-slate-700">
    I agree to the terms and conditions
  </span>
</label>
```

#### Radio
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="radio"
    name="option"
    className="w-4 h-4 text-blue-600 border-slate-300
               focus:ring-2 focus:ring-blue-500"
  />
  <span className="text-sm text-slate-700">Option 1</span>
</label>
```

### Cards

#### Basic Card
```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-md p-6">
  <h3 className="text-lg font-semibold text-slate-900 mb-2">
    Card Title
  </h3>
  <p className="text-sm text-slate-600">
    Card content goes here
  </p>
</div>
```

#### Interactive Card
```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-md p-6
                hover:shadow-lg hover:border-blue-200
                transition-all duration-200 cursor-pointer">
  {/* Content */}
</div>
```

#### Card with Header
```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
    <h3 className="text-lg font-semibold text-slate-900">Header</h3>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
  <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
    <button className="text-sm text-blue-600">Action</button>
  </div>
</div>
```

### Badges

```tsx
// Default
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                 text-xs font-medium bg-slate-100 text-slate-800">
  Badge
</span>

// Success
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                 text-xs font-medium bg-green-100 text-green-800">
  Active
</span>

// Warning
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                 text-xs font-medium bg-amber-100 text-amber-800">
  Pending
</span>

// Error
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                 text-xs font-medium bg-red-100 text-red-800">
  Error
</span>

// With icon
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                 text-xs font-medium bg-blue-100 text-blue-800">
  <CheckCircle className="h-3 w-3" />
  Complete
</span>
```

### Alerts

```tsx
// Info
<div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <h4 className="text-sm font-medium text-blue-900">Information</h4>
    <p className="text-sm text-blue-700 mt-1">
      This is an informational message
    </p>
  </div>
  <button className="text-blue-600 hover:text-blue-700">
    <X className="h-4 w-4" />
  </button>
</div>

// Success
<div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <h4 className="text-sm font-medium text-green-900">Success</h4>
    <p className="text-sm text-green-700 mt-1">
      Operation completed successfully
    </p>
  </div>
</div>

// Warning
<div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <h4 className="text-sm font-medium text-amber-900">Warning</h4>
    <p className="text-sm text-amber-700 mt-1">
      Please review before proceeding
    </p>
  </div>
</div>

// Error
<div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <h4 className="text-sm font-medium text-red-900">Error</h4>
    <p className="text-sm text-red-700 mt-1">
      An error occurred. Please try again
    </p>
  </div>
</div>
```

---

## 🎬 Animations

### Transitions

#### Timing Functions
```css
/* Ease functions */
--ease-linear:      cubic-bezier(0, 0, 1, 1);
--ease-in:          cubic-bezier(0.4, 0, 1, 1);
--ease-out:         cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);

/* Custom eases */
--ease-out-expo:    cubic-bezier(0.16, 1, 0.3, 1);     /* Smooth deceleration */
--ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);    /* Circular motion */
--ease-spring:      cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Bounce */
```

#### Duration
```css
--duration-75:   75ms;   /* Instant feedback */
--duration-100:  100ms;  /* Quick transitions */
--duration-150:  150ms;  /* Fast transitions */
--duration-200:  200ms;  /* Standard (default) */
--duration-300:  300ms;  /* Moderate */
--duration-500:  500ms;  /* Slow */
--duration-700:  700ms;  /* Very slow */
--duration-1000: 1000ms; /* Extra slow */
```

#### Common Patterns

**Hover Effect:**
```css
.button {
  transition: all 0.2s var(--ease-out);
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

**Focus Ring:**
```css
.input:focus {
  outline: none;
  ring: 2px solid var(--blue-500);
  ring-offset: 2px;
  transition: ring 0.2s var(--ease-out);
}
```

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s var(--ease-out);
}
```

**Slide In:**
```css
@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.slide-in {
  animation: slideIn 0.4s var(--ease-out-expo);
}
```

### Framer Motion Variants

```typescript
// Page transitions
export const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] // ease-out-expo
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.2 
    }
  }
};

// Stagger children
export const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Modal backdrop
export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Scale in
export const scaleVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { scale: 0.9, opacity: 0 }
};
```

### Motion Preferences

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## ♿ Accessibility

### Focus Management

```css
/* Visible focus indicator */
*:focus-visible {
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
}

/* Remove default outline */
*:focus {
  outline: none;
}

/* Skip to main content */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--blue-600);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Labels

```tsx
// Button with icon only
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Loading state
<button aria-busy="true" aria-live="polite">
  <Spinner />
  Loading...
</button>

// Input with description
<input
  aria-describedby="email-description"
  aria-invalid={hasError}
  aria-errormessage={hasError ? "email-error" : undefined}
/>
<p id="email-description">We'll never share your email</p>
{hasError && <p id="email-error">Invalid email address</p>}

// Live regions
<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage}
</div>
```

### Keyboard Navigation

```typescript
// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  // Command palette
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openCommandPalette();
  }
  
  // Escape to close
  if (e.key === 'Escape') {
    closeModal();
  }
  
  // Arrow navigation
  if (e.key === 'ArrowDown') {
    focusNextItem();
  }
  if (e.key === 'ArrowUp') {
    focusPreviousItem();
  }
};
```

### Screen Reader Support

```tsx
// Screen reader only text
<span className="sr-only">
  Loading data, please wait
</span>

// Accessible table
<table role="grid" aria-label="Case list">
  <thead>
    <tr role="row">
      <th role="columnheader" aria-sort="ascending">
        Case ID
      </th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="gridcell">12847</td>
    </tr>
  </tbody>
</table>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile first approach */
/* Base styles: 320px+ (mobile) */

@media (min-width: 480px) {
  /* Large mobile */
}

@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1280px) {
  /* Large desktop */
}

@media (min-width: 1536px) {
  /* Extra large desktop */
}
```

### Container Widths

```css
.container {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

---

## 🚀 Performance

### Code Splitting

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CaseList = lazy(() => import('./pages/CaseList'));

// Lazy load heavy components
const Chart = lazy(() => import('./components/Chart'));

// Preload on hover
<Link 
  to="/cases"
  onMouseEnter={() => import('./pages/CaseList')}
>
  Cases
</Link>
```

### Image Optimization

```tsx
// Responsive images
<img
  src="/image.jpg"
  srcSet="/image-400.jpg 400w,
          /image-800.jpg 800w,
          /image-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  loading="lazy"
  decoding="async"
  alt="Description"
/>
```

### Virtual Scrolling

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={80}
  width="100%"
>
  {Row}
</FixedSizeList>
```

---

This design system ensures consistency, accessibility, and performance across the entire platform. All components follow these guidelines to create a cohesive user experience.
