from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import uuid
import shutil
import os
from datetime import datetime

from app.api import deps
from app.db.models import (
    Subject,
    Evidence,
    Document,
    Chat,
    Video,
    Photo,
    EvidenceType,
    ProcessingStatus,
    AuditLog,
    ActionType,
)


async def _apply_processing_stub(db: AsyncSession, evidence: Evidence) -> Evidence:
    """Simulate processing and populate basic metadata for each evidence type."""
    evidence.processing_status = ProcessingStatus.PROCESSING
    await db.commit()
    await db.refresh(evidence)

    # Fake processing logic per type
    now = datetime.utcnow()
    if evidence.type == EvidenceType.DOCUMENT:
        document = evidence.document or Document(id=evidence.id)
        size_val = float(evidence.size_bytes or 0)
        document.page_count = document.page_count or max(1, int(size_val / 50_000))
        document.extracted_text = (
            document.extracted_text or "Processing stub: text extracted."
        )
        document.ocr_confidence = document.ocr_confidence or 0.92
        db.add(document)
    elif evidence.type == EvidenceType.CHAT:
        chat = evidence.chat or Chat(id=evidence.id)
        chat.message_count = chat.message_count or 120
        chat.participant_count = chat.participant_count or 4
        chat.keywords = chat.keywords or ["payment", "wire", "invoice"]
        db.add(chat)
    elif evidence.type == EvidenceType.VIDEO:
        video = evidence.video or Video(id=evidence.id)
        video.duration = video.duration or 180
        video.transcript = video.transcript or "Processing stub: transcript generated."
        video.thumbnails = video.thumbnails or ["/thumbnails/sample.jpg"]
        db.add(video)
    elif evidence.type == EvidenceType.PHOTO:
        photo = evidence.photo or Photo(id=evidence.id)
        photo.ocr_text = photo.ocr_text or "Processing stub: OCR complete."
        photo.classification = photo.classification or "receipt"
        db.add(photo)

    evidence.processing_status = ProcessingStatus.COMPLETED
    evidence.processed_at = now
    evidence.metadata_ = evidence.metadata_ or {
        "stub": True,
        "processed_at": now.isoformat(),
    }

    await db.commit()
    await db.refresh(evidence)
    return evidence


router = APIRouter()

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _serialize_evidence(ev: Evidence) -> dict:
    """Normalize evidence response payload."""

    def _to_number(value):
        try:
            return float(value) if value is not None else None
        except Exception:
            return None

    return {
        "id": str(ev.id),
        "case_id": str(ev.case_id),
        "filename": ev.filename,
        "type": ev.type.value if hasattr(ev.type, "value") else ev.type,
        "size": _to_number(ev.size_bytes),
        "mime_type": ev.mime_type,
        "uploaded_at": ev.uploaded_at.isoformat() if ev.uploaded_at else None,
        "uploaded_by": str(ev.uploaded_by) if ev.uploaded_by else None,
        "status": (
            ev.processing_status.value
            if hasattr(ev.processing_status, "value")
            else ev.processing_status
        ),
        "processed_at": ev.processed_at.isoformat() if ev.processed_at else None,
        "metadata": ev.metadata_,
        "tags": ev.tags or [],
    }


async def _ensure_case(db: AsyncSession, case_id: str) -> uuid.UUID:
    """Validate case id and ensure it exists."""
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(Subject).where(Subject.id == case_uuid))
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")
    return case_uuid


@router.post("/{case_id}/evidence", response_model=dict)
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    type: EvidenceType = Form(...),
    tags: Optional[str] = Form(None),
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """Upload evidence to a case."""
    case_uuid = await _ensure_case(db, case_id)

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
        processing_status=ProcessingStatus.PENDING,
        tags=(tags.split(",") if tags else None),
    )
    db.add(evidence)

    # Create type-specific record placeholders
    if type == EvidenceType.DOCUMENT:
        db.add(Document(id=evidence.id))
    elif type == EvidenceType.CHAT:
        db.add(Chat(id=evidence.id))
    elif type == EvidenceType.VIDEO:
        db.add(Video(id=evidence.id))
    elif type == EvidenceType.PHOTO:
        db.add(Photo(id=evidence.id))

    # Audit log
    audit_log = AuditLog(
        actor_id=current_user.id,
        action=ActionType.EDIT,
        resource_id=case_uuid,
        details={
            "action": "evidence_uploaded",
            "filename": file.filename,
            "type": type.value,
        },
    )
    db.add(audit_log)

    await db.commit()
    await db.refresh(evidence)

    return _serialize_evidence(evidence)


@router.get("/{case_id}/evidence", response_model=List[dict])
async def list_evidence(
    case_id: str,
    type: Optional[EvidenceType] = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """List evidence for a case."""
    case_uuid = await _ensure_case(db, case_id)

    query = select(Evidence).where(Evidence.case_id == case_uuid)
    if type:
        query = query.where(Evidence.type == type)

    query = query.order_by(Evidence.uploaded_at.desc())

    result = await db.execute(query)
    evidence_list = result.scalars().all()

    return [_serialize_evidence(ev) for ev in evidence_list]


@router.get("/{evidence_id}", response_model=dict)
async def get_evidence(
    evidence_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """Get evidence details."""
    try:
        ev_uuid = uuid.UUID(evidence_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(Evidence).where(Evidence.id == ev_uuid))
    evidence = result.scalars().first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    return _serialize_evidence(evidence)


@router.post("/{evidence_id}/process", response_model=dict)
async def process_evidence(
    evidence_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """Trigger evidence processing (stubbed pipeline)."""
    try:
        ev_uuid = uuid.UUID(evidence_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(Evidence).where(Evidence.id == ev_uuid))
    evidence = result.scalars().first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if evidence.processing_status == ProcessingStatus.PROCESSING:
        raise HTTPException(status_code=409, detail="Evidence already processing")

    evidence = await _apply_processing_stub(db, evidence)

    # Audit log
    audit_log = AuditLog(
        actor_id=current_user.id,
        action=ActionType.EDIT,
        resource_id=evidence.case_id,
        details={"action": "evidence_processed", "evidence_id": str(evidence.id)},
    )
    db.add(audit_log)
    await db.commit()

    return _serialize_evidence(evidence)


@router.post("/{evidence_id}/reprocess", response_model=dict)
async def reprocess_evidence(
    evidence_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """Reset status and re-run stub processing."""
    try:
        ev_uuid = uuid.UUID(evidence_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(select(Evidence).where(Evidence.id == ev_uuid))
    evidence = result.scalars().first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    evidence.processing_status = ProcessingStatus.PENDING
    evidence.processed_at = None
    await db.commit()
    await db.refresh(evidence)

    evidence = await _apply_processing_stub(db, evidence)

    audit_log = AuditLog(
        actor_id=current_user.id,
        action=ActionType.EDIT,
        resource_id=evidence.case_id,
        details={"action": "evidence_reprocessed", "evidence_id": str(evidence.id)},
    )
    db.add(audit_log)
    await db.commit()

    return _serialize_evidence(evidence)
