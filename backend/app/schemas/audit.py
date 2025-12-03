from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, Any, Dict
from app.db.models import ActionType

class AuditLogBase(BaseModel):
    actor_id: Optional[UUID] = None
    action: ActionType
    resource_id: UUID
    details: Optional[Dict[str, Any]] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: UUID
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
