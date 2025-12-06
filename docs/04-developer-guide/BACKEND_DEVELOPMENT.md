# 🐍 Backend Development Guide

> Building and extending the FastAPI backend

---

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Access API docs at: http://localhost:8000/docs

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── core/
│   │   ├── config.py        # Settings
│   │   ├── security.py      # Auth
│   │   └── database.py      # DB connection
│   ├── api/
│   │   ├── v1/              # API routes
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

## Creating Endpoints

### Basic Route

```python
# api/v1/items.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models import Item, User
from app.schemas import ItemCreate, ItemResponse

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/", response_model=list[ItemResponse])
async def list_items(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
):
    """List all items."""
    items = await Item.get_all(db, skip=skip, limit=limit)
    return items

@router.post("/", response_model=ItemResponse, status_code=201)
async def create_item(
    item: ItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new item."""
    return await Item.create(db, **item.dict(), owner_id=current_user.id)
```

### Register Route

```python
# api/v1/__init__.py
from fastapi import APIRouter
from .items import router as items_router

api_router = APIRouter()
api_router.include_router(items_router)
```

---

## Models

### SQLAlchemy Model

```python
# models/item.py
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.core.database import Base

class Item(Base):
    __tablename__ = "items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="items")
    
    @classmethod
    async def get_all(cls, db, skip=0, limit=100):
        result = await db.execute(
            select(cls).offset(skip).limit(limit)
        )
        return result.scalars().all()
```

---

## Schemas

### Pydantic Schema

```python
# schemas/item.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class ItemResponse(ItemBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
```

---

## Services

### Business Logic Layer

```python
# services/item_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Item
from app.schemas import ItemCreate, ItemUpdate

class ItemService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, data: ItemCreate, owner_id: str) -> Item:
        item = Item(**data.dict(), owner_id=owner_id)
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item
    
    async def update(self, item_id: str, data: ItemUpdate) -> Item:
        item = await Item.get(self.db, item_id)
        if not item:
            raise NotFoundError("Item not found")
        
        for key, value in data.dict(exclude_unset=True).items():
            setattr(item, key, value)
        
        await self.db.commit()
        return item
```

---

## Dependencies

### Common Dependencies

```python
# api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session
from app.core.security import verify_token
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_db():
    async with async_session() as session:
        yield session

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    user = await User.get(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
```

---

## Migrations

### Create Migration

```bash
alembic revision --autogenerate -m "Add items table"
```

### Apply Migration

```bash
alembic upgrade head
```

### Rollback

```bash
alembic downgrade -1
```

---

## Error Handling

### Custom Exceptions

```python
# core/exceptions.py
from fastapi import HTTPException

class NotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)

class ValidationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=422, detail=detail)
```

---

## Testing

### Pytest Setup

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```

### Test Case

```python
# tests/test_items.py
import pytest

@pytest.mark.asyncio
async def test_create_item(client, auth_token):
    response = await client.post(
        "/api/v1/items",
        json={"name": "Test Item"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Item"
```

---

## Running

```bash
# Development
uvicorn app.main:app --reload

# Production
gunicorn app.main:app -k uvicorn.workers.UvicornWorker
```

---

## Related

- [API Reference](./API_REFERENCE.md)
- [Database Schema](../02-architecture/DATABASE.md)
