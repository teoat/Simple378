from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas import audit as audit_schema
from app.db.models import AuditLog

router = APIRouter()

@router.get("/", response_model=List[audit_schema.AuditLog])
def read_audit_logs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve audit logs.
    """
    audit_logs = db.query(AuditLog).offset(skip).limit(limit).all()
    return audit_logs
