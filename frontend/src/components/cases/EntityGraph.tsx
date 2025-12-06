import { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Search,
  Filter,
  Settings,
  Info
} from 'lucide-react';

interface EntityNode {
  id: string;
  name: string;
  type: 'subject' | 'bank' | 'vendor' | 'account' | 'document' | 'person' | 'company';
  risk_score?: number;
  connections?: number;
  value?: number;
  color?: string;
  metadata?: Record<string, any>;
}

interface EntityLink {
  source: string;
  target: string;
  type: 'transaction' | 'ownership' | 'relationship' | 'evidence';
  weight: number;
  amount?: number;
  description?: string;
  metadata?: Record<string, any>;
}

interface EntityGraphData {
  nodes: EntityNode[];
  links: EntityLink[];
}

interface EntityGraphProps {
  data: EntityGraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: EntityNode) => void;
  onLinkClick?: (link: EntityLink) => void;
  onExport?: (id: string) => void;
  highlightedPath?: Array<{ source: string; target: string }>;
  filters?: {
    nodeTypes?: string[];
    minRiskScore?: number;
    maxConnections?: number;
  };
}

export function EntityGraph({
  data,
  width = 800,
  height = 600,
  onNodeClick,
  onLinkClick,
  onExport,
  highlightedPath,
  filters = {}
}: EntityGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [nodeSize, setNodeSize] = useState<'fixed' | 'risk' | 'connections'>('risk');

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    let filteredNodes = data.nodes;
    let filteredLinks = data.links;

    // Filter nodes by type
    if (filters.nodeTypes && filters.nodeTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node =>
        filters.nodeTypes!.includes(node.type)
      );
      // Filter links to only include connections between filtered nodes
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(link =>
        nodeIds.has(link.source) && nodeIds.has(link.target)
      );
    }

    // Filter nodes by risk score
    if (filters.minRiskScore !== undefined) {
      filteredNodes = filteredNodes.filter(node =>
        (node.risk_score || 0) >= filters.minRiskScore!
      );
    }

    // Filter nodes by connections
    if (filters.maxConnections !== undefined) {
      filteredNodes = filteredNodes.filter(node =>
        (node.connections || 0) <= filters.maxConnections!
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(node =>
        node.name.toLowerCase().includes(term) ||
        node.id.toLowerCase().includes(term)
      );
    }

    return { nodes: filteredNodes, links: filteredLinks };
  }, [data, filters, searchTerm]);

  // Color scheme for different node types
  const nodeColors = {
    subject: '#3b82f6',    // blue
    bank: '#10b981',       // emerald
    vendor: '#f59e0b',     // amber
    account: '#8b5cf6',    // violet
    document: '#ef4444',   // red
    person: '#06b6d4',     // cyan
    company: '#84cc16'     // lime
  };

  // Calculate node size based on selected metric
  const getNodeSize = (node: EntityNode) => {
    const baseSize = 8;
    switch (nodeSize) {
      case 'risk':
        return baseSize + (node.risk_score || 0) * 0.5;
      case 'connections':
        return baseSize + (node.connections || 0) * 2;
      default:
        return baseSize + (node.value || 0) * 0.1;
    }
  };

  // Calculate link width based on weight
  const getLinkWidth = (link: EntityLink) => {
    return Math.max(1, Math.min(5, link.weight / 10));
  };

  useEffect(() => {
    if (!svgRef.current || !filteredData.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Create simulation
    const simulation = d3.forceSimulation(filteredData.nodes as any)
      .force('link', d3.forceLink(filteredData.links)
        .id((d: any) => d.id)
        .distance(d => 100 - (d.weight || 1) * 10)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeSize(d as EntityNode) + 5));

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredData.links)
      .enter().append('line')
      .attr('stroke', d => {
        // Highlight path if specified
        if (highlightedPath?.some(p =>
          (p.source === d.source && p.target === d.target) ||
          (p.source === d.target && p.target === d.source)
        )) {
          return '#ef4444';
        }
        return '#999';
      })
      .attr('stroke-width', d => getLinkWidth(d))
      .attr('stroke-opacity', 0.6)
      .on('click', (event, d) => {
        event.stopPropagation();
        onLinkClick?.(d);
      })
      .style('cursor', 'pointer');

    // Create link labels for important connections
    const linkLabels = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(filteredData.links.filter(d => d.amount && d.amount > 10000))
      .enter().append('text')
      .attr('font-size', 10)
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .text(d => `$${d.amount!.toLocaleString()}`);

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(filteredData.nodes)
      .enter().append('circle')
      .attr('r', d => getNodeSize(d))
      .attr('fill', d => d.color || nodeColors[d.type] || '#666')
      .attr('stroke', d => selectedNode?.id === d.id ? '#fff' : '#fff')
      .attr('stroke-width', d => selectedNode?.id === d.id ? 3 : 1)
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, EntityNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Create node labels
    const labels = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(filteredData.nodes)
      .enter().append('text')
      .attr('font-size', 12)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('dy', d => -getNodeSize(d) - 8)
      .style('pointer-events', 'none')
      .style('opacity', showLabels ? 1 : 0)
      .text(d => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      linkLabels
        .attr('x', d => ((d.source as any).x + (d.target as any).x) / 2)
        .attr('y', d => ((d.source as any).y + (d.target as any).y) / 2);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    // Start/stop simulation based on isRunning state
    if (isRunning) {
      simulation.restart();
    } else {
      simulation.stop();
    }

    return () => {
      simulation.stop();
    };
  }, [filteredData, isRunning, selectedNode, showLabels, nodeSize, highlightedPath, width, height]);

  const resetView = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(
      d3.zoom<SVGSVGElement, unknown>().transform,
      d3.zoomIdentity
    );
    setZoom(1);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const graphId = `entity-graph-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Entity Relationship Graph
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
              />
            </div>

            {/* Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className={showLabels ? 'bg-blue-50' : ''}
            >
              Labels
            </Button>

            <select
              value={nodeSize}
              onChange={(e) => setNodeSize(e.target.value as any)}
              className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
            >
              <option value="fixed">Fixed Size</option>
              <option value="risk">Risk-based</option>
              <option value="connections">Connection-based</option>
            </select>

            <Button variant="outline" size="sm" onClick={toggleSimulation}>
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            {onExport && (
              <Button variant="outline" size="sm" onClick={() => onExport(graphId)}>
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          {Object.entries(nodeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="border border-slate-200 dark:border-slate-700 rounded"
            id={graphId}
          />

          {/* Zoom indicator */}
          <div className="absolute top-2 right-2 bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs border">
            {Math.round(zoom * 100)}%
          </div>

          {/* Node info panel */}
          {selectedNode && (
            <div className="absolute bottom-2 left-2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border max-w-xs">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                {selectedNode.name}
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mt-1">
                <div>Type: <span className="capitalize">{selectedNode.type}</span></div>
                {selectedNode.risk_score && (
                  <div>Risk Score: {selectedNode.risk_score}</div>
                )}
                {selectedNode.connections && (
                  <div>Connections: {selectedNode.connections}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100">
              {filteredData.nodes.length}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Entities</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100">
              {filteredData.links.length}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Connections</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100">
              {filteredData.nodes.filter(n => n.type === 'subject').length}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Subjects</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100">
              {Math.max(...filteredData.nodes.map(n => n.risk_score || 0), 0)}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Max Risk</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}