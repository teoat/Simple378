from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.api import deps
from app.db.models import AuditLog

router = APIRouter()

@router.get("/", response_model=dict)
async def get_audit_logs(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve audit logs.
    """
    total_query = await db.execute(select(func.count(AuditLog.id)))
    total = total_query.scalar() or 0
    
    result = await db.execute(select(AuditLog).offset(skip).limit(limit).order_by(AuditLog.timestamp.desc()))
    logs = result.scalars().all()
    
    items = []
    for log in logs:
        items.append({
            "id": str(log.id),
            "actor_id": str(log.actor_id) if log.actor_id else None,
            "action": log.action,
            "resource_id": str(log.resource_id),
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "details": log.details
        })
        
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "pages": (total + limit - 1) // limit
    }
