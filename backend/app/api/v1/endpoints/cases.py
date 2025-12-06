from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
import uuid

from app.api import deps
from app.db.models import Subject, AuditLog, ActionType, Transaction
from app.models import mens_rea as models
from app.core.websocket import emit_case_created, emit_case_updated, emit_case_deleted
from app.services.risk_forecast import RiskForecastService
from app.services.anomaly_detection import AnomalyDetectionService

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

@router.post("/", response_model=dict)
async def create_case(
    case_data: CaseCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Create a new case (subject).
    """
    # Create a new subject
    subject = Subject(
        encrypted_pii={"name": case_data.subject_name}  # In production, encrypt this properly
    )
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    
    # Create audit log
    audit_log = AuditLog(
        actor_id=current_user.id,
        action=ActionType.VIEW,  # Using VIEW as creation action
        resource_id=subject.id,
        details={"action": "case_created", "subject_name": case_data.subject_name}
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
    current_user = Depends(deps.get_current_user)
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
        details={"action": "case_updated", "updates": case_data.dict(exclude_unset=True)}
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
        "subject_name": subject.encrypted_pii.get("name", f"Subject {str(subject.id)[:8]}") if isinstance(subject.encrypted_pii, dict) else f"Subject {str(subject.id)[:8]}",
        "status": analysis.adjudication_status if analysis else "new",
        "updated_at": subject.created_at.isoformat() if subject.created_at else None,
    }

@router.patch("/batch", response_model=dict)
async def batch_update_cases(
    batch_data: BatchCaseUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
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
            details={"action": "batch_case_updated", "updates": batch_data.dict(exclude={"case_ids"})}
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
        "failed_cases": failed_cases
    }

@router.delete("/{case_id}")
async def delete_case(
    case_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
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
        details={"action": "case_deleted"}
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
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
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
        timeline.append({
            "id": str(analysis.id),
            "timestamp": analysis.created_at.isoformat() if analysis.created_at else None,
            "event_type": "analysis_completed",
            "description": f"Analysis completed with risk score {analysis.risk_score}",
            "user": "System"
        })
        
        if analysis.decision:
            timeline.append({
                "id": f"{analysis.id}-decision",
                "timestamp": analysis.updated_at.isoformat() if analysis.updated_at else None,
                "event_type": "decision_made",
                "description": f"Decision: {analysis.decision}",
                "user": str(analysis.reviewer_id) if analysis.reviewer_id else "Unknown"
            })
    
    # Add audit log events
    for log in logs:
        timeline.append({
            "id": str(log.id),
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "event_type": log.action.value if hasattr(log.action, 'value') else str(log.action),
            "description": log.details.get("action", "Action performed") if isinstance(log.details, dict) else "Action performed",
            "user": str(log.actor_id) if log.actor_id else "Unknown"
        })
    
    # Sort by timestamp descending
    timeline.sort(key=lambda x: x["timestamp"] or "", reverse=True)
    
    return timeline

@router.get("/{case_id}/financials", response_model=dict)
async def get_case_financials(
    case_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get financial visualization data for a case.
    """
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
    transactions = result.scalars().all()

    # Prepare transaction data for anomaly detection
    transaction_data = []
    total_inflow = 0.0
    total_outflow = 0.0
    cashflow_data = []
    milestones = []

    current_balance = 0.0

    # Categorization buckets
    # Income
    income_sources = {"id": "income", "name": "Income Sources", "amount": 0.0, "transactions": 0}
    mirror_txs = {"id": "mirror", "name": "Mirror Transactions", "amount": 0.0, "transactions": 0}
    external_transfers = {"id": "external", "name": "External Transfers", "amount": 0.0, "transactions": 0}

    # Expenses
    project_expenses = {"id": "project", "name": "Project Specific", "amount": 0.0, "transactions": 0}
    ops_expenses = {"id": "ops", "name": "Operational Expenses", "amount": 0.0, "transactions": 0}
    personal_expenses = {"id": "personal", "name": "Personal Expenses", "amount": 0.0, "transactions": 0}

    for tx in transactions:
        amt = float(tx.amount or 0)
        desc = (tx.description or "").lower()
        
        if amt > 0:
            total_inflow += amt
            # Income categorization
            if "mirror" in desc or "transfer" in desc:
                mirror_txs["amount"] += amt
                mirror_txs["transactions"] += 1
            elif "external" in desc or "wire" in desc:
                external_transfers["amount"] += amt
                external_transfers["transactions"] += 1
            else:
                income_sources["amount"] += amt
                income_sources["transactions"] += 1
        else:
            abs_amt = abs(amt)
            total_outflow += abs_amt
            # Expense categorization
            if any(k in desc for k in ["project", "labor", "material", "concrete", "steel", "site"]):
                project_expenses["amount"] += abs_amt
                project_expenses["transactions"] += 1
            elif any(k in desc for k in ["office", "rent", "server", "software", "utility", "ops"]):
                ops_expenses["amount"] += abs_amt
                ops_expenses["transactions"] += 1
            else:
                personal_expenses["amount"] += abs_amt
                personal_expenses["transactions"] += 1

        current_balance += amt

        tx_dict = {
            "id": str(tx.id),
            "date": tx.date.isoformat() if tx.date else None,
            "amount": amt,
            "description": tx.description or "",
            "source_bank": tx.source_bank or ""
        }
        transaction_data.append(tx_dict)

        cashflow_data.append({
            "date": tx.date.isoformat() if tx.date else "",
            "inflow": amt if amt > 0 else 0,
            "outflow": abs(amt) if amt < 0 else 0,
            "balance": current_balance
        })

        # Simple Milestone Detection: High Value Transactions (> $10k)
        if abs(amt) > 10000:
            milestones.append({
                "id": str(tx.id),
                "name": f"High Value {'Deposit' if amt > 0 else 'Payment'}",
                "date": tx.date.isoformat() if tx.date else "",
                "amount": amt,
                "status": "complete",
                "phase": "Phase 1", # Placeholder
                "description": tx.description or ""
            })

    # AI-powered anomaly detection
    subject_info = {
        "subject_id": str(case_uuid),
        "total_transactions": len(transactions),
        "total_inflow": total_inflow,
        "total_outflow": total_outflow
    }

    fraud_indicators = await AnomalyDetectionService.detect_anomalies(transaction_data, subject_info)

    # Calculate risk score from anomalies if no existing analysis
    analysis_result = await db.execute(
        select(models.AnalysisResult)
        .where(models.AnalysisResult.subject_id == case_uuid)
        .order_by(models.AnalysisResult.created_at.desc())
    )
    analysis = analysis_result.scalars().first()

    if analysis:
        risk_score = analysis.risk_score
    else:
        # Use anomaly-based risk score
        risk_score = AnomalyDetectionService.calculate_risk_score_from_anomalies(fraud_indicators)
    
    return {
        "total_inflow": total_inflow,
        "total_outflow": total_outflow,
        "net_cashflow": total_inflow - total_outflow,
        "risk_score": risk_score,
        "suspect_transactions": len(fraud_indicators),
        "milestones": milestones,
        "fraud_indicators": fraud_indicators,
        "cashflow_data": cashflow_data,
        "income_breakdown": {
            "income_sources": income_sources,
            "mirror_transactions": mirror_txs,
            "external_transfers": external_transfers
        },
        "expense_breakdown": {
            "personal_expenses": personal_expenses,
            "operational_expenses": ops_expenses,
            "project_expenses": project_expenses
        }
    }

@router.post("/{case_id}/ai-risk-prediction", response_model=Dict[str, Any])
async def predict_case_risk(
    case_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
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
        transaction_data.append({
            "date": tx.date.isoformat() if tx.date else None,
            "amount": float(tx.amount) if tx.amount else 0.0,
            "description": tx.description or "",
            "source_bank": tx.source_bank or ""
        })

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
        analysis_data.append({
            "risk_score": a.risk_score,
            "severity": a.severity,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })

    # Recent activity summary
    recent_activity = {
        "total_transactions": len(transactions),
        "last_transaction_date": transaction_data[0]["date"] if transaction_data else None,
        "high_value_transactions": len([t for t in transaction_data if abs(t["amount"]) > 10000])
    }

    # Generate AI prediction
    risk_service = RiskForecastService()
    prediction = await risk_service.ai_risk_prediction(
        subject_id=case_id,
        current_risk_score=current_risk_score,
        transaction_history=transaction_data,
        analysis_results=analysis_data,
        recent_activity=recent_activity
    )

    return prediction

