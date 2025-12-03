"""
Graph rendering stress test - tests performance with large datasets.

Tests graph visualization with 10k+ nodes to ensure UI doesn't freeze.
"""
import asyncio
import asyncpg
import networkx as nx
import json
from datetime import datetime
import random

async def generate_large_graph(num_nodes: int = 10000):
    """Generate a large transaction graph for stress testing."""
    G = nx.DiGraph()
    
    # Create nodes (subjects/entities)
    for i in range(num_nodes):
        G.add_node(f"subject_{i}", type="person", risk_score=random.uniform(0, 1))
    
    # Create edges (transactions)
    num_edges = num_nodes * 3  # Average 3 transactions per node
    for _ in range(num_edges):
        source = f"subject_{random.randint(0, num_nodes-1)}"
        target = f"subject_{random.randint(0, num_nodes-1)}"
        if source != target:
            G.add_edge(source, target, 
                      amount=random.uniform(100, 10000),
                      timestamp=datetime.now().isoformat())
    
    return G

async def insert_graph_to_db(db_config: dict, graph: nx.DiGraph):
    """Insert generated graph into database for testing."""
    conn = await asyncpg.connect(**db_config)
    
    try:
        # Insert nodes
        for node, data in graph.nodes(data=True):
            await conn.execute("""
                INSERT INTO subjects (id, encrypted_pii) 
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            """, node, json.dumps(data))
        
        # Insert edges as analysis results
        for source, target, data in graph.edges(data=True):
            await conn.execute("""
                INSERT INTO analysis_results (subject_id, status, risk_score)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING
            """, source, 'completed', data.get('amount', 0) / 10000)
        
        print(f"✓ Inserted {graph.number_of_nodes()} nodes and {graph.number_of_edges()} edges")
    
    finally:
        await conn.close()

async def main():
    """Run graph stress test."""
    print("Generating large graph (10k+ nodes)...")
    start = datetime.now()
    
    graph = await generate_large_graph(num_nodes=10000)
    
    elapsed = (datetime.now() - start).total_seconds()
    print(f"✓ Graph generated in {elapsed:.2f}s")
    print(f"  Nodes: {graph.number_of_nodes()}")
    print(f"  Edges: {graph.number_of_edges()}")
    
    # Optional: Insert into database
    # db_config = {
    #     "host": "localhost",
    #     "port": 5432,
    #     "database": "fraud_detection",
    #     "user": "postgres",
    #     "password": "postgres"
    # }
    # await insert_graph_to_db(db_config, graph)
    
    print("\nNext steps:")
    print("1. Query graph data via API: GET /api/v1/graph")
    print("2. Test frontend rendering with Chrome DevTools Performance tab")
    print("3. Monitor memory usage and frame rate")

if __name__ == "__main__":
    asyncio.run(main())
