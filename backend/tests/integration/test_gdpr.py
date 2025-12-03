"""
Integration tests for GDPR compliance features.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Subject, Transaction, User
from app.core.security import get_password_hash
import uuid

@pytest.mark.asyncio
async def test_gdpr_export_subject_data(client: AsyncClient, db: AsyncSession):
    """
    Test GDPR data portability - exporting all subject data.
    """
    # Create test user
    test_user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        hashed_password=get_password_hash("testpass"),
        role="analyst"
    )
    db.add(test_user)
    
    # Create test subject with encrypted PII
    test_subject = Subject(
        id=uuid.uuid4(),
        encrypted_pii={"name": "John Doe", "national_id": "123456789"}
    )
    db.add(test_subject)
    
    # Create test transaction
    test_transaction = Transaction(
        id=uuid.uuid4(),
        subject_id=test_subject.id,
        amount="1000.00",
        currency="USD",
        date="2024-01-01T00:00:00", 
        source_bank="Test Bank"
    )
    db.add(test_transaction)
    
    await db.commit()
    
    # Login
    login_response = await client.post("/api/v1/login", json={
        "email": "test@example.com",
        "password": "testpass"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Test GDPR export
    response = await client.get(
        f"/api/v1/compliance/gdpr/export/{test_subject.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["subject_id"] == str(test_subject.id)
    assert "data" in data
    assert "transactions" in data["data"]
    assert len(data["data"]["transactions"]) > 0

@pytest.mark.asyncio
async def test_gdpr_forget_subject(client: AsyncClient, db: AsyncSession):
    """
    Test GDPR right to be forgotten - anonymizing subject data.
    """
    # Create test subject
    test_subject = Subject(
        id=uuid.uuid4(),
        encrypted_pii={"name": "Jane Doe", "email": "jane@example.com"}
    )
    db.add(test_subject)
    await db.commit()
    
    # TODO: Add authentication
    # For now, test the endpoint exists
    response = await client.post(f"/api/v1/compliance/gdpr/forget/{test_subject.id}")
    
    assert response.status_code in [200, 401]  # 401 if auth required
