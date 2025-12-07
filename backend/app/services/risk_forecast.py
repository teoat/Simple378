import statistics
from datetime import datetime, timedelta
from typing import List, Tuple, Dict, Any
from app.schemas.analysis import RiskForecast, RiskForecastRequest
from app.services.ai.llm_service import LLMService
from langchain_core.messages import HumanMessage
import json
import logging

logger = logging.getLogger(__name__)


class RiskForecastService:
    def forecast_risk(
        self, request: RiskForecastRequest, history: List[Tuple[datetime, float]]
    ) -> RiskForecast:
        """
        Forecasts future risk score based on historical data using linear regression.

        Args:
            request: The forecast request containing subject ID.
            history: List of (timestamp, score) tuples sorted by time.

        Returns:
            RiskForecast object.
        """
        if not history or len(history) < 2:
            # Not enough data for regression
            current_score = history[-1][1] if history else 0.0
            return RiskForecast(
                subject_id=request.subject_id,
                current_score=current_score,
                forecast_30_days=current_score,
                trend="stable",
                confidence=0.0,
                projected_date=datetime.utcnow() + timedelta(days=30),
            )

        # Convert dates to ordinal (day counts) for regression
        # We use relative days from the start of the history to keep numbers small
        start_date = history[0][0]
        x_values = [(h[0] - start_date).days for h in history]
        y_values = [h[1] for h in history]

        try:
            slope, intercept = statistics.linear_regression(x_values, y_values)
        except statistics.StatisticsError:
            # Fallback if variance is zero (all scores same)
            slope = 0
            intercept = y_values[0]

        # Forecast 30 days into the future
        last_day = x_values[-1]
        future_day = last_day + 30

        forecast_score = slope * future_day + intercept

        # Clamp score 0-100
        forecast_score = max(0.0, min(100.0, forecast_score))
        current_score = y_values[-1]

        # Determine trend
        if slope > 0.05:
            trend = "increasing"
        elif slope < -0.05:
            trend = "decreasing"
        else:
            trend = "stable"

        # basic confidence metric based on variance (pseudo)
        # In a real ML model this would be r-squared or similar
        confidence = 0.8 if len(history) > 10 else 0.5

        return RiskForecast(
            subject_id=request.subject_id,
            current_score=current_score,
            forecast_30_days=round(forecast_score, 2),
            trend=trend,
            confidence=confidence,
            projected_date=datetime.utcnow() + timedelta(days=30),
        )

    async def ai_risk_prediction(
        self,
        subject_id: str,
        current_risk_score: float,
        transaction_history: List[Dict[str, Any]],
        analysis_results: List[Dict[str, Any]],
        recent_activity: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Use AI to predict future risk scores and provide insights.
        """
        llm_service = LLMService()

        # Prepare context data for AI analysis
        context = {
            "current_risk_score": current_risk_score,
            "transaction_count": len(transaction_history),
            "analysis_results": analysis_results,
            "recent_activity": recent_activity,
            "transaction_patterns": self._analyze_transaction_patterns(
                transaction_history
            ),
        }

        prompt = f"""You are an expert fraud risk analyst. Based on the following case data, predict the risk score 30 days from now and provide detailed insights.

CASE DATA:
{json.dumps(context, indent=2)}

Please analyze this case and provide:
1. Predicted risk score in 30 days (0-100 scale)
2. Risk trend assessment (increasing, decreasing, stable)
3. Confidence level in your prediction (0.0-1.0)
4. Key risk factors identified
5. Recommended actions to mitigate risk
6. Timeline for when risk might peak or decline

Return your analysis as a JSON object with these fields:
- predicted_score: number (0-100)
- trend: "increasing" | "decreasing" | "stable"
- confidence: number (0.0-1.0)
- risk_factors: array of strings
- recommendations: array of strings
- timeline_prediction: string describing when risk might change

Be specific and data-driven in your analysis."""

        try:
            messages = [HumanMessage(content=prompt)]
            response = await llm_service.generate_response(messages)

            # Parse the JSON response
            prediction = json.loads(response)

            # Validate and structure the response
            validated_prediction = {
                "predicted_score": min(
                    100.0,
                    max(
                        0.0,
                        float(prediction.get("predicted_score", current_risk_score)),
                    ),
                ),
                "trend": prediction.get("trend", "stable"),
                "confidence": min(
                    1.0, max(0.0, float(prediction.get("confidence", 0.5)))
                ),
                "risk_factors": prediction.get("risk_factors", []),
                "recommendations": prediction.get("recommendations", []),
                "timeline_prediction": prediction.get(
                    "timeline_prediction", "Unable to determine timeline"
                ),
            }

            return validated_prediction

        except Exception as e:
            print(f"AI risk prediction failed: {e}")
            # Fallback to statistical forecast
            forecast = self.forecast_risk(
                RiskForecastRequest(subject_id=subject_id),
                [(datetime.utcnow(), current_risk_score)],
            )

            return {
                "predicted_score": forecast.forecast_30_days,
                "trend": forecast.trend,
                "confidence": forecast.confidence,
                "risk_factors": ["AI analysis unavailable"],
                "recommendations": ["Continue monitoring"],
                "timeline_prediction": "Analysis pending",
            }

    def _analyze_transaction_patterns(
        self, transactions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze transaction patterns for risk assessment.
        """
        if not transactions:
            return {"patterns": "No transaction data available"}

        amounts = [tx.get("amount", 0) for tx in transactions]
        dates = [tx.get("date") for tx in transactions if tx.get("date")]

        patterns = {
            "total_transactions": len(transactions),
            "average_amount": sum(amounts) / len(amounts) if amounts else 0,
            "max_amount": max(amounts) if amounts else 0,
            "min_amount": min(amounts) if amounts else 0,
            "high_value_count": len([a for a in amounts if abs(a) > 10000]),
            "recent_activity": len(
                [tx for tx in transactions if self._is_recent(tx.get("date"))]
            ),
        }

        return patterns

    def _is_recent(self, date_str: str) -> bool:
        """
        Check if a date string represents recent activity (within 30 days).
        """
        if not date_str:
            return False
        try:
            date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            return (datetime.utcnow() - date).days <= 30
        except:
            return False
