from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CaseInsight(BaseModel):
    type: str  # pattern, risk, recommendation, evidence
    title: str
    description: str
    confidence: int

class ChatRequest(BaseModel):
    message: str
    persona: str = "analyst"  # analyst, legal, cfo
    case_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    persona: str
    suggestions: Optional[List[str]] = None
    insights: Optional[List[CaseInsight]] = None
    timestamp: Optional[int] = None

class ProactiveSuggestionRequest(BaseModel):
    context: str
    alert_id: Optional[str] = None
    case_id: Optional[str] = None
    user_actions: Optional[List[str]] = None
