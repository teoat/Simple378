import { useState, useMemo } from 'react';
import { Share2, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { ForceDirectedGraph } from './ForceDirectedGraph';
import { SankeyFlow } from './SankeyFlow';
import { TimelineZoom } from './TimelineZoom';
import { ActivityHeatmap } from './ActivityHeatmap';
import { GraphTools } from './GraphTools';
import { api } from '../../lib/api';
import { exportBoth } from '../../lib/svgExport';

// --- Types ---
interface GraphNode {
  data: {
    id: string;
    label: string;
    type: string;
    risk_score?: number;
  };
}

interface GraphEdge {
  data: {
    source: string;
    target: string;
    weight?: number;
    id?: string;
    type?: string;
  };
}

export interface GraphData {
  elements: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface FinancialData {
  cashflow_data: Array<{
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }>;
}

interface SankeyNode {
  id: string;
  name: string;
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
  intensity: number;
}

// --- Utils ---
const parsePathResponse = (result: any): string[] => {
  const candidate = result?.path ?? result?.data?.path ?? result?.data?.shortest_path;
  if (Array.isArray(candidate)) return candidate.map((id) => String(id));
  return [];
};

interface VisualizationNetworkProps {
  graphData?: GraphData;
  financialData?: FinancialData;
  isLoading?: boolean;
}

export function VisualizationNetwork({ graphData, financialData, isLoading = false }: VisualizationNetworkProps) {
  const [isGraphSimulating, setIsGraphSimulating] = useState(false);
  const [highlightNodes, setHighlightNodes] = useState<string[]>([]);
  const [highlightLinks, setHighlightLinks] = useState<Array<{ source: string; target: string }>>([]);
  const [graphStatus, setGraphStatus] = useState<string | null>(null);
  const [graphStatusTone, setGraphStatusTone] = useState<'info' | 'warn' | 'error'>('info');

  // Transform graph data for ForceDirectedGraph
  const forceGraphData = useMemo(() => {
    if (!graphData?.elements) return { nodes: [], links: [] };

    const nodes = graphData.elements.nodes.map(node => ({
        id: node.data.id,
        name: node.data.label,
        group: node.data.type === 'subject' ? 1 : node.data.type === 'bank' ? 2 : 3,
        value: node.data.risk_score || 1,
        color: node.data.type === 'subject' ? '#3b82f6' :
                node.data.type === 'bank' ? '#10b981' : '#f59e0b'
    }));

    const links = graphData.elements.edges.map(edge => ({
        source: edge.data.source,
        target: edge.data.target,
        value: edge.data.weight || 1,
        type: edge.data.type || 'default'
    }));

    return { nodes, links };
  }, [graphData]);

  // Transform data for Sankey diagram
  const sankeyData = useMemo((): SankeyData => {
    if (!financialData?.cashflow_data) return { nodes: [], links: [] };

    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];
    const nodeMap = new Map<string, number>();

    const addNode = (name: string, color?: string) => {
        if (!nodeMap.has(name)) {
        nodeMap.set(name, nodes.length);
        nodes.push({ id: name, name, color });
        }
        return nodeMap.get(name)!;
    };

    financialData.cashflow_data.forEach((flow) => {
        const inflowNode = addNode('Income', '#10b981');
        const outflowNode = addNode('Expenses', '#ef4444');
        const balanceNode = addNode('Balance', '#3b82f6');

        if (flow.inflow > 0) {
        links.push({
            source: nodes[inflowNode].id,
            target: nodes[balanceNode].id,
            value: flow.inflow,
            color: '#10b981'
        });
        }

        if (flow.outflow > 0) {
        links.push({
            source: nodes[balanceNode].id,
            target: nodes[outflowNode].id,
            value: flow.outflow,
            color: '#ef4444'
        });
        }
    });

    return { nodes, links };
  }, [financialData]);

  // Generate heatmap data
  const heatmapData = useMemo((): HeatmapData[] => {
    if (!financialData?.cashflow_data) return [];

    const heatmap: HeatmapData[] = [];

    financialData.cashflow_data.forEach(flow => {
        const date = new Date(flow.date);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const hour = date.getHours();

        const intensity = Math.min(100, (flow.inflow + flow.outflow) / 100);

        heatmap.push({
        day,
        hour,
        value: flow.inflow + flow.outflow,
        intensity
        });
    });

    return heatmap;
  }, [financialData]);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-500" />
            Entity Network
            </h3>
            {isLoading ? (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
            ) : forceGraphData.nodes.length > 0 ? (
            <ForceDirectedGraph
                data={forceGraphData}
                isRunningExternal={isGraphSimulating}
                highlightedNodes={highlightNodes}
                highlightedLinks={highlightLinks}
                onReset={() => {
                setHighlightNodes([]);
                setHighlightLinks([]);
                setGraphStatus(null);
                }}
                onExport={(id) => exportBoth(id, 'network-graph', true)}
            />
            ) : (
            <div className="h-96 flex items-center justify-center text-slate-500">
                No network data available
            </div>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500" /> Subject</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Bank</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-500" /> Other</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-orange-500" /> Highlighted path</span>
            {(highlightNodes.length > 0 || highlightLinks.length > 0) && (
                <button
                onClick={() => { setHighlightNodes([]); setHighlightLinks([]); setGraphStatus(null); }}
                className="ml-auto text-[11px] underline text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                >
                Clear highlights
                </button>
            )}
            </div>
            {graphStatus && (
            <div
                className={`mt-2 text-xs px-2 py-1 rounded border ${
                graphStatusTone === 'error'
                    ? 'text-red-600 bg-red-50 border-red-200'
                    : graphStatusTone === 'warn'
                    ? 'text-amber-600 bg-amber-50 border-amber-200'
                    : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}
            >
                {graphStatus}
            </div>
            )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Financial Flows
            </h3>
            {sankeyData.nodes.length > 0 ? (
            <SankeyFlow
                data={sankeyData}
                onExport={(id) => exportBoth(id, 'sankey-flow', true)}
            />
            ) : (
            <div className="h-96 flex items-center justify-center text-slate-500">
                No flow data available
            </div>
            )}
        </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Transaction Timeline
            </h3>
            <TimelineZoom
            data={financialData?.cashflow_data || []}
            filters={{ timeRange: '30d', entityType: 'all' }}
            />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Activity Heatmap
            </h3>
            {heatmapData.length > 0 ? (
            <ActivityHeatmap
                data={heatmapData}
                onExport={(id) => exportBoth(id, 'activity-heatmap', true)}
            />
            ) : (
            <div className="h-96 flex items-center justify-center text-slate-500">
                No activity data available
            </div>
            )}
        </div>
        </div>

        <div className="relative">
        <GraphTools
            onSimulationToggle={(enabled) => setIsGraphSimulating(enabled)}
            onShortestPath={async (source, target) => {
            try {
                const result = await api.post('/analysis/graph/shortest-path', {
                source_id: source,
                target_id: target
                });
                const path = parsePathResponse(result);
                if (Array.isArray(path) && path.length > 0) {
                setHighlightNodes(path);
                const pairs: Array<{ source: string; target: string }> = [];
                for (let i = 0; i < path.length - 1; i += 1) {
                    pairs.push({ source: path[i], target: path[i + 1] });
                }
                setHighlightLinks(pairs);
                setGraphStatus(`Path found (${path.length} nodes)`);
                setGraphStatusTone('info');
                } else {
                setHighlightNodes([]);
                setHighlightLinks([]);
                setGraphStatus('No path found for the selected nodes.');
                setGraphStatusTone('warn');
                }
            } catch (error) {
                console.error('Shortest path failed:', error);
                setHighlightNodes([]);
                setHighlightLinks([]);
                setGraphStatus('Shortest path query failed.');
                setGraphStatusTone('error');
            }
            }}
            isSimulating={isGraphSimulating}
        />
        </div>
    </div>
  );
}
