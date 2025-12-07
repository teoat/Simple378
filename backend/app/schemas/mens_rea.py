from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime


class IndicatorBase(BaseModel):
    type: str
    confidence: float
    evidence: Dict[str, Any]


class IndicatorCreate(IndicatorBase):
    pass


class Indicator(IndicatorBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime


class AnalysisResultBase(BaseModel):
    subject_id: str
    status: str
    risk_score: float


class AnalysisResultCreate(AnalysisResultBase):
    pass


class AnalysisResult(AnalysisResultBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    indicators: List[Indicator] = []


class PaginatedAnalysisResult(BaseModel):
    items: List[AnalysisResult]
    total: int
    page: int
    pages: int
