# Visualization Features

**Status:** ✅ Implemented (Core) | 📋 Planned (Advanced)

---

## Overview

The Simple378 Fraud Detection System includes comprehensive visualization capabilities for analyzing complex financial networks, transaction patterns, and fraud indicators. Visualizations are designed to handle large datasets while maintaining interactivity and clarity.

---

## Implemented Visualizations

### 1. Entity Relationship Graph
**Location:** Case Detail Page - Graph Tab  
**Technology:** React Flow  
**Purpose:** Visualize connections between subjects, accounts, and transactions

**Features:**
- Interactive node-based graph
- Progressive loading (depth-based expansion)
- Multiple node types: Subject, Account, Bank
- Edge weight indicates transaction amount
- Color coding by risk level
- Click to expand neighbors
- Pan and zoom controls
- Mini-map for navigation

**Supported Interactions:**
- Click node to view details
- Double-click to expand connections
- Drag to rearrange layout
- Hover for quick info tooltip
- Right-click for context menu

---

### 2. Dashboard Charts
**Location:** Dashboard Page  
**Technology:** Recharts  
**Purpose:** High-level metrics and trends

**Chart Types:**
1. **Bar Chart:** Cases by status distribution
2. **Line Chart:** Case creation trends over time
3. **Pie Chart:** Risk level distribution
4. **Area Chart:** Alert trends

---

### 3. Timeline Visualization
**Location:** Case Detail Page - Timeline Tab  
**Technology:** Custom React components  
**Purpose:** Chronological view of case events and transactions

**Features:**
- Scrollable timeline with date markers
- Event clustering by date
- Transaction details on hover
- Filtering by event type
- Time range selection

---

### 4. Heatmap (Planned)
**Status:** 📋 Not Yet Implemented  
**Purpose:** Transaction pattern analysis

**Planned Features:**
- Time-of-day transaction patterns
- Day-of-week patterns
- Geographic distribution
- Amount distribution heatmap

---

## Graph Visualization Specifications

### Layout Algorithms

1. **Force-Directed Layout**
   - Default for most graphs
   - Good for showing natural clustering
   - Auto-adjusts as nodes are added

2. **Hierarchical Layout** (Planned)
   - Flow-of-funds visualization
   - Uses Elkjs/Dagre algorithms
   - Top-down or left-right orientation

### Node Types

```typescript
interface SubjectNode {
  id: string;
  type: 'subject';
  data: {
    name: string;
    riskScore: number;
    avatar?: string;
  };
}

interface AccountNode {
  id: string;
  type: 'account';
  data: {
    accountNumber: string;
    bankName: string;
    balance?: number;
  };
}

interface BankNode {
  id: string;
  type: 'bank';
  data: {
    name: string;
    logo?: string;
  };
}
```

### Edge Styling

```typescript
interface EdgeStyle {
  strokeWidth: number;    // Based on transaction amount
  stroke: string;         // Color based on risk level
  strokeDasharray?: string; // Dashed for flagged transactions
  animated?: boolean;     // For active/recent transactions
}
```

---

## Performance Optimization

### Current Implementation
- **Max Nodes (Optimal):** 500 nodes per graph
- **Lazy Loading:** Load neighbors on demand
- **Memoization:** React.memo on custom node components
- **Virtualization:** Only render visible viewport

### Planned Improvements
- [ ] **Web Workers:** Offload layout calculations
- [ ] **WebGL Rendering:** For graphs > 1000 nodes (Sigma.js)
- [ ] **Edge Bundling:** Group similar edges
- [ ] **Level of Detail:** Simplify distant nodes

---

## Color Schemes

### Risk Level Colors
```css
Critical (90-100): #DC2626 (red-600)
High (75-89):      #EA580C (orange-600)
Medium (50-74):    #F59E0B (yellow-500)
Low (25-49):       #3B82F6 (blue-500)
Minimal (0-24):    #10B981 (green-500)
```

### Status Colors
```css
Active:     #3B82F6 (blue-500)
Pending:    #F59E0B (yellow-500)
Completed:  #10B981 (green-500)
Rejected:   #DC2626 (red-600)
```

---

## Accessibility Features

- **Keyboard Navigation:** Tab through nodes, Enter to expand
- **Screen Reader Support:** ARIA labels on all interactive elements
- **High Contrast Mode:** Alternative color scheme
- **Focus Indicators:** Clear visual focus states
- **Zoom Controls:** Keyboard shortcuts (+ / -)

---

## Export Capabilities

### Supported Formats
1. **PNG Image:** Static snapshot of current view
2. **SVG:** Vector format for high-quality prints
3. **JSON:** Raw graph data for external tools
4. **CSV:** Edge list for spreadsheet analysis

### Export API
```http
POST /api/v1/graph/export
Content-Type: application/json

{
  "case_id": "case_123",
  "format": "png" | "svg" | "json" | "csv",
  "include_filters": true
}
```

---

## Interactive Features

### Node Context Menu
- View full details
- Expand connections
- Hide node
- Highlight path to another node
- Flag for review

### Graph Controls
- **Fit View:** Auto-zoom to show all nodes
- **Center Selected:** Focus on selected node
- **Lock Layout:** Prevent auto-layout changes
- **Screenshot:** Capture current view
- **Reset:** Return to initial state

---

## Integration with AI Assistant

The graph visualization integrates with the AI Assistant for:
- **Explain Connection:** AI explains relationship between two nodes
- **Suggest Next:** AI recommends which node to expand
- **Anomaly Highlighting:** AI highlights suspicious patterns
- **Risk Path Analysis:** Identifies highest-risk transaction chains

---

## Future Enhancements

### Phase 2 (Q1 2026)
- [ ] 3D graph visualization for complex networks
- [ ] Time-based animation (replay transactions)
- [ ] Clustering algorithms (community detection)
- [ ] Comparative graphs (before/after intervention)

### Phase 3 (Q2 2026)
- [ ] Geospatial visualization on maps
- [ ] Sankey diagrams for flow-of-funds
- [ ] Network analysis metrics dashboard
- [ ] ML-powered layout optimization

---

## Technical Stack

| Component | Library | Version |
|-----------|---------|---------|
| Graph Rendering | React Flow | 11.x |
| Charts | Recharts | 2.x |
| 3D Graphs (Planned) | React Force Graph 3D | - |
| WebGL (Planned) | Sigma.js | 3.x |
| Export | html2canvas | 1.x |

---

## API Endpoints

### Get Graph Data
```http
GET /api/v1/graph/{case_id}?depth={1-3}
```

### Expand Node
```http
GET /api/v1/graph/{case_id}/expand/{node_id}?depth=1
```

### Graph Statistics
```http
GET /api/v1/graph/{case_id}/stats
```

**Response:**
```json
{
  "node_count": 127,
  "edge_count": 384,
  "max_degree": 45,
  "avg_degree": 6.1,
  "components": 3,
  "density": 0.048
}
```

---

**Related Documentation:**
- [Case Detail Page](./03_CASE_DETAIL.md)
- [Dashboard](./08_DASHBOARD.md)
- [Graph Visualization Spec](./docs/architecture/07_graph_viz_spec.md)
