from typing import List
from app.schemas.analysis import HeuristicRule

DEFAULT_HEURISTIC_RULES: List[HeuristicRule] = [
    HeuristicRule(
        id="RULE_001",
        name="Structuring (Smurfing)",
        description="Multiple transactions just below reporting threshold ($10,000)",
        severity="high",
        logic="9000 <= amount < 10000 and count_24h > 2",
    ),
    HeuristicRule(
        id="RULE_002",
        name="Velocity Spike",
        description="Unusual number of transactions in a short period",
        severity="medium",
        logic="transaction_count_1h > 10",
    ),
    HeuristicRule(
        id="RULE_003",
        name="Round Number Anomaly",
        description="High value round number transactions",
        severity="medium",
        logic="amount > 1000 and amount % 100 == 0",
    ),
    HeuristicRule(
        id="RULE_004",
        name="High Risk Country",
        description="Transaction involving high risk jurisdiction",
        severity="critical",
        logic="'high_risk' in country_tags",
    ),
    HeuristicRule(
        id="RULE_005",
        name="New Account Burst",
        description="High activity immediately after account creation",
        severity="high",
        logic="account_age_days < 7 and total_volume_24h > 50000",
    ),
    HeuristicRule(
        id="RULE_006",
        name="Rapid Movement (Layering)",
        description="Funds moved in and out quickly",
        severity="high",
        logic="inflow_outflow_ratio > 0.9 and turnover_time_hours < 24",
    ),
]
