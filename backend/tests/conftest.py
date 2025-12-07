"""
Pytest configuration and shared fixtures.
"""
import pytest
import os

# Set environment variable for tests to avoid Jaeger DNS errors
os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://localhost:4317"
os.environ["ENABLE_OTEL"] = "false"
# Set TESTING flag for config validation bypass
os.environ["TESTING"] = "true"
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.main
fastapi_app = app.main.app
# print(f"DEBUG: fastapi_app is {fastapi_app}, type: {type(fastapi_app)}")
from app.db.session import Base  # noqa: E402
# Import models to ensure they are registered with Base
import app.db.models
from unittest.mock import AsyncMock

# Mock Redis
import app.core.security
mock_redis = AsyncMock()
mock_redis.get.return_value = None
mock_redis.setex.return_value = True
app.core.security._redis_client = mock_redis

# Test database URL (use in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

import pytest_asyncio  # noqa: E402

@pytest_asyncio.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database for each test.
    """
    # Use StaticPool to share the same in-memory database across connections
    engine = create_async_engine(
        TEST_DATABASE_URL, 
        poolclass=StaticPool,
        connect_args={"check_same_thread": False}
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create test client with overridden database dependency.
    """
    import app.api.deps
    from app.db.models import User
    import uuid
    
    async def override_get_db():
        yield db
    
    async def override_get_current_user():
        # Return a mock admin user
        return User(
            id=uuid.uuid4(),
            email="test@example.com",
            full_name="Test User",
            hashed_password="hashed_password",
            role="admin"
        )
    
    print(f"DEBUG: Overriding get_db: {app.api.deps.get_db}")
    print(f"DEBUG: Overriding get_current_user: {app.api.deps.get_current_user}")
    fastapi_app.dependency_overrides[app.api.deps.get_db] = override_get_db
    fastapi_app.dependency_overrides[app.api.deps.get_current_user] = override_get_current_user
    
    async with AsyncClient(transport=ASGITransport(app=fastapi_app), base_url="http://test") as ac:
        yield ac
    
    fastapi_app.dependency_overrides.clear()
