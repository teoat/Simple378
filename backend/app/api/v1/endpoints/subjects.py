from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.api import deps
from app.services.subject import SubjectService

router = APIRouter()

@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    GDPR: Right to be Forgotten. Permanently delete a subject and all associated data.
    """
    try:
        sub_uuid = uuid.UUID(subject_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    success = await SubjectService.delete_subject_data(db, sub_uuid)
    if not success:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    return {"status": "success", "message": "Subject and all data deleted"}

@router.get("/{subject_id}/export")
async def export_subject_data(
    subject_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    GDPR: Data Portability. Export all data associated with a subject.
    """
    try:
        sub_uuid = uuid.UUID(subject_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    data = await SubjectService.export_subject_data(db, sub_uuid)
    if not data:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    return data
