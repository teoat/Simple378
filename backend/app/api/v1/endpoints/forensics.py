from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Any, List
import shutil
import os
import tempfile
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.services.forensics import ForensicsService
from app.services.document_indexing import document_indexing_service
from app.api import deps
from app.models import mens_rea as models

router = APIRouter()
forensics_service = ForensicsService()

@router.post("/analyze", response_model=Any)
async def analyze_file(
    file: UploadFile = File(...),
    case_id: str = None,
    subject_id: str = None,
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Upload a file for forensic analysis and semantic indexing.
    Extracts metadata, checks for manipulation, and indexes for search.
    """
    # Create a temporary file to save the upload
    try:
        suffix = os.path.splitext(file.filename)[1] if file.filename else ""
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    try:
        # Run comprehensive analysis and indexing
        result = await document_indexing_service.process_and_index_document(
            file_path=tmp_path,
            case_id=case_id,
            subject_id=subject_id,
            metadata={
                "filename": file.filename,
                "uploaded_by": str(current_user.id),
                "upload_timestamp": str(uuid.uuid4())  # For uniqueness
            }
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis and indexing failed: {str(e)}")
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.get("/evidence/{analysis_id}", response_model=List[dict])
async def get_evidence_for_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> List[dict]:
    """
    Get evidence files associated with an analysis result.
    """
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")
    
    result = await db.execute(select(models.AnalysisResult).where(models.AnalysisResult.id == analysis_uuid))
    analysis = result.scalars().first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    
    # For now, return evidence from indicators
    # In a full implementation, this would query a separate evidence/files table
    evidence = []
    
    # Get indicators which contain evidence
    indicators_result = await db.execute(
        select(models.Indicator).where(models.Indicator.analysis_result_id == analysis_uuid)
    )
    indicators = indicators_result.scalars().all()
    
    for indicator in indicators:
        if indicator.evidence and isinstance(indicator.evidence, dict):
            # Extract file references from evidence
            if "files" in indicator.evidence:
                for file_info in indicator.evidence["files"]:
                    evidence.append({
                        "id": str(indicator.id),
                        "filename": file_info.get("filename", "unknown"),
                        "file_type": file_info.get("type", "unknown"),
                        "upload_date": indicator.created_at.isoformat() if indicator.created_at else None,
                        "metadata": file_info
                    })
    
    # If no evidence found in indicators, return empty list or placeholder
    if not evidence:
        # Return placeholder evidence based on analysis
        evidence.append({
            "id": f"placeholder-{analysis.id}",
            "filename": f"analysis_{analysis_id}.json",
            "file_type": "analysis_result",
            "upload_date": analysis.created_at.isoformat() if analysis.created_at else None,
            "metadata": {
                "risk_score": analysis.risk_score,
                "status": analysis.status
            }
        })
    
    return evidence
