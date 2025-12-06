from sqlalchemy import Column, String, Float, ForeignKey, DateTime, JSON, Integer, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import uuid

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    status = Column(String, default="pending")  # pending, completed, failed
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Adjudication Fields
    adjudication_status = Column(String, default="pending")  # pending, flagged, reviewed
    decision = Column(String, nullable=True)  # confirmed_fraud, false_positive, escalated
    reviewer_notes = Column(String, nullable=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Chain of Custody
    chain_of_custody = Column(JSON, default=list)  # List of custody log entries

    # Relationships
    subject = relationship("Subject", back_populates="analysis_results")
    indicators = relationship("Indicator", back_populates="analysis_result", cascade="all, delete-orphan")
    reviewer = relationship("User", foreign_keys=[reviewer_id])

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_result_id = Column(UUID(as_uuid=True), ForeignKey("analysis_results.id"), nullable=False)
    type = Column(String, nullable=False)  # structuring, velocity, etc.
    confidence = Column(Float, default=0.0)
    evidence = Column(JSON, default={})  # Flexible payload for evidence details
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    analysis_result = relationship("AnalysisResult", back_populates="indicators")


class SearchHistory(Base):
    """Model for storing user search history."""
    __tablename__ = "search_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    query = Column(String, nullable=False)
    search_type = Column(String, default="semantic")  # semantic, hybrid, etc.
    filters = Column(JSON, default={})  # Applied filters
    result_count = Column(Integer, default=0)
    search_time_ms = Column(Integer, nullable=True)  # Search execution time
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])


class SearchTemplate(Base):
    """Model for storing reusable search templates."""
    __tablename__ = "search_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    query = Column(String, nullable=False)
    search_type = Column(String, default="semantic")
    filters = Column(JSON, default={})
    is_public = Column(Boolean, default=False)  # Allow team sharing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])


class SearchAnnotation(Base):
    """Model for storing search result annotations and comments."""
    __tablename__ = "search_annotations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    document_id = Column(String, nullable=False)  # Vector document ID
    annotation_type = Column(String, nullable=False)  # note, highlight, tag, comment
    content = Column(String, nullable=False)
    position = Column(JSON, nullable=True)  # Position data for highlights
    is_private = Column(Boolean, default=True)  # Private to user or shared
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])


class SearchSession(Base):
    """Model for collaborative search sessions."""
    __tablename__ = "search_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    case_id = Column(UUID(as_uuid=True), nullable=True)  # Associated case
    is_active = Column(Boolean, default=True)
    participant_ids = Column(JSON, default=[])  # List of user IDs
    session_data = Column(JSON, default={})  # Shared filters, results, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
