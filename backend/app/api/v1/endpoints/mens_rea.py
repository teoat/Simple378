from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas import mens_rea as schemas
from app.models import mens_rea as models
from app.services.detectors.structuring import StructuringDetector
from app.services.detectors.velocity import VelocityDetector
from app.services.detectors.mirroring import MirroringDetector
import uuid

router = APIRouter()

@router.post("/{subject_id}", response_model=schemas.AnalysisResult)
async def analyze_subject(
    subject_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Trigger Mens Rea analysis for a subject.
    """
    # 1. Fetch subject transactions (Placeholder - normally would query DB)
    # For MVP, we'll simulate some transactions
    transactions = [
        {"id": "tx1", "amount": 9500.0, "date": "2023-10-01T10:00:00"},
        {"id": "tx2", "amount": 9800.0, "date": "2023-10-01T14:00:00"},
        {"id": "tx3", "amount": 200.0, "date": "2023-10-02T09:00:00"},
        {"id": "tx4", "amount": 5000.0, "date": "2023-10-03T10:00:00"}, # Mirror candidate
        {"id": "tx5", "amount": 5000.0, "date": "2023-10-03T10:05:00"}, # Mirror candidate
    ]
    
    # 2. Run Detectors
    indicators_data = []
    
    structuring_detector = StructuringDetector()
    indicators_data.extend(structuring_detector.detect(transactions))
    
    velocity_detector = VelocityDetector()
    indicators_data.extend(velocity_detector.detect(transactions))

    mirroring_detector = MirroringDetector()
    indicators_data.extend(mirroring_detector.detect(transactions))
    
    # 3. Save Results
    analysis_result = models.AnalysisResult(
        subject_id=subject_id,
        status="completed",
        risk_score=0.7 if indicators_data else 0.0 # Simple logic for now
    )
    db.add(analysis_result)
    await db.commit()
    await db.refresh(analysis_result)
    
    for ind_data in indicators_data:
        indicator = models.Indicator(
            analysis_result_id=analysis_result.id,
            type=ind_data["type"],
            confidence=ind_data["confidence"],
            evidence=ind_data["evidence"]
        )
        db.add(indicator)
    
    await db.commit()
    await db.refresh(analysis_result)
    
    # Re-fetch to get relationships
    # In a real app we'd use select options to eager load
    
    return analysis_result
