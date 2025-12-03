import networkx as nx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any, Set
from uuid import UUID

from app.db.models import Transaction
from app.models.mens_rea import AnalysisResult
from app.db.models import Subject

class GraphAnalyzer:
    """
    Service to build and analyze entity graphs using NetworkX.
    """
    
    @staticmethod
    async def build_subgraph(db: AsyncSession, subject_id: UUID, depth: int = 2) -> Dict[str, Any]:
        """
        Builds a subgraph centered around a subject, including related transactions and entities.
        Returns a JSON-serializable dictionary of nodes and edges.
        """
        graph = nx.Graph()
        visited_subjects: Set[UUID] = set()
        queue = [(subject_id, 0)]
        
        while queue:
            current_id, current_depth = queue.pop(0)
            
            if current_id in visited_subjects or current_depth > depth:
                continue
            
            visited_subjects.add(current_id)
            
            # Fetch Subject
            result = await db.execute(select(Subject).where(Subject.id == current_id))
            subject = result.scalars().first()
            
            if not subject:
                continue
                
            # Add Node
            graph.add_node(str(subject.id), label=subject.name, type="subject", risk_score=0.0) # TODO: Fetch risk score
            
            if current_depth < depth:
                # Fetch Transactions (Outgoing and Incoming)
                # Note: For MVP, we assume transactions link subjects if we had a counterparty_id.
                # Since our Transaction model currently only has subject_id (one-sided), 
                # we can only link subjects if they share attributes (PII) or if we infer links.
                # For this MVP, let's assume we link subjects that share the SAME PII (e.g. email).
                
                # Fetch PII for this subject
                # Assuming PII is in subject.encrypted_pii (needs decryption in real app, using raw for now if accessible or mock)
                # For MVP, let's just fetch ALL transactions for this subject to show edges to "External" entities
                
                tx_result = await db.execute(select(Transaction).where(Transaction.subject_id == current_id))
                transactions = tx_result.scalars().all()
                
                for tx in transactions:
                    # Create a node for the counterparty (derived from description or external_id)
                    # This is a simplification. In reality, we'd do entity resolution.
                    counterparty_label = tx.description or "Unknown"
                    counterparty_id = f"ext_{tx.id}" # Unique ID for this specific transaction's counterparty
                    
                    # Deduplicate external entities by name if possible
                    # For now, let's just make a node for the transaction itself to show flow
                    # Or better, make a node for the "Source Bank" to show concentration
                    
                    bank_node_id = f"bank_{tx.source_bank}"
                    if not graph.has_node(bank_node_id):
                        graph.add_node(bank_node_id, label=tx.source_bank, type="bank")
                    
                    # Edge: Subject -> Bank (via Transaction)
                    graph.add_edge(str(subject.id), bank_node_id, weight=tx.amount, id=str(tx.id), type="transaction")

        # Convert to JSON format (Cytoscape/ReactFlow friendly)
        nodes = [{"data": {"id": n, **attr}} for n, attr in graph.nodes(data=True)]
        edges = [{"data": {"source": u, "target": v, **attr}} for u, v, attr in graph.edges(data=True)]
        
        return {"elements": {"nodes": nodes, "edges": edges}}

    @staticmethod
    async def find_paths(db: AsyncSession, start_id: UUID, end_id: UUID) -> List[Any]:
        """
        Finds paths between two subjects.
        """
        # Placeholder for pathfinding logic
        return []
