from typing import List
from app.schemas.analysis import RuleResult

class SARGeneratorService:
    def generate_narrative(self, subject_name: str, triggered_rules: List[RuleResult], risk_score: float) -> str:
        """
        Generates a Suspicious Activity Report (SAR) narrative based on 
        triggered heuristics. (Mocking an LLM response).
        """
        
        if not triggered_rules:
            return f"Review of subject {subject_name} yielded no specific suspicious indicators. Risk score remains low at {risk_score}."

        narrative = f"SUSPICIOUS ACTIVITY REPORT NARRATIVE\n"
        narrative += f"SUBJECT: {subject_name}\n"
        narrative += f"RISK SCORE: {risk_score}\n\n"
        
        narrative += "INTRODUCTION:\n"
        narrative += f"This report documents atypical financial activity observed for {subject_name} consistent with potential money laundering or illicit finance methodologies.\n\n"
        
        narrative += "OBSERVED ACTIVITY:\n"
        for rule in triggered_rules:
            narrative += f"- {rule.rule_name} (Severity: {rule.severity.upper()}): {rule.context}\n"
            if rule.rule_name == "Structuring (Smurfing)":
                narrative += "  Analysis indicates an attempt to evade reporting thresholds through multiple small transactions.\n"
            elif rule.rule_name == "Velocity Spike":
                narrative += "  Rapid movement of funds inconsistent with historical profile.\n"
            elif rule.rule_name == "High Risk Country":
                narrative += "  Transactions involve jurisdictions designated as high risk for financial crime.\n"
        
        narrative += "\nCONCLUSION:\n"
        narrative += f"Based on the cumulative weight of these indicators, the activity is deemed suspicious. Total risk score is {risk_score}. "
        narrative += "Metrics suggest a high probability of structured transactions intended to conceal the source or destination of funds.\n"
        
        return narrative
