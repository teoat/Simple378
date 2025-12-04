import networkx as nx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from collections import defaultdict, deque
from typing import List, Dict, Any, Set
from uuid import UUID
from datetime import datetime

from app.db.models import Transaction
from app.models.mens_rea import AnalysisResult
from app.db.models import Subject

class GraphAnalyzer:
    """
    Service to build and analyze entity graphs using NetworkX.
    """
    
    @staticmethod
    async def build_subgraph(
        db: AsyncSession, 
        subject_id: UUID, 
        depth: int = 2,
        limit: int = 1000,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Builds a subgraph centered around a subject, including related transactions and entities.
        Returns a JSON-serializable dictionary of nodes and edges.
        
        Args:
            db: Database session
            subject_id: Root subject ID
            depth: Maximum graph traversal depth
            limit: Maximum number of transactions to fetch per subject
            offset: Number of transactions to skip (for pagination)
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
            result = await db.execute(
                select(Subject)
                .options(selectinload(Subject.analysis_results))
                .where(Subject.id == current_id)
            )
            subject = result.scalars().first()
            
            if not subject:
                continue
                
            # Add Node
            # Fetch risk score from analysis results
            subject_name = f"Subject_{str(subject.id)[:8]}"  # Use truncated ID as name for MVP
            risk_score = 0.0
            if hasattr(subject, 'analysis_results') and subject.analysis_results:
                # Get the latest analysis result's risk score
                from datetime import datetime
                latest_analysis = max(subject.analysis_results, key=lambda x: x.created_at if x.created_at else datetime.min)
                risk_score = latest_analysis.risk_score if latest_analysis.risk_score else 0.0
            
            graph.add_node(str(subject.id), label=subject_name, type="subject", risk_score=risk_score)
            
            if current_depth < depth:
                # Fetch Transactions with pagination
                tx_result = await db.execute(
                    select(Transaction)
                    .where(Transaction.subject_id == current_id)
                    .limit(limit)
                    .offset(offset)
                )
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
