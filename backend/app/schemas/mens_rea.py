from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class IndicatorBase(BaseModel):
    type: str
    confidence: float
    evidence: Dict[str, Any]

class IndicatorCreate(IndicatorBase):
    pass

class Indicator(IndicatorBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisResultBase(BaseModel):
    subject_id: str
    status: str
    risk_score: float

class AnalysisResultCreate(AnalysisResultBase):
    pass

class AnalysisResult(AnalysisResultBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    indicators: List[Indicator] = []

    class Config:
        from_attributes = True

class PaginatedAnalysisResult(BaseModel):
    items: List[AnalysisResult]
    total: int
    page: int
    pages: int
