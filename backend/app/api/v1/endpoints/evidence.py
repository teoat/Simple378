from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uuid
import shutil
import os
from datetime import datetime

from app.api import deps
from app.db.models import Subject, Evidence, Document, Chat, Video, Photo, EvidenceType, ProcessingStatus, AuditLog, ActionType

router = APIRouter()

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{case_id}/evidence", response_model=dict)
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    type: EvidenceType = Form(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Upload evidence to a case
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    # Verify case exists
    result = await db.execute(select(Subject).where(Subject.id == case_uuid))
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")

    # Save file locally (simulating S3)
    file_id = uuid.uuid4()
    file_ext = os.path.splitext(file.filename)[1]
    file_path = f"{UPLOAD_DIR}/{file_id}{file_ext}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)

    # Create Evidence record
    evidence = Evidence(
        id=file_id,
        case_id=case_uuid,
        type=type,
        filename=file.filename,
        original_path=file_path,
        size_bytes=file_size,
        mime_type=file.content_type,
        uploaded_by=current_user.id,
        processing_status=ProcessingStatus.PENDING
    )
    db.add(evidence)
    
    # Create type-specific record placeholders
    if type == EvidenceType.DOCUMENT:
        doc = Document(id=evidence.id)
        db.add(doc)
    elif type == EvidenceType.CHAT:
        chat = Chat(id=evidence.id)
        db.add(chat)
    elif type == EvidenceType.VIDEO:
        video = Video(id=evidence.id)
        db.add(video)
    elif type == EvidenceType.PHOTO:
        photo = Photo(id=evidence.id)
        db.add(photo)

    # Audit log
    audit_log = AuditLog(
        actor_id=current_user.id,
        action=ActionType.EDIT, # Uploading evidence is an edit to the case
        resource_id=case_uuid,
        details={"action": "evidence_uploaded", "filename": file.filename, "type": type}
    )
    db.add(audit_log)

    await db.commit()
    await db.refresh(evidence)

    return {
        "id": str(evidence.id),
        "filename": evidence.filename,
        "status": evidence.processing_status,
        "uploaded_at": evidence.uploaded_at.isoformat()
    }

@router.get("/{case_id}/evidence", response_model=List[dict])
async def list_evidence(
    case_id: str,
    type: Optional[EvidenceType] = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    List evidence for a case
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    query = select(Evidence).where(Evidence.case_id == case_uuid)
    if type:
        query = query.where(Evidence.type == type)
    
    query = query.order_by(Evidence.uploaded_at.desc())
    
    result = await db.execute(query)
    evidence_list = result.scalars().all()
    
    return [
        {
            "id": str(ev.id),
            "filename": ev.filename,
            "type": ev.type,
            "size": ev.size_bytes,
            "uploaded_at": ev.uploaded_at.isoformat(),
            "status": ev.processing_status,
            "uploaded_by": str(ev.uploaded_by) if ev.uploaded_by else None
        }
        for ev in evidence_list
    ]

@router.get("/{evidence_id}", response_model=dict)
async def get_evidence(
    evidence_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get evidence details
    """
    try:
        ev_uuid = uuid.UUID(evidence_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(Evidence).where(Evidence.id == ev_uuid))
    evidence = result.scalars().first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    return {
        "id": str(evidence.id),
        "case_id": str(evidence.case_id),
        "filename": evidence.filename,
        "type": evidence.type,
        "size": evidence.size_bytes,
        "mime_type": evidence.mime_type,
        "uploaded_at": evidence.uploaded_at.isoformat(),
        "status": evidence.processing_status,
        "metadata": evidence.metadata_
    }
