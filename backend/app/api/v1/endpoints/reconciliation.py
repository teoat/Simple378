from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uuid

from app.api import deps
from app.db.models import Transaction, Match, TransactionSourceType, MatchStatus
from app.services.reconciliation import ReconciliationService

router = APIRouter()


class MatchRequest(BaseModel):
    internal_id: str
    external_id: str


class AutoMatchRequest(BaseModel):
    threshold: Optional[float] = 0.8
    date_buffer_days: Optional[int] = 3


@router.get("/transactions", response_model=List[Dict[str, Any]])
async def get_transactions(
    source: str = Query(..., description="internal or external"),
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """
    Get transactions with match status.
    """
    try:
        source_type = TransactionSourceType(source.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid source type")

    # Fetch transactions of the requested source
    result = await db.execute(
        select(Transaction)
        .where(Transaction.source_type == source_type)
        .order_by(Transaction.date.desc())
    )
    transactions = result.scalars().all()

    # Create lookup map
    match_map = {}

    if transactions:
        tx_ids = [tx.id for tx in transactions]

        # Optimize: Only fetch matches for the retrieved transactions
        if source_type == TransactionSourceType.INTERNAL:
            stmt = select(Match).where(Match.internal_transaction_id.in_(tx_ids))
        else:
            stmt = select(Match).where(Match.external_transaction_id.in_(tx_ids))

        matches_result = await db.execute(stmt)
        matches = matches_result.scalars().all()

        # Build map
        for m in matches:
            if source_type == TransactionSourceType.INTERNAL:
                match_map[m.internal_transaction_id] = m
            else:
                match_map[m.external_transaction_id] = m

    response = []
    for tx in transactions:
        match = match_map.get(tx.id)

        status = "unmatched"
        matched_with = None
        confidence = None

        if match:
            status = match.status.value
            confidence = float(match.confidence) if match.confidence else 1.0
            # Get the ID of the counterpart
            if source_type == TransactionSourceType.INTERNAL:
                matched_with = str(match.external_transaction_id)
            else:
                matched_with = str(match.internal_transaction_id)

        response.append(
            {
                "id": str(tx.id),
                "date": tx.date.isoformat() if tx.date else None,
                "description": tx.description or "",
                "amount": float(tx.amount) if tx.amount else 0.0,
                "account": tx.source_bank,
                "category": "Uncategorized",  # Placeholder until Category model exists
                "source": source_type.value,
                "matchStatus": status,
                "matchedWith": matched_with,
                "confidence": confidence,
            }
        )

    return response


@router.post("/match", response_model=Dict[str, Any])
async def create_manual_match(
    match_req: MatchRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """
    Manually match two transactions.
    """
    try:
        int_id = uuid.UUID(match_req.internal_id)
        ext_id = uuid.UUID(match_req.external_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    # Verify transactions exist
    int_tx = await db.get(Transaction, int_id)
    ext_tx = await db.get(Transaction, ext_id)

    if not int_tx or not ext_tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if (
        int_tx.source_type != TransactionSourceType.INTERNAL
        or ext_tx.source_type != TransactionSourceType.EXTERNAL
    ):
        raise HTTPException(status_code=400, detail="Must match Internal with External")

    # Create match
    match = Match(
        internal_transaction_id=int_id,
        external_transaction_id=ext_id,
        status=MatchStatus.MATCHED,
        confidence=1.0,
    )
    db.add(match)
    await db.commit()
    await db.refresh(match)

    return {"status": "success", "match_id": str(match.id)}


@router.delete("/match/{transaction_id}")
async def unmatch_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """
    Remove a match for a given transaction ID (internal or external).
    """
    try:
        tx_uuid = uuid.UUID(transaction_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    # Find match involving this transaction
    result = await db.execute(
        select(Match).where(
            or_(
                Match.internal_transaction_id == tx_uuid,
                Match.external_transaction_id == tx_uuid,
            )
        )
    )
    match = result.scalars().first()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    await db.delete(match)
    await db.commit()

    return {"status": "success", "message": "Match removed"}


@router.post("/auto-match", response_model=Dict[str, Any])
async def auto_match(
    params: AutoMatchRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    """
    Run ML-based auto-reconciliation.
    """
    try:
        result = await ReconciliationService.ml_based_matching(
            db=db,
            threshold=params.threshold or 0.8,
            date_buffer_days=params.date_buffer_days or 3,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-matching failed: {str(e)}")
