from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from sqlalchemy.future import select
from sqlalchemy import func
from app.api import deps
from app.services.subject import SubjectService
from app.db.models import Subject

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

@router.get("/", response_model=dict)
async def get_subjects(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    List subjects (Cases).
    """
    # Calculate offset
    offset = skip  # api.ts sends page/limit, but let's assume standard skip/limit for now or adjust
    
    # Query total
    total_query = await db.execute(select(func.count(Subject.id)))
    total = total_query.scalar() or 0
    
    # Query items
    result = await db.execute(select(Subject).offset(skip).limit(limit))
    subjects = result.scalars().all()
    
    items = []
    for sub in subjects:
        # Mocking missing fields for now
        items.append({
            "id": str(sub.id),
            "subject_name": f"Subject {str(sub.id)[:8]}", # Placeholder
            "risk_score": 0, # Placeholder
            "status": "active", # Placeholder
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
            "assigned_to": "Unassigned" # Placeholder
        })
        
    return {
        "items": items,
        "total": total,
        "page": (skip // limit) + 1,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{subject_id}", response_model=dict)
async def get_subject(
    subject_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get subject details.
    """
    try:
        sub_uuid = uuid.UUID(subject_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(Subject).where(Subject.id == sub_uuid))
    sub = result.scalars().first()
    
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    return {
        "id": str(sub.id),
        "subject_name": f"Subject {str(sub.id)[:8]}",
        "risk_score": 0,
        "status": "active",
        "description": "No description available",
        "assigned_to": "Unassigned",
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
    }
