from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
from app.db.models import User
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
