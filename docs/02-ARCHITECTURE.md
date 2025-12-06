# 🏗️ System Architecture & Code Organization

---

## Tech Stack Overview

### Backend
- **FastAPI** - Modern async Python web framework
- **Python 3.11+** - Language
- **PostgreSQL 16** - Primary OLTP database
- **TimescaleDB** - Time-series analytics (ready, consolidation possible)
- **SQLAlchemy 2.0** - Async ORM
- **Redis** - Caching, sessions, rate limiting
- **Qdrant** - Vector search for semantic queries

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript** - Language
- **Vite** - Ultra-fast bundler
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Infrastructure
- **Docker Compose** - Local orchestration
- **Prometheus** - Metrics (ready)
- **Nginx** - Reverse proxy (production)
- **WebSocket** - Real-time updates

---

## Code Organization

```
backend/app/
├── api/v1/
│   ├── endpoints/
│   │   ├── auth.py              # OAuth, JWT
│   │   ├── cases.py             # Case CRUD
│   │   ├── ingestion.py         # Ingestion workflow
│   │   ├── categorization.py    # Category ops
│   │   ├── reconciliation.py    # Matching engine
│   │   └── ... (50+ endpoints)
│   └── websocket.py             # Real-time updates
├── services/
│   ├── auth_service.py          # Authentication
│   ├── redaction_analyzer.py    # Gap analysis ⭐
│   ├── auto_mapper.py           # AI field mapping ⭐
│   ├── categorization_service.py # Transaction org
│   └── ... (15+ services)
├── models/
│   ├── user.py                  # User model
│   ├── case.py                  # Case model
│   ├── transaction.py           # Transaction model
│   ├── audit_log.py             # Compliance
│   └── ... (schema definitions)
├── core/
│   ├── config.py                # Settings
│   ├── security.py              # Auth middleware
│   ├── dependencies.py          # DI
│   └── exceptions.py            # Error handling
├── schemas/
│   └── ... (Pydantic models)
└── main.py                      # FastAPI initialization

frontend/src/
├── pages/
│   ├── Login.tsx                # Authentication
│   ├── Dashboard.tsx            # Metrics
│   ├── CaseList.tsx             # Browse cases
│   ├── CaseDetail.tsx           # View case
│   ├── Ingestion.tsx            # 5-step wizard ⭐
│   ├── Visualization.tsx        # Charts & KPIs ⭐
│   ├── Categorization.tsx       # Bulk categorize ⭐
│   ├── Summary.tsx              # Reports
│   ├── AdjudicationQueue.tsx    # WebSocket live
│   ├── Reconciliation.tsx       # Matching
│   ├── SemanticSearch.tsx       # Vector search
│   ├── SearchAnalytics.tsx      # Analytics
│   ├── Settings.tsx             # Preferences
│   └── Error pages (404, 500, 403)
├── components/
│   ├── ingestion/
│   │   ├── FileUpload.tsx       # Upload UI
│   │   ├── FieldMapper.tsx      # Column mapping
│   │   ├── RedactionAnalysisPanel.tsx  # Gap analysis ⭐
│   │   └── Preview.tsx          # Validation
│   ├── categorization/
│   │   ├── CategoryTable.tsx    # Browse
│   │   ├── BulkSelector.tsx     # Multi-select
│   │   ├── AISuggestions.tsx    # AI helpers
│   │   └── Statistics.tsx       # Dashboard
│   ├── common/
│   │   ├── Header.tsx           # Top nav
│   │   ├── Sidebar.tsx          # Left nav
│   │   ├── ErrorBoundary.tsx    # Error handling
│   │   └── ... (20+ common)
│   ├── charts/
│   │   ├── KPICard.tsx          # Metrics
│   │   ├── ExpenseChart.tsx     # Trends
│   │   └── ... (5+ visualizations)
│   └── ... (60+ total components)
├── hooks/
│   ├── useWebSocket.ts          # Real-time
│   ├── useAuth.ts               # Auth state
│   ├── useApi.ts                # API calls
│   └── ... (10+ custom hooks)
├── services/
│   ├── api.ts                   # HTTP client
│   ├── websocket.ts             # WS client
│   ├── storage.ts               # Local state
│   └── auth.ts                  # Auth flow
├── types/
│   ├── index.ts                 # Common types
│   ├── api.ts                   # API schemas
│   └── domain.ts                # Business types
├── styles/
│   └── globals.css              # Global styles
└── App.tsx                      # Root component
```

---

## API Design

### RESTful Endpoints (50+)

**Pattern:** `/api/v1/{resource}`

**Authentication:** JWT token in Authorization header

**Examples:**

```
POST   /api/v1/auth/login              # Login
POST   /api/v1/auth/logout             # Logout

GET    /api/v1/cases                   # List cases
POST   /api/v1/cases                   # Create case
GET    /api/v1/cases/{id}              # Get case
PUT    /api/v1/cases/{id}              # Update case

POST   /api/v1/ingestion               # Create ingestion
POST   /api/v1/ingestion/{id}/upload   # Upload file
POST   /api/v1/ingestion/{id}/auto-map # AI mapping ⭐
POST   /api/v1/ingestion/{id}/analyze-redactions  # Gap analysis ⭐
GET    /api/v1/ingestion/{id}/preview  # Validation

GET    /api/v1/transactions            # List transactions
POST   /api/v1/transactions/categorize # Bulk update
POST   /api/v1/transactions/{id}/category  # Single update

GET    /api/v1/metrics/dashboard       # KPIs
GET    /api/v1/metrics/visualization   # Charts
```

### WebSocket Endpoints

**Pattern:** `ws://localhost:8000/ws/{channel}`

**Usage:** Real-time adjudication queue, live case updates

---

## Data Models

### Core Tables

**users** - Authentication & RBAC
```sql
id, email, hashed_password, role, created_at, updated_at
```

**cases** - Case management
```sql
id, name, risk_score, status, created_at, updated_at, metadata
```

**transactions** - Financial records
```sql
id, case_id, amount, date, description, category, created_at
```

**audit_logs** - Compliance & tracking
```sql
id, user_id, action, entity_type, entity_id, timestamp
```

**ingestions** - Import workflows
```sql
id, case_id, file_name, status, field_mapping, created_at
```

### Relationships

```
users (1) ──────> (M) cases
         ──────> (M) audit_logs

cases (1) ──────> (M) transactions
      ──────> (M) ingestions
      ──────> (M) audit_logs

transactions (1) ──────> (1) ingestion
             ──────> (1) category
```

---

## Key Architectural Patterns

### 1. Async/Await Throughout

**Backend:**
```python
@router.get("/cases")
async def list_cases(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    result = await db.execute(select(Case).offset(skip).limit(limit))
    return result.scalars().all()
```

**Frontend:**
```typescript
const { data, isLoading } = useQuery(
  ['cases'],
  async () => {
    const response = await api.get('/cases');
    return response.data;
  }
);
```

### 2. Dependency Injection (Backend)

```python
# In core/dependencies.py
async def get_db() -> AsyncGenerator:
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user_id = verify_token(token)
    return await get_user(user_id)

# In endpoint
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### 3. Service Layer Abstraction

**Example: Redaction Analysis**

```python
# services/redaction_analyzer.py
class RedactionAnalyzer:
    async def analyze(self, case_id: str, transactions: List[Transaction]):
        gaps = self.find_sequence_gaps(transactions)
        balance_issues = await self.verify_balances(transactions)
        return self.format_findings(gaps, balance_issues)

# api/endpoints/ingestion.py
analyzer = RedactionAnalyzer()

@router.post("/ingestion/{id}/analyze-redactions")
async def analyze_redactions(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    transactions = await db.query(Transaction).filter_by(case_id=id).all()
    findings = await analyzer.analyze(id, transactions)
    return findings
```

### 4. React Query for Server State

```typescript
// Automatic caching, deduplication, background updates
const { data: cases, refetch } = useQuery(
  ['cases', page],  // Cache key with dependency
  () => api.get('/cases?page=' + page),
  {
    staleTime: 5 * 60 * 1000,  // Fresh for 5 min
    cacheTime: 10 * 60 * 1000, // Keep in memory for 10 min
  }
);
```

### 5. Component Composition (Frontend)

```typescript
// Compound component pattern
<TransactionCategorization>
  <SearchBar />
  <FilterPanel />
  <BulkActions>
    {/* Children get state from context */}
  </BulkActions>
  <TransactionTable />
  <Pagination />
</TransactionCategorization>
```

---

## Performance Optimizations

### Backend
- **Async pool:** 20 connections, max 40 overflow
- **Lazy loading:** Only select needed columns
- **Pagination:** 100 items per page by default
- **Query caching:** Redis for expensive queries
- **Connection pooling:** Reuse DB connections

### Frontend
- **Code splitting:** Each page is separate chunk
- **Lazy loading:** `React.lazy()` for route components
- **Vendor splitting:** React, Query, UI libs in separate chunks
- **Tree shaking:** Unused code removed in build
- **Compression:** GZip ready (middleware)

### Database
- **Indexes:** 9 strategic indexes on hot tables
- **Pagination:** Cursor-based or offset
- **Materialized views:** For complex queries
- **TimescaleDB:** Compression for time-series

---

## Security Layers

1. **Authentication:** OAuth2 + JWT
2. **Authorization:** RBAC with permission checking
3. **Input Validation:** Pydantic schemas + TypeScript types
4. **SQL Injection:** SQLAlchemy ORM parameterized queries
5. **XSS Prevention:** React auto-escaping, CSP headers
6. **CORS:** Restricted to trusted origins
7. **Rate Limiting:** Per IP + per user
8. **Audit Logging:** All actions logged for compliance

---

## Error Handling Strategy

**Backend:**
```python
class ValidationError(Exception):
    def __init__(self, message: str, field: str = None):
        self.message = message
        self.field = field

@router.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"error": exc.message, "field": exc.field}
    )
```

**Frontend:**
```typescript
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const ErrorBoundary: ErrorBoundary = (props) => {
  if (this.state.error instanceof APIError) {
    return <ErrorPage status={error.status} message={error.message} />;
  }
  // ...
};
```

---

## Testing Strategy

**Backend:**
- Unit tests: Services, models, utilities
- Integration tests: API endpoints with test DB
- E2E tests: Full workflows with Playwright

**Frontend:**
- Unit tests: Components, hooks, utilities
- Integration tests: Page workflows
- E2E tests: Full user journeys (Playwright)

---

## Deployment Architecture

```
┌─────────────────┐
│   Client (Web)  │
└────────┬────────┘
         │ HTTP/WS
         ↓
┌─────────────────────┐
│   Nginx (Reverse    │
│   Proxy + SSL)      │
└────────┬────────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────────┐
│React   │ │FastAPI   │
│(SPA)   │ │ Backend  │
└────────┘ └──────┬───┘
                  │
            ┌─────┴─────────────────┐
            ↓                       ↓
       ┌──────────┐          ┌──────────────┐
       │PostgreSQL│          │Redis/Qdrant  │
       └──────────┘          └──────────────┘
```

---

## Development Workflow

1. **Feature branch:** `git checkout -b feature/killer-feature`
2. **Backend:** Implement service + API endpoint
3. **Frontend:** Build component + integrate API
4. **Testing:** Unit + integration tests
5. **Code review:** PR with tests passing
6. **Merge:** To main → CI/CD pipeline
7. **Deploy:** Automatic to dev → manual to staging/prod

---

## Database Consolidation (Recommended)

**Current:** 2 separate databases (fraud_db + fraud_timescale)  
**Recommended:** Single TimescaleDB instance

**Benefits:**
- 50% fewer containers
- Simplified backup strategy
- Same connection pool management
- TimescaleDB is PostgreSQL superset

**See:** `03-DEPLOYMENT.md` for consolidation guide

---

**Architecture Status:** ✅ Production-Ready  
**Last Updated:** 2025-12-06
