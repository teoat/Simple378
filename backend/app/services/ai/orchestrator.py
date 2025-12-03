from typing import TypedDict, Annotated, List, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from app.services.ai.llm_service import LLMService
from app.services.ai.prompts import (
    SUPERVISOR_PROMPT, 
    FRAUD_ANALYST_PROMPT, 
    DOCUMENT_PROCESSOR_PROMPT, 
    REPORT_GENERATOR_PROMPT
)

class InvestigationState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_step: str
    case_id: str

class Orchestrator:
    def __init__(self):
        self.llm_service = LLMService()
        self.workflow = self._build_workflow()

    def _build_workflow(self):
        workflow = StateGraph(InvestigationState)

        # Define Nodes
        workflow.add_node("supervisor", self.supervisor_node)
        workflow.add_node("fraud_analyst", self.fraud_analyst_node)
        workflow.add_node("document_processor", self.document_processor_node)
        workflow.add_node("report_generator", self.report_generator_node)

        # Define Edges
        workflow.set_entry_point("supervisor")
        
        workflow.add_conditional_edges(
            "supervisor",
            lambda x: x["next_step"],
            {
                "fraud_analyst": "fraud_analyst",
                "document_processor": "document_processor",
                "report_generator": "report_generator",
                "FINISH": END
            }
        )

        workflow.add_edge("fraud_analyst", "supervisor")
        workflow.add_edge("document_processor", "supervisor")
        workflow.add_edge("report_generator", "supervisor")

        return workflow.compile()

    async def supervisor_node(self, state: InvestigationState):
        messages = state["messages"]
        # In a real implementation, we would use function calling or structured output
        # to get the next step. For this MVP, we'll simulate a simple router.
        
        # Mock logic for MVP flow:
        # If no messages from workers, start with fraud_analyst
        # If fraud_analyst done, do document_processor
        # If both done, do report_generator
        # If report done, FINISH
        
        last_message = messages[-1] if messages else None
        
        if not last_message or isinstance(last_message, HumanMessage):
            return {"next_step": "fraud_analyst", "messages": [AIMessage(content="Starting investigation with Fraud Analyst.")]}
            
        last_sender = "unknown"
        # Logic to determine sender would go here (e.g. via message name or metadata)
        
        # Simplified sequence for MVP verification
        history_str = str(messages)
        if "Fraud Analyst Report" not in history_str:
             return {"next_step": "fraud_analyst"}
        elif "Document Analysis Report" not in history_str:
             return {"next_step": "document_processor"}
        elif "Final Investigation Report" not in history_str:
             return {"next_step": "report_generator"}
        else:
             return {"next_step": "FINISH"}

    async def fraud_analyst_node(self, state: InvestigationState):
        # Call ScoringService here
        return {
            "messages": [AIMessage(content="Fraud Analyst Report: Found suspicious structuring pattern. Risk Score: 0.85")]
        }

    async def document_processor_node(self, state: InvestigationState):
        # Call ForensicsService here
        return {
            "messages": [AIMessage(content="Document Analysis Report: Receipt metadata matches transaction date.")]
        }

    async def report_generator_node(self, state: InvestigationState):
        return {
            "messages": [AIMessage(content="Final Investigation Report: High probability of fraud detected. Recommend freezing account.")]
        }

    async def run_investigation(self, case_id: str, initial_message: str):
        inputs = {
            "messages": [HumanMessage(content=initial_message)],
            "case_id": case_id,
            "next_step": ""
        }
        
        results = []
        async for output in self.workflow.astream(inputs):
            results.append(output)
            
        return results
