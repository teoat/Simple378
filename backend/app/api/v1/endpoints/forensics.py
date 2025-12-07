from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Any, List
import shutil
import os
import tempfile
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.services.forensics import ForensicsService
from app.services.entity_resolution import EntityResolutionService
from app.api import deps
from app.db import models
from pydantic import BaseModel
from typing import Dict


class EntityResolutionRequest(BaseModel):
    entities: List[Dict[str, Any]]
    context_data: Dict[str, Any] = None


class EntityNetworkRequest(BaseModel):
    entities: List[Dict[str, Any]]
    transactions: List[Dict[str, Any]] = None


router = APIRouter()
forensics_service = ForensicsService()
entity_service = EntityResolutionService()


@router.post("/analyze", response_model=Any)
async def analyze_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Upload a file for forensic analysis.
    Extracts metadata and checks for manipulation.
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
        # Run analysis, passing DB for event sourcing
        result = await forensics_service.analyze_document(tmp_path, db=db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.get("/evidence/{analysis_id}", response_model=List[dict])
async def get_evidence_for_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user),
) -> List[dict]:
    """
    Get evidence files associated with an analysis result.
    """
    try:
        analysis_uuid = uuid.UUID(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    result = await db.execute(
        select(models.AnalysisResult).where(models.AnalysisResult.id == analysis_uuid)
    )
    analysis = result.scalars().first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")

    # For now, return evidence from indicators
    # In a full implementation, this would query a separate evidence/files table
    evidence = []

    # Get indicators which contain evidence
    indicators_result = await db.execute(
        select(models.Indicator).where(
            models.Indicator.analysis_result_id == analysis_uuid
        )
    )
    indicators = indicators_result.scalars().all()

    for indicator in indicators:
        if indicator.evidence and isinstance(indicator.evidence, dict):
            # Extract file references from evidence
            if "files" in indicator.evidence:
                for file_info in indicator.evidence["files"]:
                    evidence.append(
                        {
                            "id": str(indicator.id),
                            "filename": file_info.get("filename", "unknown"),
                            "file_type": file_info.get("type", "unknown"),
                            "upload_date": (
                                indicator.created_at.isoformat()
                                if indicator.created_at
                                else None
                            ),
                            "metadata": file_info,
                        }
                    )

    # If no evidence found in indicators, return empty list or placeholder
    if not evidence:
        # Return placeholder evidence based on analysis
        evidence.append(
            {
                "id": f"placeholder-{analysis.id}",
                "filename": f"analysis_{analysis_id}.json",
                "file_type": "analysis_result",
                "upload_date": (
                    analysis.created_at.isoformat() if analysis.created_at else None
                ),
                "metadata": {
                    "risk_score": analysis.risk_score,
                    "status": analysis.status,
                },
            }
        )

    return evidence


@router.post("/entity-resolution", response_model=List[Dict[str, Any]])
async def resolve_entities(
    request: EntityResolutionRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user),
):
    """
    Use AI to resolve entities and identify potential duplicates or matches.
    """
    try:
        matches = await entity_service.ai_entity_resolution(
            entities=request.entities, context_data=request.context_data, db=db
        )

        return [
            {
                "entity_id_a": match.entity_id_a,
                "entity_name_a": match.entity_name_a,
                "entity_id_b": match.entity_id_b,
                "entity_name_b": match.entity_name_b,
                "similarity_score": match.similarity_score,
                "reason": match.reason,
            }
            for match in matches
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Entity resolution failed: {str(e)}"
        )


@router.get("/entities", response_model=List[Dict[str, Any]])
async def get_forensic_entities(
    db: AsyncSession = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user),
):
    """
    Get list of entities for forensic analysis.
    Aggregates Subjects and potentially other entity types.
    """
    # For now, map Subjects to Forensic Entities
    result = await db.execute(select(models.Subject))
    subjects = result.scalars().all()

    entities = []
    for sub in subjects:
        # Determine type (heuristic)
        entity_type = "person"  # Default
        if (
            sub.encrypted_pii
            and isinstance(sub.encrypted_pii, dict)
            and "type" in sub.encrypted_pii
        ):
            entity_type = sub.encrypted_pii["type"]

        # Extract name if possible
        name = f"Subject {str(sub.id)[:8]}"
        if sub.encrypted_pii and isinstance(sub.encrypted_pii, dict):
            name = sub.encrypted_pii.get("name", name)

        entities.append(
            {
                "id": str(sub.id),
                "name": name,
                "type": entity_type,
                "risk_score": 0,  # Should join with AnalysisResult for real score
                "connections": 0,  # Placeholder
                "last_activity": (
                    sub.updated_at.isoformat()
                    if sub.updated_at
                    else sub.created_at.isoformat()
                ),
            }
        )

    return entities


@router.post("/entity-network", response_model=Dict[str, Any])
async def analyze_entity_network(
    request: EntityNetworkRequest, current_user: Any = Depends(deps.get_current_user)
):
    """
    Analyze entity relationships and build a network graph using AI.
    """
    try:
        network = await entity_service.resolve_entity_network(
            entities=request.entities, transactions=request.transactions
        )
        return network
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Network analysis failed: {str(e)}"
        )
