from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import Transaction, Match, TransactionSourceType, MatchStatus
from app.services.ai.llm_service import LLMService
from langchain_core.messages import HumanMessage
import uuid
import json


class ReconciliationService:
    """
    Service for reconciling internal and external transactions using ML-based matching.
    """

    @staticmethod
    async def ml_based_matching(
        db: AsyncSession, threshold: float = 0.8, date_buffer_days: int = 3
    ) -> Dict[str, Any]:
        """
        Use ML/AI to match transactions based on multiple features.
        """
        # Get unmatched transactions
        unmatched_internals, unmatched_externals = (
            await ReconciliationService._get_unmatched_transactions(db)
        )

        if not unmatched_internals or not unmatched_externals:
            return {
                "matched": 0,
                "conflicts": 0,
                "message": "No unmatched transactions to reconcile",
            }

        # Use AI to find matches
        matches = await ReconciliationService._find_matches_with_ai(
            unmatched_internals, unmatched_externals, threshold, date_buffer_days
        )

        # Create matches in database
        created_matches = 0
        for match in matches:
            db_match = Match(
                internal_transaction_id=match["internal_id"],
                external_transaction_id=match["external_id"],
                status=MatchStatus.MATCHED,
                confidence=match["confidence"],
            )
            db.add(db_match)
            created_matches += 1

        await db.commit()

        return {
            "matched": created_matches,
            "conflicts": 0,  # For now, no conflict detection
            "message": f"ML-based matching completed: {created_matches} matches found",
        }

    @staticmethod
    async def _get_unmatched_transactions(
        db: AsyncSession,
    ) -> Tuple[List[Transaction], List[Transaction]]:
        """Get all unmatched internal and external transactions."""
        # Get all existing matches
        matches_result = await db.execute(select(Match))
        matches = matches_result.scalars().all()

        matched_ids = set()
        for match in matches:
            matched_ids.add(match.internal_transaction_id)
            matched_ids.add(match.external_transaction_id)

        # Get unmatched internals
        internals_result = await db.execute(
            select(Transaction)
            .where(Transaction.source_type == TransactionSourceType.INTERNAL)
            .where(Transaction.id.not_in(matched_ids))
        )
        internals = internals_result.scalars().all()

        # Get unmatched externals
        externals_result = await db.execute(
            select(Transaction)
            .where(Transaction.source_type == TransactionSourceType.EXTERNAL)
            .where(Transaction.id.not_in(matched_ids))
        )
        externals = externals_result.scalars().all()

        return list(internals), list(externals)

    @staticmethod
    async def _find_matches_with_ai(
        internals: List[Transaction],
        externals: List[Transaction],
        threshold: float,
        date_buffer_days: int,
    ) -> List[Dict[str, Any]]:
        """
        Use AI to analyze transactions and find matches based on multiple criteria.
        """
        llm_service = LLMService()

        # Prepare transaction data for AI analysis
        internal_data = []
        for tx in internals:
            internal_data.append(
                {
                    "id": str(tx.id),
                    "date": tx.date.isoformat() if tx.date else "",
                    "amount": float(tx.amount) if tx.amount else 0.0,
                    "description": tx.description or "",
                    "bank": tx.source_bank or "",
                }
            )

        external_data = []
        for tx in externals:
            external_data.append(
                {
                    "id": str(tx.id),
                    "date": tx.date.isoformat() if tx.date else "",
                    "amount": float(tx.amount) if tx.amount else 0.0,
                    "description": tx.description or "",
                    "bank": tx.source_bank or "",
                }
            )

        # Create prompt for AI matching
        prompt = f"""You are an expert financial reconciliation specialist. Your task is to match internal transactions with external transactions based on multiple criteria.

INTERNAL TRANSACTIONS:
{json.dumps(internal_data, indent=2)}

EXTERNAL TRANSACTIONS:
{json.dumps(external_data, indent=2)}

MATCHING CRITERIA (in order of importance):
1. Amount similarity (exact match gets highest score)
2. Date proximity (within {date_buffer_days} days)
3. Description similarity (semantic meaning)
4. Bank/source consistency

For each potential match, calculate a confidence score from 0.0 to 1.0 where:
- 1.0 = Perfect match (exact amount, same date, identical description)
- 0.8+ = Very confident match
- 0.6-0.8 = Good match but needs review
- Below 0.6 = Weak match, probably not

Return a JSON array of matches with the following format:
[
  {{
    "internal_id": "uuid",
    "external_id": "uuid",
    "confidence": 0.95,
    "reasoning": "Exact amount match, date within 1 day, similar descriptions"
  }}
]

Only include matches with confidence >= {threshold}.
Each transaction should only be matched once (no duplicates).
Focus on high-confidence matches first."""

        try:
            messages = [HumanMessage(content=prompt)]
            response = await llm_service.generate_response(messages)

            # Parse the JSON response
            matches = json.loads(response)

            # Validate and filter matches
            validated_matches = []
            used_internal_ids = set()
            used_external_ids = set()

            for match in matches:
                if isinstance(match, dict) and all(
                    k in match for k in ["internal_id", "external_id", "confidence"]
                ):
                    internal_id = match["internal_id"]
                    external_id = match["external_id"]
                    confidence = float(match.get("confidence", 0.0))

                    # Check if IDs are valid and not already used
                    if (
                        confidence >= threshold
                        and internal_id not in used_internal_ids
                        and external_id not in used_external_ids
                    ):

                        validated_matches.append(
                            {
                                "internal_id": uuid.UUID(internal_id),
                                "external_id": uuid.UUID(external_id),
                                "confidence": confidence,
                                "reasoning": match.get("reasoning", ""),
                            }
                        )

                        used_internal_ids.add(internal_id)
                        used_external_ids.add(external_id)

            return validated_matches

        except Exception as e:
            print(f"AI matching failed: {e}")
            # Fallback to basic matching
            return ReconciliationService._fallback_matching(
                internals, externals, threshold, date_buffer_days
            )

    @staticmethod
    def _fallback_matching(
        internals: List[Transaction],
        externals: List[Transaction],
        threshold: float,
        date_buffer_days: int,
    ) -> List[Dict[str, Any]]:
        """
        Basic rule-based matching as fallback when AI fails.
        """
        matches = []

        for internal in internals:
            best_match = None
            best_score = 0.0

            for external in externals:
                score = ReconciliationService._calculate_match_score(
                    internal, external, date_buffer_days
                )
                if score > best_score and score >= threshold:
                    best_match = external
                    best_score = score

            if best_match:
                matches.append(
                    {
                        "internal_id": internal.id,
                        "external_id": best_match.id,
                        "confidence": best_score,
                        "reasoning": "Fallback rule-based matching",
                    }
                )
                # Remove matched external to prevent duplicates
                externals.remove(best_match)

        return matches

    @staticmethod
    def _calculate_match_score(
        internal: Transaction, external: Transaction, date_buffer_days: int
    ) -> float:
        """
        Calculate a match score based on multiple criteria.
        """
        score = 0.0

        # Amount match (40% weight)
        if abs(float(internal.amount or 0) - float(external.amount or 0)) < 0.01:
            score += 0.4
        elif abs(float(internal.amount or 0) - float(external.amount or 0)) < 1.0:
            score += 0.2  # Partial credit for close amounts

        # Date proximity (30% weight)
        if internal.date and external.date:
            days_diff = abs((internal.date - external.date).days)
            if days_diff == 0:
                score += 0.3
            elif days_diff <= date_buffer_days:
                score += 0.3 * (1 - days_diff / (date_buffer_days + 1))

        # Description similarity (20% weight) - basic text matching
        if internal.description and external.description:
            desc1 = internal.description.lower()
            desc2 = external.description.lower()
            if desc1 == desc2:
                score += 0.2
            elif any(word in desc2 for word in desc1.split()):
                score += 0.1

        # Bank consistency bonus (10% weight)
        if internal.source_bank and external.source_bank:
            if internal.source_bank.lower() == external.source_bank.lower():
                score += 0.1

        return min(score, 1.0)
