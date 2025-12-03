import pytest
from unittest.mock import MagicMock
from app.orchestration.orchestrator import create_supervisor_node, SupervisorOutput, InvestigationState
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableLambda

@pytest.mark.asyncio
async def test_supervisor_node_routing():
    # Mock LLM
    mock_llm = MagicMock()
    
    # Create a mock runnable that returns the expected output
    async def mock_run(input):
        return SupervisorOutput(next_step="FraudAnalyst", reasoning="Need to check transactions.")
    
    mock_chain = RunnableLambda(mock_run)
    mock_llm.with_structured_output.return_value = mock_chain
    
    # Create supervisor
    supervisor = create_supervisor_node(mock_llm)
    
    # Test state
    state = InvestigationState(
        subject_id="123",
        messages=[HumanMessage(content="Investigate this.")],
        next_step="Supervisor",
        findings={},
        final_verdict=None
    )
    
    # Run
    result = await supervisor(state)
    
    # Assert
    assert result["next_step"] == "FraudAnalyst"

@pytest.mark.asyncio
async def test_supervisor_node_finish():
    # Mock LLM
    mock_llm = MagicMock()
    
    # Create a mock runnable that returns the expected output
    async def mock_run(input):
        return SupervisorOutput(next_step="FINISH", reasoning="Investigation complete.")
    
    mock_chain = RunnableLambda(mock_run)
    mock_llm.with_structured_output.return_value = mock_chain
    
    # Create supervisor
    supervisor = create_supervisor_node(mock_llm)
    
    # Test state
    state = InvestigationState(
        subject_id="123",
        messages=[HumanMessage(content="Done.")],
        next_step="Supervisor",
        findings={},
        final_verdict=None
    )
    
    # Run
    result = await supervisor(state)
    
    # Assert
    assert result["next_step"] == "FINISH"
