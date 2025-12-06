"""
Integration tests for subjects and batch operations APIs.
"""
import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Subject
from app.models.mens_rea import AnalysisResult
from app.core.security import create_access_token


@pytest.fixture
async def auth_headers(db: AsyncSession):
    """Create authentication headers for test user."""
    # Create a test user in the database
    from app.db.models import User
    test_user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True,
        role="admin"
    )
    db.add(test_user)
    await db.commit()

    # Create access token
    token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_subject(db: AsyncSession):
    """Create a test subject with analysis result."""
    subject = Subject(
        id=uuid.uuid4(),
        encrypted_pii={"name": "John Doe", "email": "john@example.com"}
    )
    db.add(subject)

    # Create analysis result
    analysis = AnalysisResult(
        subject_id=subject.id,
        risk_score=75,
        adjudication_status="flagged",
        explanation="High risk transaction pattern detected"
    )
    db.add(analysis)

    await db.commit()
    await db.refresh(subject)
    return subject


class TestSubjectsAPI:
    """Test subjects API endpoints."""

    @pytest.mark.asyncio
    async def test_get_subjects_list(self, client: AsyncClient, auth_headers, test_subject):
        """Test GET /subjects returns list of subjects."""
        response = await client.get("/api/v1/subjects/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1

        # Check that our test subject is in the results
        subject_ids = [item["id"] for item in data["items"]]
        assert str(test_subject.id) in subject_ids

    @pytest.mark.asyncio
    async def test_get_subject_detail(self, client: AsyncClient, auth_headers, test_subject):
        """Test GET /subjects/{id} returns subject details."""
        response = await client.get(f"/api/v1/subjects/{test_subject.id}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_subject.id)
        assert data["subject_name"] == "John Doe"
        assert data["risk_score"] == 75
        assert data["status"] == "flagged"

    @pytest.mark.asyncio
    async def test_get_subject_not_found(self, client: AsyncClient, auth_headers):
        """Test GET /subjects/{id} with non-existent subject."""
        fake_id = str(uuid.uuid4())
        response = await client.get(f"/api/v1/subjects/{fake_id}", headers=auth_headers)

        assert response.status_code == 404
        assert "Subject not found" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_subject_invalid_uuid(self, client: AsyncClient, auth_headers):
        """Test GET /subjects/{id} with invalid UUID."""
        response = await client.get("/api/v1/subjects/invalid-uuid", headers=auth_headers)

        assert response.status_code == 400
        assert "Invalid UUID" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_subjects_filtering(self, client: AsyncClient, auth_headers, test_subject, db: AsyncSession):
        """Test subjects filtering by status."""
        # Create another subject with different status
        subject2 = Subject(
            id=uuid.uuid4(),
            encrypted_pii={"name": "Jane Smith"}
        )
        db.add(subject2)

        analysis2 = AnalysisResult(
            subject_id=subject2.id,
            risk_score=45,
            adjudication_status="pending"
        )
        db.add(analysis2)
        await db.commit()

        # Test filtering by status
        response = await client.get("/api/v1/subjects/?status=flagged", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

        # Check that only flagged subjects are returned
        for item in data["items"]:
            assert item["status"] == "flagged"

    @pytest.mark.asyncio
    async def test_subjects_pagination(self, client: AsyncClient, auth_headers, test_subject):
        """Test subjects pagination."""
        response = await client.get("/api/v1/subjects/?page=1&limit=10", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "page" in data
        assert "pages" in data
        assert "total" in data
        assert data["page"] == 1


class TestBatchOperationsAPI:
    """Test batch operations API endpoints."""

    @pytest.mark.asyncio
    async def test_batch_update_cases_success(self, client: AsyncClient, auth_headers, test_subject, db: AsyncSession):
        """Test successful batch update of cases."""
        # Create another subject for batch operation
        subject2 = Subject(id=uuid.uuid4(), encrypted_pii={"name": "Jane Smith"})
        db.add(subject2)

        analysis2 = AnalysisResult(
            subject_id=subject2.id,
            risk_score=50,
            adjudication_status="pending"
        )
        db.add(analysis2)
        await db.commit()

        case_ids = [str(test_subject.id), str(subject2.id)]

        response = await client.patch(
            "/api/v1/cases/batch",
            json={
                "case_ids": case_ids,
                "status": "under review"
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["updated"] == 2
        assert data["failed"] == 0
        assert len(data["updated_cases"]) == 2

        # Verify the status was updated in database
        await db.refresh(test_subject)
        updated_analysis = await db.execute(
            db.query(AnalysisResult).filter(AnalysisResult.subject_id == test_subject.id)
        )
        result = updated_analysis.scalars().first()
        assert result.adjudication_status == "under review"

    @pytest.mark.asyncio
    async def test_batch_update_partial_failure(self, client: AsyncClient, auth_headers, test_subject):
        """Test batch update with some failures."""
        valid_id = str(test_subject.id)
        invalid_id = str(uuid.uuid4())

        response = await client.patch(
            "/api/v1/cases/batch",
            json={
                "case_ids": [valid_id, invalid_id],
                "status": "closed"
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["updated"] == 1
        assert data["failed"] == 1
        assert len(data["failed_cases"]) == 1
        assert data["failed_cases"][0]["id"] == invalid_id

    @pytest.mark.asyncio
    async def test_batch_update_empty_cases(self, client: AsyncClient, auth_headers):
        """Test batch update with empty case list."""
        response = await client.patch(
            "/api/v1/cases/batch",
            json={
                "case_ids": [],
                "status": "closed"
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["updated"] == 0
        assert data["failed"] == 0

    @pytest.mark.asyncio
    async def test_batch_update_invalid_case_ids(self, client: AsyncClient, auth_headers):
        """Test batch update with invalid case IDs."""
        response = await client.patch(
            "/api/v1/cases/batch",
            json={
                "case_ids": ["invalid-uuid", "another-invalid"],
                "status": "closed"
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["updated"] == 0
        assert data["failed"] == 2
        assert len(data["failed_cases"]) == 2


class TestGDPRCompliance:
    """Test GDPR compliance features."""

    @pytest.mark.asyncio
    async def test_subject_data_export(self, client: AsyncClient, auth_headers, test_subject):
        """Test subject data export for GDPR portability."""
        response = await client.get(f"/api/v1/subjects/{test_subject.id}/export", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "subject" in data
        assert "transactions" in data
        assert "analysis_results" in data
        assert "consents" in data

        assert data["subject"]["id"] == str(test_subject.id)
        assert data["subject"]["encrypted_pii"]["name"] == "John Doe"

    @pytest.mark.asyncio
    async def test_subject_deletion(self, client: AsyncClient, auth_headers, test_subject):
        """Test subject deletion for GDPR right to be forgotten."""
        response = await client.delete(f"/api/v1/subjects/{test_subject.id}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

        # Verify subject is deleted
        get_response = await client.get(f"/api/v1/subjects/{test_subject.id}", headers=auth_headers)
        assert get_response.status_code == 404