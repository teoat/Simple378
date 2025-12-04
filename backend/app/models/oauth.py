"""
OAuth/SSO database models.
"""
from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class OAuthAccount(Base):
    """OAuth/SSO linked accounts."""
    __tablename__ = "oauth_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Provider information
    provider = Column(String, nullable=False, index=True)  # 'google', 'microsoft', 'github'
    provider_user_id = Column(String, nullable=False)  # User ID from provider
    
    # Tokens
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        # Ensure one account per provider per user
        # UniqueConstraint('provider', 'provider_user_id', name='unique_provider_account'),
    )
