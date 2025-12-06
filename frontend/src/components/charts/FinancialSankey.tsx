import { useEffect, useRef } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface SankeyNode {
  id: string;
  label: string;
  type: 'source' | 'intermediary' | 'destination';
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface FinancialSankeyProps {
  nodes?: SankeyNode[];
  links?: SankeyLink[];
  height?: number;
}

// Mock data for demonstration
const MOCK_NODES: SankeyNode[] = [
  { id: 'bank_a', label: 'Bank A', type: 'source' },
  { id: 'bank_b', label: 'Bank B', type: 'source' },
  { id: 'wire', label: 'Wire Transfer', type: 'source' },
  { id: 'shell_co', label: 'Shell Company', type: 'intermediary' },
  { id: 'bank_x', label: 'Bank X', type: 'destination' },
  { id: 'bank_y', label: 'Bank Y', type: 'destination' },
];

const MOCK_LINKS: SankeyLink[] = [
  { source: 'bank_a', target: 'shell_co', value: 500000 },
  { source: 'bank_b', target: 'shell_co', value: 300000 },
  { source: 'wire', target: 'shell_co', value: 250000 },
  { source: 'shell_co', target: 'bank_x', value: 750000 },
  { source: 'shell_co', target: 'bank_y', value: 250000 },
];

export function FinancialSankey({ 
  nodes = MOCK_NODES, 
  links = MOCK_LINKS,
  height = 500 
}: FinancialSankeyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate layout
    const padding = 60;
    const nodeWidth = 20;
    const width = rect.width;
    
    // Group nodes by type
    const sourceNodes = nodes.filter(n => n.type === 'source');
    const intermediaryNodes = nodes.filter(n => n.type === 'intermediary');
    const destinationNodes = nodes.filter(n => n.type === 'destination');

    // Calculate positions
    const nodePositions = new Map<string, { x: number; y: number; height: number }>();

    // Position sources on left
    const sourceSpacing = (height - padding * 2) / (sourceNodes.length + 1);
    sourceNodes.forEach((node, i) => {
      const totalValue = links.filter(l => l.source === node.id).reduce((sum, l) => sum + l.value, 0);
      const nodeHeight = Math.max(40, (totalValue / 1050000) * (height - padding * 2));
      nodePositions.set(node.id, {
        x: padding,
        y: padding + sourceSpacing * (i + 1) - nodeHeight / 2,
        height: nodeHeight,
      });
    });

    // Position intermediaries in middle
    const middleX = width / 2;
    const intermediarySpacing = (height - padding * 2) / (intermediaryNodes.length + 1);
    intermediaryNodes.forEach((node, i) => {
      const totalValue = links.filter(l => l.target === node.id).reduce((sum, l) => sum + l.value, 0);
      const nodeHeight = Math.max(60, (totalValue / 1050000) * (height - padding * 2));
      nodePositions.set(node.id, {
        x: middleX - nodeWidth / 2,
        y: padding + intermediarySpacing * (i + 1) - nodeHeight / 2,
        height: nodeHeight,
      });
    });

    // Position destinations on right
    const destSpacing = (height - padding * 2) / (destinationNodes.length + 1);
    destinationNodes.forEach((node, i) => {
      const totalValue = links.filter(l => l.target === node.id).reduce((sum, l) => sum + l.value, 0);
      const nodeHeight = Math.max(40, (totalValue / 1050000) * (height - padding * 2));
      nodePositions.set(node.id, {
        x: width - padding - nodeWidth,
        y: padding + destSpacing * (i + 1) - nodeHeight / 2,
        height: nodeHeight,
      });
    });

    // Draw links with gradients
    links.forEach(link => {
      const source = nodePositions.get(link.source);
      const target = nodePositions.get(link.target);
      if (!source || !target) return;

      const linkHeight = (link.value / 1050000) * 80;
      
      // Create gradient for flow
      const gradient = ctx.createLinearGradient(
        source.x + nodeWidth,
        source.y + source.height / 2,
        target.x,
        target.y + target.height / 2
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');

      // Draw curved path
      ctx.beginPath();
      ctx.moveTo(source.x + nodeWidth, source.y + source.height / 2 - linkHeight / 2);
      
      const cp1x = source.x + nodeWidth + (target.x - source.x - nodeWidth) / 3;
      const cp2x = source.x + nodeWidth + (target.x - source.x - nodeWidth) * 2 / 3;
      
      ctx.bezierCurveTo(
        cp1x, source.y + source.height / 2 - linkHeight / 2,
        cp2x, target.y + target.height / 2 - linkHeight / 2,
        target.x, target.y + target.height / 2 - linkHeight / 2
      );
      
      ctx.lineTo(target.x, target.y + target.height / 2 + linkHeight / 2);
      
      ctx.bezierCurveTo(
        cp2x, target.y + target.height / 2 + linkHeight / 2,
        cp1x, source.y + source.height / 2 + linkHeight / 2,
        source.x + nodeWidth, source.y + source.height / 2 + linkHeight / 2
      );
      
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw nodes
    nodePositions.forEach((pos, nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Node rectangle
      const nodeColor = node.type === 'source' ? '#3b82f6' : 
                       node.type === 'intermediary' ? '#8b5cf6' : 
                       '#10b981';
      
      ctx.fillStyle = nodeColor;
      ctx.fillRect(pos.x, pos.y, nodeWidth, pos.height);

      // Node label
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter, sans-serif';
      ctx.textBaseline = 'middle';
      
      if (node.type === 'source') {
        ctx.textAlign = 'right';
        ctx.fillText(node.label, pos.x - 10, pos.y + pos.height / 2);
      } else if (node.type === 'destination') {
        ctx.textAlign = 'left';
        ctx.fillText(node.label, pos.x + nodeWidth + 10, pos.y + pos.height / 2);
      } else {
        ctx.textAlign = 'center';
        ctx.fillText(node.label, pos.x + nodeWidth / 2, pos.y - 10);
      }
    });

  }, [nodes, links, height]);

  // Calculate totals
  const totalInflow = links.reduce((sum, l) => {
    const target = nodes.find(n => n.id === l.target);
    return target?.type === 'intermediary' ? sum + l.value : sum;
  }, 0);

  const totalOutflow = links.reduce((sum, l) => {
    const source = nodes.find(n => n.id === l.source);
    return source?.type === 'intermediary' ? sum + l.value : sum;
  }, 0);

  const missingAmount = totalInflow - totalOutflow;
  const suspiciousCount = links.filter(l => l.value > 400000).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Financial Flow Analysis
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <TrendingUp className="h-4 w-4" />
          <span>Sankey Diagram</span>
        </div>
      </div>

      {/* Canvas for Sankey diagram */}
      <div className="relative rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: `${height}px` }}
        />
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <DollarSign className="h-4 w-4" />
            Total Inflow
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${(totalInflow / 1000000).toFixed(2)}M
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <DollarSign className="h-4 w-4" />
            Total Outflow
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${(totalOutflow / 1000000).toFixed(2)}M
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-slate-500 text-sm mb-1">Suspicious Transactions</div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {suspiciousCount}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-slate-500 text-sm mb-1">Missing Amount</div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${Math.abs(missingAmount / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-600" />
          <span>Source Accounts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-violet-600" />
          <span>Intermediary</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-emerald-600" />
          <span>Destination</span>
        </div>
      </div>
    </div>
  );
}
