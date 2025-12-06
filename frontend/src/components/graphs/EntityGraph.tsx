import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface GraphNode {
  id: string;
  type: 'person' | 'company' | 'account' | 'transaction';
  label: string;
  properties?: Record<string, string | number>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

interface EntityGraphProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  height?: number;
}

// Mock data for demonstration
const MOCK_NODES: GraphNode[] = [
  { id: 'n1', type: 'person', label: 'John Doe', properties: { role: 'Owner' } },
  { id: 'n2', type: 'company', label: 'Tech Corp', properties: { status: 'Active' } },
  { id: 'n3', type: 'company', label: 'Shell LLC', properties: { status: 'Suspicious' } },
  { id: 'n4', type: 'account', label: 'Account A-001', properties: { balance: 500000 } },
  { id: 'n5', type: 'account', label: 'Account B-002', properties: { balance: 750000 } },
  { id: 'n6', type: 'transaction', label: 'Wire Transfer', properties: { amount: 250000 } },
];

const MOCK_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', type: 'owns', label: 'owns' },
  { id: 'e2', source: 'n1', target: 'n3', type: 'controls', label: 'controls' },
  { id: 'e3', source: 'n2', target: 'n4', type: 'has_account', label: 'has' },
  { id: 'e4', source: 'n3', target: 'n5', type: 'has_account', label: 'has' },
  { id: 'e5', source: 'n4', target: 'n6', type: 'sent', label: 'sent' },
  { id: 'e6', source: 'n6', target: 'n5', type: 'received', label: 'received' },
];

const NODE_COLORS = {
  person: { fill: '#3b82f6', stroke: '#2563eb', text: '#ffffff' },
  company: { fill: '#10b981', stroke: '#059669', text: '#ffffff' },
  account: { fill: '#f59e0b', stroke: '#d97706', text: '#ffffff' },
  transaction: { fill: '#8b5cf6', stroke: '#7c3aed', text: '#ffffff' },
};

const NODE_RADIUS = 30;

interface Position {
  x: number;
  y: number;
}

export function EntityGraph({ 
  nodes = MOCK_NODES, 
  edges = MOCK_EDGES,
  height = 600 
}: EntityGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [nodePositions, setNodePositions] = useState<Map<string, Position>>(new Map());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Simple force-directed layout simulation
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize positions in a circle
    const positions = new Map<string, Position>();
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) / 3;
      positions.set(node.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    // Simple force simulation
    const iterations = 100;
    const repulsionStrength = 5000;
    const attractionStrength = 0.01;

    for (let iter = 0; iter < iterations; iter++) {
      const forces = new Map<string, { fx: number; fy: number }>();
      
      // Initialize forces
      nodes.forEach(node => {
        forces.set(node.id, { fx: 0, fy: 0 });
      });

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const p1 = positions.get(n1.id)!;
          const p2 = positions.get(n2.id)!;
          
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const force = repulsionStrength / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          
          const f1 = forces.get(n1.id)!;
          const f2 = forces.get(n2.id)!;
          f1.fx -= fx;
          f1.fy -= fy;
          f2.fx += fx;
          f2.fy += fy;
        }
      }

      // Attraction along edges
      edges.forEach(edge => {
        const p1 = positions.get(edge.source)!;
        const p2 = positions.get(edge.target)!;
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        
        const fx = dx * attractionStrength;
        const fy = dy * attractionStrength;
        
        const f1 = forces.get(edge.source)!;
        const f2 = forces.get(edge.target)!;
        f1.fx += fx;
        f1.fy += fy;
        f2.fx -= fx;
        f2.fy -= fy;
      });

      // Apply forces
      nodes.forEach(node => {
        const pos = positions.get(node.id)!;
        const force = forces.get(node.id)!;
        
        pos.x += force.fx * 0.1;
        pos.y += force.fy * 0.1;
        
        // Keep within bounds
        pos.x = Math.max(NODE_RADIUS, Math.min(width - NODE_RADIUS, pos.x));
        pos.y = Math.max(NODE_RADIUS, Math.min(height - NODE_RADIUS, pos.y));
      });
    }

    setNodePositions(positions);
  }, [nodes, edges, height]);

  // Render the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodePositions.size === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Apply zoom
    ctx.save();
    ctx.translate(rect.width / 2, rect.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-rect.width / 2, -rect.height / 2);

    // Draw edges
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    edges.forEach(edge => {
      const source = nodePositions.get(edge.source);
      const target = nodePositions.get(edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Draw edge label
      if (edge.label) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.label, midX, midY);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const colors = NODE_COLORS[node.type];
      const isSelected = selectedNode === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#1e293b' : colors.stroke;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Truncate long labels
      let label = node.label;
      if (label.length > 12) {
        label = label.substring(0, 10) + '...';
      }
      ctx.fillText(label, pos.x, pos.y);

      // Type label below
      ctx.fillStyle = '#64748b';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(node.type, pos.x, pos.y + NODE_RADIUS + 12);
    });

    ctx.restore();
  }, [nodePositions, edges, nodes, zoom, selectedNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a node
    for (const [nodeId, pos] of nodePositions.entries()) {
      const dx = x - pos.x * zoom;
      const dy = y - pos.y * zoom;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= NODE_RADIUS * zoom) {
        setSelectedNode(nodeId);
        return;
      }
    }

    setSelectedNode(null);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleReset = () => setZoom(1);

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Entity Relationship Graph
        </h3>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="gap-2"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="gap-2"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="relative rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full cursor-pointer"
          style={{ height: `${height}px` }}
          onClick={handleCanvasClick}
        />

        {/* Selected node info */}
        {selectedNodeData && (
          <div className="absolute top-4 right-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-lg max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: NODE_COLORS[selectedNodeData.type].fill }}
              />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedNodeData.label}
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 capitalize">
              {selectedNodeData.type}
            </p>
            {selectedNodeData.properties && (
              <div className="space-y-1 text-sm">
                {Object.entries(selectedNodeData.properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 capitalize">
                      {key}:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {typeof value === 'number' && key.includes('amount') || key.includes('balance')
                        ? `$${value.toLocaleString()}`
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-600" />
          <span>Person</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-600" />
          <span>Company</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-600" />
          <span>Account</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-violet-600" />
          <span>Transaction</span>
        </div>
      </div>
    </div>
  );
}
