from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, Dict, Any
from pydantic import BaseModel
import uuid

from app.api import deps
from app.db.models import Subject, AuditLog, ActionType, Transaction
from app.db import models
from app.core.websocket import emit_case_created, emit_case_updated, emit_case_deleted
from app.services.risk_forecast import RiskForecastService
from app.core.cache import (
    set_cache_headers,
    add_etag,
    check_etag_match,
    apply_cache_preset,
)
from fastapi import Request
from sqlalchemy import asc, desc, func

router = APIRouter()


class CaseCreate(BaseModel):
    subject_name: str
    description: Optional[str] = None


class CaseUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    description: Optional[str] = None


class BatchCaseUpdate(BaseModel):
    case_ids: list[str]
    status: Optional[str] = None
    assigned_to: Optional[str] = None


@router.get("/", response_model=dict)
async def get_cases(
    response: Response,
    status: Optional[str] = None,
    min_risk: Optional[int] = None,
    max_risk: Optional[int] = None,
    search: Optional[str] = None,
    page: Optional[int] = 1,
    limit: Optional[int] = 20,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """
    List cases (Subjects) with filtering, search, pagination, and sorting.
    """
    # Calculate skip from page
    skip = (page - 1) * limit if page > 0 else 0

    # Base query
    query = select(Subject, models.AnalysisResult).outerjoin(
        models.AnalysisResult, Subject.id == models.AnalysisResult.subject_id
    )

    # Apply filters
    if status:
        query = query.where(models.AnalysisResult.adjudication_status == status)

    if min_risk is not None:
        query = query.where(models.AnalysisResult.risk_score >= min_risk)

    if max_risk is not None:
        query = query.where(models.AnalysisResult.risk_score <= max_risk)

    if search:
        # Simple case-insensitive search on ID.
        # Searching on encrypted PII is not possible directly via SQL LIKE.
        # We cast UUID to text for searching.
        from sqlalchemy import cast, String

        search_term = f"%{search}%"
        query = query.where(cast(Subject.id, String).ilike(search_term))

    # Apply sorting
    valid_sort_fields = {
        "created_at": Subject.created_at,
        "risk_score": models.AnalysisResult.risk_score,
        "status": models.AnalysisResult.adjudication_status,
        "id": Subject.id,
    }

    sort_field = valid_sort_fields.get(sort_by, Subject.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_field))
    else:
        query = query.order_by(desc(sort_field))

    # Count query for pagination
    count_query = (
        select(func.count())
        .select_from(Subject)
        .outerjoin(
            models.AnalysisResult, Subject.id == models.AnalysisResult.subject_id
        )
    )

    if status:
        count_query = count_query.where(
            models.AnalysisResult.adjudication_status == status
        )
    if min_risk is not None:
        count_query = count_query.where(models.AnalysisResult.risk_score >= min_risk)
    if max_risk is not None:
        count_query = count_query.where(models.AnalysisResult.risk_score <= max_risk)
    if search:
        from sqlalchemy import cast, String

        search_term = f"%{search}%"
        count_query = count_query.where(cast(Subject.id, String).ilike(search_term))

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    items = []
    for row in rows:
        sub = row[0]
        analysis = row[1]

        # Name resolution (mock logic for now if encrypted_pii is just dict)
        subject_name = f"Case {str(sub.id)[:8]}"
        if sub.encrypted_pii and isinstance(sub.encrypted_pii, dict):
            subject_name = sub.encrypted_pii.get("name", subject_name)

        items.append(
            {
                "id": str(sub.id),
                "subject_name": subject_name,
                "risk_score": analysis.risk_score if analysis else 0,
                "status": analysis.adjudication_status if analysis else "new",
                "created_at": sub.created_at.isoformat() if sub.created_at else None,
                "assigned_to": "Unassigned",  # Placeholder
            }
        )

    data = {
        "items": items,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if limit > 0 else 1,
    }

    apply_cache_preset(response, "case_list")

    return data


@router.get("/{case_id}", response_model=dict)
async def get_case(
    case_id: str,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """
    Get case details.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    query = (
        select(Subject, models.AnalysisResult)
        .outerjoin(
            models.AnalysisResult, Subject.id == models.AnalysisResult.subject_id
        )
        .where(Subject.id == case_uuid)
    )

    result = await db.execute(query)
    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Case not found")

    sub = row[0]
    analysis = row[1]

    subject_name = f"Case {str(sub.id)[:8]}"
    if sub.encrypted_pii and isinstance(sub.encrypted_pii, dict):
        subject_name = sub.encrypted_pii.get("name", subject_name)

    data = {
        "id": str(sub.id),
        "subject_name": subject_name,
        "risk_score": analysis.risk_score if analysis else 0,
        "status": analysis.adjudication_status if analysis else "new",
        "description": (
            analysis.explanation
            if analysis and hasattr(analysis, "explanation")
            else "No description available"
        ),
        "assigned_to": "Unassigned",
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
        "flags": analysis.flags if analysis and hasattr(analysis, "flags") else {},
    }

    check_etag_match(request, data)
    apply_cache_preset(response, "default")
    add_etag(response, data)

    return data


@router.post("/", response_model=dict)
async def create_case(
    case_data: CaseCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Create a new case (subject).
    """
    # Create a new subject
    subject = Subject(
        encrypted_pii={
            "name": case_data.subject_name
        }  # In production, encrypt this properly
    )
    db.add(subject)
    await db.commit()
    await db.refresh(subject)

    # Create audit log
    audit_log = AuditLog(
        actor_id=current_user.id,
        action=ActionType.VIEW,  # Using VIEW as creation action
        resource_id=subject.id,
        details={"action": "case_created", "subject_name": case_data.subject_name},
    )
    db.add(audit_log)
    await db.commit()

    # Emit WebSocket event
    await emit_case_created(str(subject.id), str(current_user.id))

    return {
        "id": str(subject.id),
        "subject_name": case_data.subject_name,
        "status": "new",
        "created_at": subject.created_at.isoformat() if subject.created_at else None,
    }


@router.put("/{case_id}", response_model=dict)
async def update_case(
    case_id: str,
    case_data: CaseUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Update a case.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(Subject).where(Subject.id == case_uuid))
    subject = result.scalars().first()

    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")

    # Update subject if needed (for now, we'll just update the analysis result status if provided)
    if case_data.status:
        # Find the latest analysis result for this subject
        analysis_result = await db.execute(
            select(models.AnalysisResult)
            .where(models.AnalysisResult.subject_id == case_uuid)
            .order_by(models.AnalysisResult.created_at.desc())
        )
        analysis = analysis_result.scalars().first()
        if analysis:
            analysis.adjudication_status = case_data.status
            db.add(analysis)

    # Create audit log
    audit_log = AuditLog(
        actor_id=current_user.id,
        action=ActionType.EDIT,
        resource_id=subject.id,
        details={
            "action": "case_updated",
            "updates": case_data.dict(exclude_unset=True),
        },
    )
    db.add(audit_log)
    await db.commit()
    await db.refresh(subject)

    # Emit WebSocket event
    await emit_case_updated(str(subject.id), str(current_user.id))

    # Get latest analysis result for response
    analysis_result = await db.execute(
        select(models.AnalysisResult)
        .where(models.AnalysisResult.subject_id == case_uuid)
        .order_by(models.AnalysisResult.created_at.desc())
    )
    analysis = analysis_result.scalars().first()

    return {
        "id": str(subject.id),
        "subject_name": (
            subject.encrypted_pii.get("name", f"Subject {str(subject.id)[:8]}")
            if isinstance(subject.encrypted_pii, dict)
            else f"Subject {str(subject.id)[:8]}"
        ),
        "status": analysis.adjudication_status if analysis else "new",
        "updated_at": subject.created_at.isoformat() if subject.created_at else None,
    }


@router.patch("/batch", response_model=dict)
async def batch_update_cases(
    batch_data: BatchCaseUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Batch update multiple cases.
    """
    updated_cases = []
    failed_cases = []

    for case_id in batch_data.case_ids:
        try:
            case_uuid = uuid.UUID(case_id)
        except ValueError:
            failed_cases.append({"id": case_id, "error": "Invalid UUID"})
            continue

        result = await db.execute(select(Subject).where(Subject.id == case_uuid))
        subject = result.scalars().first()

        if not subject:
            failed_cases.append({"id": case_id, "error": "Case not found"})
            continue

        # Update analysis result status if provided
        if batch_data.status:
            analysis_result = await db.execute(
                select(models.AnalysisResult)
                .where(models.AnalysisResult.subject_id == case_uuid)
                .order_by(models.AnalysisResult.created_at.desc())
            )
            analysis = analysis_result.scalars().first()
            if analysis:
                analysis.adjudication_status = batch_data.status
                db.add(analysis)

        # Create audit log
        audit_log = AuditLog(
            actor_id=current_user.id,
            action=ActionType.EDIT,
            resource_id=subject.id,
            details={
                "action": "batch_case_updated",
                "updates": batch_data.dict(exclude={"case_ids"}),
            },
        )
        db.add(audit_log)

        updated_cases.append(case_id)

    await db.commit()

    # Emit WebSocket events for updated cases
    for case_id in updated_cases:
        await emit_case_updated(case_id, str(current_user.id))

    return {
        "updated": len(updated_cases),
        "failed": len(failed_cases),
        "updated_cases": updated_cases,
        "failed_cases": failed_cases,
    }


@router.delete("/{case_id}")
async def delete_case(
    case_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Delete a case (subject).
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(Subject).where(Subject.id == case_uuid))
    subject = result.scalars().first()

    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")

    case_id = str(subject.id)

    # Create audit log before deletion
    audit_log = AuditLog(
        actor_id=current_user.id,
        action=ActionType.DELETE,
        resource_id=subject.id,
        details={"action": "case_deleted"},
    )
    db.add(audit_log)

    # Delete subject (cascade will handle related records)
    await db.delete(subject)
    await db.commit()

    # Emit WebSocket event
    await emit_case_deleted(case_id, str(current_user.id))

    return {"status": "success", "message": "Case deleted"}


@router.get("/{case_id}/timeline", response_model=list)
async def get_case_timeline(
    case_id: str,
    response: Response,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Get timeline of events for a case.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    # Get audit logs for this case
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.resource_id == case_uuid)
        .order_by(AuditLog.timestamp.desc())
    )
    logs = result.scalars().all()

    # Get analysis results
    analysis_result = await db.execute(
        select(models.AnalysisResult)
        .where(models.AnalysisResult.subject_id == case_uuid)
        .order_by(models.AnalysisResult.created_at.desc())
    )
    analyses = analysis_result.scalars().all()

    timeline = []

    # Add analysis events
    for analysis in analyses:
        timeline.append(
            {
                "id": str(analysis.id),
                "timestamp": (
                    analysis.created_at.isoformat() if analysis.created_at else None
                ),
                "event_type": "analysis_completed",
                "description": f"Analysis completed with risk score {analysis.risk_score}",
                "user": "System",
            }
        )

        if analysis.decision:
            timeline.append(
                {
                    "id": f"{analysis.id}-decision",
                    "timestamp": (
                        analysis.updated_at.isoformat() if analysis.updated_at else None
                    ),
                    "event_type": "decision_made",
                    "description": f"Decision: {analysis.decision}",
                    "user": (
                        str(analysis.reviewer_id) if analysis.reviewer_id else "Unknown"
                    ),
                }
            )

    # Add audit log events
    for log in logs:
        timeline.append(
            {
                "id": str(log.id),
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "event_type": (
                    log.action.value
                    if hasattr(log.action, "value")
                    else str(log.action)
                ),
                "description": (
                    log.details.get("action", "Action performed")
                    if isinstance(log.details, dict)
                    else "Action performed"
                ),
                "user": str(log.actor_id) if log.actor_id else "Unknown",
            }
        )

    # Sort by timestamp descending
    timeline.sort(key=lambda x: x["timestamp"] or "", reverse=True)

    # Cache for 30 seconds
    set_cache_headers(response, max_age=30)
    add_etag(response, timeline)

    return timeline


@router.get("/{case_id}/financials", response_model=dict)
async def get_case_financials(
    case_id: str,
    response: Response,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Get financial visualization data for a case with advanced categorization.

    Returns comprehensive cashflow analysis with:
    - Mirror transaction detection (excluded from project calculations)
    - Personal vs business expense categorization
    - Project transaction calculation
    - Milestone detection
    - Fraud indicator analysis
    """
    from app.services.visualization import (
        CashflowAnalyzer,
        MilestoneDetector,
        FraudIndicatorDetector,
    )

    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    # Check subject exists
    subject = await db.get(Subject, case_uuid)
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")

    # Fetch transactions (limit to 5000 to prevent OOM)
    result = await db.execute(
        select(Transaction)
        .where(Transaction.subject_id == case_uuid)
        .order_by(Transaction.date)
        .limit(5000)
    )
    transactions = list(result.scalars().all())

    # Use new visualization services
    cashflow_analysis = await CashflowAnalyzer.analyze_cashflow(transactions, db)
    milestones = await MilestoneDetector.detect_milestones(transactions)
    fraud_indicators, risk_score = await FraudIndicatorDetector.detect_indicators(
        transactions, case_id
    )

    # Get suspect transaction count
    suspect_count = sum(
        1
        for indicator in fraud_indicators
        if indicator["severity"] in ["high", "medium"]
    )

    # Apply cache headers
    apply_cache_preset(response, "short")  # 5 minutes cache

    return {
        "total_inflow": cashflow_analysis["total_inflow"],
        "total_outflow": cashflow_analysis["total_outflow"],
        "net_cashflow": cashflow_analysis["net_cashflow"],
        "suspect_transactions": suspect_count,
        "risk_score": risk_score,
        "cashflow_data": cashflow_analysis["cashflow_data"],
        "income_breakdown": cashflow_analysis["income_breakdown"],
        "expense_breakdown": cashflow_analysis["expense_breakdown"],
        "project_summary": cashflow_analysis["project_summary"],
        "milestones": milestones,
        "fraud_indicators": fraud_indicators,
    }


@router.post("/{case_id}/ai-risk-prediction", response_model=Dict[str, Any])
async def predict_case_risk(
    case_id: str,
    response: Response,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.verify_active_analyst),
):
    """
    Use AI to predict future risk scores and provide insights for a case.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    # Check subject exists
    subject = await db.get(Subject, case_uuid)
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")

    # Get current risk score from latest analysis
    analysis_result = await db.execute(
        select(models.AnalysisResult)
        .where(models.AnalysisResult.subject_id == case_uuid)
        .order_by(models.AnalysisResult.created_at.desc())
    )
    analysis = analysis_result.scalars().first()
    current_risk_score = analysis.risk_score if analysis else 0.0

    # Get transaction history
    transactions_result = await db.execute(
        select(Transaction)
        .where(Transaction.subject_id == case_uuid)
        .order_by(Transaction.date.desc())
    )
    transactions = transactions_result.scalars().all()

    transaction_data = []
    for tx in transactions:
        transaction_data.append(
            {
                "date": tx.date.isoformat() if tx.date else None,
                "amount": float(tx.amount) if tx.amount else 0.0,
                "description": tx.description or "",
                "source_bank": tx.source_bank or "",
            }
        )

    # Get analysis results
    analyses_result = await db.execute(
        select(models.AnalysisResult)
        .where(models.AnalysisResult.subject_id == case_uuid)
        .order_by(models.AnalysisResult.created_at.desc())
        .limit(5)  # Last 5 analyses
    )
    analyses = analyses_result.scalars().all()

    analysis_data = []
    for a in analyses:
        analysis_data.append(
            {
                "risk_score": a.risk_score,
                "severity": a.severity,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
        )

    # Recent activity summary
    recent_activity = {
        "total_transactions": len(transactions),
        "last_transaction_date": (
            transaction_data[0]["date"] if transaction_data else None
        ),
        "high_value_transactions": len(
            [t for t in transaction_data if abs(t["amount"]) > 10000]
        ),
    }

    # Generate AI prediction
    risk_service = RiskForecastService()
    prediction = await risk_service.ai_risk_prediction(
        subject_id=case_id,
        current_risk_score=current_risk_score,
        transaction_history=transaction_data,
        analysis_results=analysis_data,
        recent_activity=recent_activity,
    )

    return prediction

    # Cache AI prediction for 5 minutes
    set_cache_headers(response, max_age=300)
    return prediction
