from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Transaction
from app.services.graph_analyzer import GraphAnalyzer


async def get_recent_transactions(
    db: AsyncSession, subject_id: UUID, limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Fetches the most recent transactions for a subject.
    """
    result = await db.execute(
        select(Transaction)
        .where(Transaction.subject_id == subject_id)
        .order_by(Transaction.date.desc())
        .limit(limit)
    )
    transactions = result.scalars().all()
    return [
        {
            "id": str(tx.id),
            "date": tx.date.isoformat(),
            "amount": tx.amount,
            "description": tx.description,
            "source_bank": tx.source_bank,
        }
        for tx in transactions
    ]


async def get_entity_graph(db: AsyncSession, subject_id: UUID) -> Dict[str, Any]:
    """
    Fetches the entity graph for a subject.
    """
    return await GraphAnalyzer.build_subgraph(db, subject_id, depth=2)


async def flag_transaction(db: AsyncSession, transaction_id: UUID, reason: str) -> str:
    """
    Flags a transaction as suspicious.
    """
    # Placeholder: In a real app, this would create an Alert or update the Transaction status.
    # For now, we just log it.
    print(f"FLAGGING Transaction {transaction_id}: {reason}")
    return f"Transaction {transaction_id} flagged successfully."
