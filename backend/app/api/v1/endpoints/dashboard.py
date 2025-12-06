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
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get dashboard metrics.
    """
    # Count active subjects (treating them as cases for now)
    result_subjects = await db.execute(select(func.count(Subject.id)))
    active_cases = result_subjects.scalar() or 0

    # Count high risk subjects (risk_score > 80)
    # We need to import AnalysisResult inside the function or at top level if circular imports allow
    from app.db.models import AnalysisResult
    
    result_high_risk = await db.execute(
        select(func.count(AnalysisResult.id)).where(AnalysisResult.risk_score > 80)
    )
    high_risk_subjects = result_high_risk.scalar() or 0

    # Count pending reviews (adjudication_status == 'pending')
    result_pending = await db.execute(
        select(func.count(AnalysisResult.id)).where(AnalysisResult.adjudication_status == 'pending')
    )
    pending_reviews = result_pending.scalar() or 0

    # Mock system load (could use psutil in future)
    import random
    system_load = int(42 + (random.random() * 10 - 5)) # Fluctuate around 42

    return {
        "active_cases": active_cases,
        "high_risk_subjects": high_risk_subjects,
        "pending_reviews": pending_reviews,
        "system_load": system_load,
    }
