from pydantic import BaseModel, Field
from typing import List, Literal
from uuid import UUID

class AlertOut(BaseModel):
    id: UUID = Field(..., description="Alert identifier")
    subject_name: str
    risk_score: int
    triggered_rules: List[str]
    created_at: str
    status: Literal['pending', 'flagged', 'resolved']

    class Config:
        orm_mode = True

class DecisionIn(BaseModel):
    decision: Literal['approve', 'reject', 'escalate']
    confidence: Literal['low', 'medium', 'high']
    comment: str | None = None
