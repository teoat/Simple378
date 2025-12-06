# Copilot Coding Agent Guidelines

This document provides context and guidelines for GitHub Copilot coding agents working on this repository. Following these guidelines will help ensure consistent, high-quality contributions.

## Project Overview

**Fraud Detection System** - A privacy-focused, AI-powered fraud detection system with offline capabilities for investigating financial fraud through multi-modal evidence analysis, entity relationship detection, and AI-assisted case adjudication.

### Key Features
- Multi-modal evidence analysis (documents, images, metadata)
- Digital forensics with EXIF/metadata extraction
- Entity relationship analysis and visualization
- AI-powered fraud detection and scoring
- Real-time case management and adjudication
- Offline-first architecture with synchronization
- GDPR-compliant audit trails

## Technology Stack

### Backend
- **Framework:** Python 3.12+ with FastAPI (async/await)
- **Database:** PostgreSQL 15+ with TimescaleDB
- **Vector Search:** Qdrant (self-hosted)
- **Cache/Queue:** Redis + Celery
- **AI/LLM:** Claude 3.5 Sonnet via Anthropic API
- **Testing:** pytest, pytest-asyncio
- **Linting:** Ruff, Black (formatting)
- **Type Checking:** Mypy (optional, not enforced)

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **State Management:** React Query (server state), React hooks (client state)
- **UI Components:** Tailwind CSS with shadcn/ui
- **Charts/Viz:** Recharts, D3.js, React Force Graph
- **Real-time:** Socket.io client
- **Testing:** Vitest, React Testing Library
- **Linting:** ESLint with TypeScript support

### Infrastructure
- **Containers:** Docker & Docker Compose
- **Storage:** Cloudflare R2 (S3-compatible)
- **Orchestration:** Kubernetes manifests (k8s/)
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus metrics

## Repository Structure

```
.
├── backend/                 # Python FastAPI backend
│   ├── app/                # Application code
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core utilities, config
│   │   ├── models/        # SQLAlchemy models
│   │   ├── services/      # Business logic
│   │   └── main.py        # FastAPI app entry
│   ├── tests/             # Backend tests
│   └── pyproject.toml     # Poetry dependencies
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities, API client
│   │   └── hooks/         # Custom React hooks
│   ├── tests/             # Frontend tests
│   └── package.json       # npm dependencies
├── docs/                   # Documentation
│   ├── architecture/      # Architecture docs
│   └── CI_CD_*.md         # CI/CD guides
├── .github/
│   └── workflows/         # GitHub Actions workflows
├── k8s/                    # Kubernetes manifests
├── nginx/                  # Nginx config
└── scripts/                # Utility scripts
```

## Coding Standards

### Python (Backend)

#### Style and Formatting
- **PEP 8 compliance** via Ruff linter
- **Black** for code formatting (line length: 88)
- Use **type hints** for all function signatures
- Prefer **async/await** for I/O operations
- Use **Pydantic** models for data validation

#### Naming Conventions
- **snake_case** for variables, functions, methods
- **PascalCase** for classes
- **UPPER_SNAKE_CASE** for constants
- Prefix private methods with single underscore `_`
- Use descriptive names: `calculate_fraud_score()` not `calc_fs()`

#### Best Practices
- Keep functions focused (single responsibility)
- Use docstrings for public functions/classes
- Handle exceptions explicitly, avoid bare `except:`
- Use SQLAlchemy async sessions consistently
- Structure API endpoints in `app/api/v1/endpoints/`
- Place business logic in `app/services/`
- Use structured logging with `structlog`

#### Testing
- Write tests in `backend/tests/`
- Use `pytest` fixtures from `conftest.py`
- Async tests require `@pytest.mark.asyncio`
- Aim for >80% code coverage
- Run tests: `cd backend && poetry run pytest`

#### Dependencies
- Manage with **Poetry** (`pyproject.toml`)
- Pin exact versions for bcrypt and critical security deps
- Add new deps: `poetry add <package>`
- Add dev deps: `poetry add --group dev <package>`

### TypeScript/React (Frontend)

#### Style and Formatting
- **ESLint** for linting with React hooks rules
- **TypeScript strict mode** enabled
- Use **functional components** with hooks (no class components)
- Prefer **named exports** over default exports

#### Naming Conventions
- **PascalCase** for components: `CaseList.tsx`
- **camelCase** for variables, functions, props
- **UPPER_SNAKE_CASE** for constants
- Prefix custom hooks with `use`: `useDecisionHistory()`
- Suffix test files with `.test.tsx` or `.spec.tsx`

#### Best Practices
- Use **TypeScript interfaces** for props and data types
- Leverage **React Query** for server state management
- Use **Tailwind classes** for styling (utility-first)
- Extract reusable logic into custom hooks
- Keep components under 250 lines (split if larger)
- Use **Suspense boundaries** for async components
- Handle errors with error boundaries

#### Component Structure
```typescript
// Imports
import React from 'react';

// Types/Interfaces
interface Props {
  id: string;
  onSubmit: (data: FormData) => void;
}

// Component
export function ComponentName({ id, onSubmit }: Props) {
  // Hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => { };
  
  // Render
  return <div>...</div>;
}
```

#### Testing
- Write tests in `frontend/src/**/__tests__/` or alongside components
- Use **Vitest** + **React Testing Library**
- Test user interactions, not implementation details
- Run tests: `cd frontend && npm run test`
- Coverage: `npm run test -- --coverage`

#### Dependencies
- Manage with **npm** (`package.json`)
- Use `npm install` not `npm i` for production deps
- Use `npm install --save-dev` for dev dependencies

## File Organization

### Backend Files
- **API Routes:** `backend/app/api/v1/endpoints/<feature>.py`
- **Models:** `backend/app/models/<entity>.py`
- **Services:** `backend/app/services/<feature>_service.py`
- **Tests:** `backend/tests/integration/test_<feature>.py`

### Frontend Files
- **Components:** `frontend/src/components/<category>/<Component>.tsx`
  - Reusable modals in `frontend/src/components/ui/Modal.tsx`
  - Feature modals like `NewCaseModal.tsx` in `frontend/src/components/cases/`
- **Pages:** `frontend/src/pages/<PageName>.tsx`
- **Hooks:** `frontend/src/hooks/use<HookName>.ts`
- **API:** `frontend/src/lib/api.ts` (centralized API client)
- **Tests:** `frontend/src/components/<category>/__tests__/<Component>.test.tsx`

## Build and Test Commands

### Backend
```bash
cd backend

# Setup
poetry install

# Run dev server
poetry run uvicorn app.main:app --reload

# Lint
poetry run ruff check .

# Format
poetry run black .

# Type check (optional)
poetry run mypy app/

# Test
poetry run pytest

# Test with coverage
poetry run pytest --cov=app --cov-report=html
```

### Frontend
```bash
cd frontend

# Setup
npm install

# Run dev server
npm run dev

# Lint
npm run lint

# Type check
npm run build  # TypeScript errors will fail build

# Test
npm run test

# Test with coverage
npm run test -- --coverage

# Build for production
npm run build
```

### Full Stack with Docker
```bash
# Start all services
docker-compose up --build

# Run specific service
docker-compose up backend
docker-compose up frontend

# Stop all
docker-compose down
```

## CI/CD

### GitHub Actions Workflows
- **ci.yml** - Basic CI (lint, test, build) on PR/push
- **quality-checks.yml** - Comprehensive quality gates
- **cd.yml** - Continuous deployment (not fully configured)

### What Gets Checked
- Python linting (Ruff) and formatting (Black)
- TypeScript linting (ESLint) and type checking
- Backend unit tests (pytest)
- Frontend unit tests (Vitest)
- Frontend E2E tests (Playwright)
- Security scanning (Trivy, npm audit, bandit)
- Accessibility tests (jest-axe)
- Performance (Lighthouse CI)

## Good Tasks for Copilot Agent

### ✅ Recommended Tasks
- **Bug fixes** with clear reproduction steps
- **Adding tests** for existing features
- **Updating documentation** (README, API docs, architecture)
- **Refactoring** well-defined components
- **Implementing UI components** from mockups/specs
- **Adding API endpoints** following existing patterns
- **Improving error handling** and logging
- **Accessibility improvements** (ARIA labels, keyboard nav)
- **Performance optimizations** based on profiling data
- **Technical debt** items with clear scope

### ⚠️ Approach with Caution
- **New AI/ML features** (requires domain expertise)
- **Authentication/authorization changes** (security-sensitive)
- **Database migrations** affecting production data
- **Major architectural changes** (needs human design review)
- **Integration with external APIs** (requires credentials, testing)

### ❌ Not Recommended for Agent
- **Security-critical code** (auth flows, encryption)
- **Production database changes** without approval
- **Ambiguous feature requests** without clear requirements
- **Complex business logic** requiring domain knowledge
- **Legal/compliance features** (GDPR, data retention)

## Issue and PR Guidelines

### Writing Good Issues for Copilot
Include:
1. **Clear description** of the problem or requirement
2. **Acceptance criteria** (what success looks like)
3. **Affected files/components** to modify
4. **Test requirements** (what tests to add/update)
5. **Links to relevant docs** or examples

Example:
```markdown
## Issue: Add pagination to Case List

**Description:** The case list currently loads all cases at once, causing performance issues with >100 cases.

**Acceptance Criteria:**
- [ ] Case list displays 20 cases per page
- [ ] Pagination controls (prev/next, page numbers)
- [ ] URL updates with current page (?page=2)
- [ ] Unit tests for pagination logic
- [ ] Accessibility: keyboard navigation for page controls

**Files to Modify:**
- `frontend/src/components/cases/CaseList.tsx`
- `frontend/src/lib/api.ts` (add pagination params)
- `backend/app/api/v1/endpoints/cases.py` (add limit/offset)

**Testing:**
- Add tests to `CaseList.test.tsx`
- Manual test with 100+ cases
```

### Pull Request Checklist
- [ ] All tests pass (`npm run test` and `poetry run pytest`)
- [ ] Code follows style guidelines (linters pass)
- [ ] Added tests for new functionality
- [ ] Updated documentation if needed
- [ ] No sensitive data (API keys, passwords) in code
- [ ] Changelog/release notes updated (if applicable)

## Security Guidelines

### What to Avoid
- **Never commit secrets** (API keys, passwords, tokens)
- Use environment variables for sensitive config
- Validate all user input (backend AND frontend)
- Sanitize data before displaying (prevent XSS)
- Use parameterized queries (prevent SQL injection)
- Don't log sensitive data (passwords, PII)

### Safe Practices
- Use `.env.example` for env var templates (no real values)
- Store secrets in GitHub Secrets for CI/CD
- Use HTTPS for all external API calls
- Implement rate limiting for API endpoints
- Follow principle of least privilege
- Keep dependencies updated (security patches)

## Common Patterns

### Backend: Adding a New API Endpoint
```python
# backend/app/api/v1/endpoints/example.py
from fastapi import APIRouter, Depends
from app.services.example_service import ExampleService

router = APIRouter()

@router.get("/items/{item_id}")
async def get_item(
    item_id: int,
    service: ExampleService = Depends()
):
    """Get item by ID."""
    return await service.get_item(item_id)
```

### Frontend: Fetching Data with React Query
```typescript
// frontend/src/hooks/useCases.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: () => api.get('/api/v1/cases'),
  });
}
```

### Frontend: Component with Tests
```typescript
// CaseCard.tsx
interface CaseCardProps {
  caseId: string;
  title: string;
}

export function CaseCard({ caseId, title }: CaseCardProps) {
  return <div data-testid={`case-${caseId}`}>{title}</div>;
}

// CaseCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CaseCard } from './CaseCard';

test('renders case title', () => {
  render(<CaseCard caseId="1" title="Test Case" />);
  expect(screen.getByText('Test Case')).toBeInTheDocument();
});
```

## Getting Help

### Documentation Resources
- **Architecture:** See `docs/architecture/` for system design
- **API Docs:** Run backend, visit http://localhost:8000/docs
- **Setup Guide:** `.github/GITHUB_SETUP_GUIDE.md`
- **CI/CD:** `docs/CI_CD_QUICK_START.md`

### External Links
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev/)
- [pytest Documentation](https://docs.pytest.org/)

### Agent Coordination
⚠️ **IMPORTANT**: This project uses agent coordination rules. Agents must respect:
- Rules in `.agent/rules/agent_coordination.mdc`
- Workflow verification: `.agent/workflows/verify_mcp_config.md`

## Review Process

All code changes require:
1. **Automated checks** passing (CI workflows)
2. **Human review** before merging
3. **Testing** in appropriate environment
4. **Documentation** updated if behavior changes

Copilot agents cannot merge their own PRs - human approval required.

## Environment Setup

### Required Environment Variables (Backend)
```bash
DATABASE_URL=postgresql://user:pass@localhost/fraud_detection
REDIS_URL=redis://localhost:6379/0
ANTHROPIC_API_KEY=sk-...  # For Claude API
SECRET_KEY=<random-string>  # For JWT
```

### Required Environment Variables (Frontend)
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

Use `.env.example` files as templates. Never commit real credentials.

## Performance Considerations

### Backend
- Use database indexes on frequently queried fields
- Implement pagination for list endpoints (default: 20 items)
- Use async I/O for all database/external API calls
- Cache expensive operations with Redis
- Use background tasks (Celery) for long operations

### Frontend
- Lazy load routes with React.lazy()
- Virtualize long lists (react-virtual)
- Debounce search inputs
- Use React Query caching (staleTime, cacheTime)
- Optimize images (WebP, lazy loading)
- Code split large dependencies

## Accessibility

### Requirements
- All interactive elements keyboard accessible
- ARIA labels on buttons/controls
- Proper heading hierarchy (h1, h2, h3)
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible
- Form validation with clear error messages

### Testing
- Run `npm run test:a11y` in frontend
- Test keyboard navigation manually
- Use screen reader (NVDA, VoiceOver) for critical flows

## Version Control

### Branch Naming
- Feature: `feature/add-pagination`
- Bug fix: `fix/case-list-crash`
- Copilot: `copilot/<task-description>`

### Commit Messages
- Use imperative mood: "Add pagination to case list"
- Reference issue: "Fix #123: Handle empty case list"
- Keep first line under 72 characters
- Add body for complex changes

### What Not to Commit
- `node_modules/`, `__pycache__/`, `.pytest_cache/`
- `.env` files with real credentials
- `coverage/`, `dist/`, `build/` directories
- IDE-specific files (except .vscode/ if team-shared)
- Large binary files (use Git LFS or external storage)

## Debugging Tips

### Backend
- Use FastAPI interactive docs: http://localhost:8000/docs
- Check logs: `docker-compose logs backend`
- Use Python debugger: `import pdb; pdb.set_trace()`
- Check database: `docker-compose exec db psql -U postgres -d fraud_detection`

### Frontend
- Use React DevTools browser extension
- Check network tab for API calls
- Use browser debugger with source maps
- Check console for errors and warnings

## Conclusion

Following these guidelines will help maintain code quality and consistency. When in doubt:
1. Look at existing code for patterns
2. Run tests early and often
3. Ask for clarification on ambiguous requirements
4. Prioritize security and accessibility
5. Keep changes focused and minimal

Happy coding! 🚀
