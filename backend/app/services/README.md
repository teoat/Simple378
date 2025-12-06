# Backend Services

This directory contains the business logic layer for the Fraud Detection System.

## 📁 Structure

```
services/
├── ai/                    # AI and ML services
│   ├── assistant.py      # AI assistant (chat, suggestions)
│   ├── copilot.py        # AI copilot features
│   ├── entity_resolution.py  # Entity disambiguation
│   ├── frenly_service.py # Frenly AI integration
│   └── persona_analyzer.py  # User persona analysis
├── auth.py               # Authentication service
├── cache_service.py      # Caching layer
├── forensics.py          # Forensic analysis
├── ingestion.py          # Data ingestion (CSV, bulk)
├── mens_rea.py           # Intent analysis
├── offline.py            # Offline sync handling
├── orchestration.py      # Multi-service orchestration
├── search.py             # Search functionality
└── websocket.py          # WebSocket connections
```

## 🎯 Service Layer Architecture

Services implement **business logic** and coordinate between:
- **API Layer** (endpoints) - HTTP request/response
- **Database Layer** (models) - Data persistence  
- **External Services** - Third-party APIs

### Design Principles

1. **Single Responsibility**: Each service handles one domain
2. **Dependency Injection**: Services receive dependencies (DB session, config)
3. **Async First**: All I/O operations use `async`/`await`
4. **Type Safety**: Full type hints for all functions
5. **Error Handling**: Raise custom exceptions, not HTTP errors

## 📚 Core Services

### Authentication (`auth.py`)

Handles user authentication and authorization:

```python
from app.services.auth import AuthService

# Create service
auth_service = AuthService(db_session)

# Create user
user = await auth_service.create_user(email, password)

# Verify credentials
user = await auth_service.verify_credentials(email, password)

# Create access token
token = await auth_service.create_access_token(user.id)
```

**Key Features**:
- Password hashing with bcrypt
- JWT token generation/validation
- OAuth2 provider integration
- Session management

### Data Ingestion (`ingestion.py`)

Processes CSV uploads and bulk data imports:

```python
from app.services.ingestion import IngestionService

ingestion = IngestionService(db_session)

# Process CSV file
result = await ingestion.process_csv(
    file_path="transactions.csv",
    subject_id="uuid-here",
    user_id="uuid-here"
)

# Create batch
batch = await ingestion.create_transactions_batch(
    transactions=[...],
    subject_id="uuid-here"
)
```

**Key Features**:
- CSV parsing and validation
- Bulk transaction creation
- Event sourcing integration
- Error reporting

### Forensics (`forensics.py`)

Document analysis and evidence processing:

```python
from app.services.forensics import ForensicsService

forensics = ForensicsService(db_session, qdrant_client)

# Analyze document
result = await forensics.analyze_document(
    document_id="uuid-here",
    user_id="uuid-here"
)

# Extract entities
entities = await forensics.extract_entities(text)
```

**Key Features**:
- Document OCR and parsing
- Entity extraction
- Link analysis
- Vector embedding storage

### Offline Sync (`offline.py`)

Handles offline-first synchronization:

```python
from app.services.offline import OfflineService

offline = OfflineService(db_session)

# Sync events from client
result = await offline.sync_events(
    events=[...],
    user_id="uuid-here"
)

# Detect conflicts
conflicts = await offline.detect_conflicts(
    local_events=[...],
    remote_events=[...]
)
```

**Key Features**:
- Event-based sync
- Conflict detection (Lamport clocks)
- Merge strategies
- Optimistic locking

## 🤖 AI Services

### AI Assistant (`ai/assistant.py`)

Conversational AI for fraud investigation:

```python
from app.services.ai.assistant import AIAssistant

assistant = AIAssistant(db_session)

# Get AI response
response = await assistant.chat(
    message="Analyze this transaction pattern",
    context={"case_id": "uuid-here"},
    user_id="uuid-here"
)
```

**Key Features**:
- Multi-turn conversations
- Context-aware responses
- Tool calling (function execution)
- Response streaming

### Entity Resolution (`ai/entity_resolution.py`)

Disambiguates entities across data sources:

```python
from app.services.ai.entity_resolution import EntityResolutionService

resolver = EntityResolutionService(db_session)

# Resolve entity
canonical = await resolver.resolve_entity(
    name="John Smith",
    attributes={"dob": "1990-01-01"}
)

# Find matches
matches = await resolver.find_matches(entity_id="uuid-here")
```

**Key Features**:
- Fuzzy name matching
- Attribute comparison
- Confidence scoring
- Manual override support

### Persona Analyzer (`ai/persona_analyzer.py`)

Analyzes user behavior patterns:

```python
from app.services.ai.persona_analyzer import PersonaAnalyzer

analyzer = PersonaAnalyzer(db_session)

# Analyze persona
persona = await analyzer.analyze_subject(
    subject_id="uuid-here"
)
```

**Key Features**:
- Behavioral pattern detection
- Risk scoring
- Anomaly identification
- Temporal analysis

## 🛠️ Utility Services

### Cache Service (`cache_service.py`)

Redis-based caching layer:

```python
from app.services.cache_service import CacheService

cache = CacheService(redis_client)

# Set cached value
await cache.set("key", {"data": "value"}, ttl=3600)

# Get cached value
data = await cache.get("key")

# Invalidate cache
await cache.invalidate("pattern:*")
```

### Search Service (`search.py`)

Full-text search with Meilisearch:

```python
from app.services.search import SearchService

search = SearchService(meilisearch_client)

# Index documents
await search.index_documents("cases", cases)

# Search
results = await search.search(
    index="cases",
    query="fraud",
    filters={"status": "active"}
)
```

### WebSocket Service (`websocket.py`)

Real-time updates via WebSocket:

```python
from app.services.websocket import WebSocketService

ws_service = WebSocketService()

# Broadcast message
await ws_service.broadcast(
    message={"type": "case_updated", "id": "uuid"},
    room="case:uuid-here"
)
```

## ✅ Best Practices

### Service Structure

```python
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import MyModel
from app.schemas.my_model import MyModelCreate, MyModelUpdate

class MyService:
    """Service for managing MyModel resources."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, data: MyModelCreate, user_id: str) -> MyModel:
        """
        Create a new model instance.
        
        Args:
            data: Creation data
            user_id: ID of user creating the resource
            
        Returns:
            Created model instance
            
        Raises:
            ValueError: If validation fails
        """
        # Validation
        if not data.name:
            raise ValueError("Name is required")
        
        # Business logic
        model = MyModel(**data.model_dump(), created_by=user_id)
        
        # Persistence
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        
        return model
    
    async def get_by_id(self, model_id: str) -> Optional[MyModel]:
        """Get model by ID."""
        result = await self.db.execute(
            select(MyModel).where(MyModel.id == model_id)
        )
        return result.scalar_one_or_none()
```

### Error Handling

Services should raise **domain exceptions**, not HTTP exceptions:

```python
# ❌ BAD - Don't raise HTTP exceptions in services
from fastapi import HTTPException

async def get_user(user_id: str):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ✅ GOOD - Raise domain exceptions
from app.core.exceptions import NotFoundError

async def get_user(user_id: str):
    user = await db.get(User, user_id)
    if not user:
        raise NotFoundError(f"User {user_id} not found")
    return user
```

Endpoints handle HTTP concerns:

```python
from fastapi import APIRouter, HTTPException
from app.services.user_service import UserService
from app.core.exceptions import NotFoundError

@router.get("/{user_id}")
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    try:
        return await service.get_user(user_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
```

### Dependency Injection

Services receive dependencies in constructor:

```python
class MyService:
    def __init__(
        self,
        db: AsyncSession,
        cache: CacheService,
        config: Settings
    ):
        self.db = db
        self.cache = cache
        self.config = config
```

Used in endpoints via factory functions:

```python
from app.api import deps

@router.post("/")
async def create_item(
    data: ItemCreate,
    db: AsyncSession = Depends(deps.get_db),
    cache: CacheService = Depends(deps.get_cache)
):
    service = MyService(db, cache, settings)
    return await service.create(data)
```

### Testing Services

```python
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.my_service import MyService

@pytest.mark.asyncio
async def test_create_item(db_session: AsyncSession):
    # Arrange
    service = MyService(db_session)
    data = MyModelCreate(name="Test")
    
    # Act
    result = await service.create(data, user_id="test-user")
    
    # Assert
    assert result.name == "Test"
    assert result.created_by == "test-user"
    
@pytest.mark.asyncio
async def test_get_by_id_not_found(db_session: AsyncSession):
    # Arrange
    service = MyService(db_session)
    
    # Act & Assert
    result = await service.get_by_id("nonexistent-id")
    assert result is None
```

## 🔍 Service Testing

### Unit Tests

Test service logic in isolation:

```bash
# Run service tests only
poetry run pytest tests/services/

# Run specific service
poetry run pytest tests/services/test_auth.py
```

### Integration Tests

Test services with real database:

```bash
# Run with test database
poetry run pytest tests/integration/
```

### Mocking External Services

```python
from unittest.mock import AsyncMock
import pytest

@pytest.mark.asyncio
async def test_with_mocked_api(db_session):
    # Mock external API
    mock_client = AsyncMock()
    mock_client.call_api.return_value = {"result": "success"}
    
    # Create service with mock
    service = MyService(db_session, external_api=mock_client)
    
    # Test
    result = await service.process()
    assert result == "success"
    mock_client.call_api.assert_called_once()
```

## 📖 Documentation

### Docstring Format

Use Google-style docstrings:

```python
async def calculate_risk_score(
    subject_id: str,
    window_days: int = 30,
    weights: Optional[Dict[str, float]] = None
) -> float:
    """
    Calculate fraud risk score for a subject.
    
    Analyzes transaction patterns, behavioral indicators, and historical
    data to compute a normalized risk score between 0.0 and 1.0.
    
    Args:
        subject_id: UUID of the subject to analyze
        window_days: Number of days to consider (default: 30)
        weights: Optional custom weights for risk factors
            Example: {"velocity": 0.4, "anomaly": 0.6}
    
    Returns:
        Risk score between 0.0 (low risk) and 1.0 (high risk)
    
    Raises:
        NotFoundError: If subject does not exist
        ValueError: If window_days < 1 or weights sum != 1.0
    
    Example:
        >>> score = await calculate_risk_score("abc-123", window_days=90)
        >>> print(f"Risk: {score:.2%}")
        Risk: 34.50%
    """
```

## 🤝 Contributing

When adding a new service:

1. Create service file in appropriate subdirectory
2. Implement service class with dependency injection
3. Add comprehensive docstrings
4. Write unit tests (80%+ coverage)
5. Add integration tests for critical paths
6. Update this README

See [/CONTRIBUTING.md](/CONTRIBUTING.md) for full guidelines.

## 🔗 Related Documentation

- [API Endpoints README](/backend/app/api/README.md)
- [Database Models](/backend/app/db/README.md)
- [Architecture Docs](/docs/architecture/)
