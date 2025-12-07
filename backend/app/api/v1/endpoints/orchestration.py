from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from app.services.ai.orchestrator import Orchestrator

router = APIRouter()
orchestrator = Orchestrator()


class InvestigationRequest(BaseModel):
    initial_message: str


class InvestigationResponse(BaseModel):
    case_id: str
    status: str
    results: List[Dict[str, Any]]


@router.post("/run/{case_id}", response_model=InvestigationResponse)
async def run_investigation(case_id: str, request: InvestigationRequest):
    """
    Starts or resumes an AI investigation for a specific case.
    """
    try:
        results = await orchestrator.run_investigation(case_id, request.initial_message)
        return {
            "case_id": case_id,
            "status": "completed",  # Simplified for MVP
            "results": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/state/{case_id}")
async def get_investigation_state(case_id: str):
    """
    Retrieves the current state of the investigation graph.
    (Placeholder for MVP - would typically fetch from Postgres checkpoint)
    """
    return {"case_id": case_id, "state": "active", "step": "supervisor"}


@router.post("/intervene/{case_id}")
async def intervene_investigation(case_id: str, feedback: str):
    """
    Allows human intervention to guide the AI agents.
    """
    return {"case_id": case_id, "action": "intervention_recorded", "feedback": feedback}
