# Contributing to Fraud Detection System

Thank you for your interest in contributing to the Fraud Detection System! This document provides guidelines for both human developers and AI coding agents (like GitHub Copilot).

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [For AI Coding Agents](#for-ai-coding-agents)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and constructive
- Focus on what's best for the project
- Accept constructive criticism gracefully
- Support other contributors

## Getting Started

### Prerequisites

- **Python 3.12+** with Poetry
- **Node.js 20+** with npm
- **Docker & Docker Compose**
- **Git**

### Setup Your Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Simple378.git
   cd Simple378
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Install dependencies**
   
   Backend:
   ```bash
   cd backend
   poetry install
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm install
   ```

4. **Start development environment**
   ```bash
   # Option 1: Docker Compose (recommended)
   docker-compose up --build
   
   # Option 2: Local development
   # Terminal 1 - Backend
   cd backend && poetry run uvicorn app.main:app --reload
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Verify setup**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/docs
   - All tests pass: `cd frontend && npm test` and `cd backend && poetry run pytest`

## Development Workflow

### 1. Choose or Create an Issue

- Browse [existing issues](https://github.com/teoat/Simple378/issues)
- Look for issues labeled `good first issue` for newcomers
- For new features, create an issue first to discuss the approach
- Use issue templates for consistency

### 2. Create a Branch

```bash
# For features
git checkout -b feature/add-pagination

# For bug fixes
git checkout -b fix/case-list-crash

# For Copilot agents (automatically created)
git checkout -b copilot/<task-description>
```

### 3. Make Your Changes

- Follow the [coding standards](#coding-standards)
- Write tests for new functionality
- Keep changes focused and minimal
- Commit frequently with clear messages

### 4. Test Your Changes

**Backend:**
```bash
cd backend
poetry run ruff check .        # Linting
poetry run black .              # Formatting
poetry run pytest               # All tests
poetry run pytest --cov=app     # With coverage
```

**Frontend:**
```bash
cd frontend
npm run lint                    # Linting
npm run build                   # Type checking
npm test                        # Unit tests
npm run test -- --coverage      # With coverage
```

### 5. Submit a Pull Request

- Push your branch to your fork
- Open a pull request against `main`
- Fill out the PR template completely
- Link related issues
- Request review from maintainers

## Coding Standards

### Python (Backend)

**Style:**
- Follow PEP 8
- Use Black for formatting (line length: 88)
- Use Ruff for linting
- Add type hints to all functions

**Example:**
```python
from typing import List
from app.models.case import Case

async def get_cases(
    skip: int = 0,
    limit: int = 20,
) -> List[Case]:
    """
    Retrieve cases with pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of Case objects
    """
    # Implementation
    pass
```

### TypeScript/React (Frontend)

**Style:**
- Use ESLint configuration
- Functional components with hooks
- TypeScript strict mode
- Named exports preferred

**Example:**
```typescript
interface CaseListProps {
  filter?: string;
  onCaseSelect: (caseId: string) => void;
}

export function CaseList({ filter, onCaseSelect }: CaseListProps) {
  const { data, isLoading } = useCases(filter);
  
  if (isLoading) return <Spinner />;
  
  return (
    <div className="case-list">
      {data?.map(case => (
        <CaseCard 
          key={case.id} 
          case={case}
          onClick={() => onCaseSelect(case.id)}
        />
      ))}
    </div>
  );
}
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting (no logic change)
- `refactor:` Code restructuring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(cases): add pagination to case list

- Add pagination component with prev/next buttons
- Update API to support limit/offset parameters
- Add tests for pagination logic

Closes #123
```

```
fix(auth): handle expired token gracefully

Previously, expired tokens caused a crash. Now they redirect
to the login page with a helpful message.

Fixes #456
```

## Testing Requirements

### When to Write Tests

**Required:**
- All new features must have tests
- Bug fixes should include regression tests
- Refactoring should maintain test coverage

**Test Types:**

1. **Unit Tests** - Test individual functions/components
   ```typescript
   // Frontend example
   test('CasePagination updates page on click', () => {
     const onPageChange = vi.fn();
     render(<CasePagination currentPage={1} onPageChange={onPageChange} />);
     
     fireEvent.click(screen.getByText('Next'));
     expect(onPageChange).toHaveBeenCalledWith(2);
   });
   ```

2. **Integration Tests** - Test component interactions
   ```python
   # Backend example
   async def test_create_case_with_evidence(client):
       response = await client.post(
           "/api/v1/cases",
           json={"title": "Test Case", "evidence_ids": ["ev1"]}
       )
       assert response.status_code == 201
       assert response.json()["evidence_count"] == 1
   ```

3. **E2E Tests** - Test user workflows (Playwright)
   ```typescript
   test('user can create and view case', async ({ page }) => {
     await page.goto('/cases');
     await page.click('text=New Case');
     await page.fill('[name=title]', 'Fraud Case');
     await page.click('text=Submit');
     
     await expect(page.locator('text=Fraud Case')).toBeVisible();
   });
   ```

### Coverage Goals

- **Backend:** Minimum 80% coverage
- **Frontend:** Minimum 70% coverage
- **Critical paths:** 100% coverage (auth, payments, data processing)

## Pull Request Process

### Before Submitting

- [ ] All tests pass locally
- [ ] Code follows style guidelines (linters pass)
- [ ] Added tests for new functionality
- [ ] Updated documentation if needed
- [ ] Reviewed your own code for obvious issues
- [ ] No merge conflicts with main branch

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Changes Made
- Added pagination component
- Updated API endpoint to support limit/offset
- Added unit tests for pagination

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manually tested in browser/app
- [ ] No breaking changes

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
```

### Review Process

1. **Automated checks** run via GitHub Actions
   - Linting, type checking, tests must pass
   - Security scanning (Trivy, npm audit)
   - Accessibility tests (for frontend)

2. **Code review** by maintainers
   - At least one approval required
   - Address all feedback or explain decisions

3. **Final approval** and merge
   - Squash and merge for clean history
   - Delete branch after merge

## For AI Coding Agents

If you're a GitHub Copilot coding agent or similar AI assistant:

### Important Files to Read First

1. **AGENTS.md** - Comprehensive guidelines for AI agents
2. **README.md** - Project overview and setup
3. **This file** - Contribution process
4. Issue templates in `.github/ISSUE_TEMPLATE/`

### Best Practices for AI Agents

**✅ DO:**
- Read issue descriptions carefully and ask clarifying questions
- Follow existing code patterns and conventions
- Write tests for all new functionality
- Update documentation for behavior changes
- Make minimal, focused changes
- Use existing libraries and utilities
- Check that all CI checks pass
- Link PRs to related issues

**❌ DON'T:**
- Make assumptions about unclear requirements
- Skip writing tests
- Introduce breaking changes without discussion
- Commit secrets or sensitive data
- Modify security-critical code without human review
- Change more files than necessary
- Ignore linter/type checker errors
- Create PRs without descriptions

### Task Suitability

**Good for AI Agents:**
- Bug fixes with clear reproduction steps
- Adding tests for existing features
- Implementing UI components from specs
- API endpoints following existing patterns
- Documentation updates
- Refactoring with clear scope
- Accessibility improvements
- Performance optimizations (with benchmarks)

**Require Human Oversight:**
- New authentication/authorization features
- Database schema changes
- Major architectural changes
- Integration with external services
- Security-sensitive code
- Complex business logic
- Ambiguous requirements

### Quality Checklist for AI Agents

Before submitting a PR:

- [ ] I understand the issue requirements completely
- [ ] My changes follow the existing code style and patterns
- [ ] I added tests that verify my changes work correctly
- [ ] All existing tests still pass
- [ ] I updated relevant documentation
- [ ] I did not introduce any security vulnerabilities
- [ ] My code handles errors appropriately
- [ ] I tested the changes manually (if applicable)
- [ ] The PR description clearly explains what and why

### Getting Feedback

If you're unsure about:
- **Requirements:** Comment on the issue asking for clarification
- **Implementation approach:** Describe your plan in the issue first
- **Testing strategy:** Ask what level of testing is appropriate
- **Architecture decisions:** Tag a maintainer for guidance

## Questions or Help?

- **Issues:** [Create an issue](https://github.com/teoat/Simple378/issues/new/choose)
- **Discussions:** Use GitHub Discussions for general questions
- **Documentation:** Check `docs/` folder for detailed guides
- **Setup issues:** See `.github/GITHUB_SETUP_GUIDE.md`

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🎉
