# Deep Dive: Advanced Graph Visualization

## 1. Overview
This document specifies the frontend architecture for the **Entity Link Analyzer** visualization (Phase 4). The goal is to render interactive graphs of financial networks, capable of handling 1,000+ nodes with smooth performance.

## 2. Technology Selection

| Library | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- |
| **React Flow** | Easy integration, great custom nodes, good for workflows. | Performance drops > 500 nodes. | **Best for MVP / Case View** |
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

## 6. Interaction Design

### 6.1 Mouse & Keyboard Controls
- **Pan:** Drag empty space or right-click drag
- **Zoom:** Mouse wheel or pinch gestures
- **Select:** Click node/edge, Shift+click for multi-select
- **Navigate:** Arrow keys for node traversal, Tab for sequential focus
- **Expand:** Double-click node or click "+" button to load neighbors
- **Context Menu:** Right-click for node/edge actions (view details, hide, highlight path)

### 6.2 Selection Modes
- **Single Selection:** Click to select, show details panel
- **Multi-Selection:** Shift+click or drag-select rectangle
- **Path Selection:** Click source then target to highlight shortest path
- **Cluster Selection:** Select all nodes within a risk score range

## 7. Advanced Features

### 7.1 Node Types & Customization
- **Subject Nodes:** Avatar, risk badge, entity type icon
- **Account Nodes:** Bank logo, masked account number, balance indicator
- **Transaction Hubs:** Aggregated nodes for high-volume connections
- **Risk Clusters:** Grouped nodes by risk level with expandable details
- **Temporal Nodes:** Time-based grouping with timeline controls

### 7.2 Filtering & Search
- **In-Graph Search:** Type-ahead search with highlighting
- **Dynamic Filtering:** Filter by node type, risk score, date range
- **Graph Pruning:** Hide/show edges below threshold amounts
- **Saved Filters:** Persist filter sets for common views

### 7.3 Animation & Transitions
- **Layout Transitions:** Smooth repositioning during expansion
- **State Changes:** Color transitions for risk score updates
- **Loading Animations:** Progressive reveal of new nodes
- **Highlight Effects:** Pulse animations for selected paths

## 8. Multi-Graph & Collaboration

### 8.1 Multi-View Support
- **Split Screen:** Compare two graphs side-by-side
- **Tabbed Interface:** Multiple graph tabs with independent states
- **Graph Diffing:** Highlight differences between graph versions

### 8.2 Collaboration Features
- **Real-time Sync:** WebSocket updates for shared investigations
- **User Cursors:** Show other analysts' selections and focus
- **Annotation Tools:** Sticky notes, highlights, and comments on nodes
- **Session Recording:** Record and replay graph exploration sessions

## 9. Export & Integration

### 9.1 Export Formats
- **PNG/SVG:** High-resolution images with customizable styling
- **PDF:** Printable reports with legends and metadata
- **JSON:** Raw graph data for external analysis
- **GraphML:** Standard format for graph analysis tools

### 9.2 API Integration
- **WebSocket Events:** Real-time graph updates from backend
- **REST Endpoints:** CRUD operations for graph data
- **Embedding API:** Integrate graphs into other pages
- **Plugin System:** Extensible architecture for custom node types

## 10. Accessibility & Performance

### 10.1 Accessibility Features
- **Screen Reader:** Node descriptions and edge relationships
- **Keyboard Navigation:** Full keyboard control without mouse
- **High Contrast:** WCAG-compliant color schemes
- **Focus Management:** Clear focus indicators and logical tab order

### 10.2 Performance Benchmarks
- **Node Count:** Support 500+ nodes smoothly, 1000+ with virtualization
- **Render Time:** <100ms for layout calculations
- **Memory Usage:** <50MB for typical graphs
- **Frame Rate:** 60fps during interactions

### 10.3 Error Handling
- **Large Graph Warning:** Alert users before loading >500 nodes
- **Progressive Loading:** Load in chunks with progress indicators
- **Graceful Degradation:** Simplified view for low-performance devices
- **Recovery Options:** Undo/redo for failed operations

## 11. Styling & Theming

### 11.1 Visual Design System
- **Color Palette:** Risk-based color coding (green=low, red=high)
- **Node Shapes:** Circles for entities, squares for accounts, diamonds for hubs
- **Edge Styles:** Thickness by amount, dashed for indirect relationships
- **Themes:** Light/dark mode with customizable accent colors

### 11.2 Responsive Design
- **Desktop:** Full feature set with side panels
- **Tablet:** Touch-optimized gestures, collapsible panels
- **Mobile:** Simplified view with essential interactions only

## 12. Testing & Quality Assurance

### 12.1 Testing Strategy
- **Unit Tests:** Component rendering, interaction logic
- **Integration Tests:** Graph loading and API interactions
- **E2E Tests:** Full user workflows and performance scenarios
- **Visual Regression:** Screenshot comparisons for UI consistency

### 12.2 Quality Metrics
- **Code Coverage:** >90% for graph components
- **Performance Budget:** <2s initial load, <100ms interactions
- **Accessibility Score:** WCAG AA compliance
- **Cross-browser:** Support for Chrome, Firefox, Safari, Edge