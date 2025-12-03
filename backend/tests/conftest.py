"""
Pytest configuration and shared fixtures.
"""
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.main
fastapi_app = app.main.app
# print(f"DEBUG: fastapi_app is {fastapi_app}, type: {type(fastapi_app)}")
from app.db.session import Base
from app.core.config import settings
# Import models to ensure they are registered with Base
import app.db.models

# Test database URL (use in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
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
    from app.api import deps
    
    async def override_get_db():
        yield db
    
    fastapi_app.dependency_overrides[deps.get_db] = override_get_db
    
    async with AsyncClient(app=fastapi_app, base_url="http://test") as ac:
        yield ac
    
    fastapi_app.dependency_overrides.clear()
