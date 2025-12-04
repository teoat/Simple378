"""
WebAuthn database models.
"""
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class WebAuthnCredential(Base):
    """WebAuthn/Passkey credentials."""
    __tablename__ = "webauthn_credentials"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Credential data
    credential_id = Column(String, unique=True, nullable=False, index=True)
    public_key = Column(String, nullable=False)  # Base64 encoded public key
    
    # Security
    sign_count = Column(Integer, default=0, nullable=False)
    
    # Device information
    device_type = Column(String, nullable=True)  # 'platform', 'cross-platform'
    transports = Column(JSON, default=list)  # ['usb', 'nfc', 'ble', 'internal']
    
    # Usage tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_used = Column(DateTime(timezone=True), nullable=True)
