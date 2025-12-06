"""
Comprehensive tests for visualization services.

Tests cover:
- CashflowAnalyzer with mirror transaction detection
- MilestoneDetector with clustering
- FraudIndicatorDetector with anomaly patterns
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import AsyncMock, Mock

from app.services.visualization import (
    CashflowAnalyzer,
    MilestoneDetector,
    FraudIndicatorDetector
)
from app.db.models import Transaction


class TestCashflowAnalyzer:
    """Test suite for CashflowAnalyzer"""
    
    @pytest.fixture
    def sample_transactions(self):
        """Create sample transactions for testing"""
        base_date = datetime(2024, 1, 1)
        return [
            Transaction(
                id="tx1",
                amount=Decimal("5000.00"),
                description="Income Source",
                date=base_date
            ),
            Transaction(
                id="tx2",
                amount=Decimal("-2000.00"),
                description="Project materials - concrete",
                date=base_date + timedelta(days=1)
            ),
            Transaction(
                id="tx3",
                amount=Decimal("-500.00"),
                description="Office rent",
                date=base_date + timedelta(days=2)
            ),
            Transaction(
                id="tx4",
                amount=Decimal("-200.00"),
                description="Personal expense",
                date=base_date + timedelta(days=3)
            ),
        ]
    
    @pytest.fixture
    def mirror_transactions(self):
        """Create mirror transaction pairs"""
        base_date = datetime(2024, 1, 1)
        return [
            Transaction(
                id="mirror1",
                amount=Decimal("1000.00"),
                description="Transfer in",
                date=base_date
            ),
            Transaction(
                id="mirror2",
                amount=Decimal("-1000.00"),
                description="Transfer out",
                date=base_date + timedelta(hours=1)
            ),
        ]
    
    @pytest.mark.asyncio
    async def test_basic_cashflow_analysis(self, sample_transactions):
        """Test basic cashflow calculation"""
        db = AsyncMock()
        
        result = await CashflowAnalyzer.analyze_cashflow(sample_transactions, db)
        
        assert result["total_inflow"] == 5000.0
        assert result["total_outflow"] == 2700.0
        assert result["net_cashflow"] == 2300.0
        assert len(result["cashflow_data"]) == 4
    
    @pytest.mark.asyncio
    async def test_income_categorization(self, sample_transactions):
        """Test income breakdown categorization"""
        db = AsyncMock()
        
        result = await CashflowAnalyzer.analyze_cashflow(sample_transactions, db)
        
        assert result["income_breakdown"]["income_sources"]["amount"] == 5000.0
        assert result["income_breakdown"]["income_sources"]["transactions"] == 1
    
    @pytest.mark.asyncio
    async def test_expense_categorization(self, sample_transactions):
        """Test expense breakdown by category"""
        db = AsyncMock()
        
        result = await CashflowAnalyzer.analyze_cashflow(sample_transactions, db)
        
        assert result["expense_breakdown"]["project_expenses"]["amount"] == 2000.0
        assert result["expense_breakdown"]["operational_expenses"]["amount"] == 500.0
        assert result["expense_breakdown"]["personal_expenses"]["amount"] == 200.0
    
    @pytest.mark.asyncio
    async def test_mirror_transaction_detection(self, mirror_transactions):
        """Test detection of mirror transaction pairs"""
        db = AsyncMock()
        
        result = await CashflowAnalyzer.analyze_cashflow(mirror_transactions, db)
        
        assert result["mirror_transaction_count"] == 2
        assert result["income_breakdown"]["mirror_transactions"]["amount"] == 1000.0
    
    @pytest.mark.asyncio
    async def test_project_summary(self, sample_transactions):
        """Test project summary calculation"""
        db = AsyncMock()
        
        result = await CashflowAnalyzer.analyze_cashflow(sample_transactions, db)
        
        summary = result["project_summary"]
        assert summary["total_project_spend"] == 2000.0
        assert summary["transaction_count"] == 1
        assert summary["average_transaction"] == 2000.0
        assert len(summary["top_transactions"]) == 1
    
    def test_project_expense_detection(self):
        """Test project expense keyword matching"""
        assert CashflowAnalyzer._is_project_expense("project materials")
        assert CashflowAnalyzer._is_project_expense("labor costs")
        assert CashflowAnalyzer._is_project_expense("concrete delivery")
        assert not CashflowAnalyzer._is_project_expense("office supplies")
    
    def test_operational_expense_detection(self):
        """Test operational expense keyword matching"""
        assert CashflowAnalyzer._is_operational_expense("office rent")
        assert CashflowAnalyzer._is_operational_expense("software license")
        assert CashflowAnalyzer._is_operational_expense("payroll")
        assert not CashflowAnalyzer._is_operational_expense("groceries")


class TestMilestoneDetector:
    """Test suite for MilestoneDetector"""
    
    @pytest.fixture
    def high_value_transactions(self):
        """Create high-value transactions"""
        base_date = datetime(2024, 1, 1)
        return [
            Transaction(
                id="high1",
                amount=Decimal("15000.00"),
                description="Large deposit",
                date=base_date
            ),
            Transaction(
                id="high2",
                amount=Decimal("-12000.00"),
                description="Major payment",
                date=base_date + timedelta(days=30)
            ),
        ]
    
    @pytest.fixture
    def clustered_transactions(self):
        """Create clustered payment transactions"""
        base_date = datetime(2024, 1, 1)
        return [
            Transaction(id=f"cluster{i}", amount=Decimal("-1000.00"), 
                       description=f"Payment {i}", date=base_date + timedelta(days=i))
            for i in range(5)
        ]
    
    @pytest.mark.asyncio
    async def test_high_value_milestone_detection(self, high_value_transactions):
        """Test detection of high-value transaction milestones"""
        milestones = await MilestoneDetector.detect_milestones(high_value_transactions)
        
        assert len(milestones) >= 2
        assert any(m["type"] == "high_value" for m in milestones)
        assert any(m["name"] == "High Value Deposit" for m in milestones)
        assert any(m["name"] == "High Value Payment" for m in milestones)
    
    @pytest.mark.asyncio
    async def test_payment_cluster_detection(self, clustered_transactions):
        """Test detection of payment clusters"""
        milestones = await MilestoneDetector.detect_milestones(clustered_transactions)
        
        # Should detect a cluster of 5 transactions
        cluster_milestones = [m for m in milestones if m.get("type") == "cluster"]
        assert len(cluster_milestones) >= 1
        
        if cluster_milestones:
            assert cluster_milestones[0]["amount"] == -5000.0  # Sum of 5x$1000
    
    @pytest.mark.asyncio
    async def test_empty_transactions(self):
        """Test milestone detection with empty transaction list"""
        milestones = await MilestoneDetector.detect_milestones([])
        assert milestones == []
    
    def test_phase_estimation(self):
        """Test project phase estimation"""
        base_date = datetime(2024, 1, 1)
        transactions = [
            Transaction(id=f"tx{i}", amount=Decimal("100.00"), 
                       date=base_date + timedelta(days=i*30))
            for i in range(3)
        ]
        
        # Early transaction should be Phase 1
        phase1 = MilestoneDetector._estimate_phase(base_date, transactions)
        assert "Phase 1" in phase1
        
        # Late transaction should be Phase 3
        phase3 = MilestoneDetector._estimate_phase(
            base_date + timedelta(days=70), 
            transactions
        )
        assert "Phase 3" in phase3


class TestFraudIndicatorDetector:
    """Test suite for FraudIndicatorDetector"""
    
    @pytest.fixture
    def anomalous_transactions(self):
        """Create transactions with anomalies"""
        base_date = datetime(2024, 1, 1)
        return [
            # Normal transactions
            *[Transaction(id=f"normal{i}", amount=Decimal("100.00"), 
                         description="Normal", date=base_date + timedelta(days=i))
              for i in range(10)],
            # Outlier
            Transaction(
                id="outlier",
                amount=Decimal("10000.00"),
                description="Unusual large amount",
                date=base_date + timedelta(days=11)
            ),
            # Round amount
            Transaction(
                id="round",
                amount=Decimal("5000.00"),
                description="Round amount",
                date=base_date + timedelta(days=12)
            ),
        ]
    
    @pytest.fixture
    def rapid_transactions(self):
        """Create rapid succession transactions"""
        base_date = datetime(2024, 1, 1, 10, 0, 0)
        return [
            Transaction(
                id="rapid1",
                amount=Decimal("-500.00"),
                description="First",
                date=base_date
            ),
            Transaction(
                id="rapid2",
                amount=Decimal("-500.00"),
                description="Second",
                date=base_date + timedelta(minutes=2)
            ),
        ]
    
    @pytest.mark.asyncio
    async def test_unusual_amount_detection(self, anomalous_transactions):
        """Test detection of statistically unusual amounts"""
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(
            anomalous_transactions,
            "test_subject"
        )
        
        unusual_amt_indicators = [i for i in indicators if i["type"] == "unusual_amount"]
        assert len(unusual_amt_indicators) > 0
        assert any(i["severity"] in ["high", "medium"] for i in unusual_amt_indicators)
    
    @pytest.mark.asyncio
    async def test_round_amount_detection(self, anomalous_transactions):
        """Test detection of round-number amounts"""
        indicators, _ = await FraudIndicatorDetector.detect_indicators(
            anomalous_transactions,
            "test_subject"
        )
        
        round_indicators = [i for i in indicators if i["type"] == "round_amount"]
        assert len(round_indicators) > 0
    
    @pytest.mark.asyncio
    async def test_rapid_succession_detection(self, rapid_transactions):
        """Test detection of rapid succession transactions"""
        indicators, _ = await FraudIndicatorDetector.detect_indicators(
            rapid_transactions,
            "test_subject"
        )
        
        rapid_indicators = [i for i in indicators if i["type"] == "rapid_succession"]
        assert len(rapid_indicators) > 0
        assert rapid_indicators[0]["severity"] == "medium"
    
    @pytest.mark.asyncio
    async def test_weekend_detection(self):
        """Test detection of weekend transactions"""
        # Saturday transaction
        weekend_tx = [
            Transaction(
                id="weekend",
                amount=Decimal("1000.00"),
                description="Weekend transaction",
                date=datetime(2024, 1, 6, 12, 0, 0)  # Saturday
            )
        ]
        
        indicators, _ = await FraudIndicatorDetector.detect_indicators(
            weekend_tx,
            "test_subject"
        )
        
        weekend_indicators = [i for i in indicators if i["type"] == "unusual_timing"]
        assert len(weekend_indicators) > 0
    
    @pytest.mark.asyncio
    async def test_risk_score_calculation(self, anomalous_transactions):
        """Test overall risk score calculation"""
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(
            anomalous_transactions,
            "test_subject"
        )
        
        assert 0 <= risk_score <= 100
        assert risk_score > 0  # Should have some indicators
    
    @pytest.mark.asyncio
    async def test_empty_transactions_risk(self):
        """Test risk score with no transactions"""
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(
            [],
            "test_subject"
        )
        
        assert indicators == []
        assert risk_score == 0.0
    
    def test_risk_score_calculation_logic(self):
        """Test risk score calculation from indicators"""
        indicators = [
            {"severity": "high"},
            {"severity": "medium"},
            {"severity": "low"},
        ]
        
        score = FraudIndicatorDetector._calculate_risk_score(indicators)
        
        # 30 (high) + 15 (medium) + 5 (low) = 50
        assert score == 50.0
    
    def test_risk_score_cap(self):
        """Test risk score is capped at 100"""
        # Create many high-severity indicators
        indicators = [{"severity": "high"} for _ in range(10)]
        
        score = FraudIndicatorDetector._calculate_risk_score(indicators)
        
        assert score == 100.0  # Should be capped


@pytest.mark.integration
class TestVisualizationIntegration:
    """Integration tests combining all visualization services"""
    
    @pytest.mark.asyncio
    async def test_full_visualization_pipeline(self):
        """Test complete visualization pipeline"""
        base_date = datetime(2024, 1, 1)
        
        # Create realistic transaction set
        transactions = [
            # Income
            Transaction(id="income1", amount=Decimal("50000.00"), 
                       description="Project funding", date=base_date),
            # Mirror pair
            Transaction(id="mirror1", amount=Decimal("5000.00"), 
                       description="Transfer in", date=base_date + timedelta(days=1)),
            Transaction(id="mirror2", amount=Decimal("-5000.00"), 
                       description="Transfer out", date=base_date + timedelta(hours=25)),
            # Project expenses
            Transaction(id="project1", amount=Decimal("-15000.00"), 
                       description="Construction materials", date=base_date + timedelta(days=5)),
            Transaction(id="project2", amount=Decimal("-10000.00"), 
                       description="Labor costs", date=base_date + timedelta(days=6)),
            # Anomaly
            Transaction(id="anomaly", amount=Decimal("-25000.00"), 
                       description="Large unexpected payment", date=base_date + timedelta(days=10)),
        ]
        
        db = AsyncMock()
        
        # Run cashflow analysis
        cashflow = await CashflowAnalyzer.analyze_cashflow(transactions, db)
        assert cashflow["mirror_transaction_count"] == 2
        assert cashflow["project_summary"]["total_project_spend"] == 25000.0
        
        # Run milestone detection
        milestones = await MilestoneDetector.detect_milestones(transactions)
        assert len(milestones) > 0
        
        # Run fraud detection
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(
            transactions,
            "test_case"
        )
        assert len(indicators) > 0
        assert risk_score > 0
