"""
Simple378 MCP Server - Agent Coordination Tools
Provides database-connected tools for AI agents.
"""
import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Simple378 MCP Server",
    description="Agent Coordination MCP Server for Fraud Detection",
    version="1.0.0"
)

# Mock data for demo (replace with real DB queries when connected)
MOCK_CASES = [
    {"id": "case-001", "title": "Wire Transfer Investigation", "status": "active", "risk_score": 85},
    {"id": "case-002", "title": "Invoice Fraud Review", "status": "pending", "risk_score": 72},
    {"id": "case-003", "title": "Vendor Payment Audit", "status": "closed", "risk_score": 45},
]


class HealthResponse(BaseModel):
    status: str
    version: str
    tools: list[str]


class CaseListRequest(BaseModel):
    status: Optional[str] = None
    limit: int = 10


class RiskAnalysisRequest(BaseModel):
    amount: float
    location: Optional[str] = None
    subject_id: Optional[str] = None


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        tools=["list_cases", "get_case_details", "analyze_risk", "database_health"]
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Simple378 MCP Server", "status": "running"}


@app.post("/tools/list_cases")
async def list_cases(request: CaseListRequest):
    """List cases with optional filtering"""
    cases = MOCK_CASES
    
    if request.status:
        cases = [c for c in cases if c["status"] == request.status]
    
    return {
        "cases": cases[:request.limit],
        "total": len(cases),
        "source": "mock_data"
    }


@app.get("/tools/get_case_details/{case_id}")
async def get_case_details(case_id: str):
    """Get details for a specific case"""
    case = next((c for c in MOCK_CASES if c["id"] == case_id), None)
    
    if not case:
        return {"error": f"Case {case_id} not found"}
    
    return {
        **case,
        "transactions": 47,
        "evidence_count": 12,
        "last_updated": "2025-12-07T00:00:00Z"
    }


@app.post("/tools/analyze_risk")
async def analyze_risk(request: RiskAnalysisRequest):
    """Analyze risk for a transaction"""
    # Simple risk scoring logic
    base_score = 50
    
    if request.amount > 100000:
        base_score += 30
    elif request.amount > 50000:
        base_score += 20
    elif request.amount > 10000:
        base_score += 10
    
    if request.location and request.location.lower() in ["offshore", "unknown", "high-risk"]:
        base_score += 20
    
    return {
        "risk_score": min(base_score, 100),
        "risk_level": "high" if base_score >= 70 else "medium" if base_score >= 40 else "low",
        "factors": [
            f"Amount: ${request.amount:,.2f}",
            f"Location: {request.location or 'N/A'}",
        ]
    }


@app.get("/tools/database_health")
async def database_health():
    """Check database connectivity"""
    db_url = os.getenv("DATABASE_URL", "not configured")
    
    return {
        "status": "mock_mode",
        "database_url": "configured" if "postgresql" in db_url else "not configured",
        "message": "Running with mock data - DB integration available"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
