from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.api import deps
from app.models.mens_rea import AnalysisResult
from app.schemas.alert import AlertOut, DecisionIn

router = APIRouter()

@router.get("", response_model=List[AlertOut])
async def list_alerts(
    status: str = "pending",
    db: AsyncSession = Depends(deps.get_db)
):
    """
    List alerts (AnalysisResults) filtered by adjudication status.
    """
    query = (
        select(AnalysisResult)
        .where(AnalysisResult.adjudication_status == status)
        .options(
            selectinload(AnalysisResult.subject),
            selectinload(AnalysisResult.indicators)
        )
    )
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    # Map to AlertOut schema
    mapped_alerts = []
    for alert in alerts:
        # Extract subject name safely
        subject_name = "Unknown Subject"
        if alert.subject and alert.subject.encrypted_pii:
            # Assuming encrypted_pii is a dict with 'name' for now, 
            # or we use ID if name is missing.
            # In a real encrypted scenario, we'd decrypt here.
            pii = alert.subject.encrypted_pii
            if isinstance(pii, dict):
                subject_name = pii.get("name", f"Subject {str(alert.subject.id)[:8]}")
            else:
                subject_name = f"Subject {str(alert.subject.id)[:8]}"
        
        # Extract triggered rules from indicators
        triggered_rules = [ind.type for ind in alert.indicators] if alert.indicators else []
        
        mapped_alerts.append(AlertOut(
            id=alert.id,
            subject_name=subject_name,
            risk_score=int(alert.risk_score) if alert.risk_score else 0,
            triggered_rules=triggered_rules,
            created_at=alert.created_at.isoformat() if alert.created_at else "",
            status=alert.adjudication_status
        ))
        
    return mapped_alerts

@router.post("/{alert_id}/decision")
async def submit_decision(
    alert_id: UUID,
    payload: DecisionIn,
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Submit an adjudication decision for an alert.
    """
    result = await db.get(AnalysisResult, alert_id)
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    result.adjudication_status = "resolved" if payload.decision in ["approve", "reject"] else "flagged"
    result.decision = payload.decision
    result.reviewer_notes = payload.comment
    # We might want to update risk_score or other fields based on decision
    
    await db.commit()
    
    # TODO: Emit WebSocket event
    # from app.core.websocket import manager
    # await manager.broadcast(f"alert:update:{alert_id}")
    
    return {"status": "success"}
