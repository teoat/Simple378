"""
Integration tests for fraud detection services.
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.scoring import ScoringService
from app.services.graph_analyzer import GraphAnalyzer
from app.db.models import Subject, Transaction
import uuid
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_scoring_service_velocity_check():
    """Test velocity scoring detects rapid transactions."""
    service = ScoringService()
    
    # Create test transactions (5 transactions in 10 minutes)
    now = datetime.utcnow()
    transactions = [
        {
            "amount": "500.00",
            "date": (now - timedelta(minutes=i)).isoformat(),
            "currency": "USD"
        }
        for i in range(5)
    ]
    
    score = await service.calculate_velocity_score(transactions)
    
    # High velocity should result in higher score
    assert score > 0.5

@pytest.mark.asyncio
async def test_scoring_service_structuring_detection():
    """Test structuring detection for amounts just under reporting threshold."""
    service = ScoringService()
    
    # Multiple transactions just under $10,000
    transactions = [
        {"amount": "9500.00", "currency": "USD"},
        {"amount": "9800.00", "currency": "USD"},
        {"amount": "9900.00", "currency": "USD"},
    ]
    
    score = await service.calculate_structuring_score(transactions)
    
    # Should detect structuring pattern
    assert score > 0.7

@pytest.mark.asyncio
async def test_graph_analyzer_builds_subgraph(db: AsyncSession):
    """Test graph analyzer builds transaction network."""
    # Create test subject
    subject = Subject(
        id=uuid.uuid4(),
        encrypted_pii={"name": "Test Subject"}
    )
    db.add(subject)
    
    # Create transactions
    for i in range(3):
        tx = Transaction(
            id=uuid.uuid4(),
            subject_id=subject.id,
            amount="1000.00",
            currency="USD",
            date=datetime.utcnow(),
            source_bank=f"Bank_{i}"
        )
        db.add(tx)
    
    await db.commit()
    
    # Build subgraph
    graph_data = await GraphAnalyzer.build_subgraph(db, subject.id, depth=1)
    
    # Should have nodes and edges
    assert "elements" in graph_data
    assert "nodes" in graph_data["elements"]
    assert "edges" in graph_data["elements"]
    
    # Should have subject node + bank nodes
    assert len(graph_data["elements"]["nodes"]) >= 4

@pytest.mark.asyncio
async def test_mens_rea_analysis_workflow(db: AsyncSession):
    """Test end-to-end mens rea analysis."""
    # Create subject with transactions
    subject = Subject(
        id=uuid.uuid4(),
        encrypted_pii={"name": "Suspicious Actor"}
    )
    db.add(subject)
    await db.commit()
    
    # In real test, would call mens rea analysis endpoint
    # and verify AnalysisResult is created
    
    # Placeholder for now
    assert subject.id is not None
