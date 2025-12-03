from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.api import deps
from app.db.models import Subject, User

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get dashboard metrics.
    """
    # Count active subjects (treating them as cases for now)
    result_subjects = await db.execute(select(func.count(Subject.id)))
    active_cases = result_subjects.scalar() or 0

    # Mock other metrics for now as models might be missing or complex
    high_risk_subjects = 0 # Placeholder
    pending_reviews = 0    # Placeholder
    system_load = 42       # Placeholder

    return {
        "active_cases": active_cases,
        "high_risk_subjects": high_risk_subjects,
        "pending_reviews": pending_reviews,
        "system_load": system_load,
    }
