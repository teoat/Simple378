from typing import List, Dict, Any
from statistics import mean, stdev
from app.services.ai.llm_service import LLMService
from langchain_core.messages import HumanMessage
import json


class AnomalyDetectionService:
    """
    AI-powered anomaly detection for financial transactions and patterns.
    """

    @staticmethod
    async def detect_anomalies(
        transactions: List[Dict[str, Any]], subject_info: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Detect anomalies in transaction data using AI analysis.
        """
        if not transactions:
            return []

        # First, do basic statistical analysis
        basic_anomalies = AnomalyDetectionService._basic_statistical_analysis(
            transactions
        )

        # Then, use AI for more sophisticated pattern recognition
        ai_anomalies = await AnomalyDetectionService._ai_pattern_analysis(
            transactions, subject_info or {}
        )

        # Combine and deduplicate
        all_anomalies = basic_anomalies + ai_anomalies
        return AnomalyDetectionService._deduplicate_anomalies(all_anomalies)

    @staticmethod
    def _basic_statistical_analysis(
        transactions: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Basic statistical anomaly detection.
        """
        anomalies = []

        if len(transactions) < 3:
            return anomalies

        # Extract amounts
        amounts = [
            abs(tx.get("amount", 0))
            for tx in transactions
            if tx.get("amount") is not None
        ]

        if not amounts:
            return anomalies

        # Calculate statistics
        avg_amount = mean(amounts)
        std_amount = stdev(amounts) if len(amounts) > 1 else 0

        # Detect amount outliers (3 sigma rule)
        threshold = avg_amount + 3 * std_amount

        for tx in transactions:
            amount = abs(tx.get("amount", 0))
            if amount > threshold and amount > 1000:  # Minimum threshold
                anomalies.append(
                    {
                        "id": f"statistical_{tx.get('id', 'unknown')}",
                        "type": "Amount Outlier",
                        "severity": "medium" if amount > threshold * 1.5 else "low",
                        "description": f"Unusually large transaction: ${amount:,.2f} (avg: ${avg_amount:,.2f})",
                        "amount": amount,
                        "count": 1,
                        "trend": "stable",
                        "confidence": 0.8,
                        "detection_method": "statistical",
                    }
                )

        # Detect velocity anomalies (transactions per day)
        date_groups = {}
        for tx in transactions:
            date_str = tx.get("date", "").split("T")[0] if tx.get("date") else "unknown"
            if date_str not in date_groups:
                date_groups[date_str] = []
            date_groups[date_str].append(tx)

        avg_daily_tx = len(transactions) / max(len(date_groups), 1)

        for date, txs in date_groups.items():
            if len(txs) > avg_daily_tx * 3:  # 3x average daily transactions
                total_amount = sum(abs(tx.get("amount", 0)) for tx in txs)
                anomalies.append(
                    {
                        "id": f"velocity_{date}",
                        "type": "Velocity Spike",
                        "severity": "high" if len(txs) > avg_daily_tx * 5 else "medium",
                        "description": f"High transaction frequency on {date}: {len(txs)} transactions (avg: {avg_daily_tx:.1f}/day)",
                        "amount": total_amount,
                        "count": len(txs),
                        "trend": "up",
                        "confidence": 0.9,
                        "detection_method": "statistical",
                    }
                )

        return anomalies

    @staticmethod
    async def _ai_pattern_analysis(
        transactions: List[Dict[str, Any]], subject_info: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Use AI to detect complex patterns and anomalies.
        """
        llm_service = LLMService()

        # Prepare transaction summary for AI
        tx_summary = []
        for tx in transactions[-50:]:  # Last 50 transactions for context
            tx_summary.append(
                {
                    "date": tx.get("date", ""),
                    "amount": tx.get("amount", 0),
                    "description": tx.get("description", "")[
                        :100
                    ],  # Truncate long descriptions
                    "source_bank": tx.get("source_bank", ""),
                }
            )

        prompt = f"""You are an expert financial fraud investigator. Analyze the following transaction data for suspicious patterns and anomalies.

TRANSACTION DATA (last {len(tx_summary)} transactions):
{json.dumps(tx_summary, indent=2)}

SUBJECT CONTEXT:
{json.dumps(subject_info, indent=2)}

Look for these types of anomalies:
1. Structuring (smurfing): Multiple transactions just below reporting thresholds
2. Layering: Complex chains of transactions to obscure money trail
3. Round-trip transactions: Funds moving in circles
4. Unusual velocity: Sudden spikes in transaction frequency
5. Geographic anomalies: Transactions from unexpected locations
6. Merchant anomalies: Transactions with unusual merchants or descriptions
7. Amount patterns: Systematic patterns in transaction amounts
8. Temporal patterns: Unusual timing of transactions

For each anomaly you detect, provide:
- type: The type of anomaly (e.g., "Structuring", "Velocity", "Layering")
- severity: "high", "medium", or "low"
- description: Clear explanation of the suspicious pattern
- amount: Total amount involved in this anomaly
- count: Number of transactions involved
- confidence: Your confidence level (0.0-1.0)

Return your findings as a JSON array. Only include genuine anomalies, not normal business activity."""

        try:
            messages = [HumanMessage(content=prompt)]
            response = await llm_service.generate_response(messages)

            # Parse the JSON response
            ai_findings = json.loads(response)

            # Format the findings
            formatted_anomalies = []
            for finding in ai_findings:
                if isinstance(finding, dict) and "type" in finding:
                    formatted_anomalies.append(
                        {
                            "id": f"ai_{finding['type'].lower().replace(' ', '_')}_{len(formatted_anomalies)}",
                            "type": finding["type"],
                            "severity": finding.get("severity", "medium"),
                            "description": finding.get(
                                "description", "AI-detected anomaly"
                            ),
                            "amount": float(finding.get("amount", 0)),
                            "count": int(finding.get("count", 1)),
                            "trend": "stable",  # AI doesn't specify trend
                            "confidence": float(finding.get("confidence", 0.7)),
                            "detection_method": "ai",
                        }
                    )

            return formatted_anomalies

        except Exception as e:
            print(f"AI anomaly detection failed: {e}")
            return []

    @staticmethod
    def _deduplicate_anomalies(anomalies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate or overlapping anomalies.
        """
        # Simple deduplication based on type and description similarity
        unique_anomalies = []
        seen = set()

        for anomaly in anomalies:
            key = f"{anomaly['type']}_{anomaly['description'][:50]}"
            if key not in seen:
                seen.add(key)
                unique_anomalies.append(anomaly)

        return unique_anomalies

    @staticmethod
    def calculate_risk_score_from_anomalies(anomalies: List[Dict[str, Any]]) -> float:
        """
        Calculate an overall risk score based on detected anomalies.
        """
        if not anomalies:
            return 10.0  # Base low risk

        score = 10.0  # Base score

        severity_weights = {"high": 20, "medium": 10, "low": 5}

        confidence_multiplier = {
            "ai": 1.2,  # AI detections get higher weight
            "statistical": 1.0,
        }

        for anomaly in anomalies:
            severity_weight = severity_weights.get(
                anomaly.get("severity", "medium"), 10
            )
            method_multiplier = confidence_multiplier.get(
                anomaly.get("detection_method", "statistical"), 1.0
            )
            confidence = anomaly.get("confidence", 0.5)

            score += severity_weight * method_multiplier * confidence

        return min(score, 100.0)  # Cap at 100
