# Frontend Directory

This directory contains the React + Vite frontend for the Fraud Detection System.

## 📁 Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── ai/         # AI-related components
│   │   ├── cases/      # Case management
│   │   ├── analytics/  # Analytics and charts
│   │   ├── reports/    # Report generation
│   │   └── ui/         # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── lib/            # Utilities and API client
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # State management (Zustand)
│   ├── App.tsx         # Root application component
│   └── main.tsx        # Application entry point
├── public/             # Static assets
│   ├── sw.js          # Service Worker
│   └── manifest.json  # PWA manifest
├── tests/             # E2E and integration tests
├── .env.example       # Environment template
├── package.json       # Dependencies
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── playwright.config.ts  # E2E test configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 10+** (comes with Node.js)

### Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   
   Essential variables:
   ```bash
   VITE_API_URL=http://localhost:8000
   VITE_WS_URL=ws://localhost:8000/ws
   VITE_ENABLE_OFFLINE=true
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   
   Application will be available at: http://localhost:5173

## 🏗️ Build and Deployment

### Development Build

```bash
# Start dev server with hot reload
npm run dev

# Preview production build locally
npm run build
npm run preview
```

### Production Build

```bash
# Build optimized production bundle
npm run build

# Output: dist/ directory
```

**Build artifacts**:
- `dist/index.html` - Entry HTML
- `dist/assets/` - Compiled JS, CSS, images
- Optimized, minified, tree-shaken code
- Source maps generated for debugging

### Build Configuration

**vite.config.ts** settings:
```typescript
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts'],
        }
      }
    }
  }
})
```

### Deployment Strategies

#### 1. Docker Deployment (Recommended)

```bash
# Build production image
docker build -t fraud-detection-frontend .

# Run container
docker run -p 80:80 fraud-detection-frontend
```

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Docker Compose (Full Stack)

```bash
# Start all services
docker-compose up --build

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Static Hosting (Vercel, Netlify, Cloudflare Pages)

```bash
# Build
npm run build

# Deploy dist/ directory to your hosting provider
```

**Build settings**:
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20

#### 4. CDN Deployment

For edge caching and global distribution:

```bash
# Build with CDN base path
VITE_BASE_URL=/cdn npm run build

# Upload dist/ to CDN
aws s3 sync dist/ s3://your-bucket/frontend/
```

### Environment-Specific Builds

```bash
# Development
npm run build -- --mode development

# Staging
npm run build -- --mode staging

# Production
npm run build -- --mode production
```

Create `.env.production`:
```bash
VITE_API_URL=https://api.production.example.com
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### Performance Optimization

#### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Generate bundle report
npm run build -- --mode production
# Open stats.html to view bundle composition
```

#### Code Splitting

Lazy load routes and heavy components:

```typescript
import { lazy, Suspense } from 'react';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

#### Asset Optimization

- **Images**: Use WebP format, lazy loading
- **Fonts**: Preload critical fonts, subset if possible
- **CSS**: Extract critical CSS, defer non-critical
- **JS**: Tree-shake unused code, minify

### CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/frontend-ci.yml`):

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Lint
        run: cd frontend && npm run lint
      
      - name: Type check
        run: cd frontend && npm run type-check
      
      - name: Unit tests
        run: cd frontend && npm test -- --coverage
      
      - name: E2E tests
        run: cd frontend && npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Build
        run: cd frontend && npm ci && npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: frontend/dist/

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
      
      - name: Deploy to production
        run: |
          # Deploy to your hosting provider
          # Example: aws s3 sync . s3://bucket-name/
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Test file example**:
```typescript
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- tests/login.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

**Test file example**:
```typescript
// tests/case-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Case Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
  });

  test('should create a new case', async ({ page }) => {
    await page.getByRole('button', { name: 'New Case' }).click();
    await page.getByLabel('Case Name').fill('Test Case');
    await page.getByLabel('Description').fill('Test description');
    await page.getByRole('button', { name: 'Create' }).click();
    
    await expect(page.getByText('Test Case')).toBeVisible();
  });

  test('should display case timeline', async ({ page }) => {
    await page.goto('/cases/123');
    await expect(page.getByText('Case Timeline')).toBeVisible();
    await expect(page.getByRole('chart')).toBeVisible();
  });
});
```

### Test Coverage Requirements

- **Overall**: 80% minimum
- **Critical paths**: 100% (authentication, data mutations)
- **UI components**: 70% minimum
- **Utilities**: 90% minimum

**Coverage report**:
```bash
npm test -- --coverage
# Open coverage/index.html in browser
```

### Testing Strategy

#### 1. Unit Tests
- **What**: Individual components, hooks, utilities
- **Tools**: Vitest, React Testing Library
- **Focus**: Logic, edge cases, error handling

#### 2. Integration Tests
- **What**: Component interactions, API integration
- **Tools**: Vitest, MSW (Mock Service Worker)
- **Focus**: Data flow, state management

#### 3. E2E Tests
- **What**: Complete user journeys
- **Tools**: Playwright
- **Focus**: Critical paths (login, case creation, reports)

#### 4. Visual Regression Tests
- **What**: UI consistency
- **Tools**: Playwright screenshots, Percy
- **Focus**: Key pages, responsive layouts

## 📝 Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**ESLint configuration** (`eslint.config.js`):
```javascript
export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

### Type Checking

```bash
# Run TypeScript compiler check
npm run type-check

# Watch mode
npm run type-check -- --watch
```

### Formatting

```bash
# Format with Prettier (if configured)
npm run format

# Check formatting
npm run format -- --check
```

### Pre-commit Hooks

Install pre-commit hooks:
```bash
npx husky install
```

**`.husky/pre-commit`**:
```bash
#!/bin/sh
cd frontend
npm run lint
npm run type-check
npm test -- --run
```

## 🔒 Security

### Dependency Auditing

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may break things)
npm audit fix --force

# Audit report
npm audit --json > audit-report.json
```

### Automated Scanning

**Snyk integration**:
```bash
# Install Snyk
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

**GitHub Dependabot** (`.github/dependabot.yml`):
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "teoat"
```

### Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store in environment variables only
3. **XSS Protection**: Sanitize user input, use React's built-in escaping
4. **CSRF**: Use CSRF tokens for mutations
5. **Content Security Policy**: Configure in `index.html`

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### Secrets Management

- Use **GitHub Secrets** for CI/CD
- Use **environment-specific** `.env` files
- Never hardcode credentials
- Rotate keys regularly

## 🎨 Styling

### Technologies

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styles
- **Dark Mode**: Built-in theme support

### Styling Guidelines

```tsx
// Use Tailwind classes
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">
  Click me
</button>

// Conditional classes
<div className={`card ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
  Content
</div>

// Or use classnames utility
import classNames from 'classnames';

<div className={classNames('card', {
  'bg-blue-100': isActive,
  'bg-gray-100': !isActive,
})}>
```

### Accessibility (WCAG 2.1 AA)

- **Semantic HTML**: Use proper elements (`<button>`, `<nav>`, etc.)
- **ARIA labels**: Add `aria-label` for screen readers
- **Keyboard navigation**: Tab order, focus management
- **Color contrast**: Minimum 4.5:1 ratio
- **Alt text**: All images must have descriptive alt text

## 📊 Monitoring and Performance

### Performance Monitoring

**Web Vitals** tracking:
```typescript
// src/lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Tracking

**Sentry integration**:
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Bundle Size Monitoring

```bash
# Check bundle size
npm run build -- --mode production
# Check dist/ folder size

# Bundle analysis
npm run build -- --mode production --analyze
```

**Size budgets** (vite.config.ts):
```typescript
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 500, // KB
  }
})
```

## 🔧 Troubleshooting

### Common Issues

**1. Build fails with TypeScript errors**:
```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run type-check
```

**2. Dependencies not installing**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Port already in use**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

**4. Hot reload not working**:
```bash
# Check Vite config, ensure:
server: {
  watch: {
    usePolling: true // For some Docker setups
  }
}
```

## 📖 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Playwright Documentation](https://playwright.dev/)

## 🔗 Related Documentation

- [Backend README](/backend/README.md)
- [Component Documentation](/docs/frontend/pages/)
- [Architecture Docs](/docs/architecture/)
- [API Integration Guide](/docs/API_INTEGRATION.md)
- [Contributing Guidelines](/CONTRIBUTING.md)
