from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from app.services.ai.llm_service import LLMService
from app.db.models import Subject, Transaction, AuditLog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from langchain_core.messages import HumanMessage
import json
import statistics


class PredictiveModelingService:
    """
    Service for predictive modeling and scenario simulation.
    """

    def __init__(self):
        self.llm_service = LLMService()

    async def predict_case_outcome(
        self,
        db: AsyncSession,
        case_id: str,
        historical_cases: Optional[List[Dict[str, Any]]] = None,
        tenant_id: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Predict the outcome of a case based on historical data and current case characteristics.
        """
        # Get current case data
        case_data = await self._get_case_data(db, case_id, tenant_id=tenant_id)

        if not case_data:
            return {
                "prediction": "unknown",
                "confidence": 0.0,
                "reasoning": "Case data not found",
                "factors": []
            }

        # Get historical cases for training data (filtered by tenant)
        if not historical_cases:
            historical_cases = await self._get_historical_cases(db, tenant_id=tenant_id)

        # Use AI to analyze and predict
        prediction = await self._analyze_case_outcome(case_data, historical_cases)

        return prediction

    async def forecast_risk_score(
        self,
        db: AsyncSession,
        case_id: str,
        days_ahead: int = 30
    ) -> Dict[str, Any]:
        """
        Forecast future risk scores based on current trends and patterns.
        """
        # Get risk score history
        risk_history = await self._get_risk_history(db, case_id)

        if len(risk_history) < 2:
            return {
                "forecast": [],
                "trend": "stable",
                "confidence": 0.0,
                "reasoning": "Insufficient historical data"
            }

        # Use AI to forecast
        forecast = await self._forecast_risk_trend(risk_history, days_ahead)

        return forecast

    async def estimate_resource_requirements(
        self,
        db: AsyncSession,
        case_id: str
    ) -> Dict[str, Any]:
        """
        Estimate resource requirements (time, personnel, budget) for case resolution.
        """
        case_data = await self._get_case_data(db, case_id)

        if not case_data:
            return {
                "estimated_time": "unknown",
                "estimated_cost": 0,
                "personnel_needed": [],
                "confidence": 0.0
            }

        # Analyze similar cases
        similar_cases = await self._find_similar_cases(db, case_data)

        # Estimate based on historical data
        estimate = await self._calculate_resource_estimate(case_data, similar_cases)

        return estimate

    async def detect_pattern_alerts(
        self,
        db: AsyncSession,
        case_id: str
    ) -> List[Dict[str, Any]]:
        """
        Detect patterns that should trigger alerts based on case data.
        """
        case_data = await self._get_case_data(db, case_id)

        if not case_data:
            return []

        # Analyze for alert patterns
        alerts = await self._analyze_alert_patterns(case_data)

        return alerts

    async def analyze_trends(
        self,
        db: AsyncSession,
        time_period: str = "30d",
        tenant_id: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Analyze trends across all cases for the specified time period.
        """
        # Get cases from the time period
        cases = await self._get_cases_by_period(db, time_period, tenant_id=tenant_id)

        if not cases:
            return {
                "trends": [],
                "insights": [],
                "recommendations": []
            }

        # Analyze trends
        trends = await self._analyze_case_trends(cases)

        return trends

    async def simulate_scenario(
        self,
        db: AsyncSession,
        scenario_type: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run scenario simulations (what-if analysis, burn rate, vendor stress testing, etc.)
        """
        if scenario_type == "what_if":
            return await self._simulate_what_if(db, parameters)
        elif scenario_type == "burn_rate":
            return await self._simulate_burn_rate(db, parameters)
        elif scenario_type == "vendor_stress":
            return await self._simulate_vendor_stress(db, parameters)
        elif scenario_type == "dependency_risk":
            return await self._simulate_dependency_risk(db, parameters)
        else:
            return {"error": "Unknown scenario type"}

    # Helper methods

    async def _get_case_data(self, db: AsyncSession, case_id: str, tenant_id: Optional[Any] = None) -> Optional[Dict[str, Any]]:
        """Get comprehensive case data."""
        try:
            case_uuid = UUID(case_id)
        except ValueError:
            return None

        # Get subject with analysis results
        query = select(Subject).options(selectinload(Subject.analysis_results)).where(Subject.id == case_uuid)
        
        if tenant_id:
            query = query.where(Subject.tenant_id == tenant_id)
            
        result = await db.execute(query)
        subject = result.scalars().first()

        if not subject:
            return None

        # Get transactions
        tx_result = await db.execute(
            select(Transaction).where(Transaction.subject_id == case_uuid)
        )
        transactions = tx_result.scalars().all()

        # Get audit logs
        audit_result = await db.execute(
            select(AuditLog).where(AuditLog.resource_id == case_uuid)
        )
        audit_logs = audit_result.scalars().all()

        return {
            "id": str(subject.id),
            "name": subject.encrypted_pii.get('name', 'Unknown') if isinstance(subject.encrypted_pii, dict) else 'Unknown',
            "risk_score": subject.analysis_results[0].risk_score if subject.analysis_results else 0,
            "severity": subject.analysis_results[0].severity if subject.analysis_results else "low",
            "transaction_count": len(transactions),
            "total_amount": sum(float(tx.amount or 0) for tx in transactions),
            "audit_events": len(audit_logs),
            "created_at": subject.created_at.isoformat() if subject.created_at else None,
            "transactions": [
                {
                    "amount": float(tx.amount or 0),
                    "date": tx.date.isoformat() if tx.date else None,
                    "description": tx.description or "",
                    "source_bank": tx.source_bank or ""
                }
                for tx in transactions
            ]
        }

    async def _get_historical_cases(
        self, 
        db: AsyncSession, 
        limit: int = 100,
        tenant_id: Optional[Any] = None
    ) -> List[Dict[str, Any]]:
        """Get historical cases for training, filtered by tenant."""
        query = select(Subject).options(selectinload(Subject.analysis_results))
        
        if tenant_id:
            query = query.where(Subject.tenant_id == tenant_id)
            
        result = await db.execute(query.limit(limit))
        subjects = result.scalars().all()

        historical_cases = []
        for subject in subjects:
            if subject.analysis_results:
                analysis = subject.analysis_results[0]
                historical_cases.append({
                    "risk_score": analysis.risk_score,
                    "severity": analysis.severity,
                    "outcome": analysis.decision or "pending",
                    "transaction_count": 0,  # Would need to count transactions
                    "total_amount": 0  # Would need to sum amounts
                })

        return historical_cases

    async def _analyze_case_outcome(
        self,
        case_data: Dict[str, Any],
        historical_cases: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Use AI to predict case outcome."""

        prompt = f"""You are an expert fraud investigator analyzing case outcomes. Based on the current case data and historical patterns, predict the likely outcome of this case.

CURRENT CASE DATA:
{json.dumps(case_data, indent=2)}

HISTORICAL CASE PATTERNS:
{json.dumps(historical_cases[:10], indent=2)}  # Sample of historical cases

Analyze the case and provide:
1. Predicted outcome: "approved", "denied", "escalated", "pending_review"
2. Confidence score (0.0-1.0)
3. Key factors influencing the prediction
4. Risk assessment
5. Recommended actions

Return your analysis as JSON with these fields:
- prediction: string
- confidence: number
- reasoning: string
- factors: array of strings
- risk_assessment: string
- recommendations: array of strings"""

        try:
            messages = [HumanMessage(content=prompt)]
            response = await self.llm_service.generate_response(messages)
            result = json.loads(response)

            return {
                "prediction": result.get("prediction", "pending_review"),
                "confidence": min(1.0, max(0.0, result.get("confidence", 0.5))),
                "reasoning": result.get("reasoning", "AI analysis completed"),
                "factors": result.get("factors", []),
                "risk_assessment": result.get("risk_assessment", "Medium risk"),
                "recommendations": result.get("recommendations", [])
            }

        except Exception as e:
            print(f"Case outcome prediction failed: {e}")
            return {
                "prediction": "pending_review",
                "confidence": 0.0,
                "reasoning": "Analysis failed",
                "factors": [],
                "risk_assessment": "Unknown",
                "recommendations": ["Manual review required"]
            }

    async def _get_risk_history(self, db: AsyncSession, case_id: str) -> List[Tuple[datetime, float]]:
        """Get historical risk scores for a case."""
        try:
            case_uuid = UUID(case_id)
        except ValueError:
            return []

        # Get all analysis results for this case
        result = await db.execute(
            select(AnalysisResult)
            .where(AnalysisResult.subject_id == case_uuid)
            .order_by(AnalysisResult.created_at)
        )
        analyses = result.scalars().all()

        return [(a.created_at, a.risk_score) for a in analyses if a.created_at and a.risk_score is not None]

    async def _forecast_risk_trend(
        self,
        risk_history: List[Tuple[datetime, float]],
        days_ahead: int
    ) -> Dict[str, Any]:
        """Forecast risk score trends using AI analysis."""

        # Calculate basic trend
        if len(risk_history) >= 2:
            scores = [score for _, score in risk_history]
            trend = "increasing" if scores[-1] > scores[0] else "decreasing" if scores[-1] < scores[0] else "stable"
            avg_change = (scores[-1] - scores[0]) / len(scores)
        else:
            trend = "stable"
            avg_change = 0

        # Generate forecast points
        last_date = risk_history[-1][0] if risk_history else datetime.utcnow()
        last_score = risk_history[-1][1] if risk_history else 50.0

        forecast = []
        for i in range(1, days_ahead + 1):
            forecast_date = last_date + timedelta(days=i)
            # Simple linear extrapolation
            forecast_score = last_score + (avg_change * i)
            forecast_score = max(0, min(100, forecast_score))  # Clamp to 0-100
            forecast.append({
                "date": forecast_date.isoformat(),
                "risk_score": round(forecast_score, 2)
            })

        return {
            "forecast": forecast,
            "trend": trend,
            "confidence": 0.7 if len(risk_history) > 5 else 0.4,
            "reasoning": f"Based on {len(risk_history)} historical risk scores showing {trend} trend"
        }

    async def _find_similar_cases(self, db: AsyncSession, case_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find cases similar to the current one."""
        # Simple similarity based on risk score and transaction count
        target_risk = case_data.get("risk_score", 0)
        target_tx_count = case_data.get("transaction_count", 0)

        result = await db.execute(
            select(Subject)
            .options(selectinload(Subject.analysis_results))
            .limit(20)
        )
        subjects = result.scalars().all()

        similar_cases = []
        for subject in subjects:
            if subject.analysis_results:
                analysis = subject.analysis_results[0]
                risk_diff = abs(analysis.risk_score - target_risk)
                if risk_diff < 20:  # Within 20 points
                    similar_cases.append({
                        "id": str(subject.id),
                        "risk_score": analysis.risk_score,
                        "outcome": analysis.decision or "pending",
                        "similarity_score": 1.0 - (risk_diff / 100)
                    })

        return similar_cases[:5]  # Return top 5

    async def _calculate_resource_estimate(
        self,
        case_data: Dict[str, Any],
        similar_cases: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate resource requirements based on similar cases."""

        # Base estimates
        base_time_days = 7
        base_cost = 1000

        # Adjust based on risk score
        risk_multiplier = case_data.get("risk_score", 0) / 50.0  # Scale around medium risk
        time_days = base_time_days * (1 + risk_multiplier)
        cost = base_cost * (1 + risk_multiplier)

        # Adjust based on transaction volume
        tx_count = case_data.get("transaction_count", 0)
        if tx_count > 50:
            time_days *= 1.5
            cost *= 1.3

        personnel = ["Investigator"]
        if case_data.get("risk_score", 0) > 70:
            personnel.append("Senior Analyst")
        if tx_count > 100:
            personnel.append("Data Specialist")

        return {
            "estimated_time": f"{round(time_days)} days",
            "estimated_cost": round(cost),
            "personnel_needed": personnel,
            "confidence": 0.6,
            "based_on_similar_cases": len(similar_cases)
        }

    async def _analyze_alert_patterns(self, case_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze case data for alert patterns."""

        alerts = []
        risk_score = case_data.get("risk_score", 0)
        tx_count = case_data.get("transaction_count", 0)
        total_amount = case_data.get("total_amount", 0)

        # High risk alert
        if risk_score > 80:
            alerts.append({
                "type": "high_risk",
                "severity": "high",
                "message": f"Case has very high risk score of {risk_score}",
                "action_required": "Immediate senior review"
            })

        # Large transaction volume
        if tx_count > 200:
            alerts.append({
                "type": "high_volume",
                "severity": "medium",
                "message": f"Unusually high transaction count: {tx_count}",
                "action_required": "Review for structuring patterns"
            })

        # Large total amount
        if total_amount > 100000:
            alerts.append({
                "type": "large_amount",
                "severity": "medium",
                "message": f"Large total amount: ${total_amount:,.2f}",
                "action_required": "Verify transaction legitimacy"
            })

        return alerts

    async def _get_cases_by_period(
        self, 
        db: AsyncSession, 
        time_period: str,
        tenant_id: Optional[Any] = None
    ) -> List[Dict[str, Any]]:
        """Get cases from a specific time period, filtered by tenant."""

        # Parse time period
        if time_period == "7d":
            days = 7
        elif time_period == "30d":
            days = 30
        elif time_period == "90d":
            days = 90
        else:
            days = 30

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        query = select(Subject).options(selectinload(Subject.analysis_results)).where(Subject.created_at >= cutoff_date)
        
        if tenant_id:
            query = query.where(Subject.tenant_id == tenant_id)

        result = await db.execute(query)
        subjects = result.scalars().all()

        cases = []
        for subject in subjects:
            if subject.analysis_results:
                analysis = subject.analysis_results[0]
                cases.append({
                    "id": str(subject.id),
                    "risk_score": analysis.risk_score,
                    "severity": analysis.severity,
                    "outcome": analysis.decision or "pending",
                    "created_at": subject.created_at.isoformat() if subject.created_at else None
                })

        return cases

    async def _analyze_case_trends(self, cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze trends in case data."""

        if not cases:
            return {"trends": [], "insights": [], "recommendations": []}

        # Calculate basic statistics
        risk_scores = [c["risk_score"] for c in cases if c["risk_score"] is not None]
        avg_risk = statistics.mean(risk_scores) if risk_scores else 0

        # Count by severity
        severity_counts = {}
        for case in cases:
            severity = case.get("severity", "low")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

        # Count by outcome
        outcome_counts = {}
        for case in cases:
            outcome = case.get("outcome", "pending")
            outcome_counts[outcome] = outcome_counts.get(outcome, 0) + 1

        trends = [
            {
                "metric": "average_risk_score",
                "value": round(avg_risk, 2),
                "change": 0,  # Would need historical comparison
                "direction": "stable"
            },
            {
                "metric": "total_cases",
                "value": len(cases),
                "change": 0,
                "direction": "stable"
            }
        ]

        insights = []
        if avg_risk > 60:
            insights.append("Average risk score is high - consider increasing review resources")
        if severity_counts.get("high", 0) > len(cases) * 0.2:
            insights.append("High proportion of high-severity cases detected")

        recommendations = [
            "Monitor risk score trends weekly",
            "Review high-severity case handling procedures",
            "Consider additional training for investigators"
        ]

        return {
            "trends": trends,
            "insights": insights,
            "recommendations": recommendations,
            "severity_distribution": severity_counts,
            "outcome_distribution": outcome_counts
        }

    async def _simulate_what_if(self, db: AsyncSession, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Run what-if scenario analysis."""

        scenario = parameters.get("scenario", "")
        changes = parameters.get("changes", {})

        # This would analyze how changes affect case outcomes
        # For now, return a basic simulation

        return {
            "scenario": scenario,
            "baseline_outcome": "pending_review",
            "simulated_outcome": "approved",  # Based on changes
            "impact": "positive",
            "confidence": 0.7,
            "factors_affected": ["risk_score", "processing_time"]
        }

    async def _simulate_burn_rate(self, db: AsyncSession, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate burn rate based on case load."""

        case_load = parameters.get("case_load", 10)
        avg_resolution_time = parameters.get("avg_resolution_time", 14)  # days

        monthly_capacity = 30 / avg_resolution_time * case_load  # Cases per month
        burn_rate = case_load * 1000  # Assumed cost per case

        return {
            "monthly_capacity": round(monthly_capacity),
            "burn_rate": burn_rate,
            "bottlenecks": ["investigator_shortage"] if monthly_capacity < case_load else [],
            "recommendations": ["Increase team size"] if monthly_capacity < case_load else ["Maintain current capacity"]
        }

    async def _simulate_vendor_stress(self, db: AsyncSession, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate vendor stress testing."""

        vendor_id = parameters.get("vendor_id", "")
        stress_factor = parameters.get("stress_factor", 1.0)

        # Simulate how vendor issues affect cases
        return {
            "vendor_id": vendor_id,
            "stress_factor": stress_factor,
            "affected_cases": round(10 * stress_factor),
            "risk_increase": round(20 * stress_factor),
            "mitigation_steps": ["Diversify vendors", "Implement backup systems"]
        }

    async def _simulate_dependency_risk(self, db: AsyncSession, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate dependency risk modeling."""

        dependencies = parameters.get("dependencies", [])

        risk_scores = {}
        for dep in dependencies:
            # Calculate risk based on dependency type
            if "external" in dep.lower():
                risk_scores[dep] = 0.8
            elif "internal" in dep.lower():
                risk_scores[dep] = 0.3
            else:
                risk_scores[dep] = 0.5

        overall_risk = max(risk_scores.values()) if risk_scores else 0

        return {
            "dependency_risks": risk_scores,
            "overall_risk": overall_risk,
            "critical_dependencies": [k for k, v in risk_scores.items() if v > 0.7],
            "recommendations": ["Implement redundancy", "Regular risk assessments"]
        }


# Import here to avoid circular imports
from app.db.models import AnalysisResult
from uuid import UUID