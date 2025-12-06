from typing import List, Dict, Any, Optional
from decimal import Decimal
import re

class RedactionAnalyzer:
    """
    Service to analyze redacted transactions and infer missing information
    using heuristics like sequence gaps and running balance calculations.
    """

    @staticmethod
    def analyze_sequence_gaps(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identify gaps in transaction sequences (e.g., Check numbers).
        Expects transactions to have 'description' and 'date'.
        """
        # Regex to find check numbers (e.g., "CHECK #1234" or "CHK 1234")
        check_pattern = re.compile(r'(?:CHECK|CHK|NO\.?)\s*#?\s*(\d+)', re.IGNORECASE)
        
        check_numbers = []
        for tx in transactions:
            match = check_pattern.search(tx.get("description", ""))
            if match:
                check_num = int(match.group(1))
                check_numbers.append({
                    "number": check_num,
                    "tx_id": tx.get("id"),
                    "date": tx.get("date")
                })
        
        check_numbers.sort(key=lambda x: x["number"])
        
        gaps = []
        for i in range(len(check_numbers) - 1):
            current = check_numbers[i]
            next_check = check_numbers[i+1]
            
            diff = next_check["number"] - current["number"]
            if diff > 1:
                # Found a gap
                for missing_num in range(current["number"] + 1, next_check["number"]):
                    gaps.append({
                        "type": "missing_check",
                        "inferred_value": f"CHECK #{missing_num}",
                        "confidence": 0.9,
                        "context": f"Gap between #{current['number']} ({current['date']}) and #{next_check['number']} ({next_check['date']})"
                    })
                    
        return gaps

    @staticmethod
    def analyze_running_balance(
        transactions: List[Dict[str, Any]], 
        start_balance: Decimal, 
        end_balance: Decimal
    ) -> List[Dict[str, Any]]:
        """
        Verify if transactions sum up to the difference between start and end balance.
        If not, suggest a redacted amount.
        """
        total_delta = end_balance - start_balance
        
        tx_sum = sum(Decimal(str(tx.get("amount", 0))) for tx in transactions)
        
        discrepancy = total_delta - tx_sum
        
        findings = []
        if abs(discrepancy) > Decimal("0.01"):
            findings.append({
                "type": "balance_discrepancy",
                "inferred_value": float(discrepancy),
                "confidence": 1.0, # Math is certain
                "context": f"Calculated sum {tx_sum} does not match statement delta {total_delta}"
            })
            
        return findings

    @staticmethod
    def analyze_partial_metadata(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze partial metadata to infer merchant names or categories.
        """
        findings = []
        # Placeholder for more complex pattern matching
        # Example: identifying recurring redacted payments based on amount frequency
        
        return findings
