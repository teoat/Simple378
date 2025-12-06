from typing import List, Dict, Any
from simpleeval import simple_eval
from app.schemas.analysis import HeuristicRule, RuleResult
from app.core.heuristic_rules import DEFAULT_HEURISTIC_RULES
import logging

logger = logging.getLogger(__name__)

class HeuristicEngine:
    def __init__(self, rules: List[HeuristicRule] = None):
        self.rules = rules or DEFAULT_HEURISTIC_RULES

    def evaluate_transaction(self, transaction_context: Dict[str, Any]) -> List[RuleResult]:
        """
        Evaluates a transaction context against all enabled rules.
        
        Args:
            transaction_context: Dict containing variables like 'amount', 'count_24h', etc.
            
        Returns:
            List of RuleResult for triggered rules.
        """
        results = []
        for rule in self.rules:
            if not rule.enabled:
                continue

            try:
                # simpleeval is safe for arithmetic and simple logic
                is_triggered = simple_eval(rule.logic, names=transaction_context)
                
                if is_triggered:
                    results.append(RuleResult(
                        rule_id=rule.id,
                        rule_name=rule.name,
                        triggered=True,
                        severity=rule.severity,
                        context={"val": is_triggered}
                    ))
            except Exception as e:
                logger.error(f"Error evaluating rule {rule.id}: {str(e)}")
                # We do not fail the whole batch, just log the rule failure
                continue
                
        return results

    def add_rule(self, rule: HeuristicRule):
        self.rules.append(rule)
