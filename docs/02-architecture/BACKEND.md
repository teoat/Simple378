# 🐍 Backend Architecture

> FastAPI Python backend documentation

---

## Overview

The backend is built with FastAPI, providing a high-performance, async-first REST API for the Simple378 platform.

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # Application entry
│   ├── core/
│   │   ├── config.py        # Settings
│   │   ├── security.py      # Auth utilities
│   │   └── database.py      # DB connection
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py      # Authentication
│   │   │   ├── cases.py     # Case management
│   │   │   ├── analysis.py  # Fraud analysis
│   │   │   ├── ingestion.py # Document upload
│   │   │   └── adjudication.py
│   │   └── deps.py          # Dependencies
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   └── utils/               # Helpers
├── alembic/                 # Migrations
├── tests/                   # Test suite
└── requirements.txt
```

---

## Key Services

### AuthService
Handles authentication and authorization.

```python
class AuthService:
    async def login(email: str, password: str) -> TokenResponse
    async def verify_token(token: str) -> User
    async def refresh_token(refresh: str) -> TokenResponse
```

### CaseService
Manages investigation cases.

```python
class CaseService:
    async def create_case(data: CaseCreate) -> Case
    async def get_case(id: str) -> Case
    async def update_status(id: str, status: str) -> Case
    async def assign_investigator(id: str, user_id: str) -> Case
```

### AnalysisService
Performs fraud detection and pattern analysis.

```python
class AnalysisService:
    async def analyze_transactions(case_id: str) -> AnalysisResult
    async def detect_patterns(transactions: List[Transaction]) -> List[Pattern]
    async def calculate_risk_score(subject_id: str) -> RiskScore
```

### IngestionService
Handles document upload and processing.

```python
class IngestionService:
    async def upload_file(file: UploadFile, case_id: str) -> Document
    async def process_document(doc_id: str) -> ProcessingResult
    async def extract_entities(doc_id: str) -> List[Entity]
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Current user |

### Cases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cases` | List cases |
| POST | `/api/v1/cases` | Create case |
| GET | `/api/v1/cases/{id}` | Get case |
| PUT | `/api/v1/cases/{id}` | Update case |
| DELETE | `/api/v1/cases/{id}` | Delete case |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analysis/run` | Run analysis |
| GET | `/api/v1/analysis/{id}` | Get results |
| GET | `/api/v1/analysis/patterns` | List patterns |

### Adjudication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/adjudication/queue` | Get queue |
| POST | `/api/v1/adjudication/decide` | Submit decision |
| GET | `/api/v1/adjudication/history` | Decision history |

---

## Database Models

### Core Models

```python
class User(Base):
    id: UUID
    email: str
    hashed_password: str
    role: str
    created_at: datetime

class Case(Base):
    id: UUID
    subject_id: UUID
    status: str
    risk_score: float
    investigator_id: UUID
    created_at: datetime

class Transaction(Base):
    id: UUID
    case_id: UUID
    date: date
    amount: Decimal
    description: str
    counterparty: str
```

---

## Error Handling

All errors return consistent JSON:

```json
{
  "detail": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

---

## Testing

```bash
# Run all tests
pytest

# With coverage
pytest --cov=app

# Specific module
pytest tests/test_cases.py
```

---

## Related

- [API Reference](../04-developer-guide/API_REFERENCE.md)
- [Database Schema](./DATABASE.md)
