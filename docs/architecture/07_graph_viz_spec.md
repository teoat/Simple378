# Deep Dive: Advanced Graph Visualization

## 1. Overview
This document specifies the frontend architecture for the **Entity Link Analyzer** visualization (Phase 4). The goal is to render interactive graphs of financial networks, capable of handling 1,000+ nodes with smooth performance.

## 2. Technology Selection

| Library | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- |
| **React Flow** | Easy integration, great custom nodes, good for workflows. | Performance drops > 500 nodes. | **Best for MVP / Case Flow** |
| **Cytoscape.js** | Powerful analysis, good layout algorithms. | Canvas-based (harder to style), dated API. | **Strong Contender** |
| **Sigma.js (WebGL)** | Extreme performance (100k+ nodes). | Limited interactivity, complex setup. | **Best for "Big Picture"** |

**Decision:** We will use **React Flow** for the detailed "Case View" (small subgraphs) and **Cosmograph** or **Sigma.js** for the "Global Exploration" view if needed later. For Phase 4, **React Flow** is sufficient for subgraphs of < 500 nodes.

## 3. Features & Interactions

### 3.1 Node Types
- **Subject Node:** Avatar, Risk Score badge, Name.
- **Account Node:** Bank Logo, Account Number (masked).
- **Transaction Edge:** Thickness = Amount, Color = Risk Level (Red=High).

### 3.2 Layout Algorithms
We need automatic layout to untangle the "hairball".
- **Force Directed:** Good for showing clusters.
- **Elkjs / Dagre:** Hierarchical layout (good for flow of funds).
- **Strategy:** Use `elkjs` with React Flow to calculate positions server-side or in a web worker.

### 3.3 Progressive Loading (Expansion)
To avoid overwhelming the user:
1.  Load `Subject` + direct neighbors (Depth 1).
2.  User clicks "+" on a node.
3.  Fetch neighbors of that node (API `GET /graph/{id}?depth=1`).
4.  Add new nodes/edges to the existing graph state.

## 4. Data Structure (Frontend)
Standardized JSON format for the API response:

```typescript
interface GraphData {
  nodes: {
    id: string;
    type: 'subject' | 'account' | 'bank';
    data: {
      label: string;
      riskScore?: number;
      metadata: Record<string, any>;
    };
    position: { x: number; y: number }; // Calculated by layout engine
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    type: 'transaction' | 'relationship';
    data: {
      amount?: number;
      date?: string;
    };
    style: { strokeWidth: number; stroke: string };
  }[];
}
```

## 5. Performance Optimization
- **Web Workers:** Run layout calculations off the main thread.
- **Virtualization:** Only render nodes in the viewport (React Flow handles this partially).
- **Simplification:** Group low-value transactions into a single "Aggregated" edge.
