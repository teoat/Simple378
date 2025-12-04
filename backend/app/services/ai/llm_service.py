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
