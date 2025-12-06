"""
Integration tests for AI Orchestrator.
"""
import pytest
import unittest.mock
from app.services.ai.orchestrator import Orchestrator
from langchain_core.messages import HumanMessage

@pytest.mark.asyncio
async def test_orchestrator_basic_flow():
    """
    Test that orchestrator routes through agents correctly.
    """
    with unittest.mock.patch("app.services.ai.orchestrator.LLMService") as MockLLMService:
        mock_llm = MockLLMService.return_value
        mock_llm.route_decision = unittest.mock.AsyncMock(side_effect=[
            {"next_agent": "fraud_analyst", "reasoning": "Test reasoning"},
            {"next_agent": "FINISH", "reasoning": "Done"}
        ])
        mock_llm.analyze_with_context = unittest.mock.AsyncMock(return_value="Test analysis result")
        
        orchestrator = Orchestrator()
    
    case_id = "test-case-123"
    initial_message = "Investigate transaction pattern for subject X showing multiple cash deposits under $10,000."
    
    results = await orchestrator.run_investigation(case_id, initial_message)
    
    # Should have multiple steps (supervisor -> agents -> supervisor -> ...)
    assert len(results) > 0
    
    # Verify we hit different agents
    agent_names = set()
    for result in results:
        for node_name in result.keys():
            if node_name in ["fraud_analyst", "document_processor", "report_generator"]:
                agent_names.add(node_name)
    
    # At minimum should have fraud_analyst
    assert "fraud_analyst" in agent_names

@pytest.mark.asyncio
async def test_supervisor_routing_decision():
    """
    Test that supervisor makes LLM-based routing decisions.
    """
    with unittest.mock.patch("app.services.ai.orchestrator.LLMService") as MockLLMService:
        mock_llm = MockLLMService.return_value
        mock_llm.route_decision = unittest.mock.AsyncMock(return_value={"next_agent": "fraud_analyst", "reasoning": "Test reasoning"})
        
        orchestrator = Orchestrator()
    
    # Initial state - should route to fraud_analyst
    state = {
        "messages": [HumanMessage(content="Start investigation")],
        "case_id": "test-123",
        "next_step": ""
    }
    
    result = await orchestrator.supervisor_node(state)
    
    # Should have next_step decided
    assert "next_step" in result
    assert result["next_step"] in ["fraud_analyst", "document_processor", "report_generator", "FINISH"]
    
    # Should have supervisor reasoning message
    assert len(result["messages"]) > 0
    assert "Routing to" in result["messages"][0].content

@pytest.mark.asyncio
async def test_fraud_analyst_node():
    """
    Test fraud analyst node generates analysis.
    """
    with unittest.mock.patch("app.services.ai.orchestrator.LLMService") as MockLLMService:
        mock_llm = MockLLMService.return_value
        mock_llm.analyze_with_context = unittest.mock.AsyncMock(return_value="Test fraud analysis")
        
        orchestrator = Orchestrator()
    
    state = {
        "messages": [HumanMessage(content="Analyze transactions for suspicious patterns")],
        "case_id": "test-case-456",
        "next_step": "fraud_analyst"
    }
    
    result = await orchestrator.fraud_analyst_node(state)
    
    # Should have analysis message
    assert len(result["messages"]) > 0
    message = result["messages"][0]
    assert message.name == "fraud_analyst"
    assert "Fraud Analyst Report" in message.content
