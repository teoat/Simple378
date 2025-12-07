from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class HeuristicRule(BaseModel):
    id: str
    name: str
    description: str
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    logic: str  # simpleeval expression
    enabled: bool = True

class RuleResult(BaseModel):
    rule_id: str
    rule_name: str
    triggered: bool
    context: Dict[str, Any] = {}
    severity: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class RiskForecastRequest(BaseModel):
    subject_id: str
    history_days: int = 90

class RiskForecast(BaseModel):
    subject_id: str
    current_score: float
    forecast_30_days: float
    trend: str = Field(..., description="increasing, decreasing, stable")
    confidence: float
    projected_date: datetime

class CommunityResult(BaseModel):
    node_id: str
    cluster_id: int

class CentralityResult(BaseModel):
    node_id: str
    score: float
    rank: int

class ShortestPathRequest(BaseModel):
    source_id: str
    target_id: str

class ShortestPathResult(BaseModel):
    path: List[str]
    length: int

class AnalysisResultResponse(BaseModel):
    """Response schema for analysis results"""
    id: str
    subject_id: str
    status: str = "pending"
    risk_score: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    adjudication_status: str = "pending"
    decision: Optional[str] = None
    reviewer_notes: Optional[str] = None
    reviewer_id: Optional[str] = None
    
    class Config:
        from_attributes = True  # Allows conversion from ORM models

class AnalysisResult(BaseModel):
    """Schema for analysis evaluation results"""
    subject_id: str
    risk_score: float
    triggered_rules: List[RuleResult] = []
    created_at: Optional[datetime] = None
