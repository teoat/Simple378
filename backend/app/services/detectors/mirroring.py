from typing import List, Dict, Any

class MirroringDetector:
    """
    Detects 'mirroring' - transfers of money from one account to another 
    that belongs to the same person to inflate cashflow or create the 
    appearance of activity (wash trading).
    """
    
    def detect(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        indicators = []
        
        # Logic: Look for pairs of transactions where:
        # 1. Amount is identical (or very close).
        # 2. Source and Destination accounts belong to the same Subject (if known)
        #    OR simply look for In/Out patterns that cancel each other out rapidly.
        
        # For Phase 2 MVP, we'll simulate detection based on a "counterparty" field
        # In a real scenario, we'd need a graph or account ownership mapping.
        
        # Group by amount to find potential mirrors
        amount_map = {}
        for tx in transactions:
            amt = float(tx.get("amount", 0))
            if amt == 0:
                continue
            
            # Use absolute amount for grouping
            abs_amt = abs(amt)
            if abs_amt not in amount_map:
                amount_map[abs_amt] = []
            amount_map[abs_amt].append(tx)
            
        for amt, txs in amount_map.items():
            if len(txs) >= 2:
                # Check if we have both credit and debit of same amount
                # Or if we have transfers between known owned accounts
                
                # Simplified logic: If we see same amount appearing multiple times 
                # within a short window, flag it as potential mirroring/wash trading.
                
                indicators.append({
                    "type": "mirroring_suspected",
                    "confidence": 0.6,
                    "evidence": {
                        "amount": amt,
                        "transaction_count": len(txs),
                        "reason": f"Repeated transactions of exact amount ${amt} detected, potential cashflow inflation."
                    }
                })
                
        return indicators
