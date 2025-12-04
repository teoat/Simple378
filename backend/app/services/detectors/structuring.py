from typing import List, Dict, Any

class StructuringDetector:
    """
    Detects 'structuring' or 'smurfing' - breaking down large transactions 
    into smaller ones to evade reporting thresholds (e.g., $10,000).
    """
    
    THRESHOLD_AMOUNT = 10000.0
    NEAR_THRESHOLD_PCT = 0.9  # 90% of threshold (e.g., $9,000)
    
    def detect(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        indicators = []
        
        # Logic: Look for multiple deposits just below the threshold within a short window
        # For Phase 2 MVP, we'll do a simple check on individual transactions
        # In a real scenario, this would need a time-window aggregation
        
        for tx in transactions:
            amount = float(tx.get("amount", 0))
            if amount > 0 and self.THRESHOLD_AMOUNT * self.NEAR_THRESHOLD_PCT <= amount < self.THRESHOLD_AMOUNT:
                indicators.append({
                    "type": "structuring_attempt",
                    "confidence": 0.7,
                    "evidence": {
                        "transaction_id": tx.get("id"),
                        "amount": amount,
                        "reason": f"Transaction amount ${amount} is just below the reporting threshold of ${self.THRESHOLD_AMOUNT}"
                    }
                })
                
        return indicators
