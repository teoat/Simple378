"""
Benchmarking and analytics endpoints for peer comparison.
"""

from typing import List
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.api import deps
from app.db.models import Subject, Transaction, AnalysisResult, User

router = APIRouter()


class BenchmarkDataPoint(BaseModel):
    case_id: str
    case_name: str
    total_amount: float
    risk_score: float
    transaction_count: int


class BenchmarkResponse(BaseModel):
    benchmark_data: List[BenchmarkDataPoint]
    statistics: dict


@router.get("/analytics/benchmarks", response_model=BenchmarkResponse)
async def get_peer_benchmarks(
    case_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.verify_active_analyst),
):
    """
    Get peer benchmark data for comparison.

    Returns similar cases for risk score comparison.
    Similarity is based on transaction volume and patterns.
    """
    try:
        current_case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID")

    # Get current case data
    current_case = await db.get(Subject, current_case_uuid)
    if not current_case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Get current case transaction count and total amount
    current_tx_result = await db.execute(
        select(
            func.count(Transaction.id).label("tx_count"),
            func.sum(Transaction.amount).label("total_amount"),
        ).where(Transaction.subject_id == current_case_uuid)
    )
    current_tx_data = current_tx_result.first()
    current_tx_count = current_tx_data.tx_count if current_tx_data else 0
    current_total = float(current_tx_data.total_amount or 0) if current_tx_data else 0

    # Get current case risk score
    current_analysis_result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.subject_id == current_case_uuid)
        .order_by(AnalysisResult.created_at.desc())
    )
    current_analysis = current_analysis_result.scalars().first()
    current_risk_score = float(current_analysis.risk_score) if current_analysis else 0

    # Fetch all subjects for comparison
    all_subjects_result = await db.execute(
        select(Subject)
        .where(Subject.id != current_case_uuid)  # Exclude current case
        .limit(limit * 2)  # Get more than needed for filtering
    )
    all_subjects = list(all_subjects_result.scalars().all())

    # Build benchmark data
    benchmark_data: List[BenchmarkDataPoint] = []

    for subject in all_subjects:
        # Get transaction data
        tx_result = await db.execute(
            select(
                func.count(Transaction.id).label("tx_count"),
                func.sum(Transaction.amount).label("total_amount"),
            ).where(Transaction.subject_id == subject.id)
        )
        tx_data = tx_result.first()
        tx_count = tx_data.tx_count if tx_data else 0
        total_amount = float(tx_data.total_amount or 0) if tx_data else 0

        # Skip cases with no transactions
        if tx_count == 0:
            continue

        # Get risk score
        analysis_result = await db.execute(
            select(AnalysisResult)
            .where(AnalysisResult.subject_id == subject.id)
            .order_by(AnalysisResult.created_at.desc())
        )
        analysis = analysis_result.scalars().first()
        risk_score = float(analysis.risk_score) if analysis else 0

        # Filter for similar cases (within 50% transaction count range)
        if current_tx_count > 0:
            tx_ratio = tx_count / current_tx_count
            if tx_ratio < 0.5 or tx_ratio > 2.0:
                continue  # Skip cases that are too different

        # Extract case name from encrypted PII (simplified - use id if not available)
        case_name = f"Case {str(subject.id)[:8]}"
        if subject.encrypted_pii and isinstance(subject.encrypted_pii, dict):
            case_name = subject.encrypted_pii.get("name", case_name)

        benchmark_data.append(
            BenchmarkDataPoint(
                case_id=str(subject.id),
                case_name=case_name,
                total_amount=abs(total_amount),  # Use absolute value
                risk_score=risk_score,
                transaction_count=tx_count,
            )
        )

        # Stop if we have enough
        if len(benchmark_data) >= limit:
            break

    # Calculate statistics
    if benchmark_data:
        risk_scores = [b.risk_score for b in benchmark_data]
        amounts = [b.total_amount for b in benchmark_data]

        avg_risk = sum(risk_scores) / len(risk_scores)
        avg_amount = sum(amounts) / len(amounts)

        # Calculate percentile for current case
        sorted_risks = sorted(risk_scores + [current_risk_score])
        percentile = (sorted_risks.index(current_risk_score) / len(sorted_risks)) * 100
    else:
        avg_risk = 0
        avg_amount = 0
        percentile = 50

    statistics = {
        "total_cases": len(benchmark_data),
        "avg_risk_score": round(avg_risk, 2),
        "avg_amount": round(avg_amount, 2),
        "current_case_percentile": round(percentile, 1),
        "current_risk_score": current_risk_score,
        "current_total_amount": abs(current_total),
        "min_risk": min(risk_scores) if risk_scores else 0,
        "max_risk": max(risk_scores) if risk_scores else 100,
    }

    return BenchmarkResponse(benchmark_data=benchmark_data, statistics=statistics)


@router.get("/analytics/vendor-outliers/{case_id}", response_model=List[dict])
async def get_vendor_outliers(
    case_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.verify_active_analyst),
):
    """
    Detect vendor outliers based on pricing anomalies.

    Returns transactions that are statistically anomalous compared to average.
    """
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid case ID")

    # Get all transactions
    result = await db.execute(
        select(Transaction).where(Transaction.subject_id == case_uuid)
    )
    transactions = list(result.scalars().all())

    if not transactions:
        return []

    # Calculate statistics
    amounts = [abs(float(tx.amount or 0)) for tx in transactions]
    mean_amount = sum(amounts) / len(amounts)
    variance = sum((x - mean_amount) ** 2 for x in amounts) / len(amounts)
    std_dev = variance**0.5

    # Find outliers (> 2 standard deviations from mean)
    outliers = []
    for tx in transactions:
        amount = abs(float(tx.amount or 0))
        z_score = (amount - mean_amount) / std_dev if std_dev > 0 else 0

        if abs(z_score) > 2:  # More than 2 std dev away
            outliers.append(
                {
                    "transaction_id": str(tx.id),
                    "date": tx.date.isoformat() if tx.date else "",
                    "amount": amount,
                    "description": tx.description or "",
                    "source_bank": tx.source_bank or "",
                    "z_score": round(z_score, 2),
                    "deviation_amount": round(amount - mean_amount, 2),
                    "severity": "high" if abs(z_score) > 3 else "medium",
                }
            )

    # Sort by z-score (highest first)
    outliers.sort(key=lambda x: abs(x["z_score"]), reverse=True)

    return outliers[:20]  # Return top 20 outliers
