from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import statistics
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from app.db.models import Subject, Transaction
from app.db.models import AnalysisResult
from app.services.ai.llm_service import LLMService


class PredictiveModeler:
    """
    AI-powered predictive modeling for case outcomes and risk forecasting.
    """

    def __init__(self):
        self.llm_service = LLMService()

    async def predict_case_outcome(
        self, subject_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Predict the likely outcome and resolution path for a case.
        """
        # Get historical case data for training
        historical_data = await self._get_historical_cases(db)

        # Get current case data
        case_data = await self._get_case_data(subject_id, db)

        if not case_data:
            return {
                "prediction": "unknown",
                "confidence": 0.0,
                "reasoning": "Insufficient case data",
            }

        # Analyze patterns and predict outcome
        prediction = await self._analyze_case_patterns(case_data, historical_data)

        return prediction

    async def forecast_risk_trends(
        self, time_period_days: int, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Forecast risk trends and potential case volumes.
        """
        # Get historical risk data
        historical_risks = await self._get_historical_risk_data(time_period_days, db)

        # Analyze trends
        trend_analysis = self._analyze_risk_trends(historical_risks)

        # Generate forecast
        forecast = await self._generate_risk_forecast(trend_analysis, time_period_days)

        return forecast

    async def _get_case_data(
        self, subject_id: str, db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """Get comprehensive case data for prediction."""
        try:
            subject_uuid = __import__("uuid").UUID(subject_id)

            # Get subject and analysis
            subject_query = (
                select(Subject, AnalysisResult)
                .outerjoin(AnalysisResult, Subject.id == AnalysisResult.subject_id)
                .where(Subject.id == subject_uuid)
            )

            result = await db.execute(subject_query)
            row = result.first()

            if not row:
                return None

            subject, analysis = row

            # Get transactions
            tx_query = (
                select(Transaction)
                .where(Transaction.subject_id == subject_uuid)
                .order_by(desc(Transaction.date))
            )

            tx_result = await db.execute(tx_query)
            transactions = tx_result.scalars().all()

            # Calculate metrics
            total_amount = sum(float(tx.amount or 0) for tx in transactions)
            avg_transaction = total_amount / len(transactions) if transactions else 0

            # Transaction frequency (transactions per day)
            if (
                len(transactions) >= 2
                and transactions[0].date
                and transactions[-1].date
            ):
                days_span = (transactions[0].date - transactions[-1].date).days
                frequency = len(transactions) / max(days_span, 1)
            else:
                frequency = 0

            # Amount variability
            amounts = [float(tx.amount or 0) for tx in transactions]
            variability = statistics.stdev(amounts) if len(amounts) > 1 else 0

            return {
                "subject_id": subject_id,
                "risk_score": analysis.risk_score if analysis else 0,
                "status": analysis.adjudication_status if analysis else "new",
                "transaction_count": len(transactions),
                "total_amount": total_amount,
                "avg_transaction": avg_transaction,
                "transaction_frequency": frequency,
                "amount_variability": variability,
                "days_active": (
                    (datetime.utcnow().date() - subject.created_at.date()).days
                    if subject.created_at
                    else 0
                ),
                "has_pii": subject.encrypted_pii is not None,
            }

        except Exception as e:
            print(f"Error getting case data: {e}")
            return None

    async def _get_historical_cases(
        self, db: AsyncSession, limit: int = 1000
    ) -> List[Dict[str, Any]]:
        """Get historical case data for pattern analysis."""
        query = (
            select(Subject, AnalysisResult)
            .outerjoin(AnalysisResult, Subject.id == AnalysisResult.subject_id)
            .where(AnalysisResult.adjudication_status.isnot(None))
            .limit(limit)
        )

        result = await db.execute(query)
        rows = result.all()

        historical_cases = []
        for subject, analysis in rows:
            # Get transaction count for this subject
            tx_count_query = select(func.count(Transaction.id)).where(
                Transaction.subject_id == subject.id
            )
            tx_result = await db.execute(tx_count_query)
            tx_count = tx_result.scalar() or 0

            historical_cases.append(
                {
                    "risk_score": analysis.risk_score,
                    "status": analysis.adjudication_status,
                    "transaction_count": tx_count,
                    "resolution_time": (
                        (analysis.updated_at - analysis.created_at).days
                        if analysis.updated_at and analysis.created_at
                        else 0
                    ),
                }
            )

        return historical_cases

    async def _analyze_case_patterns(
        self, case_data: Dict[str, Any], historical_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze case patterns and predict outcome using AI."""

        # Create analysis prompt
        prompt = f"""
You are an expert fraud investigator predicting case outcomes. Based on the current case data and historical patterns, predict the most likely outcome.

Current Case:
- Risk Score: {case_data['risk_score']}/100
- Status: {case_data['status']}
- Transactions: {case_data['transaction_count']}
- Total Amount: ${case_data['total_amount']:,.2f}
- Average Transaction: ${case_data['avg_transaction']:,.2f}
- Transaction Frequency: {case_data['transaction_frequency']:.2f} per day
- Amount Variability: ${case_data['amount_variability']:,.2f}
- Days Active: {case_data['days_active']}

Historical Patterns Summary:
- Average Risk Score: {statistics.mean([c['risk_score'] for c in historical_data]) if historical_data else 0:.1f}
- Common Resolutions: {', '.join(set(c['status'] for c in historical_data if c['status']))}

Predict the case outcome with:
1. Most likely resolution (closed, escalated, under_review, etc.)
2. Confidence score (0.0-1.0)
3. Expected resolution time in days
4. Key factors influencing the prediction
5. Recommended actions

Format as JSON with keys: prediction, confidence, expected_time, factors, recommendations
"""

        try:
            messages = [{"role": "user", "content": prompt}]
            response = await self.llm_service.generate_response(messages)

            # Parse JSON response
            import json

            result = json.loads(response.content)

            return {
                "prediction": result.get("prediction", "under_review"),
                "confidence": result.get("confidence", 0.7),
                "expected_time": result.get("expected_time", 7),
                "factors": result.get("factors", []),
                "recommendations": result.get("recommendations", []),
            }

        except Exception as e:
            print(f"AI prediction error: {e}")
            # Fallback prediction based on risk score
            risk_score = case_data["risk_score"]

            if risk_score >= 80:
                return {
                    "prediction": "escalated",
                    "confidence": 0.85,
                    "expected_time": 3,
                    "factors": ["High risk score", "Requires senior review"],
                    "recommendations": [
                        "Assign to senior investigator",
                        "Gather additional evidence",
                    ],
                }
            elif risk_score >= 60:
                return {
                    "prediction": "under_review",
                    "confidence": 0.75,
                    "expected_time": 7,
                    "factors": [
                        "Moderate risk indicators",
                        "Standard investigation needed",
                    ],
                    "recommendations": ["Complete standard investigation protocol"],
                }
            else:
                return {
                    "prediction": "closed",
                    "confidence": 0.65,
                    "expected_time": 14,
                    "factors": ["Low risk indicators", "Likely normal activity"],
                    "recommendations": [
                        "Monitor for 30 days",
                        "Close if no new activity",
                    ],
                }

    async def _get_historical_risk_data(
        self, days: int, db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Get historical risk data for trend analysis."""
        start_date = datetime.utcnow() - timedelta(days=days)

        query = (
            select(AnalysisResult)
            .where(AnalysisResult.created_at >= start_date)
            .order_by(AnalysisResult.created_at)
        )

        result = await db.execute(query)
        analyses = result.scalars().all()

        return [
            {
                "date": analysis.created_at.date() if analysis.created_at else None,
                "risk_score": analysis.risk_score,
                "status": analysis.adjudication_status,
            }
            for analysis in analyses
        ]

    def _analyze_risk_trends(
        self, historical_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze risk trends from historical data."""
        if not historical_data:
            return {"trend": "stable", "direction": 0, "volatility": 0}

        # Group by date
        date_groups = {}
        for item in historical_data:
            date_key = item["date"].isoformat() if item["date"] else "unknown"
            if date_key not in date_groups:
                date_groups[date_key] = []
            date_groups[date_key].append(item["risk_score"])

        # Calculate daily averages
        daily_averages = []
        for date, scores in sorted(date_groups.items()):
            daily_averages.append(sum(scores) / len(scores))

        # Calculate trend
        if len(daily_averages) >= 2:
            trend = statistics.linear_regression(
                range(len(daily_averages)), daily_averages
            )[0]
            direction = 1 if trend > 0.1 else -1 if trend < -0.1 else 0
            volatility = (
                statistics.stdev(daily_averages) if len(daily_averages) > 1 else 0
            )
        else:
            trend = 0
            direction = 0
            volatility = 0

        return {
            "trend": (
                "increasing"
                if direction > 0
                else "decreasing" if direction < 0 else "stable"
            ),
            "direction": direction,
            "volatility": volatility,
            "average_risk": statistics.mean(daily_averages) if daily_averages else 0,
            "data_points": len(daily_averages),
        }

    async def _generate_risk_forecast(
        self, trend_analysis: Dict[str, Any], forecast_days: int
    ) -> Dict[str, Any]:
        """Generate risk forecast using AI analysis."""

        prompt = f"""
Analyze the risk trend data and provide a forecast:

Current Trend Analysis:
- Direction: {trend_analysis['trend']}
- Average Risk Score: {trend_analysis['average_risk']:.1f}
- Volatility: {trend_analysis['volatility']:.2f}
- Data Points: {trend_analysis['data_points']}

Provide a {forecast_days}-day risk forecast including:
1. Expected risk level trend (increasing/decreasing/stable)
2. Projected average risk score
3. Potential alerts to watch for
4. Recommended actions

Format as JSON with keys: trend_forecast, projected_risk, alerts, recommendations
"""

        try:
            messages = [{"role": "user", "content": prompt}]
            response = await self.llm_service.generate_response(messages)

            import json

            result = json.loads(response.content)

            return {
                "forecast_period_days": forecast_days,
                "trend_forecast": result.get("trend_forecast", "stable"),
                "projected_risk": result.get(
                    "projected_risk", trend_analysis["average_risk"]
                ),
                "alerts": result.get("alerts", []),
                "recommendations": result.get("recommendations", []),
                "confidence": 0.75,
            }

        except Exception as e:
            print(f"Forecast generation error: {e}")
            return {
                "forecast_period_days": forecast_days,
                "trend_forecast": trend_analysis["trend"],
                "projected_risk": trend_analysis["average_risk"],
                "alerts": ["Monitor for unusual spikes"],
                "recommendations": ["Maintain current monitoring levels"],
                "confidence": 0.6,
            }
