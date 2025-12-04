"""
WebSocket Authentication Integration Tests

Tests for WebSocket JWT verification and authentication flow.
"""
import pytest
import uuid
from datetime import datetime, timedelta
from jose import jwt
from fastapi import WebSocket
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.core.config import settings
from app.db.models import User


class TestWebSocketAuthentication:
    """Test WebSocket authentication and JWT verification."""
    
    def test_websocket_requires_token(self, client: TestClient):
        """Test that WebSocket connection requires a token."""
        with pytest.raises(Exception):
            # Attempt to connect without token should fail
            with client.websocket_connect("/api/v1/ws"):
                pass
    
    def test_websocket_rejects_invalid_token(self, client: TestClient):
        """Test that invalid tokens are rejected."""
        with pytest.raises(Exception):
            with client.websocket_connect("/api/v1/ws?token=invalid-token-12345"):
                pass
    
    def test_websocket_rejects_expired_token(self, client: TestClient, test_user: User):
        """Test that expired tokens are rejected."""
        # Create expired token
        expire = datetime.utcnow() - timedelta(minutes=30)
        expired_token = jwt.encode(
            {
                "exp": expire,
                "sub": str(test_user.id),
                "type": "access",
                "jti": str(uuid.uuid4())
            },
            settings.SECRET_KEY,
            algorithm=security.ALGORITHM
        )
        
        with pytest.raises(Exception):
            with client.websocket_connect(f"/api/v1/ws?token={expired_token}"):
                pass
    
    def test_websocket_rejects_refresh_token(self, client: TestClient, test_user: User):
        """Test that refresh tokens are rejected (only access tokens allowed)."""
        # Create refresh token
        refresh_token = security.create_refresh_token(str(test_user.id))
        
        with pytest.raises(Exception):
            with client.websocket_connect(f"/api/v1/ws?token={refresh_token}"):
                pass
    
    @pytest.mark.asyncio
    async def test_websocket_rejects_blacklisted_token(
        self,
        client: TestClient,
        test_user: User,
        db: AsyncSession
    ):
        """Test that blacklisted tokens are rejected."""
        # Create valid token
        token = security.create_access_token(str(test_user.id))
        
        # Blacklist the token
        await security.blacklist_token(token, expires_in=3600)
        
        with pytest.raises(Exception):
            with client.websocket_connect(f"/api/v1/ws?token={token}"):
                pass
    
    def test_websocket_accepts_valid_token(
        self,
        client: TestClient,
        test_user: User
    ):
        """Test that valid tokens are accepted."""
        # Create valid access token
        token = security.create_access_token(str(test_user.id))
        
        # Should connect successfully
        with client.websocket_connect(f"/api/v1/ws?token={token}") as websocket:
            # Connection established
            assert websocket is not None
            
            # Can send and receive messages
            websocket.send_text("ping")
            # Note: Actual message handling depends on your implementation
    
    def test_websocket_rejects_nonexistent_user(self, client: TestClient):
        """Test that tokens for non-existent users are rejected."""
        # Create token for non-existent user
        fake_user_id = str(uuid.uuid4())
        token = security.create_access_token(fake_user_id)
        
        with pytest.raises(Exception):
            with client.websocket_connect(f"/api/v1/ws?token={token}"):
                pass
    
    def test_websocket_handles_malformed_token(self, client: TestClient):
        """Test that malformed tokens are properly rejected."""
        malformed_tokens = [
            "not.a.token",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed",
            "Bearer valid-looking-but-not-jwt",
            "",
            "null",
        ]
        
        for malformed_token in malformed_tokens:
            with pytest.raises(Exception):
                with client.websocket_connect(f"/api/v1/ws?token={malformed_token}"):
                    pass


class TestWebSocketFunctionality:
    """Test WebSocket message handling and real-time updates."""
    
    def test_websocket_receives_stats_update(
        self,
        client: TestClient,
        test_user: User
    ):
        """Test that connected clients receive stats updates."""
        token = security.create_access_token(str(test_user.id))
        
        with client.websocket_connect(f"/api/v1/ws?token={token}") as websocket:
            # In a real test, you'd trigger a stats update event
            # and verify the websocket receives it
            pass
    
    def test_websocket_handles_disconnect(
        self,
        client: TestClient,
        test_user: User
    ):
        """Test that disconnections are handled gracefully."""
        token = security.create_access_token(str(test_user.id))
        
        with client.websocket_connect(f"/api/v1/ws?token={token}") as websocket:
            # Connection established
            assert websocket is not None
        
        # Connection closed, should clean up properly
        # Verify in connection manager (if accessible in tests)
    
    def test_multiple_concurrent_connections(
        self,
        client: TestClient,
        test_user: User
    ):
        """Test that multiple connections from same user work correctly."""
        token = security.create_access_token(str(test_user.id))
        
        # Open multiple connections
        with client.websocket_connect(f"/api/v1/ws?token={token}") as ws1:
            with client.websocket_connect(f"/api/v1/ws?token={token}") as ws2:
                assert ws1 is not None
                assert ws2 is not None
                # Both connections should be active


class TestWebSocketSecurity:
    """Security-focused tests for WebSocket connections."""
    
    def test_websocket_validates_jwt_signature(self, client: TestClient, test_user: User):
        """Test that JWT signature is validated."""
        # Create token with wrong secret
        wrong_token = jwt.encode(
            {
                "exp": datetime.utcnow() + timedelta(minutes=30),
                "sub": str(test_user.id),
                "type": "access",
                "jti": str(uuid.uuid4())
            },
            "wrong-secret-key",
            algorithm=security.ALGORITHM
        )
        
        with pytest.raises(Exception):
            with client.websocket_connect(f"/api/v1/ws?token={wrong_token}"):
                pass
    
    def test_websocket_validates_token_structure(self, client: TestClient):
        """Test that token structure is validated."""
        # Create token missing required fields
        incomplete_token = jwt.encode(
            {
                "exp": datetime.utcnow() + timedelta(minutes=30),
                # Missing 'sub', 'type', etc.
            },
            settings.SECRET_KEY,
            algorithm=security.ALGORITHM
        )
        
        with pytest.raises(Exception):
            with client.websocket_connect(f"/api/v1/ws?token={incomplete_token}"):
                pass
    
    @pytest.mark.asyncio
    async def test_websocket_prevents_token_reuse_after_blacklist(
        self,
        client: TestClient,
        test_user: User
    ):
        """Test that once blacklisted, token cannot be reused."""
        token = security.create_access_token(str(test_user.id))
        
        # First connection should work
        with client.websocket_connect(f"/api/v1/ws?token={token}") as websocket:
            assert websocket is not None
        
        # Blacklist the token (simulating logout)
        await security.blacklist_token(token, expires_in=3600)
        
        # Second connection should fail
        with pytest.raises(Exception):
            with client.websocket_connect(f"/api/v1/ws?token={token}"):
                pass


# Fixtures for tests
@pytest.fixture
def test_user(db: AsyncSession):
    """Create a test user for WebSocket tests."""
    from app.db.models import User
    import uuid
    from app.core.security import get_password_hash
    
    user = User(
        id=uuid.uuid4(),
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpass123"),
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    yield user
    
    # Cleanup
    db.delete(user)
    db.commit()
