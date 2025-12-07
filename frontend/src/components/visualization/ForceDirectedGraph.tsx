import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: number;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
}

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    group: number;
    value?: number;
    color?: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    value?: number;
    type?: string;
  }>;
}

interface ForceDirectedGraphProps {
  title?: string;
  data?: GraphData;
  nodes?: NodeDatum[];
  links?: LinkDatum[];
  height?: number;
  onExport?: (id: string) => void;
  highlightedNodes?: string[];
  highlightedLinks?: Array<{ source: string; target: string }>;
  isRunningExternal?: boolean;
  fitToContainer?: boolean;
  onReset?: () => void;
}

export function ForceDirectedGraph({
  title = 'Force-Directed Graph',
  data,
  nodes: propNodes,
  links: propLinks,
  height = 360,
  onExport,
  highlightedNodes,
  highlightedLinks,
  isRunningExternal,
  onReset,
}: ForceDirectedGraphProps) {
  // Use data prop if provided, otherwise fall back to individual props
  const nodes = data
    ? data.nodes.map((n) => ({ id: n.id, label: n.name, group: n.group, value: n.value }))
    : propNodes || [];

  const links = data
    ? data.links.map((l) => ({ source: l.source, target: l.target, value: l.value || 1 }))
    : propLinks || [];
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const graphId = useMemo(() => `force-graph-${Math.random().toString(36).slice(2, 8)}`, []);

  const stabilizeLayout = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.05);
      simulationRef.current.stop();
    }
  };

  const resetView = () => {
    setHighlightNodesLocal([]);
    setHighlightLinksLocal([]);
    setIsRunning(true);
    simulationRef.current?.alpha(0.9).restart();
    onReset?.();
  };

  // Local mirrors for reset button to clear transient highlights when not controlled externally
  const [highlightNodesLocal, setHighlightNodesLocal] = useState<string[]>([]);
  const [highlightLinksLocal, setHighlightLinksLocal] = useState<Array<{ source: string; target: string }>>([]);

  useEffect(() => {
    setHighlightNodesLocal(highlightedNodes || []);
    setHighlightLinksLocal(highlightedLinks || []);
  }, [highlightedNodes, highlightedLinks]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 640;

    const highlightNodeSet = new Set(highlightNodesLocal || []);
    const highlightLinkSet = new Set(
      (highlightLinksLocal || []).map((l) => `${l.source}::${l.target}`)
    );

    const getLinkKey = (d: LinkDatum) => {
      const s = typeof d.source === 'string' ? d.source : d.source.id;
      const t = typeof d.target === 'string' ? d.target : d.target.id;
      return `${s}::${t}`;
    };

    const isLinkHighlighted = (d: LinkDatum) => {
      const key = getLinkKey(d);
      const revKey = key.split('::').reverse().join('::');
      return highlightLinkSet.has(key) || highlightLinkSet.has(revKey);
    };

    const simulation = d3
      .forceSimulation<NodeDatum>(nodes.map(n => ({ ...n })))
      .force('link', d3.forceLink<NodeDatum, LinkDatum>(links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-160))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(40));

    simulationRef.current = simulation;

    const link = svg
      .append('g')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(simulation.force<d3.ForceLink<NodeDatum, LinkDatum>>('link')?.links() || [])
      .join('line')
      .attr('stroke-width', (d) => Math.max(1, Math.sqrt(d.value || 1)))
      .attr('stroke', (d) => (isLinkHighlighted(d) ? '#f97316' : '#cbd5e1'))
      .attr('stroke-opacity', (d) => (isLinkHighlighted(d) ? 0.95 : 0.6));

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(simulation.nodes())
      .join('circle')
      .attr('r', (d) => (highlightNodeSet.has(d.id) ? 18 : 16))
      .attr('fill', (d) =>
        highlightNodeSet.has(d.id) ? '#f97316' : (color(String(d.group)) as string)
      )
      .call(
        d3
          .drag<SVGCircleElement, NodeDatum>()
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
          }) as any
      );

    const labels = svg
      .append('g')
      .selectAll('text')
      .data(simulation.nodes())
      .join('text')
      .text((d) => d.label)
      .attr('font-size', 11)
      .attr('fill', (d) => (highlightNodeSet.has(d.id) ? '#0f172a' : '#0f172a'))
      .attr('text-anchor', 'middle')
      .attr('dy', 30);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as NodeDatum).x as number)
        .attr('y1', (d) => (d.source as NodeDatum).y as number)
        .attr('x2', (d) => (d.target as NodeDatum).x as number)
        .attr('y2', (d) => (d.target as NodeDatum).y as number);

      node
        .attr('cx', (d) => d.x as number)
        .attr('cy', (d) => d.y as number);

      labels
        .attr('x', (d) => d.x as number)
        .attr('y', (d) => d.y as number);
    });

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [nodes, links, height, highlightNodesLocal, highlightLinksLocal]);

  useEffect(() => {
    const running = typeof isRunningExternal === 'boolean' ? isRunningExternal : isRunning;

    if (!svgRef.current) return;
    if (running) {
      d3.select(svgRef.current).transition().duration(150).style('opacity', 1);
      if (simulationRef.current) {
        simulationRef.current.alpha(0.8).restart();
      }
    } else {
      d3.select(svgRef.current).transition().duration(150).style('opacity', 0.45);
      simulationRef.current?.stop();
    }
  }, [isRunning, isRunningExternal]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex gap-2">
          {typeof isRunningExternal !== 'boolean' && (
            <Button size="sm" variant="outline" onClick={() => setIsRunning((prev) => !prev)}>
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={stabilizeLayout}>
            Stabilize layout
          </Button>
          <Button size="sm" variant="outline" onClick={resetView}>
            Reset view
          </Button>
          {onExport && (
            <Button size="sm" variant="outline" onClick={() => onExport(graphId)}>
              Export SVG/PNG
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <svg ref={svgRef} id={graphId} role="img" width="100%" height={height} />
      </CardContent>
    </Card>
  );
}

export default ForceDirectedGraph;
