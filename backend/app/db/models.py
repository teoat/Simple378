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

class EvidenceType(str, enum.Enum):
    DOCUMENT = "document"
    CHAT = "chat"
    VIDEO = "video"
    PHOTO = "photo"

class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    case_id = Column(Uuid, ForeignKey("subjects.id"), nullable=False)
    type = Column(Enum(EvidenceType), nullable=False)
    filename = Column(String, nullable=False)
    original_path = Column(String, nullable=False)
    size_bytes = Column(Numeric, nullable=False)
    mime_type = Column(String)
    uploaded_by = Column(Uuid, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processing_status = Column(Enum(ProcessingStatus), default=ProcessingStatus.PENDING)
    processed_at = Column(DateTime)
    metadata_ = Column("metadata", JSON, nullable=True)  # 'metadata' is reserved in SQLAlchemy Base
    tags = Column(JSON, nullable=True)  # Store as JSON array since ARRAY is Postgres specific and we want generic support if possible, or just use JSON
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    document = relationship("Document", uselist=False, back_populates="evidence", cascade="all, delete-orphan")
    chat = relationship("Chat", uselist=False, back_populates="evidence", cascade="all, delete-orphan")
    video = relationship("Video", uselist=False, back_populates="evidence", cascade="all, delete-orphan")
    photo = relationship("Photo", uselist=False, back_populates="evidence", cascade="all, delete-orphan")
    
    annotations = relationship("EvidenceAnnotation", back_populates="evidence", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Uuid, ForeignKey("evidence.id"), primary_key=True)
    page_count = Column(Numeric)
    extracted_text = Column(String)
    extracted_tables = Column(JSON)
    entities = Column(JSON)
    thumbnails = Column(JSON)  # List of URLs
    ocr_confidence = Column(Numeric)
    
    evidence = relationship("Evidence", back_populates="document")

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Uuid, ForeignKey("evidence.id"), primary_key=True)
    platform = Column(String)
    message_count = Column(Numeric)
    participant_count = Column(Numeric)
    date_range_start = Column(DateTime)
    date_range_end = Column(DateTime)
    participants = Column(JSON)
    messages = Column(JSON)
    keywords = Column(JSON)
    sentiment = Column(JSON)
    network_graph = Column(JSON)
    
    evidence = relationship("Evidence", back_populates="chat")

class Video(Base):
    __tablename__ = "videos"
    
    id = Column(Uuid, ForeignKey("evidence.id"), primary_key=True)
    duration = Column(Numeric) # seconds
    resolution = Column(JSON)
    fps = Column(Numeric)
    transcript = Column(String)
    transcript_confidence = Column(Numeric)
    thumbnails = Column(JSON)
    scenes = Column(JSON)
    detected_faces = Column(JSON)
    detected_objects = Column(JSON)
    key_moments = Column(JSON)
    
    evidence = relationship("Evidence", back_populates="video")

class Photo(Base):
    __tablename__ = "photos"
    
    id = Column(Uuid, ForeignKey("evidence.id"), primary_key=True)
    dimensions = Column(JSON)
    exif_data = Column(JSON)
    ocr_text = Column(String)
    classification = Column(String)
    detected_objects = Column(JSON)
    detected_text = Column(JSON)
    gps_location = Column(JSON) # {lat: float, lng: float}
    
    evidence = relationship("Evidence", back_populates="photo")

class EvidenceLink(Base):
    __tablename__ = "evidence_links"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    evidence_id_1 = Column(Uuid, ForeignKey("evidence.id"), nullable=False)
    evidence_id_2 = Column(Uuid, ForeignKey("evidence.id"), nullable=False)
    link_type = Column(String, nullable=False) # 'supports', 'contradicts', 'references', 'related'
    confidence = Column(Numeric)
    created_by = Column(Uuid, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class EvidenceAnnotation(Base):
    __tablename__ = "evidence_annotations"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    evidence_id = Column(Uuid, ForeignKey("evidence.id"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id"))
    annotation_type = Column(String, nullable=False) # 'highlight', 'comment', 'redaction', 'timestamp'
    content = Column(JSON)
    position = Column(JSON) # page/timestamp/coordinates
    created_at = Column(DateTime, default=datetime.utcnow)
    
    evidence = relationship("Evidence", back_populates="annotations")
