"""
API Smoke Tests for Staging Environment
Tests critical backend endpoints to ensure basic functionality
"""

import pytest
import requests
import os
from typing import Dict

# Configuration
STAGING_URL = os.getenv("STAGING_URL", "http://localhost:8000")
TEST_USER_EMAIL = os.getenv("TEST_USER_EMAIL", "analyst@staging.example.com")
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD", "StagingTest123!")

# Test timeout
TIMEOUT = 10


@pytest.fixture(scope="session")
def auth_token() -> str:
    """Get authentication token for test user"""
    response = requests.post(
        f"{STAGING_URL}/api/v1/auth/login",
        json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
        timeout=TIMEOUT
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "access_token" in data, "No access token in response"
    return data["access_token"]


@pytest.fixture
def auth_headers(auth_token: str) -> Dict[str, str]:
    """Get headers with authentication"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestHealthEndpoints:
    """Test health and status endpoints"""
    
    def test_health_endpoint(self):
        """Test basic health check"""
        response = requests.get(f"{STAGING_URL}/health", timeout=TIMEOUT)
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_root_endpoint(self):
        """Test root endpoint returns app info"""
        response = requests.get(f"{STAGING_URL}/", timeout=TIMEOUT)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "app" in data


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test successful login"""
        response = requests.post(
            f"{STAGING_URL}/api/v1/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{STAGING_URL}/api/v1/auth/login",
            json={"email": TEST_USER_EMAIL, "password": "wrongpassword"},
            timeout=TIMEOUT
        )
        assert response.status_code in [400, 401]
    
    def test_me_endpoint(self, auth_headers):
        """Test getting current user info"""
        response = requests.get(
            f"{STAGING_URL}/api/v1/auth/me",
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL


class TestDashboardEndpoints:
    """Test dashboard data endpoints"""
    
    def test_dashboard_metrics(self, auth_headers):
        """Test dashboard metrics endpoint"""
        response = requests.get(
            f"{STAGING_URL}/api/v1/dashboard/metrics",
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_cases" in data
        assert "pending_review" in data
    
    def test_dashboard_trend(self, auth_headers):
        """Test dashboard trend data"""
        response = requests.get(
            f"{STAGING_URL}/api/v1/dashboard/trend",
            headers=auth_headers,
            params={"days": 7},
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestAdjudicationEndpoints:
    """Test adjudication queue endpoints"""
    
    def test_adjudication_queue(self, auth_headers):
        """Test getting adjudication queue"""
        response = requests.get(
            f"{STAGING_URL}/api/v1/adjudication/queue",
            headers=auth_headers,
            params={"page": 1, "limit": 10},
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
    
    def test_adjudication_queue_pagination(self, auth_headers):
        """Test pagination works correctly"""
        response = requests.get(
            f"{STAGING_URL}/api/v1/adjudication/queue",
            headers=auth_headers,
            params={"page": 1, "limit": 5},
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 5


class TestCaseEndpoints:
    """Test case/analysis endpoints"""
    
    def test_list_cases(self, auth_headers):
        """Test listing all cases"""
        response = requests.get(
            f"{STAGING_URL}/api/v1/cases",
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestPerformance:
    """Test API response times"""
    
    def test_health_response_time(self):
        """Health endpoint should respond quickly"""
        import time
        start = time.time()
        response = requests.get(f"{STAGING_URL}/health", timeout=TIMEOUT)
        duration = time.time() - start
        
        assert response.status_code == 200
        assert duration < 1.0, f"Health check took {duration:.2f}s, should be < 1s"
    
    def test_api_response_time(self, auth_headers):
        """API endpoints should respond within 2 seconds"""
        import time
        start = time.time()
        response = requests.get(
            f"{STAGING_URL}/api/v1/adjudication/queue",
            headers=auth_headers,
            params={"page": 1, "limit": 10},
            timeout=TIMEOUT
        )
        duration = time.time() - start
        
        assert response.status_code == 200
        assert duration < 2.0, f"API took {duration:.2f}s, should be < 2s"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
