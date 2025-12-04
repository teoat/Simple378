from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional
from pydantic import BaseModel
import uuid

from app.api import deps
from app.db.models import Subject, AuditLog, ActionType
from app.models import mens_rea as models
from app.core.websocket import emit_case_created, emit_case_updated, emit_case_deleted

router = APIRouter()

class CaseCreate(BaseModel):
    subject_name: str
    description: Optional[str] = None

class CaseUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    description: Optional[str] = None

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

