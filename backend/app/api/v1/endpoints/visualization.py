from fastapi import APIRouter, Depends
from typing import Dict, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.core.permissions import Permission, require_permission
from app.services.visualization_service import VisualizationService

router = APIRouter()

@router.get("/kpis")
async def get_financial_kpis(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(require_permission(Permission.VIEW_DASHBOARD))
) -> Dict[str, Any]:
    """
    Get financial KPIs for the visualization page.
    """
    return await VisualizationService.get_kpis(db)

@router.get("/expenses")
async def get_expense_trend(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(require_permission(Permission.VIEW_DASHBOARD))
) -> List[Dict[str, Any]]:
    """
    Get monthly expense breakdown.
    """
    return await VisualizationService.get_expense_trend(db)

@router.get("/balance-sheet")
async def get_balance_sheet(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(require_permission(Permission.VIEW_DASHBOARD))
) -> List[Dict[str, Any]]:
    """
    Get balance sheet composition.
    """
    return await VisualizationService.get_balance_sheet(db)

@router.post("/ai-insight")
async def generate_ai_insight(
    query: str,
    current_user = Depends(require_permission(Permission.VIEW_DASHBOARD))
) -> Dict[str, str]:
    """
    Generate AI insight for finance.
    """
    # In V2 this will call LLM
    return {
        "insight": "Based on your current burn rate, consider analyzing top vendor spend."
    }
