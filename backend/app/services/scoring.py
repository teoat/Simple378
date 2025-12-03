from typing import List, Dict, Any
from app.models.mens_rea import AnalysisResult
import networkx as nx

class ScoringService:
    def __init__(self):
        pass

    async def calculate_evidence_quality(self, metadata: Dict[str, Any]) -> float:
        """
        Calculates a quality score (0.0 - 1.0) based on file metadata.
        """
        score = 0.0
        if not metadata:
            return score

        # Example heuristics
        if metadata.get("has_gps"):
            score += 0.3
        if metadata.get("camera_model"):
            score += 0.2
        if metadata.get("original_date"):
            score += 0.3
        if not metadata.get("is_edited", False):
            score += 0.2
            
        return min(score, 1.0)

    async def match_expenses_transactions(
        self, expense: Dict[str, Any], transaction: Dict[str, Any]
    ) -> float:
        """
        Calculates a match confidence score (0.0 - 1.0) between an expense and a bank transaction.
        """
        score = 0.0
        
        # Exact amount match
        if abs(expense["amount"] - transaction["amount"]) < 0.01:
            score += 0.5
            
        # Date match (within 2 days)
        # Assuming date strings are ISO format for simplicity in this MVP
        # In prod, parse to datetime objects
        if expense["date"] == transaction["date"]:
            score += 0.3
            
        # Merchant fuzzy match (placeholder)
        if expense["merchant"].lower() in transaction["description"].lower():
            score += 0.2
            
        return min(score, 1.0)

    async def calculate_fraud_confidence(
        self, 
        mens_rea_results: List[AnalysisResult], 
        graph_risk_score: float
    ) -> float:
        """
        Calculates the overall fraud confidence score (0.0 - 1.0).
        """
        base_score = 0.0
        
        # Mens Rea impact
        for result in mens_rea_results:
            if result.severity == "high":
                base_score += 0.4
            elif result.severity == "medium":
                base_score += 0.2
            elif result.severity == "low":
                base_score += 0.1
                
        # Graph risk impact
        base_score += (graph_risk_score * 0.3)
        
        return min(base_score, 1.0)
