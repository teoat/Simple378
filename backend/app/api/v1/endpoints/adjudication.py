from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel
import uuid

from app.api import deps
from app.models import mens_rea as models
from app.schemas import mens_rea as schemas
from app.core.websocket import emit_alert_resolved, emit_queue_updated
from app.core.rbac import require_analyst

router = APIRouter()

class AdjudicationDecision(BaseModel):
    decision: str  # confirmed_fraud, false_positive, escalated
    notes: Optional[str] = None

@router.get("/queue", response_model=schemas.PaginatedAnalysisResult)
async def get_adjudication_queue(
    page: int = 1,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(require_analyst)
):
    """
    Fetch cases that require adjudication (status='flagged' or 'pending').
    Supports pagination.
    """
    # Base query
    query = select(models.AnalysisResult).where(
        models.AnalysisResult.decision == None
    )
    
    # Get total count
    from sqlalchemy import func
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Apply pagination and fetch items
    query = query.options(selectinload(models.AnalysisResult.indicators))\
        .offset((page - 1) * limit)\
        .limit(limit)
    
    result = await db.execute(query)
    cases = result.scalars().all()
    
    import math
    return {
        "items": cases,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit) if limit > 0 else 1
    }

@router.post("/{analysis_id}/decision", response_model=schemas.AnalysisResult)
async def submit_decision(
    analysis_id: str,
    decision_data: AdjudicationDecision,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(require_analyst)
):
    """
    Submit an adjudication decision for a case.
    """
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(models.AnalysisResult).where(models.AnalysisResult.id == analysis_uuid).with_for_update())
    analysis = result.scalars().first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")
        
    analysis.decision = decision_data.decision
    analysis.reviewer_notes = decision_data.notes
    analysis.reviewer_id = current_user.id
    analysis.adjudication_status = "reviewed"
    
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    
    # Emit WebSocket events
    await emit_alert_resolved(str(analysis.id), str(current_user.id))
    await emit_queue_updated(str(current_user.id))
    
    return analysis

@router.post("/{analysis_id}/revert", response_model=schemas.AnalysisResult)
async def revert_decision(
    analysis_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Revert an adjudication decision, setting it back to pending.
    """
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(models.AnalysisResult).where(models.AnalysisResult.id == analysis_uuid))
    analysis = result.scalars().first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")
        
    analysis.decision = None
    analysis.reviewer_notes = None
    analysis.reviewer_id = None
    analysis.adjudication_status = "pending"
    
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    
    # Emit WebSocket events
    await emit_queue_updated(str(current_user.id))
    
    return analysis

@router.get("/{analysis_id}/report")
async def download_case_report(
    analysis_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Generate and download a PDF report for the case.
    """
    from fastapi.responses import StreamingResponse
    from app.services.reporting import ReportingService
    from io import BytesIO

    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(models.AnalysisResult).where(models.AnalysisResult.id == analysis_uuid))
    analysis = result.scalars().first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")

    # Prepare data for reporting service
    case_data = {
        "id": str(analysis.id),
        "subject_id": analysis.subject_id,
        "status": analysis.adjudication_status,
        "risk_score": analysis.risk_score,
        "description": f"Fraud analysis for subject {analysis.subject_id}",
        "evidence": [],  # Populate with actual evidence if available
        "chain_of_custody": analysis.chain_of_custody or []  # Include custody log
    }

    reporting_service = ReportingService()
    pdf_content = await reporting_service.generate_evidence_package(case_data)
    
    return StreamingResponse(
        BytesIO(pdf_content),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=case_report_{analysis_id}.pdf"}
    )

@router.get("/{analysis_id}/history", response_model=List[dict])
async def get_adjudication_history(
    analysis_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get adjudication history for an analysis result.
    """
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(models.AnalysisResult).where(models.AnalysisResult.id == analysis_uuid))
    analysis = result.scalars().first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    
    history = []
    
    # If there's a decision, add it to history
    if analysis.decision:
        history.append({
            "id": f"{analysis.id}-decision",
            "decision": analysis.decision,
            "reviewer_notes": analysis.reviewer_notes,
            "reviewer_id": str(analysis.reviewer_id) if analysis.reviewer_id else None,
            "created_at": analysis.updated_at.isoformat() if analysis.updated_at else analysis.created_at.isoformat() if analysis.created_at else None,
        })
    
    return history

@router.post("/{analysis_id}/export-offline")
async def export_offline_package(
    analysis_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Export encrypted offline case package for field work.
    """
    from fastapi.responses import StreamingResponse
    from app.services.offline import OfflineStorageService
    from io import BytesIO

    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(models.AnalysisResult).where(models.AnalysisResult.id == analysis_uuid))
    analysis = result.scalars().first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")

    # Prepare case data
    case_data = {
        "id": str(analysis.id),
        "subject_id": analysis.subject_id,
        "status": analysis.adjudication_status,
        "risk_score": analysis.risk_score,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else None
    }

    offline_service = OfflineStorageService()
    encrypted_data, encryption_key = await offline_service.export_case(case_data)
    
    # Return JSON with key and data (as hex) per security audit requirements
    return {
        "encrypted_data": encrypted_data.hex(),
        "encryption_key": encryption_key.decode('utf-8'),
        "filename": f"case_offline_{analysis_id}.enc",
        "warning": "Store this key securely. Without it, the encrypted data cannot be decrypted."
    }
