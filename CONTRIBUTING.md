# Contributing to Mens Rea - Fraud Detection System

Thank you for your interest in contributing to the Mens Rea fraud detection platform! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)
- [Security Guidelines](#security-guidelines)

---

## Code of Conduct

### Our Standards

- **Professional**: Maintain professional conduct in all interactions
- **Inclusive**: Welcome contributors of all backgrounds and experience levels
- **Respectful**: Value diverse opinions and experiences
- **Collaborative**: Work together to build the best possible product
- **Security-First**: Prioritize security and privacy in all contributions

---

## Getting Started

### Prerequisites

- **Backend**: Python 3.11+, Poetry, PostgreSQL 14+, Redis
- **Frontend**: Node.js 20+, npm 10+
- **Tools**: Docker, Git, VS Code (recommended)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/mens-rea.git
cd mens-rea

# Backend setup
cd backend
poetry install
poetry run alembic upgrade head

# Frontend setup
cd ../frontend
npm install

# Environment configuration
cp .env.example .env
# Edit .env with your local configuration
```

### Running Locally

```bash
# Terminal 1: Backend
./start-backend.sh

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Docker services (PostgreSQL, Redis, etc.)
docker-compose up -d
```

---

## Development Workflow

### Branching Strategy

We follow **Git Flow**:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/<name>` - New features
- `bugfix/<name>` - Bug fixes
- `hotfix/<name>` - Critical production fixes
- `release/<version>` - Release preparation

### Commit Message Convention

Follow **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Changes to build process, dependencies, etc.
- `perf`: Performance improvement
- `security`: Security fix or improvement

**Example**:
```
feat(adjudication): add 5-second undo window for decisions

- Implemented undo mutation calling /revert endpoint
- Added toast notification with undo button
- Auto-clears after 5 seconds

Closes #123
```

---

## Code Standards

### Backend (Python)

#### Style Guide

- **Formatter**: Black (line-length: 88)
- **Linter**: Ruff or Flake8
- **Type Checker**: mypy (strict mode)
- **Import Sorting**: isort

```bash
# Format code
poetry run black .

# Lint code
poetry run ruff check .

# Type check
poetry run mypy .

# Sort imports
poetry run isort .
```

#### Naming Conventions

- **Variables/Functions**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_CASE`
- **Private Members**: `_leading_underscore`

#### Type Hints (MANDATORY)

```python
from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession

async def get_user_by_id(
    db: AsyncSession,
    user_id: str
) -> Optional[User]:
    """
    Retrieve a user by their ID.
    
    Args:
        db: Database session
        user_id: UUID of the user
        
    Returns:
        User object if found, None otherwise
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()
```

#### Async Patterns

- Use `async/await` for all I/O operations
- Use `asyncio.gather()` for concurrent tasks
- Always handle exceptions in async contexts
- Use connection pools for database access

```python
# Good: Concurrent operations
metadata, analysis = await asyncio.gather(
    extract_metadata(file_path),
    run_analysis(file_path)
)

# Bad: Sequential when not necessary
metadata = await extract_metadata(file_path)
analysis = await run_analysis(file_path)
```

#### Database Transactions

```python
# Always use transactions for multi-step operations
async with db.begin():
    transaction = Transaction(...)
    db.add(transaction)
    
    event = Event(aggregate_id=transaction.id, ...)
    db.add(event)
    
    # Commit happens automatically
```

### Frontend (TypeScript/React)

#### Style Guide

- **Formatter**: Prettier
- **Linter**: ESLint (strict config)
- **Type Checking**: TypeScript strict mode

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

#### Naming Conventions

- **Components**: `PascalCase` (e.g., `AlertCard.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useWebSocket.tsx`)
- **Utilities**: `camelCase` (e.g., `apiRequest.ts`)
- **Constants**: `UPPER_CASE`

#### Component Structure

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Types/Interfaces
interface AlertCardProps {
  alert: Alert;
  onDecision: (decision: Decision) => void;
}

// 3. Component
export function AlertCard({ alert, onDecision }: AlertCardProps) {
  // Hooks first
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Event handlers
  const handleExpand = () => setIsExpanded(prev => !prev);
  
  // Render
  return (
    <div>...</div>
  );
}
```

#### No `any` Types

```typescript
// Bad
const handleData = (data: any) => { ... }

// Good
const handleData = (data: Alert | Transaction | Subject) => { ... }

// Or use generics
const handleData = <T extends BaseEntity>(data: T) => { ... }
```

---

## Testing Requirements

### Coverage Requirements

- **Backend**: Minimum 85% coverage (goal: 95%)
- **Frontend**: Minimum 80% coverage (goal: 95%)
- **Critical Paths**: 100% coverage required

### Backend Testing

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html

# Run specific test file
poetry run pytest tests/test_adjudication.py -v
```

#### Test Structure

```python
# tests/test_adjudication.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
async def test_submit_decision_success(
    client: AsyncClient,
    db: AsyncSession,
    test_user: User,
    test_alert: AnalysisResult
):
    """Test successful decision submission."""
    response = await client.post(
        f"/api/v1/adjudication/{test_alert.id}/decision",
        json={"decision": "confirmed_fraud", "notes": "Test note"},
        headers={"Authorization": f"Bearer {test_user.token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["decision"] == "confirmed_fraud"
```

### Frontend Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run E2E tests
npm run test:e2e
```

#### Component Testing

```typescript
// AlertCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertCard } from './AlertCard';

describe('AlertCard', () => {
  it('renders alert information', () => {
    const mockAlert = {
      id: '123',
      subject_name: 'Test Subject',
      risk_score: 85
    };
    
    render(<AlertCard alert={mockAlert} onDecision={jest.fn()} />);
    
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.getByText(/Risk: 85/)).toBeInTheDocument();
  });
  
  it('calls onDecision when approve is clicked', () => {
    const mockOnDecision = jest.fn();
    const mockAlert = { /* ... */ };
    
    render(<AlertCard alert={mockAlert} onDecision={mockOnDecision} />);
    
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    
    expect(mockOnDecision).toHaveBeenCalledWith('approve');
  });
});
```

---

## Documentation Standards

### Code Documentation

#### Python Docstrings (Google Style)

```python
def calculate_risk_score(
    transactions: List[Transaction],
    indicators: List[Indicator],
    threshold: float = 0.5
) -> RiskScore:
    """
    Calculate the overall risk score for a subject.
    
    This function aggregates multiple risk indicators and applies
    a weighted scoring algorithm to produce a final risk assessment.
    
    Args:
        transactions: List of transactions to analyze
        indicators: Detected fraud indicators
        threshold: Minimum confidence threshold (default: 0.5)
        
    Returns:
        RiskScore object containing:
            - score: Numerical risk value (0-100)
            - confidence: Confidence level (0-1)
            - breakdown: Individual indicator contributions
            
    Raises:
        ValueError: If transactions list is empty
        InvalidIndicatorError: If indicator data is malformed
        
    Example:
        >>> txns = [Transaction(...), ...]
        >>> indicators = [Indicator(...), ...]
        >>> score = calculate_risk_score(txns, indicators)
        >>> print(f"Risk: {score.score}")
        Risk: 87.5
    """
    if not transactions:
        raise ValueError("Transactions list cannot be empty")
    # ... implementation
```

#### TypeScript JSDoc

```typescript
/**
 * Submit an adjudication decision for an alert.
 * 
 * @param alertId - UUID of the alert to decide
 * @param decision - Decision type (approve, reject, escalate)
 * @param comment - Optional comment explaining the decision
 * @returns Promise resolving to the updated alert
 * @throws {ApiError} If the alert is not found or already resolved
 * 
 * @example
 * ```typescript
 * const result = await submitDecision(
 *   'alert-123',
 *   'approve',
 *   'Verified with account holder'
 * );
 * ```
 */
export async function submitDecision(
  alertId: string,
  decision: DecisionType,
  comment?: string
): Promise<Alert> {
  // ... implementation
}
```

### README Files

Every directory should have a `README.md` explaining:

1. **Purpose**: What this directory contains
2. **Structure**: How files are organized
3. **Usage**: How to use/run the code
4. **Dependencies**: Required tools/libraries
5. **Examples**: Common use cases

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines (linted and formatted)
- [ ] All tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No debugging code (console.log, print statements)
- [ ] No commented-out code
- [ ] Type hints added (Python) / No `any` types (TypeScript)
- [ ] Security implications considered

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that changes existing functionality)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Related Issues
Closes #(issue number)
```

### Review Process

1. **Automated Checks**: CI must pass (linting, type checking, tests)
2. **Code Review**: At least one approval from CODEOWNERS
3. **Security Review**: Required for changes to auth, encryption, or data handling
4. **Testing**: QA team verification for major features
5. **Merge**: Squash and merge to maintain clean history

---

## Security Guidelines

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Email: security@your-org.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

#### Secrets Management

- **NEVER** commit secrets, API keys, or passwords
- Use environment variables for configuration
- Use `.env.example` for documentation (no real values)
- Rotate secrets regularly

#### Authentication

- Always validate JWT tokens
- Use RBAC for authorization
- Implement rate limiting
- Log security events

#### Data Handling

- Encrypt PII at rest and in transit
- Use parameterized queries (prevent SQL injection)
- Validate and sanitize all user input
- Implement proper CORS policies

```python
# Bad: SQL injection risk
query = f"SELECT * FROM users WHERE email = '{email}'"

# Good: Parameterized query
query = select(User).where(User.email == email)
```

#### Dependencies

- Keep dependencies up to date
- Run `npm audit` and `poetry audit` regularly
- Review security advisories
- Use Dependabot for automated updates

---

## Questions?

- **Documentation**: Check `/docs` directory
- **Chat**: Slack #mens-rea-dev channel
- **Email**: dev-team@your-org.com
- **Issues**: GitHub Issues for bug reports and feature requests

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to Mens Rea!** 🚀
