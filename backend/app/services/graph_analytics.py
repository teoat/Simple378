import networkx as nx
from typing import List, Dict, Any, Tuple
from app.schemas.analysis import CommunityResult, CentralityResult, ShortestPathResult
import logging

logger = logging.getLogger(__name__)

class GraphAnalyticsService:
    def __init__(self):
        self.graph = nx.Graph()

    def build_graph_from_data(self, nodes: List[Dict], edges: List[Dict]):
        """
        Rebuilds the internal networkx graph from node/edge lists.
        Nodes expected fmt: {'id': 'n1', ...}
        Edges expected fmt: {'source': 'n1', 'target': 'n2', ...}
        """
        self.graph.clear()
        for n in nodes:
            self.graph.add_node(n['id'], **n)
        for e in edges:
            self.graph.add_edge(e['source'], e['target'], **e)

    def detect_communities(self) -> List[CommunityResult]:
        """
        Detects communities using Greedy Modularity maximization.
        Returns a list of node_id -> cluster_id mappings.
        """
        if len(self.graph.nodes) == 0:
            return []

        try:
            # Returns list of sets of nodes
            communities = nx.community.greedy_modularity_communities(self.graph)
            results = []
            for idx, community_set in enumerate(communities):
                for node_id in community_set:
                    results.append(CommunityResult(node_id=node_id, cluster_id=idx))
            return results
        except Exception as e:
            logger.error(f"Community detection failed: {e}")
            return []

    def calculate_centrality(self) -> List[CentralityResult]:
        """
        Calculates Betweenness Centrality for all nodes.
        Note: This is O(V*E), computationally expensive for large graphs.
        should be run in background task for V > 1000.
        """
        if len(self.graph.nodes) == 0:
            return []

        try:
            centrality_scores = nx.betweenness_centrality(self.graph)
            # Sort by score desc to assign rank
            sorted_scores = sorted(centrality_scores.items(), key=lambda x: x[1], reverse=True)
            
            results = []
            for rank, (node_id, score) in enumerate(sorted_scores):
                results.append(CentralityResult(node_id=node_id, score=score, rank=rank+1))
            return results
        except Exception as e:
            logger.error(f"Centrality calculation failed: {e}")
            return []

    def find_shortest_path(self, source_id: str, target_id: str) -> ShortestPathResult:
        """
        Finds the shortest path between two nodes.
        """
        try:
            path = nx.shortest_path(self.graph, source=source_id, target=target_id)
            return ShortestPathResult(path=path, length=len(path)-1)
        except nx.NetworkXNoPath:
            return ShortestPathResult(path=[], length=-1)
        except Exception as e:
            logger.error(f"Shortest path failed: {e}")
            return ShortestPathResult(path=[], length=-1)
