# 🧪 Testing Guide

> Testing practices for Simple378

---

## Overview

We use a comprehensive testing strategy covering unit, integration, and E2E tests.

| Layer | Tools | Coverage Target |
|-------|-------|-----------------|
| Unit | pytest, jest | 80% |
| Integration | pytest, supertest | 60% |
| E2E | Playwright | Critical paths |

---

## Backend Testing

### Setup

```bash
cd backend
pip install -r requirements-dev.txt
```

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific file
pytest tests/test_cases.py

# Verbose
pytest -v
```

### Test Structure

```
tests/
├── conftest.py          # Fixtures
├── test_auth.py         # Auth tests
├── test_cases.py        # Case tests
├── test_analysis.py     # Analysis tests
└── integration/
    └── test_api.py      # API integration
```

### Unit Test Example

```python
# tests/test_cases.py
import pytest
from app.services.case_service import CaseService

class TestCaseService:
    @pytest.mark.asyncio
    async def test_create_case(self, db_session, sample_subject):
        service = CaseService(db_session)
        case = await service.create(
            subject_id=sample_subject.id,
            priority="high"
        )
        
        assert case.id is not None
        assert case.status == "open"
        assert case.priority == "high"
    
    @pytest.mark.asyncio
    async def test_update_status(self, db_session, sample_case):
        service = CaseService(db_session)
        case = await service.update_status(
            sample_case.id,
            status="in_progress"
        )
        
        assert case.status == "in_progress"
```

### API Integration Test

```python
# tests/integration/test_api.py
import pytest
from httpx import AsyncClient

class TestCasesAPI:
    @pytest.mark.asyncio
    async def test_list_cases(self, client: AsyncClient, auth_headers):
        response = await client.get(
            "/api/v1/cases",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
    
    @pytest.mark.asyncio
    async def test_create_case_unauthorized(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/cases",
            json={"subject_id": "...", "priority": "high"}
        )
        
        assert response.status_code == 401
```

### Fixtures

```python
# tests/conftest.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with AsyncSession(engine) as session:
        yield session

@pytest.fixture
async def client(db_session):
    from app.main import app
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def auth_headers(sample_user):
    token = create_access_token(sample_user.id)
    return {"Authorization": f"Bearer {token}"}
```

---

## Frontend Testing

### Setup

```bash
cd frontend
npm install
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific file
npm test -- Card.test.tsx
```

### Test Structure

```
src/
├── components/
│   └── Card/
│       ├── Card.tsx
│       └── Card.test.tsx
├── hooks/
│   └── useCase.test.ts
└── __tests__/
    └── integration/
```

### Component Test

```typescript
// components/Card/Card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Hello World</Card>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  it('applies glass variant styles', () => {
    render(<Card variant="glass">Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('backdrop-blur-md');
  });
  
  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Clickable</Card>);
    
    await userEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Test

```typescript
// hooks/useCase.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCase } from './useCase';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useCase', () => {
  it('fetches case data', async () => {
    const { result } = renderHook(
      () => useCase('case-123'),
      { wrapper }
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data.id).toBe('case-123');
  });
});
```

---

## E2E Testing

### Setup

```bash
npx playwright install
```

### Running E2E Tests

```bash
# All tests
npm run test:e2e

# Headed mode
npm run test:e2e -- --headed

# Specific test
npm run test:e2e -- login.spec.ts
```

### E2E Test Example

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
  
  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'wrong@email.com');
    await page.fill('[data-testid="password"]', 'wrongpass');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

---

## Test Coverage

### Backend
```bash
pytest --cov=app --cov-report=term-missing
```

### Frontend
```bash
npm run test:coverage
```

### Targets

| Area | Target | Current |
|------|--------|---------|
| Backend Services | 80% | 75% |
| Backend API | 70% | 65% |
| Frontend Components | 70% | 60% |
| Frontend Hooks | 80% | 70% |

---

## CI/CD Integration

Tests run automatically on:
- Pull request creation
- Push to main branch

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backend Tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest --cov
      - name: Frontend Tests
        run: |
          cd frontend
          npm install
          npm test
```

---

## Related

- [Frontend Development](./FRONTEND_DEVELOPMENT.md)
- [Backend Development](./BACKEND_DEVELOPMENT.md)
