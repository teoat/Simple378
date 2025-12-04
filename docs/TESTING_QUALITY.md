# Testing & Quality Standards

**Consolidated from:** TESTING_AND_QUALITY_STANDARDS.md, copilot_instructions.md, CI_CD_DOCUMENTATION_INDEX.md, CI_CD_QUICK_START.md, CI_CD_SETUP_GUIDE.md, CI_CD_TESTING_CHECKLIST.md

---

## 1. Testing Strategy Overview

### Goals
- ✅ Maintain 100% Lighthouse accessibility scores
- ✅ Prevent regressions in glassmorphism and visual design
- ✅ Ensure WCAG 2.1 AAA compliance continuously
- ✅ Verify keyboard navigation and screen reader support
- ✅ Monitor performance metrics
- ✅ Automate as much as possible

### Testing Pyramid
```
         /\
        /  \  E2E Tests (10%)
       /----\
      /      \ Integration Tests (30%)
     /--------\
    /          \ Unit Tests (60%)
   /____________\
```

### Quality Standards
**Acceptance Criteria:**
- Lighthouse Accessibility: 100/100 ✅ REQUIRED
- Lighthouse Performance: 98+/100 ✅ REQUIRED
- Lighthouse Best Practices: 100/100 ✅ REQUIRED
- Lighthouse SEO: 90+/100 ⚠️ RECOMMENDED

**Code Coverage:**
- Statements: 80%+ ✅ REQUIRED
- Branches: 80%+ ✅ REQUIRED
- Functions: 80%+ ✅ REQUIRED
- Lines: 80%+ ✅ REQUIRED

**WCAG Compliance:**
- Level A: 100% ✅ REQUIRED
- Level AA: 100% ✅ REQUIRED
- Level AAA: 100% ✅ TARGET

**Browser Support:**
- Chrome: Latest 2 versions ✅
- Firefox: Latest 2 versions ✅
- Safari: Latest 2 versions ✅
- Edge: Latest 2 versions ✅
- Mobile: iOS Safari 14+, Chrome Mobile ✅

---

## 2. Automated Testing Suite

### Unit Tests (Jest + React Testing Library)

#### Setup
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest @types/jest
```

#### Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Example Tests

**Component Test (`LoginForm.test.tsx`)**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '../../context/AuthContext';

describe('LoginForm', () => {
  it('renders with glassmorphism container', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    const container = screen.getByRole('form').parentElement;
    expect(container).toHaveClass('backdrop-blur-xl');
    expect(container).toHaveClass('bg-white/10');
  });

  it('has proper ARIA attributes on email input', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);

    expect(emailInput).toHaveAttribute('aria-label', 'Email address');
    expect(emailInput).toHaveAttribute('id', 'email');
  });

  it('links error messages via aria-describedby', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);

    // Trigger validation
    await user.type(emailInput, 'invalid');
    await user.tab();

    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();
  });
});
```

**Accessibility Test (`Dashboard.accessibility.test.tsx`)**
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Dashboard } from './Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

expect.extend(toHaveNoViolations);

describe('Dashboard Accessibility', () => {
  it('has no accessibility violations', async () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('charts have ARIA labels', () => {
    const { container } = render(<Dashboard />);

    const charts = container.querySelectorAll('[role="img"]');
    expect(charts.length).toBeGreaterThan(0);

    charts.forEach(chart => {
      expect(chart).toHaveAttribute('aria-label');
      expect(chart).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('has screen reader summaries for charts', () => {
    const { container } = render(<Dashboard />);

    const summaries = container.querySelectorAll('.sr-only[role="region"]');
    expect(summaries.length).toBeGreaterThan(0);
  });

  it('announces live updates', () => {
    const { container } = render(<Dashboard />);

    const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveClass('sr-only');
  });
});
```

---

## 3. Accessibility Testing

### Automated Accessibility Checks

#### Install Tools
```bash
npm install --save-dev @axe-core/playwright @axe-core/react jest-axe pa11y
```

#### Axe DevTools Integration
```typescript
// src/utils/axeSetup.ts
import { configure } from 'axe-core';

export const axeConfig = {
  rules: {
    // Enforce WCAG 2.1 AAA
    'color-contrast': { enabled: true },
    'label': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'link-name': { enabled: true },
  },
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa'],
  },
};
```

#### Pa11y Configuration (`pa11y.config.js`)
```javascript
module.exports = {
  standard: 'WCAG2AAA',
  level: 'error',
  runners: [
    'axe',
    'htmlcs'
  ],
  ignore: [
    // Add exceptions if needed (should be NONE for 100% score)
  ],
  chromeLaunchConfig: {
    args: ['--no-sandbox']
  }
};
```

#### Accessibility Test Script (`package.json`)
```json
{
  "scripts": {
    "test:a11y": "pa11y-ci --config pa11y.config.js",
    "test:a11y:login": "pa11y http://localhost:5173/login --standard WCAG2AAA",
    "test:a11y:dashboard": "pa11y http://localhost:5173/dashboard --standard WCAG2AAA",
    "test:a11y:all": "npm run test:a11y:login && npm run test:a11y:dashboard"
  }
}
```

### Manual Screen Reader Testing

#### Testing Matrix

| Screen Reader | OS | Browser | Test Frequency |
|--------------|-----|---------|----------------|
| NVDA | Windows | Chrome/Firefox | Weekly |
| JAWS | Windows | Chrome/Edge | Bi-weekly |
| VoiceOver | macOS | Safari/Chrome | Weekly |
| TalkBack | Android | Chrome | Monthly |

#### Screen Reader Checklist (`screen-reader-checklist.md`)
```markdown
# Screen Reader Testing Checklist

## Login Page
- [x] Form labels announced correctly
- [x] Error messages announced when they appear
- [x] aria-describedby links work
- [x] Password toggle button announced
- [x] Submit button state clear

## Dashboard
- [x] Chart summaries read aloud
- [x] Live updates announced
- [x] Stat cards readable
- [x] Navigation clear

## Case List
- [x] Table structure announced
- [x] Row selection clear
- [x] Sorting indicators announced
- [x] Keyboard shortcuts work

## Adjudication Queue
- [x] Alert selection announced
- [x] Decision buttons clear
- [x] Context tabs navigable
- [x] Keyboard shortcuts work
```

---

## 4. Visual Regression Testing

### Percy.io Integration

#### Setup
```bash
npm install --save-dev @percy/cli @percy/playwright
```

#### Configuration (`.percy.yml`)
```yaml
version: 2
static:
  files: '**/*.html'
snapshot:
  widths:
    - 375  # Mobile
    - 768  # Tablet
    - 1280 # Desktop
    - 1920 # Large Desktop
  min-height: 1024
  percy-css: |
    /* Hide dynamic content */
    [data-testid="timestamp"] { visibility: hidden; }
```

#### Visual Test Script
```typescript
// tests/visual/screenshots.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests', () => {
  test('Login page - light mode', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'Login - Light Mode');
  });

  test('Login page - dark mode', async ({ page }) => {
    await page.goto('/login');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'Login - Dark Mode');
  });

  test('Dashboard - glassmorphism', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'Dashboard - Glassmorphism Effects');
  });

  test('Case List - focus states', async ({ page }) => {
    await page.goto('/cases');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await percySnapshot(page, 'Case List - Focused Row');
  });

  test('Adjudication Queue - selected alert', async ({ page }) => {
    await page.goto('/adjudication');
    await page.click('[data-testid="alert-item"]:first-child');
    await percySnapshot(page, 'Adjudication - Selected Alert Glow');
  });
});
```

### Chromatic (Alternative)
```bash
npm install --save-dev chromatic
```

```json
{
  "scripts": {
    "chromatic": "chromatic --project-token=YOUR_TOKEN"
  }
}
```

---

## 5. Performance Testing

### Lighthouse CI

#### Installation
```bash
npm install --save-dev @lhci/cli
```

#### Configuration (`lighthouserc.js`)
```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173/login',
        'http://localhost:5173/dashboard',
        'http://localhost:5173/cases',
        'http://localhost:5173/adjudication',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 1 }], // 100%
        'categories:performance': ['warn', { minScore: 0.9 }],  // 90%+
        'categories:best-practices': ['error', { minScore: 1 }], // 100%
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Specific accessibility checks
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'color-contrast': 'error',
        'label': 'error',
        'link-name': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

#### Scripts
```json
{
  "scripts": {
    "lighthouse": "lhci autorun",
    "lighthouse:mobile": "lhci autorun --preset=mobile",
    "lighthouse:ci": "lhci autorun --collect.numberOfRuns=5"
  }
}
```

### Web Vitals Monitoring
```typescript
// src/utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}

// Usage in main.tsx
reportWebVitals(console.log);
```

---

## 6. End-to-End Testing

### Playwright Setup

#### Installation
```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### Configuration (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

**Login Flow (`login.spec.ts`)**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow - 100% Accessibility', () => {
  test('glassmorphism form container', async ({ page }) => {
    await page.goto('/login');
    
    const formContainer = page.locator('.backdrop-blur-xl');
    await expect(formContainer).toBeVisible();
    await expect(formContainer).toHaveClass(/bg-white\/10/);
  });

  test('keyboard navigation through form', async ({ page }) => {
    await page.goto('/login');
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#email')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();
  });

  test('error messages have ARIA linking', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('#email');
    await emailInput.fill('invalid');
    await emailInput.blur();
    
    const ariaDescribedBy = await emailInput.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBe('email-error');
    
    const errorMessage = page.locator('#email-error');
    await expect(errorMessage).toHaveAttribute('role', 'alert');
  });
});
```

**Dashboard Charts (`dashboard.spec.ts`)**
```typescript
test.describe('Dashboard - Chart Accessibility', () => {
  test('charts have screen reader summaries', async ({ page }) => {
    await page.goto('/dashboard');
    
    const summaries = page.locator('.sr-only[role="region"]');
    const count = await summaries.count();
    expect(count).toBeGreaterThan(0);
    
    const firstSummary = summaries.first();
    const text = await firstSummary.textContent();
    expect(text).toContain('Total cases');
  });

  test('charts have ARIA labels', async ({ page }) => {
    await page.goto('/dashboard');
    
    const charts = page.locator('[role="img"]');
    const count = await charts.count();
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const chart = charts.nth(i);
      await expect(chart).toHaveAttribute('aria-label');
      await expect(chart).toHaveAttribute('aria-live', 'polite');
    }
  });

  test('live updates announced', async ({ page }) => {
    await page.goto('/dashboard');
    
    const liveRegion = page.locator('[role="status"][aria-live="polite"]');
    await expect(liveRegion).toHaveClass(/sr-only/);
  });
});
```

**Case List Navigation (`caselist.spec.ts`)**
```typescript
test.describe('Case List - Enhanced Focus', () => {
  test('table rows have focus rings', async ({ page }) => {
    await page.goto('/cases');
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.focus();
    
    await expect(firstRow).toHaveClass(/focus-within:ring-2/);
    await expect(firstRow).toHaveClass(/focus-within:ring-blue-500/);
  });

  test('Enter key activates row', async ({ page }) => {
    await page.goto('/cases');
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.focus();
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/\/cases\/.+/);
  });
});
```

---

## 7. CI/CD Pipeline

### GitHub Actions Workflow

#### `.github/workflows/quality-checks.yml`
```yaml
name: Quality Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: sleep 5
      - run: npm run test:a11y

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: sleep 5
      - run: npm run lighthouse:ci
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:4173/login
            http://localhost:4173/dashboard
          uploadArtifacts: true

  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: npx percy snapshot ./dist
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

---

## 8. MCP Tools & IDE Integrations

### Recommended MCP Servers for Testing

#### 1. Playwright MCP Server
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"],
      "description": "Browser automation and E2E testing"
    }
  }
}
```

**Usage:**
- Automate browser testing
- Generate test scripts
- Debug test failures
- Screenshot comparison

#### 2. Brave Search MCP
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_api_key"
      },
      "description": "Search for accessibility best practices"
    }
  }
}
```

**Usage:**
- Research WCAG guidelines
- Find accessibility solutions
- Stay updated on standards
- Learn testing techniques

### VS Code Extensions

#### Essential Extensions
```json
{
  "recommendations": [
    "ms-playwright.playwright",           // Playwright Test for VS Code
    "axe-core.vscode-axe-linter",        // Axe Accessibility Linter
    "deque.vscode-axe-linter",           // Deque Axe Linter
    "webhint.vscode-webhint",            // Webhint for accessibility
    "usernamehw.errorlens",              // Error Lens
    "streetsidesoftware.code-spell-checker", // Spell checker
    "esbenp.prettier-vscode",            // Prettier
    "dbaeumer.vscode-eslint",            // ESLint
    "bradlc.vscode-tailwindcss",         // Tailwind IntelliSense
    "orta.vscode-jest",                  // Jest Runner
    "firsttris.vscode-jest-runner"       // Jest Runner UI
  ]
}
```

#### Axe Accessibility Linter Configuration
```json
{
  "axe.enableAutoLint": true,
  "axe.wcagLevel": "AAA",
  "axe.standards": ["WCAG2AAA"]
}
```

---

## 9. Testing Checklist

### Pre-Deployment Checklist

#### Automated Tests
- [ ] All unit tests pass (`npm run test`)
- [ ] Coverage meets 80% threshold
- [ ] All accessibility tests pass (`npm run test:a11y`)
- [ ] E2E tests pass in all browsers (`npm run test:e2e`)
- [ ] Lighthouse scores 100% accessibility on all pages
- [ ] No console errors or warnings
- [ ] Build succeeds (`npm run build`)

#### Manual Testing
- [ ] Test with NVDA on Windows
- [ ] Test with VoiceOver on macOS
- [ ] Test keyboard navigation (Tab, Enter, Space, Arrows, Esc)
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test on mobile (iOS Safari, Chrome Mobile)
- [ ] Verify glassmorphism in light/dark mode
- [ ] Check focus indicators are visible
- [ ] Verify animations are smooth (60fps)

#### Accessibility Verification
- [ ] All interactive elements focusable
- [ ] All images have alt text
- [ ] All forms have labels
- [ ] Color contrast ratios ≥ 7:1 (AAA)
- [ ] No keyboard traps
- [ ] ARIA labels present where needed
- [ ] Error messages linked to fields
- [ ] Live regions announce updates

#### Visual Regression
- [ ] Percy/Chromatic snapshots approved
- [ ] No unexpected visual changes
- [ ] Glassmorphism effects intact
- [ ] Dark mode looks correct
- [ ] Responsive layouts work

---

## 10. Quality Standards & Metrics

### Acceptance Criteria

#### Lighthouse Scores (All Pages)
```yaml
Accessibility: 100/100  ✅ REQUIRED
Performance:   98+/100  ✅ REQUIRED
Best Practices: 100/100 ✅ REQUIRED
SEO:           90+/100  ⚠️ RECOMMENDED
```

#### Code Coverage
```yaml
Statements:  80%+  ✅ REQUIRED
Branches:    80%+  ✅ REQUIRED
Functions:   80%+  ✅ REQUIRED
Lines:       80%+  ✅ REQUIRED
```

#### WCAG Compliance
```yaml
Level A:   100% ✅ REQUIRED
Level AA:  100% ✅ REQUIRED
Level AAA: 100% ✅ TARGET
```

#### Browser Support
```yaml
Chrome:    Latest 2 versions ✅
Firefox:   Latest 2 versions ✅
Safari:    Latest 2 versions ✅
Edge:      Latest 2 versions ✅
Mobile:    iOS Safari 14+, Chrome Mobile ✅
```

---

## 11. Monitoring & Maintenance

### Weekly Tasks
```bash
# Run full test suite
npm run test:all

# Check accessibility
npm run test:a11y

# Update snapshots if needed
npm run test:e2e:update

# Review coverage reports
npm run test:coverage
```

### Monthly Tasks
- Review and update dependencies
- Test with latest screen reader versions
- Review Lighthouse trends
- Update test fixtures
- Refactor flaky tests

### Quarterly Tasks
- Full accessibility audit
- Performance optimization review
- Cross-browser compatibility check
- Update WCAG compliance documentation
- Review and update test strategy

---

## 12. Success Metrics

### KPIs to Track
```yaml
Accessibility Score:    100% (all pages) ✅
Test Coverage:          80%+ ✅
E2E Test Pass Rate:     100% ✅
Lighthouse Performance: 98+ ✅
Zero Critical Issues:   ✅
Screen Reader Support:  Full ✅
Keyboard Navigation:    Complete ✅
```

---

## 13. Copilot Instructions

### AI-Assisted Development Guidelines

#### Code Generation
- **Context Awareness:** Always provide full file context and surrounding code
- **TypeScript Strict:** Generate code that passes strict TypeScript checking
- **Accessibility First:** Include ARIA attributes and accessibility features
- **Testing Included:** Generate tests alongside implementation code
- **Documentation:** Include JSDoc comments and inline documentation

#### Testing Assistance
- **Test Coverage:** Help achieve and maintain 80%+ coverage
- **Accessibility Testing:** Generate axe-core and jest-axe tests
- **E2E Scenarios:** Create comprehensive Playwright test suites
- **Performance Testing:** Implement Lighthouse CI and Web Vitals monitoring

#### Quality Assurance
- **Linting:** Ensure ESLint and Prettier compliance
- **Type Safety:** Full TypeScript type coverage
- **Security:** OWASP compliance and input validation
- **Performance:** Bundle size optimization and lazy loading

#### Architecture Guidance
- **Component Design:** Modular, reusable component architecture
- **State Management:** React Query for server state, Context for UI state
- **API Design:** RESTful endpoints with proper error handling
- **Database Design:** Normalized schemas with proper relationships

#### Documentation
- **Code Comments:** Comprehensive JSDoc and inline documentation
- **API Documentation:** OpenAPI/Swagger specifications
- **User Guides:** Context-sensitive help and onboarding
- **Architecture Docs:** System design and component relationships

---

**Testing & Quality Standards - Complete and Consolidated**
**Last Updated:** December 5, 2025
**Status:** ✅ COMPREHENSIVE TESTING STRATEGY IMPLEMENTED