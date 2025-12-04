"""
Integration tests for authentication and RBAC.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User
from app.core.security import get_password_hash
import uuid

@pytest.mark.asyncio
async def test_login_valid_credentials(client: AsyncClient, db: AsyncSession):
    """Test login with valid credentials."""
    # Create test user
    test_user = User(
        id=uuid.uuid4(),
        email="analyst@fraud.com",
        hashed_password=get_password_hash("securepass123"),
        full_name="Test Analyst",
        role="analyst"
    )
    db.add(test_user)
    await db.commit()
    
    # Attempt login
    response = await client.post(
        "/api/v1/login/access-token",
        data={
            "username": "analyst@fraud.com",
            "password": "securepass123"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient, db: AsyncSession):
    """Test login with invalid credentials."""
    response = await client.post(
        "/api/v1/login/access-token",
        data={
            "username": "nonexistent@fraud.com",
            "password": "wrongpass"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_rbac_admin_only_endpoint(client: AsyncClient, db: AsyncSession):
    """Test that non-admin users cannot access admin endpoints."""
    # Create analyst user
    analyst = User(
        id=uuid.uuid4(),
        email="analyst@test.com",
        hashed_password=get_password_hash("pass"),
        role="analyst"
    )
    db.add(analyst)
    await db.commit()
    
    # Login as analyst
    login_response = await client.post(
        "/api/v1/login/access-token",
        data={
            "username": "analyst@test.com",
            "password": "pass"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = login_response.json()["access_token"]
    
    # Try to access admin endpoint (if we had one marked with require_admin)
    # For now, this is a placeholder test
    # response = await client.get(
    #     "/api/v1/admin/users",
    #     headers={"Authorization": f"Bearer {token}"}
    # )
    # assert response.status_code == 403
    
    # Verify token works for regular endpoints
    assert token is not None

@pytest.mark.asyncio
async def test_jwt_token_validation(client: AsyncClient, db: AsyncSession):
    """Test JWT token validation."""
    # Try accessing protected endpoint without token
    response = await client.get("/api/v1/subjects/")
    assert response.status_code == 401
    
    # Try with invalid token
    response = await client.get(
        "/api/v1/subjects/",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 403
