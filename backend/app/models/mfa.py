"""
Multi-Factor Authentication database models.
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class UserMFA(Base):
    """User MFA configuration and temporary codes."""
    __tablename__ = "user_mfa"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # MFA method: 'totp', 'sms', 'email'
    method = Column(String, nullable=False)
    
    # Encrypted secret (for TOTP) or hashed code (for SMS/Email)
    secret = Column(String, nullable=False)
    
    # Contact information
    phone = Column(String, nullable=True)  # For SMS
    email = Column(String, nullable=True)  # For Email OTP
    
    # Status
    enabled = Column(Boolean, default=False, nullable=False)
    
    # Expiry for temporary codes (SMS/Email OTP)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class MFABackupCode(Base):
    """Backup recovery codes for MFA."""
    __tablename__ = "mfa_backup_codes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Hashed backup code
    code_hash = Column(String, nullable=False, unique=True, index=True)
    
    # Usage tracking
    used = Column(Boolean, default=False, nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
