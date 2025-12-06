import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User
from app.core.security import get_password_hash
import uuid

@pytest.mark.asyncio
async def test_dashboard_metrics(client: AsyncClient, db: AsyncSession):
    """Test dashboard metrics endpoint."""
    # Create test user
    email = "dashboard_test@fraud.com"
    password = "securepass123"
    test_user = User(
        id=uuid.uuid4(),
        email=email,
        hashed_password=get_password_hash(password),
        full_name="Dashboard Tester",
        role="analyst"
    )
    db.add(test_user)
    await db.commit()
    
    # Login
    login_response = await client.post("/api/v1/login/access-token", data={
        "username": email,
        "password": password
    })
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    token = login_response.json()["access_token"]
    
    # Get metrics
    response = await client.get(
        "/api/v1/dashboard/metrics",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200, f"Dashboard metrics failed: {response.text}"
    data = response.json()
    
    # Verify keys
    expected_keys = ["active_cases", "high_risk_subjects", "pending_reviews", "system_load"]
    for key in expected_keys:
        assert key in data, f"Missing key: {key}"
    
    print(f"Dashboard metrics response: {data}")
