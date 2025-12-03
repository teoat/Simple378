import os
from typing import TypedDict, Annotated, List, Dict, Any, Optional
from uuid import UUID
import operator

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.services.ai.tools import get_recent_transactions, get_entity_graph, flag_transaction

# Define State
class InvestigationState(TypedDict):
    subject_id: str
    messages: Annotated[List[BaseMessage], operator.add]
    next_step: Optional[str]
    findings: Dict[str, Any]
    final_verdict: Optional[str]

# Initialize LLM
from app.core.config import settings

llm = ChatAnthropic(model="claude-3-5-sonnet-20240620", api_key=settings.ANTHROPIC_API_KEY)

# Define Nodes
def supervisor_node(state: InvestigationState):
    messages = state["messages"]
    # Simple router logic for MVP:
    # If no findings, ask Financial Analyst.
    # If financial findings but no graph, ask Graph Investigator.
    # If both, conclude.
    
    last_message = messages[-1] if messages else None
    
    if not state.get("findings"):
        return {"next_step": "Financial_Analyst"}
    
    if "financial_analysis" in state["findings"] and "graph_analysis" not in state["findings"]:
        return {"next_step": "Graph_Investigator"}
        
    return {"next_step": "FINISH"}

async def financial_analyst_node(state: InvestigationState):
    # In a real app, this would call the LLM with tools.
    # For MVP, we simulate the tool call and reasoning.
    return {
        "messages": [SystemMessage(content="Analyzed transactions. Found high velocity.")],
        "findings": {"financial_analysis": "High velocity detected."}
    }

async def graph_investigator_node(state: InvestigationState):
    return {
        "messages": [SystemMessage(content="Analyzed graph. Found 2 connections to known bad actors.")],
        "findings": {"graph_analysis": "Connected to bad actors."}
    }

# Build Graph
workflow = StateGraph(InvestigationState)
workflow.add_node("Supervisor", supervisor_node)
workflow.add_node("Financial_Analyst", financial_analyst_node)
workflow.add_node("Graph_Investigator", graph_investigator_node)

workflow.set_entry_point("Supervisor")

workflow.add_conditional_edges(
    "Supervisor",
    lambda x: x["next_step"],
    {
        "Financial_Analyst": "Financial_Analyst",
        "Graph_Investigator": "Graph_Investigator",
        "FINISH": END
    }
)

workflow.add_edge("Financial_Analyst", "Supervisor")
workflow.add_edge("Graph_Investigator", "Supervisor")

app = workflow.compile()
