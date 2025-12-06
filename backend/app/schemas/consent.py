from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.db.models import ConsentType

class ConsentCreate(BaseModel):
    """Request to create a new consent record."""
    subject_id: UUID
    consent_type: ConsentType
    expires_at: Optional[datetime] = None

class ConsentResponse(BaseModel):
    """Consent record response."""
    id: UUID
    subject_id: UUID
    consent_type: ConsentType
    granted_at: datetime
    expires_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class ConsentRevoke(BaseModel):
    """Request to revoke a consent."""
    reason: Optional[str] = None
