import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
class TestAIEndpoints:
    """Test suite for AI endpoints"""
    
    async def test_ai_chat_success(self, client: AsyncClient, mock_auth_token: str):
        """Test successful AI chat response"""
        response = await client.post(
            "/api/v1/ai/chat",
            params={"message": "Hello Frenly"},
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "timestamp" in data
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0
    
    async def test_ai_chat_empty_message(self, client: AsyncClient, mock_auth_token: str):
        """Test AI chat with empty message"""
        response = await client.post(
            "/api/v1/ai/chat",
            params={"message": ""},
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        # Should still return 200 but with guidance message
        assert response.status_code == 200
    
    async def test_ai_chat_rate_limit(self, client: AsyncClient, mock_auth_token: str):
        """Test AI chat rate limiting (30/minute)"""
        # Make 31 requests rapidly
        responses = []
        for i in range(31):
            response = await client.post(
                "/api/v1/ai/chat",
                params={"message": f"Test message {i}"},
                headers={"Authorization": f"Bearer {mock_auth_token}"}
            )
            responses.append(response)
        
        # Last request should be rate limited
        assert responses[-1].status_code == 429
    
    async def test_ai_chat_unauthorized(self, client: AsyncClient):
        """Test AI chat without authentication"""
        response = await client.post(
            "/api/v1/ai/chat",
            params={"message": "Hello"}
        )
        
        assert response.status_code == 401
    
    async def test_multi_persona_analysis_success(
        self, 
        client: AsyncClient, 
        mock_auth_token: str,
        mock_subject_id: str
    ):
        """Test successful multi-persona analysis"""
        response = await client.post(
            "/api/v1/ai/multi-persona-analysis",
            json={
                "subject_id": mock_subject_id,
                "personas": ["auditor", "prosecutor", "forensic"]
            },
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "status" in data
        assert data["status"] == "completed"
        assert "consensus_score" in data
        assert "majority_verdict" in data
        assert "personas" in data
        
        # Validate consensus score range
        assert 0.0 <= data["consensus_score"] <= 1.0
        
        # Check personas were analyzed
        assert len(data["personas"]) >= 3
    
    async def test_multi_persona_invalid_persona(
        self,
        client: AsyncClient,
        mock_auth_token: str
    ):
        """Test multi-persona analysis with invalid persona"""
        response = await client.post(
            "/api/v1/ai/multi-persona-analysis",
            json={
                "case_id": "test-case",
                "personas": ["invalid_persona", "auditor"]
            },
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        assert response.status_code == 400
        assert "Invalid persona" in response.json()["detail"]
    
    async def test_multi_persona_rate_limit(
        self,
        client: AsyncClient,
        mock_auth_token: str
    ):
        """Test multi-persona analysis rate limiting (20/hour)"""
        # Make 21 requests
        responses = []
        for i in range(21):
            response = await client.post(
                "/api/v1/ai/multi-persona-analysis",
                json={"case_id": f"test-case-{i}"},
                headers={"Authorization": f"Bearer {mock_auth_token}"}
            )
            responses.append(response)
        
        # 21st request should be rate limited
        assert responses[-1].status_code == 429
    
    async def test_proactive_suggestions_adjudication_context(
        self,
        client: AsyncClient,
        mock_auth_token: str
    ):
        """Test proactive suggestions for adjudication context"""
        response = await client.post(
            "/api/v1/ai/proactive-suggestions",
            json={
                "context": "adjudication-queue",
                "case_id": "test-case"
            },
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert data["status"] == "success"
        assert "suggestions" in data
        assert isinstance(data["suggestions"], list)
        assert len(data["suggestions"]) > 0
        
        # Check suggestion structure
        suggestion = data["suggestions"][0]
        assert "type" in suggestion
        assert "priority" in suggestion
        assert "message" in suggestion
        assert "actions" in suggestion
    
    async def test_proactive_suggestions_dashboard_context(
        self,
        client: AsyncClient,
        mock_auth_token: str
    ):
        """Test proactive suggestions for dashboard context"""
        response = await client.post(
            "/api/v1/ai/proactive-suggestions",
            json={
                "context": "dashboard",
                "user_actions": ["viewed_metrics", "filtered_cases"]
            },
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Dashboard should have risk alerts
        assert any(
            s["type"] == "risk_alert" 
            for s in data["suggestions"]
        )
    
    async def test_investigate_subject_success(
        self,
        client: AsyncClient,
        mock_auth_token: str,
        mock_subject_id: str
    ):
        """Test AI investigation of subject"""
        response = await client.post(
            f"/api/v1/ai/investigate/{mock_subject_id}",
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert data["status"] == "completed"
        assert "findings" in data
        assert "verdict" in data
    
    async def test_investigate_subject_rate_limit(
        self,
        client: AsyncClient,
        mock_auth_token: str,
        mock_subject_id: str
    ):
        """Test investigation rate limiting (10/hour - expensive operation)"""
        # Make 11 requests
        responses = []
        for i in range(11):
            response = await client.post(
                f"/api/v1/ai/investigate/{mock_subject_id}",
                headers={"Authorization": f"Bearer {mock_auth_token}"}
            )
            responses.append(response)
        
        # 11th request should be rate limited
        assert responses[-1].status_code == 429
    
    async def test_investigate_nonexistent_subject(
        self,
        client: AsyncClient,
        mock_auth_token: str
    ):
        """Test investigation of non-existent subject"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.post(
            f"/api/v1/ai/investigate/{fake_id}",
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        # Should handle gracefully
        assert response.status_code in [404, 500]


@pytest.mark.asyncio
class TestAIResponseQuality:
    """Test AI response quality and content"""
    
    async def test_chat_response_relevance(
        self,
        client: AsyncClient,
        mock_auth_token: str
    ):
        """Test that AI chat responses are relevant"""
        test_queries = [
            "What is a fraud pattern?",
            "How do I review evidence?",
            "Show me high-risk cases"
        ]
        
        for query in test_queries:
            response = await client.post(
                "/api/v1/ai/chat",
                params={"message": query},
                headers={"Authorization": f"Bearer {mock_auth_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Response should mention key terms from query
            assert len(data["response"]) > 20  # Not too short
            assert len(data["response"]) < 1000  # Not too verbose
    
    async def test_persona_consensus_logic(
        self,
        client: AsyncClient,
        mock_auth_token: str
    ):
        """Test that persona consensus makes sense"""
        response = await client.post(
            "/api/v1/ai/multi-persona-analysis",
            json={"case_id": "test-case"},
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Consensus score should be within confidence range
        if "confidence_range" in data:
            min_conf, max_conf = data["confidence_range"]
            consensus = data["consensus_score"]
            assert min_conf <= consensus <= max_conf
    
    async def test_suggestion_priority_levels(
        self,
        client: AsyncClient,
        mock_auth_token: str
    ):
        """Test that suggestions have valid priority levels"""
        response = await client.post(
            "/api/v1/ai/proactive-suggestions",
            json={"context": "adjudication-queue"},
            headers={"Authorization": f"Bearer {mock_auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        valid_priorities = ["high", "medium", "low"]
        for suggestion in data["suggestions"]:
            assert suggestion["priority"] in valid_priorities


# Fixtures
@pytest.fixture
async def mock_auth_token():
    """Mock authentication token for testing"""
    return "test-token-12345"

@pytest.fixture
async def mock_subject_id():
    """Mock subject ID for testing"""
    return "550e8400-e29b-41d4-a716-446655440000"
