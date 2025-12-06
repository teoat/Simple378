"""
API integration tests for case management CRUD operations
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Case, User
from app.core.security import create_access_token


@pytest.fixture
async def auth_headers(db: AsyncSession):
    """Create authenticated user and return auth headers"""
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_pass",
        is_active=True
    )
    db.add(user)
    await db.commit()
    
    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_case_success(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test successful case creation"""
    response = await client.post(
        "/api/v1/cases",
        headers=auth_headers,
        json={
            "case_number": "CASE-2025-001",
            "title": "Test Case",
            "description": "Test case description",
            "status": "open",
            "priority": "high"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["case_number"] == "CASE-2025-001"
    assert data["title"] == "Test Case"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_case_invalid_input(client: AsyncClient, auth_headers: dict):
    """Test case creation with invalid input"""
    response = await client.post(
        "/api/v1/cases",
        headers=auth_headers,
        json={
            "case_number": "",  # Invalid empty case number
            "title": "Test Case"
        }
    )
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_read_case_success(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test successful case retrieval"""
    # Create test case
    case = Case(
        case_number="CASE-2025-001",
        title="Test Case",
        description="Test case description",
        status="open",
        priority="high"
    )
    db.add(case)
    await db.commit()
    
    response = await client.get(
        f"/api/v1/cases/{case.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["case_number"] == "CASE-2025-001"
    assert data["id"] == str(case.id)


@pytest.mark.asyncio
async def test_read_case_not_found(client: AsyncClient, auth_headers: dict):
    """Test reading non-existent case"""
    import uuid
    response = await client.get(
        f"/api/v1/cases/{uuid.uuid4()}",
        headers=auth_headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_case_success(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test successful case update"""
    # Create test case
    case = Case(
        case_number="CASE-2025-001",
        title="Test Case",
        status="open"
    )
    db.add(case)
    await db.commit()
    
    response = await client.put(
        f"/api/v1/cases/{case.id}",
        headers=auth_headers,
        json={
            "title": "Updated Case",
            "status": "in_progress"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Case"
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_update_case_partial(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test partial case update"""
    case = Case(
        case_number="CASE-2025-001",
        title="Test Case",
        status="open"
    )
    db.add(case)
    await db.commit()
    
    response = await client.patch(
        f"/api/v1/cases/{case.id}",
        headers=auth_headers,
        json={"status": "closed"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "closed"
    assert data["title"] == "Test Case"  # Unchanged


@pytest.mark.asyncio
async def test_delete_case_success(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test successful case deletion"""
    case = Case(
        case_number="CASE-2025-001",
        title="Test Case",
        status="open"
    )
    db.add(case)
    await db.commit()
    
    response = await client.delete(
        f"/api/v1/cases/{case.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_case_not_found(client: AsyncClient, auth_headers: dict):
    """Test deleting non-existent case"""
    import uuid
    response = await client.delete(
        f"/api/v1/cases/{uuid.uuid4()}",
        headers=auth_headers
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_cases_success(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test listing cases with pagination"""
    # Create multiple test cases
    for i in range(15):
        case = Case(
            case_number=f"CASE-2025-{i:03d}",
            title=f"Test Case {i}",
            status="open"
        )
        db.add(case)
    await db.commit()
    
    response = await client.get(
        "/api/v1/cases?skip=0&limit=10",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) <= 10
    assert "total" in data


@pytest.mark.asyncio
async def test_list_cases_filtering(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test listing cases with filters"""
    # Create test cases with different statuses
    for status in ["open", "in_progress", "closed"]:
        case = Case(
            case_number=f"CASE-{status}",
            title=f"Test {status}",
            status=status
        )
        db.add(case)
    await db.commit()
    
    response = await client.get(
        "/api/v1/cases?status=open",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert all(item["status"] == "open" for item in data["items"])


@pytest.mark.asyncio
async def test_list_cases_sorting(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test listing cases with sorting"""
    # Create cases with different dates (using title as proxy)
    for i in range(5):
        case = Case(
            case_number=f"CASE-{i}",
            title=f"Test {i}",
            status="open"
        )
        db.add(case)
    await db.commit()
    
    response = await client.get(
        "/api/v1/cases?sort_by=case_number&sort_order=asc",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    # Verify sorting
    case_numbers = [item["case_number"] for item in data["items"]]
    assert case_numbers == sorted(case_numbers)


@pytest.mark.asyncio
async def test_bulk_create_cases(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test bulk case creation"""
    response = await client.post(
        "/api/v1/cases/bulk",
        headers=auth_headers,
        json={
            "cases": [
                {"case_number": "CASE-001", "title": "Case 1"},
                {"case_number": "CASE-002", "title": "Case 2"},
                {"case_number": "CASE-003", "title": "Case 3"}
            ]
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert len(data["created"]) == 3


@pytest.mark.asyncio
async def test_concurrent_case_updates(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test concurrent case updates don't cause conflicts"""
    import asyncio
    
    case = Case(
        case_number="CASE-CONCURRENT",
        title="Test Case",
        status="open"
    )
    db.add(case)
    await db.commit()
    
    # Simulate concurrent updates
    async def update_case():
        return await client.patch(
            f"/api/v1/cases/{case.id}",
            headers=auth_headers,
            json={"status": "in_progress"}
        )
    
    results = await asyncio.gather(update_case(), update_case(), update_case())
    
    # At least one should succeed
    success_count = sum(1 for r in results if r.status_code == 200)
    assert success_count >= 1


@pytest.mark.asyncio
async def test_case_with_request_id(client: AsyncClient, db: AsyncSession, auth_headers: dict):
    """Test that request ID is properly tracked"""
    response = await client.get(
        "/api/v1/cases",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    # Check for X-Request-ID header in response
    assert "X-Request-ID" in response.headers or "x-request-id" in response.headers
