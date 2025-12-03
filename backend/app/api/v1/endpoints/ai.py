from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Dict, Any

from app.api import deps
from app.services.ai.supervisor import app as ai_app

router = APIRouter()

@router.post("/investigate/{subject_id}", response_model=Dict[str, Any])
async def investigate_subject(
    subject_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Triggers an AI investigation for a subject.
    """
    try:
        # Initialize state
        initial_state = {
            "subject_id": str(subject_id),
            "messages": [],
            "findings": {}
        }
        
        # Run the graph (invoke is synchronous wrapper, but LangGraph supports async)
        # For MVP, we'll await the result.
        result = await ai_app.ainvoke(initial_state)
        
        return {
            "status": "completed",
            "findings": result.get("findings"),
            "verdict": result.get("final_verdict", "Pending Review")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Investigation failed: {str(e)}")
