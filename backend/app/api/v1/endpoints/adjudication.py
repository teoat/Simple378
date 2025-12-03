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

router = APIRouter()

class AdjudicationDecision(BaseModel):
    decision: str  # confirmed_fraud, false_positive, escalated
    notes: Optional[str] = None

@router.get("/queue", response_model=List[schemas.AnalysisResult])
async def get_adjudication_queue(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Fetch cases that require adjudication (status='flagged' or 'pending').
    For MVP, we'll fetch 'completed' ones that have a high risk score but no decision yet.
    """
    # Logic: Fetch AnalysisResults where adjudication_status is pending/flagged
    # OR where status is completed but decision is null
    
    query = select(models.AnalysisResult).where(
        models.AnalysisResult.decision == None
    ).options(selectinload(models.AnalysisResult.indicators))
    
    result = await db.execute(query)
    cases = result.scalars().all()
    return cases

@router.post("/{analysis_id}/decision", response_model=schemas.AnalysisResult)
async def submit_decision(
    analysis_id: str,
    decision_data: AdjudicationDecision,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Submit an adjudication decision for a case.
    """
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(models.AnalysisResult).where(models.AnalysisResult.id == analysis_uuid))
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
        "evidence": [] # Populate with actual evidence if available
    }

    reporting_service = ReportingService()
    pdf_content = await reporting_service.generate_evidence_package(case_data)
    
    return StreamingResponse(
        BytesIO(pdf_content),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=case_report_{analysis_id}.pdf"}
    )

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
    encrypted_data = await offline_service.export_case(case_data)
    
    return StreamingResponse(
        BytesIO(encrypted_data),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename=case_offline_{analysis_id}.enc"}
    )
