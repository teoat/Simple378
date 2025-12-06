from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Any, Dict

from app.api import deps
from app.services.graph_analyzer import GraphAnalyzer

router = APIRouter()

@router.get("/{subject_id}", response_model=Dict[str, Any])
async def get_subject_graph(
    subject_id: UUID,
    depth: int = 2,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get graph data for a subject, including related entities and transactions.
    """
    try:
        graph_data = await GraphAnalyzer.build_subgraph(db, subject_id, depth)
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build graph: {str(e)}")
