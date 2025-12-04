"""
Improved test configuration using PostgreSQL test containers.
Ensures parity between test and production environments.
"""
import pytest
import os
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from testcontainers.postgres import PostgresContainer
import structlog

logger = structlog.get_logger(__name__)

# Disable OTEL tracing for tests
os.environ["ENABLE_OTEL"] = "false"
os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://localhost:4317"

# Global test container
postgres_container = None


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_test_database():
    """
    Setup PostgreSQL test container for entire test session.
    Ensures database parity with production.
    """
    global postgres_container
    
    logger.info("Starting PostgreSQL test container...")
    
    # Start PostgreSQL container
    postgres_container = PostgresContainer(
        image="postgres:16-alpine",
        user="testuser",
        password="testpass",
        dbname="testdb",
    )
    
    try:
        postgres_container.start()
        
        # Get connection URL
        test_db_url = postgres_container.get_connection_url()
        test_db_url = test_db_url.replace("psycopg2", "asyncpg")
        
        logger.info("PostgreSQL container started", db_url=test_db_url[:50])
        
        # Create all tables
        from app.db.session import Base
        
        engine = create_async_engine(test_db_url, echo=False)
        
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database schema created")
        
        yield
        
    finally:
        if postgres_container:
            postgres_container.stop()
            logger.info("PostgreSQL container stopped")


@pytest.fixture
async def db(setup_test_database) -> AsyncGenerator[AsyncSession, None]:
    """
    Provide database session for each test.
    Uses actual PostgreSQL for parity with production.
    """
    global postgres_container
    
    if not postgres_container:
        pytest.skip("PostgreSQL container not available")
    
    test_db_url = postgres_container.get_connection_url()
    test_db_url = test_db_url.replace("psycopg2", "asyncpg")
    
    engine = create_async_engine(test_db_url, echo=False)
    
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    session = async_session()
    
    try:
        yield session
    finally:
        await session.rollback()
        await session.close()
        await engine.dispose()


@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Provide FastAPI test client with database session.
    """
    from app.main import app
    from app.db.session import get_db
    
    # Override dependency
    async def override_get_db():
        yield db
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


# Contract test fixtures
@pytest.fixture
def backend_contract():
    """Define expected backend API contract."""
    return {
        "health": {
            "method": "GET",
            "path": "/health",
            "expected_status": 200,
            "required_fields": ["status", "timestamp"],
        },
        "login": {
            "method": "POST",
            "path": "/api/v1/login/access-token",
            "expected_status": 200,
            "required_fields": ["access_token", "token_type"],
        },
    }


# Performance test helpers
@pytest.fixture
def performance_threshold():
    """Define performance thresholds."""
    return {
        "api_response_time": 1.0,  # seconds
        "db_query_time": 0.1,  # seconds
        "redis_operation_time": 0.01,  # seconds
    }


@pytest.fixture
async def mock_redis(monkeypatch):
    """Mock Redis for tests."""
    class MockRedis:
        async def get(self, key: str):
            return None
        
        async def set(self, key: str, value: str, ex: int = None):
            pass
        
        async def delete(self, key: str):
            pass
        
        async def ping(self):
            return True
    
    return MockRedis()
