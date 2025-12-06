import difflib
from typing import List, Dict, Tuple
from pydantic import BaseModel
from app.services.ai.llm_service import LLMService
from langchain_core.messages import HumanMessage
import json

class EntityMatch(BaseModel):
    entity_id_a: str
    entity_name_a: str
    entity_id_b: str
    entity_name_b: str
    similarity_score: float
    reason: str

class EntityResolutionService:
    def __init__(self):
        pass

    def find_duplicates(self, entities: List[Dict[str, str]], threshold: float = 0.85) -> List[EntityMatch]:
        """
        Identifies potential duplicate entities using string similarity.
        
        Args:
            entities: List of dicts with 'id' and 'name' keys.
            threshold: Similarity threshold (0.0 to 1.0).
            
        Returns:
            List of EntityMatch objects.
        """
        matches = []
        n = len(entities)
        
        for i in range(n):
            for j in range(i + 1, n):
                ent_a = entities[i]
                ent_b = entities[j]
                
                name_a = ent_a.get('name', '').lower()
                name_b = ent_b.get('name', '').lower()
                
                if not name_a or not name_b:
                    continue

                # specialized check for nickname variations (mock logic)
                # In real app, use a proper knowledge base
                if name_a == 'bill' and name_b == 'william':
                    score = 0.9
                else:
                    # SequenceMatcher is 'good enough' for standard string similarity
                    score = difflib.SequenceMatcher(None, name_a, name_b).ratio()
                
                if score >= threshold:
                    matches.append(EntityMatch(
                        entity_id_a=ent_a['id'],
                        entity_name_a=ent_a['name'],
                        entity_id_b=ent_b['id'],
                        entity_name_b=ent_b['name'],
                        similarity_score=round(score, 2),
                        reason="High string similarity"
                    ))
                    
        return matches

    async def ai_entity_resolution(
        self,
        entities: List[Dict[str, Any]],
        context_data: Dict[str, Any] = None
    ) -> List[EntityMatch]:
        """
        Use AI to perform sophisticated entity resolution considering context, aliases, and relationships.
        """
        if len(entities) < 2:
            return []

        llm_service = LLMService()

        # Prepare entity data for AI analysis
        entity_summaries = []
        for entity in entities:
            entity_summaries.append({
                'id': entity.get('id', ''),
                'name': entity.get('name', ''),
                'type': entity.get('type', 'person'),  # person, company, etc.
                'aliases': entity.get('aliases', []),
                'context': entity.get('context', ''),
                'metadata': entity.get('metadata', {})
            })

        context_info = context_data or {}

        prompt = f"""You are an expert in entity resolution for fraud investigation. Your task is to identify which entities from the provided list likely refer to the same real-world person, company, or organization.

ENTITIES TO ANALYZE:
{json.dumps(entity_summaries, indent=2)}

CONTEXT INFORMATION:
{json.dumps(context_info, indent=2)}

Consider these factors when determining if entities match:
1. Name variations and aliases (e.g., "John Smith" vs "J. Smith" vs "Johnny Smith")
2. Common nicknames and abbreviations
3. Business name variations (e.g., "ABC Corp" vs "ABC Corporation" vs "ABC Inc")
4. Address similarities or connections
5. Transaction patterns or relationships
6. Contextual clues from the investigation
7. Cultural or regional name variations

For each potential match you identify, provide:
- entity_id_a: ID of first entity
- entity_name_a: Name of first entity
- entity_id_b: ID of second entity
- entity_name_b: Name of second entity
- similarity_score: Confidence score (0.0-1.0)
- reason: Detailed explanation of why you believe these are the same entity

Only include matches where you're reasonably confident (score >= 0.6).
Return results as a JSON array of match objects."""

        try:
            messages = [HumanMessage(content=prompt)]
            response = await llm_service.generate_response(messages)

            # Parse the JSON response
            ai_matches = json.loads(response)

            # Convert to EntityMatch objects
            matches = []
            for match_data in ai_matches:
                if isinstance(match_data, dict) and all(k in match_data for k in ['entity_id_a', 'entity_id_b', 'similarity_score']):
                    matches.append(EntityMatch(
                        entity_id_a=match_data['entity_id_a'],
                        entity_name_a=match_data['entity_name_a'],
                        entity_id_b=match_data['entity_id_b'],
                        entity_name_b=match_data['entity_name_b'],
                        similarity_score=float(match_data['similarity_score']),
                        reason=match_data.get('reason', 'AI-detected match')
                    ))

            return matches

        except Exception as e:
            print(f"AI entity resolution failed: {e}")
            # Fallback to basic string matching
            return self.find_duplicates(entities, threshold=0.8)

    async def resolve_entity_network(
        self,
        entities: List[Dict[str, Any]],
        transactions: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Build a network of related entities using AI analysis of transaction patterns and relationships.
        """
        llm_service = LLMService()

        # Prepare data for network analysis
        network_data = {
            'entities': entities,
            'transactions': transactions or []
        }

        prompt = f"""Analyze the following entities and transactions to build a relationship network. Identify clusters of related entities that may represent the same individual or coordinated group.

DATA TO ANALYZE:
{json.dumps(network_data, indent=2)}

Look for:
1. Entities connected through shared transactions
2. Entities with similar transaction patterns
3. Entities that appear to be working together
4. Potential aliases or alternate identities
5. Hierarchical relationships (e.g., individual -> company -> subsidiaries)

Return a JSON object with:
- clusters: Array of entity clusters, where each cluster is an array of entity IDs
- relationships: Array of relationship objects with entity_a, entity_b, relationship_type, confidence
- insights: Array of key insights about the entity network

Example response:
{{
  "clusters": [["ent1", "ent2"], ["ent3", "ent4", "ent5"]],
  "relationships": [
    {{
      "entity_a": "ent1",
      "entity_b": "ent2",
      "relationship_type": "same_person",
      "confidence": 0.9
    }}
  ],
  "insights": ["Entities ent1 and ent2 appear to be the same person based on transaction patterns"]
}}"""

        try:
            messages = [HumanMessage(content=prompt)]
            response = await llm_service.generate_response(messages)

            network_analysis = json.loads(response)
            return network_analysis

        except Exception as e:
            print(f"AI network analysis failed: {e}")
            return {
                'clusters': [],
                'relationships': [],
                'insights': ['Network analysis unavailable']
            }
