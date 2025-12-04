from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel
import uuid

from app.api import deps
from app.db.models import Transaction

router = APIRouter()

class MatchCreate(BaseModel):
    expense_id: str
    transaction_id: str
    confidence: Optional[float] = 1.0

class MatchResponse(BaseModel):
    id: str
    expense_id: str
    transaction_id: str
    confidence: float
    created_at: str

@router.post("/matches", response_model=dict)
async def create_match(
    match_data: MatchCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Create a match between an expense and a bank transaction.
    """
    try:
        expense_uuid = uuid.UUID(match_data.expense_id)
        transaction_uuid = uuid.UUID(match_data.transaction_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")
    
    # Verify transaction exists
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_uuid))
    transaction = result.scalars().first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # In a full implementation, we would:
    # 1. Create a Match record in the database
    # 2. Update the status of both expense and transaction
    # 3. Store the match confidence
    
    # For now, return a success response
    # TODO: Implement proper Match model and database operations
    return {
        "id": str(uuid.uuid4()),
        "expense_id": match_data.expense_id,
        "transaction_id": match_data.transaction_id,
        "confidence": match_data.confidence,
        "created_at": transaction.created_at.isoformat() if transaction.created_at else None,
        "status": "matched"
    }

@router.post("/auto-match", response_model=dict)
async def auto_reconcile(
    threshold: Optional[float] = 0.8,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Automatically match expenses with transactions based on amount and date.
    """
    # In a full implementation, this would:
    # 1. Fetch all unmatched expenses
    # 2. Fetch all unmatched transactions
    # 3. Use fuzzy matching algorithm to find matches
    # 4. Create matches above the threshold
    
    # For now, return placeholder response
    return {
        "matched": 0,
        "unmatched": 0,
        "threshold": threshold
    }

@router.get("/expenses", response_model=List[dict])
async def get_expenses(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get all expenses for reconciliation.
    """
    # In a full implementation, this would query an Expenses table
    # For now, return empty list or placeholder data
    return []

@router.get("/transactions", response_model=List[dict])
async def get_transactions(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Get all bank transactions for reconciliation.
    """
    result = await db.execute(select(Transaction))
    transactions = result.scalars().all()
    
    return [
        {
            "id": str(tx.id),
            "date": tx.date.isoformat() if tx.date else None,
            "description": tx.description or "",
            "amount": float(tx.amount) if tx.amount else 0.0,
            "status": "unmatched"  # In full implementation, check match status
        }
        for tx in transactions
    ]

