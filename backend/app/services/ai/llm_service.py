from typing import Optional, Dict, Any, List
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import BaseMessage, SystemMessage
from app.core.config import settings
import json

class LLMService:
    def __init__(self):
        self.model = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=settings.ANTHROPIC_API_KEY,
            temperature=0
        )
    
    async def generate_response(self, messages: List[BaseMessage], system_prompt: Optional[str] = None) -> str:
        """
        Generate a response using the LLM.
        """
        if system_prompt:
            messages = [SystemMessage(content=system_prompt)] + list(messages)
        
        response = await self.model.ainvoke(messages)
        return response.content
    
    async def route_decision(self, messages: List[BaseMessage], available_agents: List[str]) -> Dict[str, Any]:
        """
        Use LLM with function calling to decide next agent in workflow.
        
        Args:
            messages: Conversation history
            available_agents: List of available agent names
            
        Returns:
            Dictionary with 'next_agent' and 'reasoning'
        """
        # Define the routing function schema
        tools = [{
            "name": "route_to_agent",
            "description": "Route the investigation to the next appropriate agent based on current state",
            "input_schema": {
                "type": "object",
                "properties": {
                    "next_agent": {
                        "type": "string",
                        "enum": available_agents + ["FINISH"],
                        "description": "The next agent to route to, or FINISH if investigation is complete"
                    },
                    "reasoning": {
                        "type": "string",
                        "description": "Brief explanation of why this agent was chosen"
                    }
                },
                "required": ["next_agent", "reasoning"]
            }
        }]
        
        supervisor_prompt = """You are an investigation supervisor coordinating a fraud detection workflow.

Available agents:
- fraud_analyst: Analyzes transactions for suspicious patterns and calculates risk scores
- document_processor: Examines uploaded documents for authenticity and tampering
- report_generator: Creates final investigation reports with recommendations

Based on the conversation history, decide which agent should act next:
1. If investigation just started or needs fraud analysis, route to fraud_analyst
2. If fraud analysis is done but documents need review, route to document_processor
3. If both fraud and document analysis are complete, route to report_generator
4. If final report is generated, choose FINISH

Use the route_to_agent function to make your decision."""

        messages_with_system = [SystemMessage(content=supervisor_prompt)] + list(messages)
        
        response = await self.model.ainvoke(
            messages_with_system,
            tools=tools,
            tool_choice={"type": "tool", "name": "route_to_agent"}
        )
        
        # Extract tool use from response
        for block in response.content:
            if block.get("type") == "tool_use" and block.get("name") == "route_to_agent":
                return block["input"]
        
        # Fallback if no tool use found
        return {"next_agent": "FINISH", "reasoning": "No valid routing decision"}
    
    async def analyze_with_context(self, 
                                   messages: List[BaseMessage],
                                   system_prompt: str,
                                   context_data: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate analysis with additional context data.
        """
        if context_data:
            context_str = "\n\nContext Data:\n" + json.dumps(context_data, indent=2)
            system_prompt = system_prompt + context_str
        
        return await self.generate_response(messages, system_prompt)

    async def generate_chat_response(self, message: str, persona: str, case_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate a chat response with persona-specific behavior and case context.
        """
        # Define persona-specific system prompts
        persona_prompts = {
            "analyst": """You are Frenly AI, an expert fraud analyst. Provide insightful analysis of financial transactions,
            identify suspicious patterns, and suggest investigation strategies. Be precise, data-driven, and professional.
            Focus on patterns, anomalies, and risk indicators.""",

            "legal": """You are Frenly AI, a legal compliance expert specializing in financial crimes and AML regulations.
            Provide guidance on legal compliance, evidence handling, regulatory requirements, and risk mitigation strategies.
            Always emphasize proper procedures and compliance.""",

            "cfo": """You are Frenly AI, a Chief Financial Officer with deep expertise in financial risk management.
            Focus on financial exposure, business impact, cost-benefit analysis, and strategic financial decisions.
            Provide quantitative analysis and business-oriented recommendations.""",

            "investigator": """You are Frenly AI, a Senior Investigator with decades of experience in fraud detection and criminal investigations.
            Provide practical, street-smart advice on investigation strategies, interview tactics, and case-building techniques.
            Share insights from real-world experience, suggest tactical approaches, and help navigate complex investigations.
            Focus on actionable investigation steps and practical detective work."""
        }

        system_prompt = persona_prompts.get(persona, persona_prompts["analyst"])

        # Add case context if available
        if case_context:
            context_info = f"""
Current Case Context:
- Subject: {case_context.get('subject_name', 'Unknown')}
- Risk Score: {case_context.get('risk_score', 0)}/100
- Status: {case_context.get('status', 'Unknown')}
- Analysis Available: {'Yes' if case_context.get('has_analysis') else 'No'}
"""
            system_prompt += context_info

        # Create messages for the LLM
        messages = [SystemMessage(content=system_prompt)]

        # Add user message
        from langchain_core.messages import HumanMessage
        messages.append(HumanMessage(content=message))

        # Generate response
        response = await self.model.ainvoke(messages)
        response_text = response.content

        # Generate suggestions based on persona and context
        suggestions = self._generate_suggestions(message, persona, case_context)

        return {
            "response": response_text,
            "suggestions": suggestions
        }

    def _generate_suggestions(self, message: str, persona: str, case_context: Optional[Dict[str, Any]] = None) -> List[str]:
        """Generate contextual suggestions based on the message and persona."""
        suggestions = []

        message_lower = message.lower()

        if persona == "analyst":
            if "pattern" in message_lower or "analyze" in message_lower:
                suggestions.extend(["View Transaction Graph", "Run Anomaly Detection", "Compare with Similar Cases"])
            elif "risk" in message_lower:
                suggestions.extend(["Calculate Risk Exposure", "Review Risk Factors", "Generate Risk Report"])
            else:
                suggestions.extend(["Analyze Transaction Patterns", "Review Risk Assessment", "Check Related Entities"])

        elif persona == "legal":
            if "evidence" in message_lower or "chain" in message_lower:
                suggestions.extend(["Review Chain of Custody", "Verify Evidence Integrity", "Check Compliance Logs"])
            elif "regulatory" in message_lower or "compliance" in message_lower:
                suggestions.extend(["Review AML Requirements", "Check Regulatory Filings", "Assess Compliance Risk"])
            else:
                suggestions.extend(["Review Legal Compliance", "Check Evidence Handling", "Assess Regulatory Impact"])

        elif persona == "cfo":
            if "financial" in message_lower or "exposure" in message_lower:
                suggestions.extend(["Calculate Total Exposure", "Review Financial Impact", "Generate Cost Analysis"])
            elif "business" in message_lower or "impact" in message_lower:
                suggestions.extend(["Assess Business Risk", "Review Mitigation Strategies", "Calculate ROI"])
            else:
                suggestions.extend(["Analyze Financial Exposure", "Review Business Impact", "Assess Mitigation Costs"])

        elif persona == "investigator":
            if "interview" in message_lower or "interrogation" in message_lower:
                suggestions.extend(["Prepare Interview Questions", "Review Suspect Background", "Plan Interrogation Strategy"])
            elif "evidence" in message_lower or "case" in message_lower:
                suggestions.extend(["Build Evidence Timeline", "Identify Key Witnesses", "Strengthen Case Documentation"])
            else:
                suggestions.extend(["Plan Investigation Strategy", "Identify Next Steps", "Review Case Progress"])

        # Add case-specific suggestions if context is available
        if case_context and case_context.get('has_analysis'):
            suggestions.append("View Case Analysis")
            suggestions.append("Generate Investigation Report")

        return suggestions[:4]  # Limit to 4 suggestions

