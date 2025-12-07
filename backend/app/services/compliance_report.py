from datetime import datetime
from typing import Dict, Any
from app.schemas.analysis import RiskForecast, AnalysisResult


class ComplianceReportService:
    def generate_heuristic_report(
        self, subject_id: str, analysis_result: AnalysisResult, forecast: RiskForecast
    ) -> Dict[str, Any]:
        """
        Generates a comprehensive compliance report combining heuristics and forecasting.
        """

        report = {
            "report_id": f"RPT-{subject_id}-{int(datetime.utcnow().timestamp())}",
            "generated_at": datetime.utcnow().isoformat(),
            "subject_id": subject_id,
            "risk_assessment": {
                "current_score": analysis_result.risk_score,
                "projected_score_30d": forecast.forecast_30_days,
                "trend": forecast.trend,
                "confidence_level": (
                    "High" if len(analysis_result.triggered_rules) > 2 else "Medium"
                ),
            },
            "heuristic_analysis": {
                "total_rules_checked": len(analysis_result.triggered_rules)
                + 5,  # Mock total
                "rules_triggered_count": len(analysis_result.triggered_rules),
                "triggered_details": [
                    {
                        "rule_id": r.rule_id,
                        "name": r.rule_name,
                        "severity": r.severity,
                        "timestamp": r.timestamp.isoformat(),
                    }
                    for r in analysis_result.triggered_rules
                ],
            },
            "recommendation": self._derive_recommendation(
                analysis_result.risk_score, forecast.forecast_30_days
            ),
        }

        return report

    def _derive_recommendation(self, current_score: float, future_score: float) -> str:
        score = max(current_score, future_score)
        if score >= 90:
            return "IMMEDIATE_FILING_REQUIRED"
        elif score >= 70:
            return "ENHANCED_DUE_DILIGENCE"
        elif score >= 50:
            return "MONITOR_CLOSELY"
        else:
            return "NO_ACTION_REQUIRED"
