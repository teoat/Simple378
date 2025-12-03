from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from sqlalchemy.future import select
from sqlalchemy import func, String
from typing import Optional
from app.api import deps
from app.models import mens_rea as models
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
    status: Optional[str] = None,
    min_risk: Optional[int] = None,
    max_risk: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    List subjects (Cases) with filtering and search.
    """
    # Base query
    query = select(Subject, models.AnalysisResult).outerjoin(
        models.AnalysisResult, Subject.id == models.AnalysisResult.subject_id
    )

    # Apply filters
    if status:
        # Map frontend status to backend status if needed, or assume direct match
        # Assuming AnalysisResult has the status we care about
        query = query.where(models.AnalysisResult.adjudication_status == status)
    
    if min_risk is not None:
        query = query.where(models.AnalysisResult.risk_score >= min_risk)
    
    if max_risk is not None:
        query = query.where(models.AnalysisResult.risk_score <= max_risk)

    if search:
        # Simple case-insensitive search on subject name
        # Note: In a real app, use Meilisearch or full-text search
        search_term = f"%{search}%"
        query = query.where(Subject.id.cast(String).ilike(search_term)) # Subject doesn't have a name field in the model yet? 
        # Let's check the model definition. If Subject has no name, we might search by ID.
    
    # Calculate total (simplified for now, ideally separate count query)
    # For pagination with complex joins, it's often better to do a separate count query
    # But for MVP let's just count the results of the main query without limit/offset first?
    # Or just use a window function. Let's stick to a separate count query for correctness.
    
    # Count query
    count_query = select(func.count()).select_from(Subject).outerjoin(
        models.AnalysisResult, Subject.id == models.AnalysisResult.subject_id
    )
    
    if status:
        count_query = count_query.where(models.AnalysisResult.adjudication_status == status)
    if min_risk is not None:
        count_query = count_query.where(models.AnalysisResult.risk_score >= min_risk)
    if max_risk is not None:
        count_query = count_query.where(models.AnalysisResult.risk_score <= max_risk)
    if search:
        search_term = f"%{search}%"
        count_query = count_query.where(Subject.id.cast(String).ilike(search_term))

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination to main query
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    rows = result.all()
    
    items = []
    for row in rows:
        sub = row[0]
        analysis = row[1]
        
        items.append({
            "id": str(sub.id),
            "subject_name": f"Subject {str(sub.id)[:8]}", # Placeholder as Subject might not have name
            "risk_score": analysis.risk_score if analysis else 0,
            "status": analysis.adjudication_status if analysis else "new",
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
