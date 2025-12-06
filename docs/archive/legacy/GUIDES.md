# Implementation Guides

**Consolidated from:** guides/WEBSOCKET_SECURITY_IMPLEMENTATION.md (already included in DIAGNOSTICS.md), copilot_instructions.md (already included in TESTING_QUALITY.md)

---

## 1. Development Guidelines

### Frontend Development Guidelines

#### Component Architecture
- **Atomic Design:** Organize components by complexity (atoms, molecules, organisms)
- **Single Responsibility:** Each component should have one clear purpose
- **Composition over Inheritance:** Use composition patterns for component reuse
- **TypeScript Strict:** All components must be fully typed

#### State Management
- **React Query for Server State:** API calls, caching, synchronization
- **Context for UI State:** Theme, user preferences, modal states
- **Local State for Component State:** Form inputs, UI interactions
- **Zustand for Complex State:** When Context becomes too complex

#### Styling Guidelines
- **Tailwind CSS:** Utility-first approach with custom design tokens
- **Glassmorphism:** Consistent backdrop-blur and transparency effects
- **Dark Mode:** Full support with CSS custom properties
- **Responsive Design:** Mobile-first with breakpoint system

#### Accessibility Standards
- **WCAG 2.1 AAA:** Target compliance level for all components
- **Keyboard Navigation:** Full keyboard-only operation
- **Screen Reader Support:** Comprehensive ARIA implementation
- **Focus Management:** Visible focus indicators and logical tab order

#### Performance Optimization
- **Code Splitting:** Route-based and component-based splitting
- **Lazy Loading:** Images and components loaded on demand
- **Bundle Analysis:** Regular bundle size monitoring
- **Memoization:** React.memo, useMemo, useCallback appropriately

#### Testing Strategy
- **Unit Tests:** Jest + React Testing Library for component testing
- **Integration Tests:** API integration and component interaction
- **E2E Tests:** Playwright for critical user journeys
- **Accessibility Tests:** Automated axe-core testing

#### Code Quality
- **ESLint + Prettier:** Automated code formatting and linting
- **TypeScript Strict:** No any types, full type coverage
- **Pre-commit Hooks:** Quality checks before commits
- **Code Reviews:** Required for all changes

---

## 2. Backend Development Guidelines

### API Design Principles
- **RESTful Endpoints:** Standard HTTP methods and status codes
- **Versioning:** `/api/v1/` prefix for all endpoints
- **Pagination:** Cursor-based pagination for large datasets
- **Filtering:** Query parameter-based filtering with validation
- **Sorting:** Multi-field sorting with direction control
- **Rate Limiting:** Token bucket algorithm with Redis backend

### Database Design
- **Normalized Schemas:** Proper relationships and constraints
- **Indexing Strategy:** Optimized queries with appropriate indexes
- **Migration Safety:** Backward-compatible schema changes
- **Data Integrity:** Foreign keys and constraints enforcement

### Security Implementation
- **Input Validation:** Pydantic models for all API inputs
- **Authentication:** JWT tokens with secure signing
- **Authorization:** Role-based access control (RBAC)
- **Data Encryption:** AES-256 for sensitive data at rest
- **Audit Logging:** Immutable activity tracking

### Error Handling
- **Structured Errors:** Consistent error response format
- **HTTP Status Codes:** Appropriate status codes for all scenarios
- **Logging:** Structured logging with appropriate log levels
- **Graceful Degradation:** Fail-safe behavior for service failures

### Performance Optimization
- **Async Operations:** Non-blocking I/O throughout
- **Connection Pooling:** Efficient database connection management
- **Caching Strategy:** Redis caching for frequently accessed data
- **Query Optimization:** Efficient database queries and indexing

---

## 3. Testing Implementation Guide

### Unit Testing Setup
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('displays user information', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

### Accessibility Testing
```typescript
// Axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### E2E Testing with Playwright
```typescript
// User journey test
test('complete case investigation workflow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'investigator@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/dashboard');
  
  await page.click('[data-testid="cases-link"]');
  await expect(page).toHaveURL('/cases');
  
  // Continue with case investigation flow...
});
```

---

## 4. Deployment Guide

### Docker Development Setup
```bash
# Clone repository
git clone <repository-url>
cd simple378

# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Run tests
docker-compose exec frontend npm run test
docker-compose exec backend pytest
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Health check
curl http://localhost/health
```

### Environment Configuration
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with production values
# backend/.env
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/fraud_detection
REDIS_URL=redis://cache:6379/0
SECRET_KEY=your-production-secret-key

# frontend/.env
VITE_API_URL=https://api.yourdomain.com
```

---

## 5. API Documentation Guide

### OpenAPI Specification
```yaml
openapi: 3.0.3
info:
  title: Fraud Detection API
  version: 1.0.0
  description: API for fraud detection and case management

paths:
  /api/v1/cases:
    get:
      summary: List cases
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedCases'
```

### FastAPI Documentation
```python
from fastapi import FastAPI, Query
from typing import Optional

app = FastAPI(
    title="Fraud Detection API",
    description="API for fraud detection and case management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.get("/api/v1/cases")
async def get_cases(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query")
):
    """
    Get paginated list of cases.
    
    - **page**: Page number (starts from 1)
    - **limit**: Number of items per page (1-100)
    - **search**: Optional search query
    """
    # Implementation here
    pass
```

---

## 6. Security Implementation Guide

### JWT Token Management
```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# JWT tokens
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Invalid token")
```

### Input Validation
```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)
    role: str = Field("analyst", regex="^(admin|analyst|auditor|viewer)$")

class CaseCreate(BaseModel):
    subject_name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    risk_score: float = Field(..., ge=0.0, le=100.0)
```

### Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/login")
@limiter.limit("10/minute")
async def login(request: Request, credentials: LoginCredentials):
    # Login logic here
    pass

@app.post("/api/v1/cases")
@limiter.limit("100/hour")
async def create_case(request: Request, case: CaseCreate):
    # Case creation logic here
    pass
```

---

## 7. Database Migration Guide

### Alembic Setup
```bash
# Initialize alembic
alembic init alembic

# Create migration
alembic revision -m "add user table"

# Run migration
alembic upgrade head

# Downgrade
alembic downgrade -1
```

### Migration Example
```python
# alembic/versions/001_add_user_table.py
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

def downgrade():
    op.drop_table('users')
```

---

## 8. Monitoring & Observability Guide

### Structured Logging
```python
import structlog
import logging

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage
logger.info("User login", user_id=user.id, ip_address=request.client.host)
logger.error("Database error", error=str(e), query=query)
```

### Prometheus Metrics
```python
from prometheus_fastapi_instrumentator import Instrumentator

# Initialize metrics
Instrumentator().instrument(app).expose(app)

# Custom metrics
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency', ['method', 'endpoint'])

@app.middleware("http")
async def add_metrics(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    REQUEST_COUNT.labels(request.method, request.url.path).inc()
    REQUEST_LATENCY.labels(request.method, request.url.path).observe(time.time() - start_time)
    
    return response
```

### Health Checks
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@router.get("/health/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed health check with dependencies"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {}
    }
    
    # Check database
    try:
        await db.execute(text("SELECT 1"))
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check Redis
    try:
        redis_client.ping()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    return health_status
```

---

## 9. Troubleshooting Guide

### Common Frontend Issues

#### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Check TypeScript errors
npm run type-check
```

#### Runtime Errors
```typescript
// Add error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Report to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

### Common Backend Issues

#### Database Connection Issues
```python
# Check database URL
from app.core.config import settings
print(settings.DATABASE_URL)

# Test connection
from sqlalchemy import text
from app.db.session import get_db

async def test_db():
    async with get_db() as db:
        result = await db.execute(text("SELECT 1"))
        print("Database connection successful")
```

#### Migration Issues
```bash
# Check current migration status
alembic current

# Show migration history
alembic history

# Fix stuck migration
alembic stamp head
```

### Performance Issues

#### Frontend Performance
```typescript
// Use React DevTools Profiler
// Check bundle size
npm run build -- --analyze

// Optimize images
import image from './image.jpg';
// Use next-gen formats with fallbacks
<picture>
  <source srcset={imageWebp} type="image/webp" />
  <img src={imageJpg} alt="Description" />
</picture>
```

#### Backend Performance
```python
# Add database indexes
op.create_index('idx_cases_created_at', 'cases', ['created_at'])
op.create_index('idx_cases_risk_score', 'cases', ['risk_score'])

# Use database connection pooling
# Configure in settings
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_size": 10,
    "max_overflow": 20,
    "pool_timeout": 30,
    "pool_recycle": 3600,
}
```

---

## 10. Contributing Guide

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Run tests:** `npm run test && npm run test:e2e`
5. **Check accessibility:** `npm run test:a11y`
6. **Commit your changes:** `git commit -m "Add your feature"`
7. **Push to your branch:** `git push origin feature/your-feature-name`
8. **Create a Pull Request**

### Code Review Checklist
- [ ] **Functionality:** Does the code work as expected?
- [ ] **TypeScript:** Are all types correct and complete?
- [ ] **Tests:** Are there adequate tests covering the new functionality?
- [ ] **Accessibility:** Does the code meet WCAG 2.1 AA standards?
- [ ] **Performance:** Are there any performance regressions?
- [ ] **Security:** Is the code secure and follows security best practices?
- [ ] **Documentation:** Is the code well-documented?
- [ ] **Style:** Does the code follow the project's style guidelines?

### Commit Message Guidelines
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(auth): add biometric authentication support
fix(dashboard): resolve chart rendering issue on mobile
docs(api): update endpoint documentation
test(adjudication): add keyboard navigation tests
```

---

**Implementation Guides - Complete and Consolidated**
**Last Updated:** December 5, 2025
**Status:** ✅ COMPREHENSIVE GUIDES FOR DEVELOPMENT