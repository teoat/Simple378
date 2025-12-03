from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from app.api import deps
from app.db.models import Consent, Subject
from app.schemas.consent import ConsentCreate, ConsentResponse, ConsentRevoke

router = APIRouter()

@router.post("/consent", response_model=ConsentResponse, status_code=201)
async def grant_consent(
    consent_data: ConsentCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Grant GDPR consent for a subject.
    """
    # Verify subject exists
    result = await db.execute(select(Subject).where(Subject.id == consent_data.subject_id))
    subject = result.scalars().first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Create consent record
    consent = Consent(
        subject_id=consent_data.subject_id,
        consent_type=consent_data.consent_type,
        expires_at=consent_data.expires_at
    )
    
    db.add(consent)
    await db.commit()
    await db.refresh(consent)
    
    return consent

@router.get("/consent/{subject_id}", response_model=List[ConsentResponse])
async def list_consents(
    subject_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    List all consent records for a subject.
    """
    try:
        sub_uuid = uuid.UUID(subject_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")
    
    result = await db.execute(
        select(Consent).where(Consent.subject_id == sub_uuid)
    )
    consents = result.scalars().all()
    
    return consents

@router.delete("/consent/{consent_id}", status_code=204)
async def revoke_consent(
    consent_id: str,
    revoke_data: ConsentRevoke,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Revoke a previously granted consent.
    """
    try:
        consent_uuid = uuid.UUID(consent_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")
    
    result = await db.execute(
        select(Consent).where(Consent.id == consent_uuid)
    )
    consent = result.scalars().first()
    
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    
    await db.delete(consent)
    await db.commit()
    
    return None
