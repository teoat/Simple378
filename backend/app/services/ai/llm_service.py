```
import os
from typing import Optional, Dict, Any, List
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage
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
            
            response = await self.anthropic_client.ainvoke(messages)
            return response
        except Exception as e:
            # Log error and try fallback if implemented
            print(f"LLM Error: {e}")
            raise e
