from typing import TypedDict, List, Dict, Any, Optional
from langchain_core.messages import BaseMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field


# --- State Definition ---
class InvestigationState(TypedDict):
    subject_id: str
    messages: List[BaseMessage]
    next_step: str
    findings: Dict[str, Any]
    final_verdict: Optional[str]


# --- Supervisor ---
class SupervisorOutput(BaseModel):
    next_step: str = Field(description="The next worker to call, or 'FINISH'")
    reasoning: str = Field(description="Reasoning for the decision")


def create_supervisor_node(llm):
    system_prompt = (
        "You are the Supervisor of a fraud investigation team.\n"
        "Your goal is to coordinate the investigation of a subject.\n"
        "You have the following workers:\n"
        "- DocumentProcessor: Extracts data from documents.\n"
        "- FraudAnalyst: Analyzes transactions for fraud patterns.\n"
        "- ReconciliationEngine: Matches funds and expenses.\n"
        "- ReportGenerator: Generates the final report.\n\n"
        "Given the conversation history and current findings, decide who to call next.\n"
        "If the investigation is complete, return 'FINISH'."
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="messages"),
            ("system", "Current Findings: {findings}"),
        ]
    )

    chain = prompt | llm.with_structured_output(SupervisorOutput)

    async def supervisor_node(state: InvestigationState):
        result = await chain.ainvoke(state)
        return {"next_step": result.next_step}

    return supervisor_node


# --- Worker Nodes (Stubs) ---
async def document_processor_node(state: InvestigationState):
    # Stub: Simulate document processing
    return {
        "messages": [
            AIMessage(content="DocumentProcessor: Processed uploaded documents.")
        ],
        "findings": {"documents": ["receipt_1.pdf", "invoice_2.pdf"]},
    }


async def fraud_analyst_node(state: InvestigationState):
    # Stub: Simulate fraud analysis
    return {
        "messages": [
            AIMessage(
                content="FraudAnalyst: Analyzed transactions. Found suspicious pattern."
            )
        ],
        "findings": {"suspicious_transactions": ["tx_123", "tx_456"]},
    }


async def reconciliation_engine_node(state: InvestigationState):
    # Stub: Simulate reconciliation
    return {
        "messages": [AIMessage(content="ReconciliationEngine: Reconciled funds.")],
        "findings": {"variance": 0.0},
    }


async def report_generator_node(state: InvestigationState):
    # Stub: Simulate report generation
    return {
        "messages": [AIMessage(content="ReportGenerator: Generated final report.")],
        "final_verdict": "Investigation Complete. Report generated.",
    }


# --- Graph Construction ---
def build_graph():
    llm = ChatAnthropic(model="claude-3-sonnet-20240229")
    supervisor = create_supervisor_node(llm)

    workflow = StateGraph(InvestigationState)

    workflow.add_node("Supervisor", supervisor)
    workflow.add_node("DocumentProcessor", document_processor_node)
    workflow.add_node("FraudAnalyst", fraud_analyst_node)
    workflow.add_node("ReconciliationEngine", reconciliation_engine_node)
    workflow.add_node("ReportGenerator", report_generator_node)

    workflow.set_entry_point("Supervisor")

    workflow.add_conditional_edges(
        "Supervisor",
        lambda x: x["next_step"],
        {
            "DocumentProcessor": "DocumentProcessor",
            "FraudAnalyst": "FraudAnalyst",
            "ReconciliationEngine": "ReconciliationEngine",
            "ReportGenerator": "ReportGenerator",
            "FINISH": END,
        },
    )

    workflow.add_edge("DocumentProcessor", "Supervisor")
    workflow.add_edge("FraudAnalyst", "Supervisor")
    workflow.add_edge("ReconciliationEngine", "Supervisor")
    workflow.add_edge("ReportGenerator", "Supervisor")

    return workflow.compile()
