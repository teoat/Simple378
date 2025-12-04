from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import uuid

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String, default="USD")
    date = Column(DateTime(timezone=True), nullable=False)
    description = Column(String, nullable=True)
    
    # Provenance
    source_bank = Column(String, nullable=False)  # e.g., "Chase", "Wells Fargo"
    source_file_id = Column(String, nullable=True) # ID or name of the uploaded file
    external_id = Column(String, nullable=True)   # Bank's transaction ID if available
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    subject = relationship("Subject", back_populates="transactions")
