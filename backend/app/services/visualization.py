"""
Visualization Services for Financial Analysis

Provides advanced cashflow analysis, milestone detection, and fraud indicators
for the visualization endpoints.
"""

from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import statistics

from app.db.models import Transaction, AnalysisResult, Subject


class CashflowAnalyzer:
    """
    Advanced cashflow analysis with mirror transaction detection
    and expense categorization.
    """
    
    @staticmethod
    async def analyze_cashflow(
        transactions: List[Transaction],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Analyze cashflow with sophisticated categorization.
        
        Args:
            transactions: List of Transaction objects
            db: Database session
            
        Returns:
            Dictionary with cashflow analysis including:
            - total_inflow/outflow/net
            - cashflow_data (time series)
            - income_breakdown (categorized)
            - expense_breakdown (categorized)
            - project_summary
        """
        total_inflow = 0.0
        total_outflow = 0.0
        current_balance = 0.0
        cashflow_data = []
        
        # Mirror transaction detection
        mirror_pairs = CashflowAnalyzer._detect_mirror_transactions(transactions)
        mirror_ids = set(mirror_pairs.keys())
        
        # Categorization buckets
        income_breakdown = {
            "income_sources": {"id": "income", "name": "Income Sources", "amount": 0.0, "transactions": 0},
            "mirror_transactions": {"id": "mirror", "name": "Mirror Transactions", "amount": 0.0, "transactions": 0},
            "external_transfers": {"id": "external", "name": "External Transfers", "amount": 0.0, "transactions": 0}
        }
        
        expense_breakdown = {
            "project_expenses": {"id": "project", "name": "Project Specific", "amount": 0.0, "transactions": 0},
            "operational_expenses": {"id": "ops", "name": "Operational Expenses", "amount": 0.0, "transactions": 0},
            "personal_expenses": {"id": "personal", "name": "Personal Expenses", "amount": 0.0, "transactions": 0}
        }
        
        project_transactions = []
        
        for tx in transactions:
            amt = float(tx.amount or 0)
            desc = (tx.description or "").lower()
            is_mirror = str(tx.id) in mirror_ids
            
            if amt > 0:
                total_inflow += amt
                
                # Categorize income
                if is_mirror:
                    income_breakdown["mirror_transactions"]["amount"] += amt
                    income_breakdown["mirror_transactions"]["transactions"] += 1
                elif any(k in desc for k in ["external", "wire", "ach incoming", "deposit"]):
                    income_breakdown["external_transfers"]["amount"] += amt
                    income_breakdown["external_transfers"]["transactions"] += 1
                else:
                    income_breakdown["income_sources"]["amount"] += amt
                    income_breakdown["income_sources"]["transactions"] += 1
            else:
                abs_amt = abs(amt)
                total_outflow += abs_amt
                
                # Categorize expenses (excluding mirrors from project calc)
                if not is_mirror:
                    if CashflowAnalyzer._is_project_expense(desc):
                        expense_breakdown["project_expenses"]["amount"] += abs_amt
                        expense_breakdown["project_expenses"]["transactions"] += 1
                        project_transactions.append({
                            "id": str(tx.id),
                            "date": tx.date.isoformat() if tx.date else None,
                            "amount": amt,
                            "description": tx.description or ""
                        })
                    elif CashflowAnalyzer._is_operational_expense(desc):
                        expense_breakdown["operational_expenses"]["amount"] += abs_amt
                        expense_breakdown["operational_expenses"]["transactions"] += 1
                    else:
                        expense_breakdown["personal_expenses"]["amount"] += abs_amt
                        expense_breakdown["personal_expenses"]["transactions"] += 1
            
            current_balance += amt
            
            cashflow_data.append({
                "date": tx.date.isoformat() if tx.date else "",
                "inflow": amt if amt > 0 else 0,
                "outflow": abs(amt) if amt < 0 else 0,
                "balance": current_balance,
                "is_mirror": is_mirror
            })
        
        # Calculate project summary
        project_summary = {
            "total_project_spend": expense_breakdown["project_expenses"]["amount"],
            "transaction_count": expense_breakdown["project_expenses"]["transactions"],
            "average_transaction": (
                expense_breakdown["project_expenses"]["amount"] / 
                expense_breakdown["project_expenses"]["transactions"]
                if expense_breakdown["project_expenses"]["transactions"] > 0 else 0
            ),
            "top_transactions": sorted(
                project_transactions,
                key=lambda x: abs(x["amount"]),
                reverse=True
            )[:10]
        }
        
        return {
            "total_inflow": total_inflow,
            "total_outflow": total_outflow,
            "net_cashflow": total_inflow - total_outflow,
            "cashflow_data": cashflow_data,
            "income_breakdown": income_breakdown,
            "expense_breakdown": expense_breakdown,
            "project_summary": project_summary,
            "mirror_transaction_count": len(mirror_ids)
        }
    
    @staticmethod
    def _detect_mirror_transactions(transactions: List[Transaction]) -> Dict[str, str]:
        """
        Detect mirror transactions (same amount, opposite direction, within 24h).
        
        Returns:
            Dictionary mapping transaction IDs to their mirror pair IDs
        """
        mirror_pairs = {}
        sorted_txs = sorted(transactions, key=lambda x: x.date or datetime.min)
        
        for i, tx1 in enumerate(sorted_txs):
            if str(tx1.id) in mirror_pairs:
                continue
                
            amt1 = float(tx1.amount or 0)
            date1 = tx1.date or datetime.min
            
            # Look ahead for mirror (opposite amount, within 24h)
            for tx2 in sorted_txs[i+1:i+50]:  # Check next 50 transactions
                amt2 = float(tx2.amount or 0)
                date2 = tx2.date or datetime.min
                
                # Check if amounts are opposite and within 1%
                if abs(amt1 + amt2) < abs(amt1) * 0.01:
                    # Check if within 24 hours
                    time_diff = abs((date2 - date1).total_seconds())
                    if time_diff < 86400:  # 24 hours
                        mirror_pairs[str(tx1.id)] = str(tx2.id)
                        mirror_pairs[str(tx2.id)] = str(tx1.id)
                        break
        
        return mirror_pairs
    
    @staticmethod
    def _is_project_expense(description: str) -> bool:
        """Check if transaction is a project-related expense."""
        project_keywords = [
            "project", "labor", "material", "concrete", "steel", "site",
            "construction", "contractor", "equipment", "permit", "inspection",
            "lumber", "plumbing", "electrical", "hvac", "roofing"
        ]
        return any(keyword in description for keyword in project_keywords)
    
    @staticmethod
    def _is_operational_expense(description: str) -> bool:
        """Check if transaction is an operational expense."""
        ops_keywords = [
            "office", "rent", "server", "software", "utility", "ops",
            "salary", "payroll", "insurance", "legal", "accounting",
            "marketing", "advertising", "cloud", "saas"
        ]
        return any(keyword in description for keyword in ops_keywords)


class MilestoneDetector:
    """
    Detect project milestones from transaction patterns.
    """
    
    @staticmethod
    async def detect_milestones(transactions: List[Transaction]) -> List[Dict[str, Any]]:
        """
        Detect milestones based on:
        - High-value transactions (>$10k)
        - Clustered payments
        - Significant balance changes
        
        Args:
            transactions: List of Transaction objects
            
        Returns:
            List of milestone dictionaries
        """
        milestones = []
        
        # Sort by date
        sorted_txs = sorted(
            [tx for tx in transactions if tx.date],
            key=lambda x: x.date
        )
        
        if not sorted_txs:
            return milestones
        
        # Detect high-value transactions
        for tx in sorted_txs:
            amt = float(tx.amount or 0)
            
            if abs(amt) > 10000:
                milestones.append({
                    "id": str(tx.id),
                    "name": f"High Value {'Deposit' if amt > 0 else 'Payment'}",
                    "date": tx.date.isoformat(),
                    "amount": amt,
                    "status": "complete",
                    "phase": MilestoneDetector._estimate_phase(tx.date, sorted_txs),
                    "description": tx.description or "",
                    "type": "high_value"
                })
        
        # Detect payment clusters (multiple transactions in short period)
        clusters = MilestoneDetector._detect_payment_clusters(sorted_txs)
        for cluster in clusters:
            milestones.append({
                "id": f"cluster-{cluster['start_date']}",
                "name": f"Payment Cluster ({cluster['count']} transactions)",
                "date": cluster["start_date"],
                "amount": cluster["total_amount"],
                "status": "complete",
                "phase": cluster["phase"],
                "description": f"{cluster['count']} payments totaling ${abs(cluster['total_amount']):,.2f}",
                "type": "cluster"
            })
        
        return sorted(milestones, key=lambda x: x["date"])
    
    @staticmethod
    def _estimate_phase(tx_date: datetime, all_transactions: List[Transaction]) -> str:
        """Estimate project phase based on transaction date."""
        if not all_transactions:
            return "Phase 1"
        
        start_date = all_transactions[0].date
        end_date = all_transactions[-1].date
        
        if not start_date or not end_date:
            return "Phase 1"
        
        total_duration = (end_date - start_date).days
        tx_duration = (tx_date - start_date).days
        
        if total_duration == 0:
            return "Phase 1"
        
        progress = tx_duration / total_duration
        
        if progress < 0.33:
            return "Phase 1: Foundation"
        elif progress < 0.67:
            return "Phase 2: Construction"
        else:
            return "Phase 3: Completion"
    
    @staticmethod
    def _detect_payment_clusters(transactions: List[Transaction]) -> List[Dict[str, Any]]:
        """Detect clusters of payments within 7-day windows."""
        clusters = []
        
        i = 0
        while i < len(transactions):
            tx = transactions[i]
            amt = float(tx.amount or 0)
            
            # Only cluster negative amounts (payments)
            if amt >= 0:
                i += 1
                continue
            
            cluster_txs = [tx]
            cluster_total = amt
            
            # Look ahead for more transactions within 7 days
            j = i + 1
            while j < len(transactions):
                next_tx = transactions[j]
                next_amt = float(next_tx.amount or 0)
                
                if next_tx.date and tx.date:
                    days_diff = (next_tx.date - tx.date).days
                    if days_diff <= 7 and next_amt < 0:
                        cluster_txs.append(next_tx)
                        cluster_total += next_amt
                        j += 1
                    else:
                        break
                else:
                    break
            
            # Only create cluster if 3+ transactions
            if len(cluster_txs) >= 3:
                clusters.append({
                    "start_date": tx.date.isoformat() if tx.date else "",
                    "count": len(cluster_txs),
                    "total_amount": cluster_total,
                    "phase": MilestoneDetector._estimate_phase(tx.date, transactions)
                })
                i = j
            else:
                i += 1
        
        return clusters


class FraudIndicatorDetector:
    """
    Detect fraud indicators using pattern analysis and anomaly detection.
    """
    
    @staticmethod
    async def detect_indicators(
        transactions: List[Transaction],
        subject_id: str
    ) -> Tuple[List[Dict[str, Any]], float]:
        """
        Detect fraud indicators and calculate risk score.
        
        Args:
            transactions: List of Transaction objects
            subject_id: Subject/case ID
            
        Returns:
            Tuple of (fraud_indicators, risk_score)
        """
        indicators = []
        
        if not transactions:
            return indicators, 0.0
        
        amounts = [float(tx.amount or 0) for tx in transactions]
        
        # Calculate statistics
        mean_amt = statistics.mean([abs(a) for a in amounts])
        stdev_amt = statistics.stdev([abs(a) for a in amounts]) if len(amounts) > 1 else 0
        
        # 1. Detect unusually large transactions (>3 std dev)
        threshold = mean_amt + (3 * stdev_amt) if stdev_amt > 0 else mean_amt * 2
        for tx in transactions:
            amt = abs(float(tx.amount or 0))
            if amt > threshold and amt > 1000:
                indicators.append({
                    "id": f"large-{tx.id}",
                    "type": "unusual_amount",
                    "severity": "high" if amt > threshold * 1.5 else "medium",
                    "transaction_id": str(tx.id),
                    "date": tx.date.isoformat() if tx.date else None,
                    "amount": tx.amount,
                    "description": f"Transaction amount ${amt:,.2f} exceeds threshold ${threshold:,.2f}",
                    "details": tx.description or ""
                })
        
        # 2. Detect round-number transactions (potential structuring)
        for tx in transactions:
            amt = abs(float(tx.amount or 0))
            if amt >= 1000 and amt % 1000 == 0:
                indicators.append({
                    "id": f"round-{tx.id}",
                    "type": "round_amount",
                    "severity": "low" if amt < 10000 else "medium",
                    "transaction_id": str(tx.id)",
                    "date": tx.date.isoformat() if tx.date else None,
                    "amount": tx.amount,
                    "description": f"Round-number transaction: ${amt:,.2f}",
                    "details": tx.description or ""
                })
        
        # 3. Detect rapid succession transactions
        sorted_txs = sorted([tx for tx in transactions if tx.date], key=lambda x: x.date)
        for i in range(len(sorted_txs) - 1):
            tx1 = sorted_txs[i]
            tx2 = sorted_txs[i + 1]
            
            if tx1.date and tx2.date:
                time_diff = (tx2.date - tx1.date).total_seconds()
                if time_diff < 300:  # 5 minutes
                    indicators.append({
                        "id": f"rapid-{tx1.id}-{tx2.id}",
                        "type": "rapid_succession",
                        "severity": "medium",
                        "transaction_id": f"{tx1.id},{tx2.id}",
                        "date": tx1.date.isoformat(),
                        "amount": float(tx1.amount or 0) + float(tx2.amount or 0),
                        "description": f"Two transactions {time_diff:.0f} seconds apart",
                        "details": f"{tx1.description or ''} | {tx2.description or ''}"
                    })
        
        # 4. Weekend/off-hours transactions
        for tx in transactions:
            if tx.date:
                if tx.date.weekday() >= 5:  # Saturday or Sunday
                    indicators.append({
                        "id": f"weekend-{tx.id}",
                        "type": "unusual_timing",
                        "severity": "low",
                        "transaction_id": str(tx.id),
                        "date": tx.date.isoformat(),
                        "amount": tx.amount,
                        "description": "Weekend transaction",
                        "details": tx.description or ""
                    })
        
        # Calculate risk score (0-100)
        risk_score = FraudIndicatorDetector._calculate_risk_score(indicators)
        
        return indicators, risk_score
    
    @staticmethod
    def _calculate_risk_score(indicators: List[Dict[str, Any]]) -> float:
        """Calculate overall risk score from indicators."""
        if not indicators:
            return 0.0
        
        severity_weights = {
            "high": 30,
            "medium": 15,
            "low": 5
        }
        
        total_score = sum(
            severity_weights.get(ind["severity"], 0)
            for ind in indicators
        )
        
        # Cap at 100
        return min(total_score, 100.0)
