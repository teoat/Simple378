import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ForceGraph2D from 'react-force-graph-2d';
import { apiRequest } from '../../lib/api';
import { Loader2 } from 'lucide-react';

interface GraphTabProps {
  subjectId: string;
}

interface GraphNode {
  id: string;
  label?: string;
  type?: string;
  [key: string]: unknown;
}

export function GraphTab({ subjectId }: GraphTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const { data: graphData, isLoading, error } = useQuery({
    queryKey: ['graph', subjectId],
    queryFn: () => apiRequest(`/graph/${subjectId}`),
    enabled: !!subjectId,
  });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading graph...</p>
        </div>
      </div>
    );
  }

  if (error || !graphData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-sm">Failed to load graph data</p>
        </div>
      </div>
    );
  }

  // Transform API data to graph format
  const data = {
    nodes: graphData.nodes || [],
    links: graphData.edges || [],
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Entity Network</h3>
      <div ref={containerRef} className="flex-1 rounded-xl overflow-hidden border border-white/10 dark:border-slate-700/20 bg-slate-900">
        {dimensions.width > 0 && data.nodes.length > 0 && (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            nodeLabel={(node: GraphNode) => node.label || node.id}
            nodeColor={(node: GraphNode) => node.type === 'subject' ? '#ef4444' : '#3b82f6'}
            linkColor={() => '#64748b'}
            backgroundColor="#0f172a"
          />
        )}
        {data.nodes.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>No graph data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
