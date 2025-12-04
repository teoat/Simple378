import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, JSON, Uuid, Numeric
# from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base

class ConsentType(str, enum.Enum):
    EXPLICIT = "explicit"
    LEGITIMATE_INTEREST = "legitimate_interest"
    LEGAL_OBLIGATION = "legal_obligation"

class ActionType(str, enum.Enum):
    VIEW = "view"
    EDIT = "edit"
    DELETE = "delete"
    EXPORT = "export"

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="analyst")
    created_at = Column(DateTime, default=datetime.utcnow)



class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    # Encrypted PII stored as JSON (e.g., {"name": "...", "national_id": "..."})
    encrypted_pii = Column(JSON, nullable=False) 
    created_at = Column(DateTime, default=datetime.utcnow)
    retention_policy_id = Column(String, nullable=True)
    # Relationships
    analysis_results = relationship("AnalysisResult", back_populates="subject", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="subject", cascade="all, delete-orphan")
    consents = relationship("Consent", back_populates="subject")

class Consent(Base):
    __tablename__ = "consents"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    subject_id = Column(Uuid, ForeignKey("subjects.id"))
    consent_type = Column(Enum(ConsentType), nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    subject = relationship("Subject", back_populates="consents")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    actor_id = Column(Uuid, ForeignKey("users.id"))
    action = Column(Enum(ActionType), nullable=False)
    resource_id = Column(Uuid, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(JSON, nullable=True)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    subject_id = Column(Uuid, ForeignKey("subjects.id"), nullable=False)
    
    amount = Column(Numeric(10, 2), nullable=False)  # Store as Numeric for precision
    currency = Column(String, default="USD")
    date = Column(DateTime, nullable=False)
    description = Column(String, nullable=True)
    
    # Provenance
    source_bank = Column(String, nullable=False)
    source_file_id = Column(String, nullable=True)
    external_id = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    subject = relationship("Subject", back_populates="transactions")


# Authentication Models
# Import authentication enhancement models for proper schema recognition
from app.models.mfa import UserMFA, MFABackupCode
from app.models.webauthn import WebAuthnCredential
from app.models.oauth import OAuthAccount

# Export all models for alembic autogenerate
__all__ = [
    "User",
    "Subject",
    "Consent",
    "AuditLog",
    "Transaction",
    "UserMFA",
    "MFABackupCode",
    "WebAuthnCredential",
    "OAuthAccount",
]
