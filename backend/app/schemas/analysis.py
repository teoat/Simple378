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

class AnalysisResult(BaseModel):
    subject_id: str
    risk_score: float
    triggered_rules: List[RuleResult]
    created_at: Optional[datetime] = None
