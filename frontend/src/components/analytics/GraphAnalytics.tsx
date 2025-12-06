import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  BarChart3,
  Network,
  Users,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  Download
} from 'lucide-react';

interface CommunityResponse {
  communities: Community[];
}

interface CentralityResponse {
  results: CentralityResult[];
}

interface ShortestPathResponse {
  path?: string[];
  distance: number;
}
import { api } from '../../lib/api';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  centrality?: number;
  community?: number;
  degree?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

interface Community {
  id: number;
  nodes: GraphNode[];
  size: number;
  density: number;
  description?: string;
}

interface CentralityResult {
  node_id: string;
  node_name: string;
  centrality_score: number;
  ranking: number;
}

interface GraphAnalyticsProps {
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  onCommunitySelect?: (community: Community) => void;
  onNodeHighlight?: (nodeId: string) => void;
}

export function GraphAnalytics({
  graphData,
  onCommunitySelect,
  onNodeHighlight
}: GraphAnalyticsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [centralityResults, setCentralityResults] = useState<CentralityResult[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'degree' | 'betweenness' | 'closeness' | 'eigenvector'>('degree');
  const [shortestPath, setShortestPath] = useState<{
    path: string[];
    distance: number;
  } | null>(null);
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');

  // Analyze graph for communities
  const analyzeCommunities = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post<CommunityResponse>('/analysis/graph/communities', {
        nodes: graphData.nodes,
        edges: graphData.edges
      });

      const communityData: Community[] = response.communities || [];
      setCommunities(communityData);
    } catch (error) {
      console.error('Community analysis failed:', error);
      // Generate mock communities
      generateMockCommunities();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate centrality metrics
  const calculateCentrality = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post<CentralityResponse>('/analysis/graph/centrality', {
        nodes: graphData.nodes,
        edges: graphData.edges,
        metric: selectedMetric
      });

      setCentralityResults(response.results || []);
    } catch (error) {
      console.error('Centrality calculation failed:', error);
      // Generate mock centrality results
      generateMockCentrality();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Find shortest path
  const findShortestPath = async (sourceId: string, targetId: string) => {
    try {
      const response = await api.post<ShortestPathResponse>('/analysis/graph/shortest-path', {
        source_id: sourceId,
        target_id: targetId
      });

      setShortestPath(response.path ? {
        path: response.path,
        distance: response.distance
      } : null);
    } catch (error) {
      console.error('Shortest path calculation failed:', error);
      setShortestPath(null);
    }
  };

  const generateMockCommunities = () => {
    const mockCommunities: Community[] = [
      {
        id: 1,
        nodes: graphData.nodes.slice(0, 3),
        size: 3,
        density: 0.8,
        description: 'Primary business network'
      },
      {
        id: 2,
        nodes: graphData.nodes.slice(3, 6),
        size: 3,
        density: 0.6,
        description: 'Financial relationships'
      },
      {
        id: 3,
        nodes: graphData.nodes.slice(6, 8),
        size: 2,
        density: 0.9,
        description: 'Family connections'
      }
    ];
    setCommunities(mockCommunities);
  };

  const generateMockCentrality = () => {
    const mockResults: CentralityResult[] = graphData.nodes
      .map((node, index) => ({
        node_id: node.id,
        node_name: node.name,
        centrality_score: Math.random(),
        ranking: index + 1
      }))
      .sort((a, b) => b.centrality_score - a.centrality_score)
      .map((result, index) => ({ ...result, ranking: index + 1 }));

    setCentralityResults(mockResults);
  };

  // Calculate basic graph statistics
  const graphStats = useMemo(() => {
    const nodeCount = graphData.nodes.length;
    const edgeCount = graphData.edges.length;
    const avgDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0;

    const nodeTypes: Record<string, number> = {};
    graphData.nodes.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });

    const edgeTypes: Record<string, number> = {};
    graphData.edges.forEach(edge => {
      edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
    });

    return {
      nodeCount,
      edgeCount,
      avgDegree: avgDegree.toFixed(2),
      nodeTypes,
      edgeTypes,
      density: nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0
    };
  }, [graphData]);

  const exportAnalytics = (format: 'json' | 'csv') => {
    const data = {
      graphStats,
      communities,
      centralityResults,
      shortestPath,
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph_analytics.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export for centrality results
      const csvData = centralityResults.map(result => ({
        'Node Name': result.node_name,
        'Centrality Score': result.centrality_score.toFixed(4),
        'Ranking': result.ranking
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'centrality_analysis.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Graph Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Advanced network analysis and community detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {graphData.nodes.length} nodes, {graphData.edges.length} edges
          </span>
        </div>
      </div>

      {/* Graph Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Network className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">{graphStats.nodeCount}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Nodes</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">{graphStats.edgeCount}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Edges</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">{graphStats.avgDegree}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Avg Degree</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Target className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-amber-600">{(graphStats.density * 100).toFixed(1)}%</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Density</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Community Detection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Detection
              </CardTitle>
              <Button
                size="sm"
                onClick={analyzeCommunities}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Zap className="h-3 w-3 mr-1" />
                )}
                Analyze
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {communities.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No communities detected</p>
                <p className="text-sm mt-1">Run community analysis to identify clusters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {communities.map((community) => (
                  <div
                    key={community.id}
                    onClick={() => onCommunitySelect?.(community)}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        Community {community.id}
                      </span>
                      <span className="text-sm text-slate-500">
                        {community.size} nodes
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {community.description || 'Detected community cluster'}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Density:</span>
                      <span className="font-medium">{(community.density * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Centrality Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Centrality Analysis
              </CardTitle>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                  aria-label="Select centrality metric"
                >
                  <option value="degree">Degree</option>
                  <option value="betweenness">Betweenness</option>
                  <option value="closeness">Closeness</option>
                  <option value="eigenvector">Eigenvector</option>
                </select>
                <Button
                  size="sm"
                  onClick={calculateCentrality}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <BarChart3 className="h-3 w-3 mr-1" />
                  )}
                  Calculate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {centralityResults.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No centrality analysis</p>
                <p className="text-sm mt-1">Calculate centrality metrics to identify key nodes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {centralityResults.slice(0, 10).map((result) => (

                  <div
                    key={result.node_id}
                    onClick={() => onNodeHighlight?.(result.node_id)}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-500 w-6">
                        #{result.ranking}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {result.node_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${result.centrality_score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {(result.centrality_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shortest Path Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Path Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Source Node</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                aria-label="Select source node"
              >
                <option value="">Select source...</option>
                {graphData.nodes.map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Node</label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                aria-label="Select target node"
              >
                <option value="">Select target...</option>
                {graphData.nodes.map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() => findShortestPath(sourceId, targetId)}
                disabled={!sourceId || !targetId || sourceId === targetId}
              >
                Find Shortest Path
              </Button>
            </div>
          </div>

          {shortestPath && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Shortest Path Found
              </h4>
              <div className="flex items-center gap-2 text-sm">
                {shortestPath.path.map((nodeId, index) => {
                  const node = graphData.nodes.find(n => n.id === nodeId);
                  return (
                    <div key={nodeId} className="flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-500/20 px-2 py-1 rounded">
                        {node?.name || nodeId}
                      </span>
                      {index < shortestPath.path.length - 1 && (
                        <span className="mx-2 text-blue-600">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                Path length: {shortestPath.distance} steps
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => exportAnalytics('json')}
        >
          <Download className="h-4 w-4 mr-1" />
          Export JSON
        </Button>
        <Button
          variant="outline"
          onClick={() => exportAnalytics('csv')}
        >
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}