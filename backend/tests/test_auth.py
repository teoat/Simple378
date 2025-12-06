"""
Authentication tests - critical path tests for user login
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db: AsyncSession):
    """Test successful user login"""
    # Create test user
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="$2b$12$..." # Use proper hash in real tests
    )
    db.add(user)
    await db.commit()
    
    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpass123"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with invalid credentials"""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrong"}
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_login_missing_email(client: AsyncClient):
    """Test login with missing email"""
    response = await client.post(
        "/api/v1/auth/login",
        json={"password": "testpass123"}
    )
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_login_missing_password(client: AsyncClient):
    """Test login with missing password"""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com"}
    )
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_token_refresh(client: AsyncClient, db: AsyncSession):
    """Test token refresh endpoint"""
    # Create test user and token
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_pass"
    )
    db.add(user)
    await db.commit()
    
    old_token = create_access_token(data={"sub": str(user.id)})
    
    # Refresh token
    response = await client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {old_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["access_token"] != old_token


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, db: AsyncSession):
    """Test logout endpoint"""
    # Create user and token
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_pass"
    )
    db.add(user)
    await db.commit()
    
    token = create_access_token(data={"sub": str(user.id)})
    
    # Logout
    response = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_protected_endpoint_without_token(client: AsyncClient):
    """Test accessing protected endpoint without token"""
    response = await client.get("/api/v1/cases/")
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_protected_endpoint_with_valid_token(client: AsyncClient, db: AsyncSession):
    """Test accessing protected endpoint with valid token"""
    # Create user
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_pass",
        is_active=True
    )
    db.add(user)
    await db.commit()
    
    token = create_access_token(data={"sub": str(user.id)})
    
    # Access protected endpoint
    response = await client.get(
        "/api/v1/cases/",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Should not be 403 (may be 200, 404, or other depending on implementation)
    assert response.status_code != 403


@pytest.mark.asyncio
async def test_protected_endpoint_with_expired_token(client: AsyncClient):
    """Test accessing protected endpoint with expired token"""
    # Create expired token (very short expiration)
    from datetime import timedelta
    expired_token = create_access_token(
        data={"sub": "test"},
        expires_delta=timedelta(seconds=-1)  # Already expired
    )
    
    response = await client.get(
        "/api/v1/cases/",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    
    assert response.status_code == 401
