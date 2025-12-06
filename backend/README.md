# Backend Directory

This directory contains the FastAPI-based backend for the Fraud Detection System.

## 📁 Structure

```
backend/
├── app/                 # Main application code
│   ├── api/            # API endpoints (FastAPI routers)
│   ├── core/           # Core utilities (config, security, logging)
│   ├── db/             # Database models and session management
│   ├── graphql/        # GraphQL schema and resolvers
│   ├── orchestration/  # Multi-agent orchestration
│   ├── schemas/        # Pydantic schemas (request/response models)
│   ├── services/       # Business logic layer
│   └── main.py         # FastAPI application entry point
├── alembic/            # Database migration scripts
├── tests/              # Test suite
├── pyproject.toml      # Poetry dependencies and config
├── alembic.ini         # Alembic configuration
└── fraud_detection.db  # SQLite database (dev only)
```

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Poetry (Python dependency manager)

### Setup

1. **Install Dependencies**:
   ```bash
   poetry install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run Database Migrations**:
   ```bash
   poetry run alembic upgrade head
   ```

4. **Start Development Server**:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

   API will be available at: http://localhost:8000
   Interactive docs: http://localhost:8000/docs

## 🧪 Testing

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov --cov-report=html

# Run specific test file
poetry run pytest tests/test_api.py

# Run with verbose output
poetry run pytest -v
```

## 📝 Code Quality

### Formatting

```bash
# Format code with Black
poetry run black .

# Sort imports
poetry run isort .
```

### Linting

```bash
# Lint with Ruff
poetry run ruff check .

# Auto-fix linting issues
poetry run ruff check --fix .
```

### Type Checking

```bash
# Type check with mypy
poetry run mypy app
```

### Pre-commit Hooks

```bash
# Install pre-commit hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## 📂 Key Directories

### `/app/api/`
FastAPI route handlers organized by domain:
- `v1/endpoints/` - REST API endpoints
- `deps.py` - Shared dependencies (auth, DB session)

**Key Files**:
- `api.py` - Main API router
- `endpoints/cases.py` - Case management
- `endpoints/events.py` - Event sourcing
- `endpoints/login.py` - Authentication

### `/app/core/`
Core system utilities:
- `config.py` - Centralized configuration (uses Pydantic Settings)
- `security.py` - Password hashing, JWT tokens
- `logging.py` - Structured logging setup
- `cache.py` - HTTP caching utilities
- `exceptions.py` - Custom exception classes

### `/app/db/`
Database layer:
- `models.py` - SQLAlchemy ORM models
- `session.py` - Database session factory
- `base.py` - Base model class

### `/app/services/`
Business logic layer (domain services):
- `ai/` - AI and ML services
- `auth.py` - Authentication service
- `ingestion.py` - Data ingestion (CSV, batch)
- `forensics.py` - Forensic analysis
- `offline.py` - Offline sync handling

### `/app/schemas/`
Pydantic models for request/response validation:
- Type-safe data structures
- Automatic OpenAPI documentation
- Request validation

### `/app/graphql/`
GraphQL API (alternative to REST):
- `schema.py` - Strawberry schema
- Enabled at `/graphql` with GraphiQL playground

## 🗄️ Database

### Migrations

Alembic is used for database migrations:

```bash
# Create a new migration
poetry run alembic revision --autogenerate -m "description"

# Apply migrations
poetry run alembic upgrade head

# Revert last migration
poetry run alembic downgrade -1

# View migration history
poetry run alembic history
```

### Models

All models are defined in `app/db/models.py`:
- Inherit from `Base`
- Use SQLAlchemy 2.0 async syntax
- Include type hints
- Use UUIDs for primary keys

Example:
```python
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class MyModel(Base):
    __tablename__ = "my_model"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## 🔐 Security

### Best Practices

- **Never commit secrets**: Use environment variables
- **Password hashing**: Uses bcrypt via passlib
- **JWT tokens**: Secure token-based authentication
- **CORS**: Configured in `main.py`
- **Input validation**: Pydantic schemas enforce types
- **SQL injection**: SQLAlchemy ORM prevents this
- **Rate limiting**: Implemented via middleware

### Environment Variables

Critical security settings in `.env`:
```bash
SECRET_KEY=<long-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite+aiosqlite:///./fraud_detection.db
REDIS_URL=redis://localhost:6379/0
```

## 📚 API Documentation

### Interactive Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### GraphQL Playground

- **GraphiQL**: http://localhost:8000/graphql

## 🧩 Adding New Features

### Creating a New Endpoint

1. **Define Pydantic Schemas** (`app/schemas/`):
   ```python
   # app/schemas/item.py
   from pydantic import BaseModel
   
   class ItemCreate(BaseModel):
       name: str
       description: str
   
   class ItemResponse(BaseModel):
       id: str
       name: str
       description: str
       
       class Config:
           from_attributes = True
   ```

2. **Create Service** (`app/services/`):
   ```python
   # app/services/item_service.py
   from sqlalchemy.ext.asyncio import AsyncSession
   from app.db.models import Item
   
   async def create_item(db: AsyncSession, name: str, description: str) -> Item:
       item = Item(name=name, description=description)
       db.add(item)
       await db.commit()
       await db.refresh(item)
       return item
   ```

3. **Create Endpoint** (`app/api/v1/endpoints/`):
   ```python
   # app/api/v1/endpoints/items.py
   from fastapi import APIRouter, Depends
   from sqlalchemy.ext.asyncio import AsyncSession
   from app.api import deps
   from app.schemas.item import ItemCreate, ItemResponse
   from app.services import item_service
   
   router = APIRouter()
   
   @router.post("/", response_model=ItemResponse)
   async def create_item(
       item: ItemCreate,
       db: AsyncSession = Depends(deps.get_db)
   ):
       return await item_service.create_item(db, item.name, item.description)
   ```

4. **Register Router** (`app/api/v1/api.py`):
   ```python
   from app.api.v1.endpoints import items
   
   api_router.include_router(items.router, prefix="/items", tags=["items"])
   ```

5. **Add Tests** (`tests/`):
   ```python
   # tests/test_items.py
   import pytest
   from httpx import AsyncClient
   
   @pytest.mark.asyncio
   async def test_create_item(client: AsyncClient):
       response = await client.post(
           "/api/v1/items/",
           json={"name": "Test", "description": "Test item"}
       )
       assert response.status_code == 200
       assert response.json()["name"] == "Test"
   ```

## 🔧 Environment Configuration

### Development
Uses `.env` with SQLite database.

### Production
Uses `.env.production` with PostgreSQL, Redis, etc.

### Testing
Uses `.env.test` with in-memory databases.

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Metrics**: `GET /api/v1/monitoring/metrics`
- **Logs**: Structured JSON logs via structlog

## 🐛 Debugging

### Enable Debug Logging

In `.env`:
```bash
LOG_LEVEL=DEBUG
DB_ECHO=true  # Log all SQL queries
```

### Interactive Debugging

Use `breakpoint()` in code, then run:
```bash
poetry run python -m debugpy --listen 5678 --wait-for-client -m uvicorn app.main:app
```

## 🤝 Contributing

See [/CONTRIBUTING.md](/CONTRIBUTING.md) for:
- Coding standards
- Testing requirements
- Pull request process

### Key Guidelines

- **Type hints required** for all functions
- **Docstrings** for public APIs (Google style)
- **Async/await** consistently used
- **Tests required** for new features
- **80%+ coverage** maintained

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

## 🔗 Related Documentation

- [Frontend README](/frontend/README.md)
- [Architecture Docs](/docs/architecture/)
- [API Design Patterns](/docs/backend/API_DESIGN_PATTERNS.md)
