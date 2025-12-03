import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from '../../hooks/useTheme'; // Assuming this hook exists, or we check system preference

interface GraphTabProps {
  alertId: string;
}

export function GraphTab({ alertId }: GraphTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Placeholder data
  const data = {
    nodes: [
      { id: 'Subject', group: 1, val: 20 },
      { id: 'Entity A', group: 2, val: 10 },
      { id: 'Entity B', group: 2, val: 10 },
      { id: 'Account X', group: 3, val: 15 },
    ],
    links: [
      { source: 'Subject', target: 'Entity A' },
      { source: 'Subject', target: 'Entity B' },
      { source: 'Entity A', target: 'Account X' },
    ]
  };

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Entity Network</h3>
      <div ref={containerRef} className="flex-1 rounded-xl overflow-hidden border border-white/10 dark:border-slate-700/20 bg-slate-900">
        {dimensions.width > 0 && (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            nodeLabel="id"
            nodeColor={node => (node as any).group === 1 ? '#ef4444' : '#3b82f6'}
            linkColor={() => '#64748b'}
            backgroundColor="#0f172a"
          />
        )}
      </div>
    </div>
  );
}
