"""
Unit tests for visualization service categorization and fraud detection logic.
"""
import pytest
from datetime import datetime, timedelta
from decimal import Decimal

from app.services.visualization import (
    TransactionCategorizer,
    CashflowAnalyzer,
    MilestoneDetector,
    FraudIndicatorDetector
)


class MockTransaction:
    """Mock Transaction model for testing."""
    def __init__(self, amount, description, date=None, id=None, source_bank=None):
        self.id = id or 1
        self.amount = Decimal(str(amount))
        self.description = description
        self.date = date or datetime.now()
        self.source_bank = source_bank


class TestTransactionCategorizer:
    """Tests for transaction categorization logic."""
    
    def test_is_mirror_transaction_positive_cases(self):
        """Test mirror transaction detection with positive cases."""
        assert TransactionCategorizer.is_mirror_transaction("Transfer between accounts")
        assert TransactionCategorizer.is_mirror_transaction("Internal transfer to savings")
        assert TransactionCategorizer.is_mirror_transaction("Account to account movement")
        assert TransactionCategorizer.is_mirror_transaction("Self transfer")
        assert TransactionCategorizer.is_mirror_transaction("Own account transfer")

    def test_is_mirror_transaction_negative_cases(self):
        """Test mirror transaction detection with negative cases."""
        assert not TransactionCategorizer.is_mirror_transaction("Payment to vendor")
        assert not TransactionCategorizer.is_mirror_transaction("Grocery shopping")
        assert not TransactionCategorizer.is_mirror_transaction("Monthly rent")
        assert not TransactionCategorizer.is_mirror_transaction("")
        assert not TransactionCategorizer.is_mirror_transaction(None)

    def test_categorize_personal_expense(self):
        """Test personal expense categorization."""
        assert TransactionCategorizer.categorize_personal_expense("Starbucks coffee") == "food_dining"
        assert TransactionCategorizer.categorize_personal_expense("Amazon purchase") == "shopping"
        assert TransactionCategorizer.categorize_personal_expense("Netflix subscription") == "entertainment"
        assert TransactionCategorizer.categorize_personal_expense("Uber ride") == "travel_personal"
        assert TransactionCategorizer.categorize_personal_expense("Pharmacy visit") == "healthcare"
        assert TransactionCategorizer.categorize_personal_expense("Electric bill") == "utilities"
        assert TransactionCategorizer.categorize_personal_expense("Project payment") is None

    def test_categorize_operational_expense(self):
        """Test operational expense categorization."""
        assert TransactionCategorizer.categorize_operational_expense ("Payroll processing") == "payroll"
        assert TransactionCategorizer.categorize_operational_expense("Office rent") == "rent"
        assert TransactionCategorizer.categorize_operational_expense("AWS cloud services") == "software"
        assert TransactionCategorizer.categorize_operational_expense("Marketing campaign") == "marketing"
        assert TransactionCategorizer.categorize_operational_expense("Legal fees") == "legal"
        assert TransactionCategorizer.categorize_operational_expense("Restaurant meal") is None

    def test_is_project_expense(self):
        """Test project expense detection."""
        assert TransactionCategorizer.is_project_expense("Project materials")
        assert TransactionCategorizer.is_project_expense("Case consulting fee")
        assert TransactionCategorizer.is_project_expense("Contractor payment")
        assert TransactionCategorizer.is_project_expense("Equipment for project")
        assert not TransactionCategorizer.is_project_expense("Personal shopping")
        assert not TransactionCategorizer.is_project_expense("")


class TestCashflowAnalyzer:
    """Tests for cashflow analysis calculations."""
    
    @pytest.mark.asyncio
    async def test_analyze_cashflow_basic(self, db_session):
        """Test basic cashflow analysis."""
        transactions = [
            MockTransaction(amount=1000, description="Income deposit", id=1),
            MockTransaction(amount=-200, description="Starbucks coffee", id=2),  # Personal
            MockTransaction(amount=-300, description="Project materials", id=3),  # Project
            MockTransaction(amount=500, description="Transfer between accounts", id=4),  # Mirror
        ]
        
        result = await CashflowAnalyzer.analyze_cashflow(transactions, db_session)
        
        assert result['total_inflow'] == 1500  # 1000 + 500
        assert result['total_outflow'] == 500   # 200 + 300
        assert result['net_cashflow'] == 1000   # 1500 - 500
        
        # Check categorization
        assert result['income_breakdown']['mirror_transactions']['amount'] == 500
        assert result['expense_breakdown']['personal_expenses']['amount'] == 200
        assert result['expense_breakdown']['project_expenses']['amount'] == 300

    @pytest.mark.asyncio
    async def test_project_summary_calculation(self, db_session):
        """Test project transaction calculation formula."""
        transactions = [
            MockTransaction(amount=10000, description="Total income", id=1),
            MockTransaction(amount=-1000, description="Mirror transfer", id=2),
            MockTransaction(amount=-500, description="Amazon shopping", id=3),  # Personal
        ]
        
        result = await CashflowAnalyzer.analyze_cashflow(transactions, db_session)
        
        # Formula: Total Inflow - Mirror - Personal = Project
        expected_project = 10000 - 1000 - 500
        assert result['project_summary']['net_project_transactions'] == expected_project

    @pytest.mark.asyncio
    async def test_empty_transactions(self, db_session):
        """Test handling of empty transaction list."""
        result = await CashflowAnalyzer.analyze_cashflow([], db_session)
        
        assert result['total_inflow'] == 0
        assert result['total_outflow'] == 0
        assert result['net_cashflow'] == 0


class TestMilestoneDetector:
    """Tests for milestone detection."""
    
    @pytest.mark.asyncio
    async def test_detect_high_value_milestones(self):
        """Test detection of high-value transaction milestones."""
        now = datetime.now()
        transactions = [
            MockTransaction(amount=50000, description="Large deposit", date=now - timedelta(days=40), id=1),
            MockTransaction(amount=-30000, description="Major payment", date=now - timedelta(days=10), id=2),
            MockTransaction(amount=500, description="Small transaction", date=now, id=3),
        ]
        
        milestones = await MilestoneDetector.detect_milestones(transactions, threshold=10000)
        
        assert len(milestones) == 2  # Only transactions >= 10000
        assert milestones[0]['amount'] == 50000
        assert milestones[1]['amount'] == -30000
        assert milestones[0]['status'] == 'complete'  # >30 days ago

    @pytest.mark.asyncio
    async def test_milestone_status_assignment(self):
        """Test milestone status based on age."""
        now = datetime.now()
        transactions = [
            MockTransaction(amount=15000, description="Old", date=now - timedelta(days=35), id=1),
            MockTransaction(amount=15000, description="Recent past", date=now - timedelta(days=20), id=2),
            MockTransaction(amount=15000, description="Very recent", date=now - timedelta(days=3), id=3),
        ]
        
        milestones = await MilestoneDetector.detect_milestones(transactions)
        
        assert milestones[0]['status'] == 'complete'  # >30 days
        assert milestones[1]['status'] == 'pending'   # 7-30 days
        assert milestones[2]['status'] == 'alert'      # <7 days

    @pytest.mark.asyncio
    async def test_no_milestones_below_threshold(self):
        """Test that small transactions don't create milestones."""
        transactions = [
            MockTransaction(amount=1000, description="Small", id=1),
            MockTransaction(amount=5000, description="Medium", id=2),
        ]
        
        milestones = await MilestoneDetector.detect_milestones(transactions, threshold=10000)
        
        assert len(milestones) == 0


class TestFraudIndicatorDetector:
    """Tests for fraud indicator detection algorithms."""
    
    @pytest.mark.asyncio
    async def test_velocity_detection(self):
        """Test high-velocity transaction detection."""
        now = datetime.now()
        # Create 25 recent transactions (should trigger velocity alert)
        transactions = [
            MockTransaction(amount=1000, description=f"Tx {i}", date=now - timedelta(days=i % 7), id=i)
            for i in range(25)
        ]
        
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(transactions, "case_123")
        
        # Should have velocity indicator
        velocity_indicator = next((i for i in indicators if i['type'] == 'Velocity'), None)
        assert velocity_indicator is not None
        assert velocity_indicator['severity'] == 'medium'
        assert risk_score >= 15  # Velocity adds 15 points

    @pytest.mark.asyncio
    async def test_structuring_detection(self):
        """Test detection of transactions just below $10k threshold."""
        now = datetime.now()
        # Create transactions just below 10k (suspicious structuring)
        transactions = [
            MockTransaction(amount=9500, description="Payment 1", date=now, id=1),
            MockTransaction(amount=9800, description="Payment 2", date=now, id=2),
            MockTransaction(amount=9900, description="Payment 3", date=now, id=3),
        ]
        
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(transactions, "case_123")
        
        # Should detect structuring
        structuring = next((i for i in indicators if i['type'] == 'Structuring'), None)
        assert structuring is not None
        assert structuring['severity'] == 'high'
        assert structuring['count'] == 3
        assert risk_score >= 30  # Structuring adds 30 points

    @pytest.mark.asyncio
    async def test_large_transaction_detection(self):
        """Test detection of unusually large single transactions."""
        transactions = [
            MockTransaction(amount=150000, description="Huge payment", id=1),
            MockTransaction(amount=1000, description="Normal", id=2),
        ]
        
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(transactions, "case_123")
        
        large_tx = next((i for i in indicators if i['type'] == 'Large Transaction'), None)
        assert large_tx is not None
        assert large_tx['severity'] == 'high'
        assert large_tx['amount'] == 150000
        assert risk_score >= 25

    @pytest.mark.asyncio
    async def test_round_amount_detection(self):
        """Test detection of suspicious round amounts."""
        transactions = [
            MockTransaction(amount=10000, description="Round 1", id=1),
            MockTransaction(amount=20000, description="Round 2", id=2),
            MockTransaction(amount=30000, description="Round 3", id=3),
            MockTransaction(amount=40000, description="Round 4", id=4),
            MockTransaction(amount=50000, description="Round 5", id=5),
            MockTransaction(amount=60000, description="Round 6", id=6),
        ]
        
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(transactions, "case_123")
        
        round_amounts = next((i for i in indicators if i['type'] == 'Round Amounts'), None)
        assert round_amounts is not None
        assert round_amounts['count'] == 6

    @pytest.mark.asyncio
    async def test_risk_score_capped_at_100(self):
        """Test that risk score doesn't exceed 100."""
        now = datetime.now()
        # Create many high-risk transactions
        transactions = [
            MockTransaction(amount=200000, description=f"Large {i}", date=now - timedelta(days=i % 7), id=i)
            for i in range(50)
        ]
        
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(transactions, "case_123")
        
        assert risk_score <= 100
        assert len(indicators) > 0

    @pytest.mark.asyncio
    async def test_clean_case_low_risk(self):
        """Test that normal transactions result in low risk score."""
        transactions = [
            MockTransaction(amount=1234.56, description="Normal payment", id=1),
            MockTransaction(amount=2543.21, description="Regular expense", id=2),
        ]
        
        indicators, risk_score = await FraudIndicatorDetector.detect_indicators(transactions, "case_123")
        
        assert risk_score < 10  # Should be very low
        assert len(indicators) == 0  # No fraud indicators


# Pytest fixtures
@pytest.fixture
async def db_session():
    """Mock database session for testing."""
    return None  # CashflowAnalyzer doesn't currently use db for calculations
