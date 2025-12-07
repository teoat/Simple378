from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class TenantBase(BaseModel):
    name: str
    region: str = "us-east"
    plan: str = "standard"

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    plan: Optional[str] = None

class TenantConfigUpdate(BaseModel):
    features: Optional[List[str]] = None
    limits: Optional[Dict[str, Any]] = None
    compliance_standards: Optional[List[str]] = None

class TenantResponse(TenantBase):
    id: str
    features: List[str] = []
    limits: Dict[str, Any] = {}
    compliance_standards: List[str] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
