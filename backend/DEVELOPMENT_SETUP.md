# Backend Development Setup Guide

This guide helps you set up the backend for local development, especially when working with the ingestion page.

## Quick Start (Minimal Setup)

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
pip install aiosqlite  # Required for SQLite async support
```

### 2. Create Environment File

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Or create manually with minimal config:

```env
# Minimal Development Configuration
DATABASE_URL=sqlite+aiosqlite:///./dev.db
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333
SECRET_KEY=development_secret_key_minimum_32_characters_required_for_jwt_security
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
LOG_LEVEL=DEBUG
DB_ECHO=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
ANTHROPIC_API_KEY=test-key-not-real
OPENAI_API_KEY=test-key-not-real
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_UPLOAD_FILE_SIZE_MB=5
ENVIRONMENT=development
```

### 3. Initialize Database

```bash
# Initialize the database schema
python -m alembic upgrade head

# Optional: Seed test data
python seed_data.py
```

### 4. Start Backend Server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

API docs: `http://localhost:8000/docs`

---

## Common Issues

### Issue: SECRET_KEY validation error

**Error:**
```
ValidationError: SECRET_KEY must be changed from default value in production
```

**Fix:** Make sure your `.env` file has `ENVIRONMENT=development` and a SECRET_KEY that's at least 32 characters.

---

### Issue: Module 'aiosqlite' not found

**Error:**
```
ModuleNotFoundError: No module named 'aiosqlite'
```

**Fix:**
```bash
pip install aiosqlite
```

---

### Issue: Database doesn't exist

**Error:**
```
sqlalchemy.exc.OperationalError: no such table: users
```

**Fix:**
```bash
python -m alembic upgrade head
```

---

### Issue: CORS errors in frontend

**Error:**
```
Access to fetch at 'http://localhost:8000/api/v1/...' has been blocked by CORS policy
```

**Fix:** Make sure your `.env` includes:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Development Workflow

### Frontend + Backend Together

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate  # or activate your virtual env
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then navigate to `http://localhost:5173`

---

## Testing the Ingestion Page

1. Start both frontend and backend servers
2. Navigate to `http://localhost:5173/login`
3. Login with test credentials (create a user with `create_user.py` if needed)
4. Navigate to `http://localhost:5173/ingestion`
5. You should see the ingestion wizard with subjects loaded from backend

### Without Backend Running

The ingestion page now gracefully handles backend unavailability:
- Shows warning alert: "Unable to Load Subjects"
- Allows manual subject ID entry
- Upload, mapping, and preview steps will fail but provide clear error messages

---

## Creating Test Users

```bash
cd backend
python create_user.py
```

Follow the prompts to create a test user.

Or use the Python REPL:

```python
import asyncio
from app.db.session import AsyncSessionLocal
from app.db.models import User
from app.core.security import get_password_hash

async def create_test_user():
    async with AsyncSessionLocal() as session:
        user = User(
            email="test@example.com",
            hashed_password=get_password_hash("testpassword123"),
            is_active=True,
            is_superuser=True
        )
        session.add(user)
        await session.commit()
        print(f"Created user: {user.email}")

asyncio.run(create_test_user())
```

---

## Database Migrations

### Create a new migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
alembic upgrade head
```

### Rollback migration

```bash
alembic downgrade -1
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | Database connection string |
| `SECRET_KEY` | Yes | - | JWT secret key (min 32 chars) |
| `REDIS_URL` | Yes | - | Redis connection string |
| `QDRANT_URL` | Yes | - | Qdrant vector DB URL |
| `ENVIRONMENT` | No | production | Set to `development` for dev |
| `LOG_LEVEL` | No | INFO | DEBUG, INFO, WARNING, ERROR |
| `CORS_ORIGINS` | No | [] | Comma-separated allowed origins |
| `MAX_UPLOAD_FILE_SIZE_MB` | No | 100 | Max upload size in MB |

---

## Troubleshooting

### Reset Everything

```bash
# Stop servers
# Delete database
rm dev.db

# Reinstall dependencies
pip install -r requirements.txt
pip install aiosqlite

# Recreate database
python -m alembic upgrade head

# Seed data
python seed_data.py

# Restart server
python -m uvicorn app.main:app --reload
```

---

## Using Docker Compose (Full Stack)

For a complete development environment with PostgreSQL, Redis, and Qdrant:

```bash
# From repository root
docker-compose up -d

# Backend will be at http://localhost:8000
# Frontend will be at http://localhost:3000
```

---

## API Documentation

Once the backend is running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

---

## Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-07T04:16:00Z"
}
```

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

---

**Last Updated:** 2025-12-07
