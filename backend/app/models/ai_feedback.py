from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
import uuid

from app.db.base_class import Base


class FeedbackType(str, enum.Enum):
    """Feedback type for AI responses"""
    POSITIVE = "positive"
    NEGATIVE = "negative"


class AIFeedback(Base):
    """Store user feedback for AI responses"""
    __tablename__ = "ai_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    message_id = Column(String, nullable=False, index=True)
    feedback_type = Column(SQLEnum(FeedbackType), nullable=False)
    conversation_context = Column(String, nullable=True)  # JSON string of recent messages
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="ai_feedback")


class AIConversation(Base):
    """Store AI conversation history for analytics"""
    __tablename__ = "ai_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_id = Column(String, nullable=False, index=True)
    message_count = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="ai_conversations")


class AIMetric(Base):
    """Store AI performance metrics"""
    __tablename__ = "ai_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_type = Column(String, nullable=False)  # 'response_time', 'accuracy', 'usage'
    metric_value = Column(Float, nullable=False)
    context = Column(String, nullable=True)  # Additional context as JSON
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
