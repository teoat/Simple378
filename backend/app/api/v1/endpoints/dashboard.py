from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, cast, Date, desc
from datetime import datetime, timedelta

from app.api import deps
from app.db.models import Subject, AnalysisResult, AuditLog, User

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get dashboard metrics with deltas.
    """
    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    
    # helper for daily delta
    async def get_count(model, condition=None):
        q = select(func.count(model.id))
        if condition is not None:
            q = q.where(condition)
        res = await db.execute(q)
        return res.scalar() or 0

    async def get_created_after(model, date_threshold, condition=None):
        q = select(func.count(model.id)).where(model.created_at >= date_threshold)
        if condition is not None:
            q = q.where(condition)
        res = await db.execute(q)
        return res.scalar() or 0

    # 1. Total Cases (Subjects)
    total_cases = await get_count(Subject)
    new_cases_today = await get_created_after(Subject, yesterday)
    
    # 2. High Risk
    condition_high_risk = AnalysisResult.risk_score > 80
    high_risk_subjects = await get_count(AnalysisResult, condition_high_risk)
    new_high_risk_today = await get_created_after(AnalysisResult, yesterday, condition_high_risk)

    # 3. Pending Reviews
    condition_pending = AnalysisResult.adjudication_status == 'pending'
    pending_reviews = await get_count(AnalysisResult, condition_pending)
    # Delta for pending is diff from yesterday? 
    # Hard to calc accurately without historical snapshots, but we can approx: 
    # pending today = created_pending - resolved_today. 
    # Let's just use recent creations as a proxy for "influx" or return net change if possible.
    # For now, let's return new pending items in last 24h as delta.
    new_pending_today = await get_created_after(AnalysisResult, yesterday, condition_pending)
    
    # 4. Resolved Today
    # Assuming 'reviewed' means resolved. Or 'completed'.
    condition_resolved = AnalysisResult.adjudication_status == 'reviewed'
    # We want resolved *today*. So we need updated_at > yesterday AND status=reviewed
    q_resolved = select(func.count(AnalysisResult.id)).where(
        AnalysisResult.adjudication_status == 'reviewed',
        AnalysisResult.updated_at >= yesterday
    )
    res_resolved = await db.execute(q_resolved)
    resolved_today = res_resolved.scalar() or 0

    return {
        "total_cases": total_cases,
        "total_cases_delta": new_cases_today,
        "high_risk_subjects": high_risk_subjects,
        "high_risk_delta": new_high_risk_today,
        "pending_reviews": pending_reviews,
        "pending_delta": new_pending_today, # Interpretation: +X new items to review
        "resolved_today": resolved_today
    }

@router.get("/activity")
async def get_dashboard_activity(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> List[Any]:
    """
    Get recent system activity from AuditLog.
    """
    # Join with User to get actor names
    stmt = (
        select(AuditLog, User.full_name)
        .outerjoin(User, AuditLog.actor_id == User.id)
        .order_by(desc(AuditLog.timestamp))
        .limit(10)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    activities = []
    for log, user_name in rows:
        activities.append({
            "id": str(log.id),
            "type": log.action.value if hasattr(log.action, 'value') else str(log.action),
            "message": f"Action {log.action} on resource", # You can refine this description based on details
            "timestamp": log.timestamp.isoformat(),
            "user": user_name or "System"
        })
    
    return activities

@router.get("/charts")
async def get_dashboard_charts(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get aggregated data for charts.
    """
    # 1. Weekly Activity (Cases created per day for last 7 days)
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    
    # Group by date
    stmt_cases = (
        select(cast(Subject.created_at, Date).label('day'), func.count(Subject.id))
        .where(Subject.created_at >= seven_days_ago)
        .group_by('day')
        .order_by('day')
    )
    result_cases = await db.execute(stmt_cases)
    cases_by_day = {row[0].strftime('%a'): row[1] for row in result_cases.all()}

    # Initialize last 7 days with 0
    activity_data = []
    for i in range(7):
        d = seven_days_ago + timedelta(days=i+1)
        day_str = d.strftime('%a') # Mon, Tue...
        activity_data.append({
            "day": day_str,
            "cases": cases_by_day.get(day_str, 0),
            "reviews": 0 # TODO: Query AnalysisResult completions per day similarly
        })

    # 2. Risk Distribution
    # Buckets: 0-30, 31-60, 61-80, 81-100
    # SQL way: case/when, but simple python aggregation might be fast enough for small datasets.
    # Let's do a single query for all scores.
    stmt_risk = select(AnalysisResult.risk_score)
    result_risk = await db.execute(stmt_risk)
    scores = result_risk.scalars().all()
    
    low = medium = high = critical = 0
    for score in scores:
        s = float(score) if score else 0
        if s <= 30: low += 1
        elif s <= 60: medium += 1
        elif s <= 80: high += 1
        else: critical += 1
        
    risk_distribution = [
        {"range": "0-30", "count": low, "riskLevel": "Low"},
        {"range": "31-60", "count": medium, "riskLevel": "Medium"},
        {"range": "61-80", "count": high, "riskLevel": "High"},
        {"range": "81-100", "count": critical, "riskLevel": "Critical"},
    ]

    return {
        "weekly_activity": activity_data,
        "risk_distribution": risk_distribution
    }
