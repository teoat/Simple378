from typing import Dict, Any, List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.db.models import Subject, Transaction
from app.db.models import AnalysisResult
from app.services.ai.llm_service import LLMService


class CaseClassifier:
    """
    AI-powered case categorization and intelligent routing system.
    """

    def __init__(self):
        self.llm_service = LLMService()

    async def categorize_case(
        self, subject_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Automatically categorize a case based on transaction patterns and risk factors.
        """
        # Get case data
        case_data = await self._get_case_data(subject_id, db)

        if not case_data:
            return {
                "category": "unknown",
                "confidence": 0.0,
                "reasoning": "Insufficient data for categorization",
            }

        # Prepare analysis prompt
        prompt = f"""
You are an expert fraud investigator categorizing a case. Based on the following case data, determine the most appropriate category and risk level:

Case Data:
- Subject: {case_data['subject_name']}
- Risk Score: {case_data['risk_score']}/100
- Transaction Count: {case_data['transaction_count']}
- Total Amount: ${case_data['total_amount']:,.2f}
- Date Range: {case_data['date_range']}
- Status: {case_data['status']}

Transaction Patterns:
{chr(10).join([f"- {tx['description']}: ${tx['amount']} on {tx['date']}" for tx in case_data['recent_transactions'][:5]])}

Categories:
1. MONEY_LAUNDERING - Suspicious money movement patterns
2. FRAUD - Direct fraudulent activity (check fraud, identity theft, etc.)
3. REGULATORY_VIOLATION - AML/KYC compliance issues
4. SUSPICIOUS_ACTIVITY - Unusual but not clearly fraudulent patterns
5. NORMAL_ACTIVITY - Standard financial behavior

Risk Levels: LOW, MEDIUM, HIGH, CRITICAL

Provide a JSON response with:
- category: The most appropriate category
- risk_level: LOW/MEDIUM/HIGH/CRITICAL
- confidence: 0.0-1.0 confidence score
- reasoning: Brief explanation of categorization
- recommended_actions: Array of suggested next steps
"""

        try:
            messages = [{"role": "user", "content": prompt}]
            response = await self.llm_service.generate_response(messages)

            # Parse JSON response
            import json

            result = json.loads(response.content)

            return {
                "category": result.get("category", "SUSPICIOUS_ACTIVITY"),
                "risk_level": result.get("risk_level", "MEDIUM"),
                "confidence": result.get("confidence", 0.7),
                "reasoning": result.get("reasoning", "AI-powered categorization"),
                "recommended_actions": result.get("recommended_actions", []),
            }

        except Exception as e:
            print(f"AI categorization error: {e}")
            # Fallback categorization based on risk score
            risk_score = case_data["risk_score"]
            if risk_score >= 80:
                category, risk_level = "MONEY_LAUNDERING", "CRITICAL"
            elif risk_score >= 60:
                category, risk_level = "FRAUD", "HIGH"
            elif risk_score >= 40:
                category, risk_level = "SUSPICIOUS_ACTIVITY", "MEDIUM"
            else:
                category, risk_level = "NORMAL_ACTIVITY", "LOW"

            return {
                "category": category,
                "risk_level": risk_level,
                "confidence": 0.6,
                "reasoning": f"Rule-based categorization based on risk score {risk_score}",
                "recommended_actions": [
                    "Review transaction patterns",
                    "Verify subject identity",
                ],
            }

    async def suggest_routing(
        self, subject_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Suggest optimal routing for case investigation based on category and workload.
        """
        # Get case categorization
        categorization = await self.categorize_case(subject_id, db)

        # Get available investigators and their workloads
        investigators = await self._get_investigator_workloads(db)

        # Route based on category and risk level
        routing_suggestion = self._calculate_routing(categorization, investigators)

        return {
            "suggested_investigator": routing_suggestion["investigator"],
            "priority": routing_suggestion["priority"],
            "estimated_time": routing_suggestion["estimated_time"],
            "reasoning": routing_suggestion["reasoning"],
            "category": categorization,
        }

    async def _get_case_data(
        self, subject_id: str, db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """Get comprehensive case data for analysis."""
        try:
            subject_uuid = uuid.UUID(subject_id)

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

            # Get recent transactions
            tx_query = (
                select(Transaction)
                .where(Transaction.subject_id == subject_uuid)
                .order_by(desc(Transaction.date))
                .limit(10)
            )

            tx_result = await db.execute(tx_query)
            transactions = tx_result.scalars().all()

            # Calculate date range
            if transactions:
                dates = [tx.date for tx in transactions if tx.date]
                date_range = (
                    f"{min(dates).strftime('%Y-%m-%d')} to {max(dates).strftime('%Y-%m-%d')}"
                    if dates
                    else "N/A"
                )
            else:
                date_range = "N/A"

            return {
                "subject_name": (
                    subject.encrypted_pii.get("name", f"Subject {subject_id[:8]}")
                    if subject.encrypted_pii
                    else f"Subject {subject_id[:8]}"
                ),
                "risk_score": analysis.risk_score if analysis else 0,
                "transaction_count": len(transactions),
                "total_amount": sum(float(tx.amount or 0) for tx in transactions),
                "date_range": date_range,
                "status": analysis.adjudication_status if analysis else "new",
                "recent_transactions": [
                    {
                        "date": tx.date.strftime("%Y-%m-%d") if tx.date else "N/A",
                        "amount": float(tx.amount or 0),
                        "description": tx.description or "No description",
                    }
                    for tx in transactions
                ],
            }

        except Exception as e:
            print(f"Error getting case data: {e}")
            return None

    async def _get_investigator_workloads(
        self, db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Get current investigator workloads (mock implementation)."""
        # In a real implementation, this would query user assignments and workloads
        return [
            {
                "id": "investigator_1",
                "name": "Senior Investigator",
                "specialty": "money_laundering",
                "current_cases": 5,
                "capacity": 10,
                "experience_level": "senior",
            },
            {
                "id": "investigator_2",
                "name": "Fraud Analyst",
                "specialty": "fraud",
                "current_cases": 3,
                "capacity": 8,
                "experience_level": "mid",
            },
            {
                "id": "investigator_3",
                "name": "Compliance Officer",
                "specialty": "regulatory",
                "current_cases": 7,
                "capacity": 12,
                "experience_level": "senior",
            },
        ]

    def _calculate_routing(
        self, categorization: Dict[str, Any], investigators: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate optimal routing based on case category and investigator availability."""

        category = categorization["category"]
        risk_level = categorization["risk_level"]

        # Map categories to specialties
        specialty_mapping = {
            "MONEY_LAUNDERING": "money_laundering",
            "FRAUD": "fraud",
            "REGULATORY_VIOLATION": "regulatory",
            "SUSPICIOUS_ACTIVITY": "fraud",
            "NORMAL_ACTIVITY": "fraud",
        }

        required_specialty = specialty_mapping.get(category, "fraud")

        # Find best investigator
        best_investigator = None
        best_score = -1

        for investigator in investigators:
            if investigator["specialty"] == required_specialty:
                # Calculate fitness score
                workload_ratio = (
                    investigator["current_cases"] / investigator["capacity"]
                )
                experience_bonus = (
                    1.5 if investigator["experience_level"] == "senior" else 1.0
                )

                # Prefer less loaded investigators
                score = (1 - workload_ratio) * experience_bonus

                if score > best_score:
                    best_score = score
                    best_investigator = investigator

        # Fallback to any available investigator
        if not best_investigator:
            best_investigator = min(
                investigators, key=lambda x: x["current_cases"] / x["capacity"]
            )

        # Calculate priority and time estimates
        priority_map = {
            "CRITICAL": "urgent",
            "HIGH": "high",
            "MEDIUM": "normal",
            "LOW": "low",
        }

        time_estimates = {
            "CRITICAL": "2-4 hours",
            "HIGH": "4-8 hours",
            "MEDIUM": "1-2 days",
            "LOW": "2-3 days",
        }

        return {
            "investigator": best_investigator["name"],
            "investigator_id": best_investigator["id"],
            "priority": priority_map.get(risk_level, "normal"),
            "estimated_time": time_estimates.get(risk_level, "1-2 days"),
            "reasoning": f"Case categorized as {category} with {risk_level} risk. Assigned to {best_investigator['name']} based on specialty match and current workload.",
        }
