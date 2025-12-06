from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from sqlalchemy.future import select
from sqlalchemy import func, String, desc, asc
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
    page: Optional[int] = 1,
    limit: Optional[int] = 20,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    List subjects (Cases) with filtering, search, pagination, and sorting.
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
        # Simple case-insensitive search on subject ID
        # Note: In a real app, use Meilisearch or full-text search
        search_term = f"%{search}%"
        query = query.where(Subject.id.cast(String).ilike(search_term))
    
    # Apply sorting
    valid_sort_fields = {
        "created_at": Subject.created_at,
        "risk_score": models.AnalysisResult.risk_score,
        "status": models.AnalysisResult.adjudication_status,
    }
    
    sort_field = valid_sort_fields.get(sort_by, Subject.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_field))
    else:
        query = query.order_by(desc(sort_field))
    
    # Count query (before pagination)
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
        "page": page,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
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

    query = select(Subject, models.AnalysisResult).outerjoin(
        models.AnalysisResult, Subject.id == models.AnalysisResult.subject_id
    ).where(Subject.id == sub_uuid)
    
    result = await db.execute(query)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    sub = row[0]
    analysis = row[1]
    
    # Decrypt PII if available (mock for now)
    subject_name = f"Subject {str(sub.id)[:8]}"
    if sub.encrypted_pii and isinstance(sub.encrypted_pii, dict):
        subject_name = sub.encrypted_pii.get("name", subject_name)
        
    return {
        "id": str(sub.id),
        "subject_name": subject_name,
        "risk_score": analysis.risk_score if analysis else 0,
        "status": analysis.adjudication_status if analysis else "new",
        "description": analysis.explanation if analysis and hasattr(analysis, 'explanation') else "No description available",
        "assigned_to": "Unassigned", # Placeholder
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
        "flags": analysis.flags if analysis and hasattr(analysis, 'flags') else {}
    }
