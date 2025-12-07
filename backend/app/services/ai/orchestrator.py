from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from app.services.ai.llm_service import LLMService
from app.services.ai.prompts import (
    FRAUD_ANALYST_PROMPT,
    DOCUMENT_PROCESSOR_PROMPT,
    REPORT_GENERATOR_PROMPT,
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
                "FINISH": END,
            },
        )

        workflow.add_edge("fraud_analyst", "supervisor")
        workflow.add_edge("document_processor", "supervisor")
        workflow.add_edge("report_generator", "supervisor")

        return workflow.compile()

    async def supervisor_node(self, state: InvestigationState):
        """
        Supervisor uses LLM with function calling to dynamically route to next agent.
        """
        messages = state["messages"]

        # Use LLM to make routing decision
        available_agents = ["fraud_analyst", "document_processor", "report_generator"]

        decision = await self.llm_service.route_decision(messages, available_agents)

        next_agent = decision.get("next_agent", "FINISH")
        reasoning = decision.get("reasoning", "")

        # Add supervisor's decision to conversation
        supervisor_message = AIMessage(
            content=f"Routing to {next_agent}. Reason: {reasoning}", name="supervisor"
        )

        return {"next_step": next_agent, "messages": [supervisor_message]}

    async def fraud_analyst_node(self, state: InvestigationState):
        """
        Fraud analyst analyzes transactions using ScoringService and LLM.
        """

        case_id = state.get("case_id")
        messages = state["messages"]

        # In real implementation, fetch transactions from database
        # For now, create structured analysis
        analysis_context = {
            "case_id": case_id,
            "analysis_type": "fraud_pattern_detection",
        }

        # Use LLM to generate fraud analysis
        fraud_analysis = await self.llm_service.analyze_with_context(
            messages, system_prompt=FRAUD_ANALYST_PROMPT, context_data=analysis_context
        )

        return {
            "messages": [
                AIMessage(
                    content=f"Fraud Analyst Report: {fraud_analysis}",
                    name="fraud_analyst",
                )
            ]
        }

    async def document_processor_node(self, state: InvestigationState):
        """
        Document processor analyzes uploaded evidence.
        """
        messages = state["messages"]
        case_id = state.get("case_id")

        # Use LLM to analyze documents
        doc_analysis = await self.llm_service.analyze_with_context(
            messages,
            system_prompt=DOCUMENT_PROCESSOR_PROMPT,
            context_data={"case_id": case_id},
        )

        return {
            "messages": [
                AIMessage(
                    content=f"Document Analysis: {doc_analysis}",
                    name="document_processor",
                )
            ]
        }

    async def report_generator_node(self, state: InvestigationState):
        """
        Generate final investigation report synthesizing all findings.
        """
        messages = state["messages"]

        # Use LLM to synthesize all previous analyses into final report
        final_report = await self.llm_service.analyze_with_context(
            messages,
            system_prompt=REPORT_GENERATOR_PROMPT,
            context_data={"case_id": state.get("case_id")},
        )

        return {
            "messages": [
                AIMessage(
                    content=f"Final Report: {final_report}", name="report_generator"
                )
            ]
        }

    async def run_investigation(self, case_id: str, initial_message: str):
        inputs = {
            "messages": [HumanMessage(content=initial_message)],
            "case_id": case_id,
            "next_step": "",
        }

        results = []
        async for output in self.workflow.astream(inputs):
            results.append(output)

        return results
