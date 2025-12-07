"""
Case Summary API endpoints.

Provides comprehensive case summary, findings, report generation, and archival.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

from app.db.session import get_db
from app.db import models
from app.api import deps
from app.core.cache import apply_cache_preset
from fastapi import Response

router = APIRouter(prefix="/summary", tags=["summary"])


# ============================================
# Request/Response Models
# ============================================

class ReportRequest(BaseModel):
    template: str = "standard"  # executive, standard, detailed, compliance
    include_appendix: bool = True
    format: str = "pdf"


class EmailRequest(BaseModel):
    recipients: List[EmailStr]
    template: str = "standard"
    message: str = ""
    cc: List[EmailStr] = []


class ArchiveRequest(BaseModel):
    reason: str = "Investigation complete"
    archive_location: str = ""


class Finding(BaseModel):
    id: str
    type: str  # pattern, amount, confirmation, false_positive, recommendation
    severity: str  # high, medium, low
    description: str
    evidence: List[str] = []


class CaseSummaryResponse(BaseModel):
    case_id: str
    status: str  # success, partial, failed
    data_quality: float
    days_to_resolution: int
    ingestion: Dict[str, Any]
    reconciliation: Dict[str, Any]
    adjudication: Dict[str, Any]


# ============================================
# Endpoints
# ============================================

@router.get("/{case_id}")
async def get_case_summary(
    case_id: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> CaseSummaryResponse:
    """
    Get comprehensive case summary with all pipeline metrics.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    # Get subject (case)
    subject_result = await db.execute(
        select(models.Subject).where(models.Subject.id == case_uuid)
    )
    subject = subject_result.scalars().first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Calculate days to resolution
    if subject.created_at:
        days_to_resolution = (datetime.utcnow() - subject.created_at).days
    else:
        days_to_resolution = 0
    
    # Get transaction count (ingestion)
    transaction_count_result = await db.execute(
        select(func.count(models.Transaction.id))
        .where(models.Transaction.subject_id == case_uuid)
    )
    transaction_count = transaction_count_result.scalar() or 0
    
    # Get analysis results count (adjudication)
    analysis_result = await db.execute(
        select(func.count(models.AnalysisResult.id))
        .where(models.AnalysisResult.subject_id == case_uuid)
    )
    total_alerts = analysis_result.scalar() or 0
    
    # Get resolved count
    resolved_result = await db.execute(
        select(func.count(models.AnalysisResult.id))
        .where(
            models.AnalysisResult.subject_id == case_uuid,
            models.AnalysisResult.decision.isnot(None)
        )
    )
    resolved_count = resolved_result.scalar() or 0
    
    # Calculate average decision time (mock for now)
    avg_time_minutes = 8.3
    
    # Calculate data quality (based on completeness)
    data_quality = min(
        100.0,
        (transaction_count / max(transaction_count, 1)) * 100
    )
    
    # Determine overall status
    if resolved_count == total_alerts and total_alerts > 0:
        status = "success"
    elif resolved_count > 0:
        status = "partial"
    else:
        status = "failed" if total_alerts > 0 else "success"
    
    # Cache for 5 minutes
    apply_cache_preset(response, "short")
    
    return CaseSummaryResponse(
        case_id=case_id,
        status=status,
        data_quality=data_quality,
        days_to_resolution=days_to_resolution,
        ingestion={
            "records": transaction_count,
            "files": 8,  # Mock - could track in future
            "completion": 100,
            "status": "complete"
        },
        reconciliation={
            "matchRate": 94.2,  # Mock - calculate from actual matches
            "newRecords": 890,
            "rejected": 45,
            "status": "complete"
        },
        adjudication={
            "resolved": resolved_count,
            "avgTime": f"{avg_time_minutes} min",
            "totalAlerts": total_alerts,
            "status": "complete" if resolved_count == total_alerts else "partial"
        }
    )


@router.get("/{case_id}/findings")
async def get_findings(
    case_id: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> Dict[str, List[Finding]]:
    """
    Get AI-generated key findings for the case.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    # Get analysis results with high risk scores
    analysis_results = await db.execute(
        select(models.AnalysisResult)
        .where(
            models.AnalysisResult.subject_id == case_uuid,
            models.AnalysisResult.risk_score > 60
        )
        .order_by(models.AnalysisResult.risk_score.desc())
        .limit(10)
    )
    results = list(analysis_results.scalars().all())
    
    # Generate findings
    findings = []
    
    if results:
        # Pattern finding
        findings.append(Finding(
            id=f"finding_{uuid.uuid4().hex[:8]}",
            type="pattern",
            severity="high",
            description=f"Identified {len(results)} high-risk patterns involving multiple entities",
            evidence=[str(r.id) for r in results[:3]]
        ))
        
        # Amount summary
        total_amount = sum(
            float(r.metadata_.get("total_amount", 0)) 
            if r.metadata_ else 0 
            for r in results
        )
        if total_amount > 0:
            findings.append(Finding(
                id=f"finding_{uuid.uuid4().hex[:8]}",
                type="amount",
                severity="high",
                description=f"Total flagged amount: ${total_amount:,.2f}",
                evidence=[]
            ))
        
        # Confirmation
        confirmed = [r for r in results if r.decision == "confirmed_fraud"]
        if confirmed:
            findings.append(Finding(
                id=f"finding_{uuid.uuid4().hex[:8]}",
                type="confirmation",
                severity="high",
                description=f"{len(confirmed)} confirmed fraudulent transactions referred to authorities",
                evidence=[str(r.id) for r in confirmed]
            ))
        
        # False positives
        false_positives = [r for r in results if r.decision == "false_positive"]
        if false_positives:
            findings.append(Finding(
                id=f"finding_{uuid.uuid4().hex[:8]}",
                type="false_positive",
                severity="low",
                description=f"{len(false_positives)} false positives correctly ruled out",
                evidence=[]
            ))
    else:
        findings.append(Finding(
            id=f"finding_{uuid.uuid4().hex[:8]}",
            type="recommendation",
            severity="low",
            description="No high-risk patterns detected. Case appears clean.",
            evidence=[]
        ))
    
    # Cache for 5 minutes
    apply_cache_preset(response, "short")
    
    return {"findings": findings}


@router.post("/{case_id}/report")
async def generate_report(
    case_id: str,
    request: ReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> Dict[str, str]:
    """
    Generate PDF report for the case.
    
    Template options:
    - executive: 2-3 pages, high-level summary
    - standard: 8-12 pages, full investigation
    - detailed: 15-25 pages, complete audit trail
    - compliance: 10-15 pages, regulatory format
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    # Verify case exists
    subject_result = await db.execute(
        select(models.Subject).where(models.Subject.id == case_uuid)
    )
    subject = subject_result.scalars().first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # TODO: Implement actual PDF generation
    # For now, return a mock URL
    report_url = f"https://storage.example.com/reports/{case_id}_{request.template}_report.pdf"
    
    return {
        "reportUrl": report_url,
        "expiresAt": (datetime.utcnow().isoformat() + "Z")
    }


@router.post("/{case_id}/archive")
async def archive_case(
    case_id: str,
    request: ArchiveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> Dict[str, Any]:
    """
    Archive a completed case.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    # Get subject
    subject_result = await db.execute(
        select(models.Subject).where(models.Subject.id == case_uuid)
    )
    subject = subject_result.scalars().first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Update status to archived (add archived_at field if it exists)
    # For now, just update metadata
    if not subject.metadata_:
        subject.metadata_ = {}
    
    subject.metadata_["archived"] = True
    subject.metadata_["archived_at"] = datetime.utcnow().isoformat()
    subject.metadata_["archive_reason"] = request.reason
    subject.metadata_["archive_location"] = request.archive_location or "default"
    
    await db.commit()
    
    return {
        "status": "archived",
        "archivedAt": subject.metadata_["archived_at"],
        "archiveId": f"archive_{case_uuid.hex[:8]}"
    }


@router.post("/{case_id}/email")
async def email_report(
    case_id: str,
    request: EmailRequest,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> Dict[str, Any]:
    """
    Email case report to recipients.
    
    TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    # Verify case exists
    subject_result = await db.execute(
        select(models.Subject).where(models.Subject.id == case_uuid)
    )
    subject = subject_result.scalars().first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # TODO: Implement actual email sending
    # For now, return mock response
    
    return {
        "status": "sent",
        "messageId": f"msg_{uuid.uuid4().hex[:12]}",
        "sentAt": datetime.utcnow().isoformat() + "Z"
    }


@router.put("/{case_id}/findings")
async def update_findings(
    case_id: str,
    findings: List[Finding],
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> Dict[str, str]:
    """
    Update case findings (for edit mode).
    
    Stores edited findings in subject metadata.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID format")
    
    # Get subject
    subject_result = await db.execute(
        select(models.Subject).where(models.Subject.id == case_uuid)
    )
    subject = subject_result.scalars().first()
    
    if not subject:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Update metadata with edited findings
    if not subject.metadata_:
        subject.metadata_ = {}
    
    subject.metadata_["edited_findings"] = [f.dict() for f in findings]
    subject.metadata_["findings_last_edited"] = datetime.utcnow().isoformat()
    subject.metadata_["findings_edited_by"] = str(current_user.id)
    
    await db.commit()
    
    return {"status": "updated"}
