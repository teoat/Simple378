from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Any, Dict

from app.api import deps
from app.services.graph_analyzer import GraphAnalyzer
from app.core.permissions import Permission, require_permission

router = APIRouter()

@router.get("/{subject_id}", response_model=Dict[str, Any])
async def get_subject_graph(
    subject_id: UUID,
    depth: int = Query(default=2, ge=1, le=5, description="Graph traversal depth"),
    limit: int = Query(default=1000, ge=1, le=10000, description="Maximum transactions to fetch"),
    offset: int = Query(default=0, ge=0, description="Number of transactions to skip"),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(require_permission(Permission.ANALYSIS_READ))
):
    """
    Get graph data for a subject, including related entities and transactions.
    
    Supports pagination to prevent memory exhaustion on high-volume subjects.
    """
    try:
        graph_data = await GraphAnalyzer.build_subgraph(
            db, 
            subject_id, 
            depth, 
            limit=limit, 
            offset=offset
        )
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build graph: {str(e)}")
