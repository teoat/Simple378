import { useState } from 'react';
import { Play, Navigation, AlertTriangle } from 'lucide-react';

interface GraphToolsProps {
  onSimulationToggle: (enabled: boolean) => void;
  onShortestPath: (source: string, target: string) => void;
  isSimulating: boolean;
}

export function GraphTools({ onSimulationToggle, onShortestPath, isSimulating }: GraphToolsProps) {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      {/* Simulation Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-2">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onSimulationToggle(!isSimulating)}
            className={`p-2 rounded-md transition-colors ${
              isSimulating 
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
            }`}
            title="Toggle Simulation Mode"
          >
            <AlertTriangle className="h-5 w-5" />
          </button>
          
          {isSimulating && (
            <span className="text-xs font-semibold text-purple-500 pr-2">
              Simulation Mode Active
            </span>
          )}
        </div>
      </div>

      {/* Shortest Path Tool */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-4 w-64">
        <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
          <Navigation className="h-4 w-4" />
          <span className="text-sm font-medium">Path Finder</span>
        </div>
        
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Source Node ID"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full h-8 px-2 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Target Node ID"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full h-8 px-2 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => onShortestPath(sourceId, targetId)}
            className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-1"
          >
            <Play className="h-3 w-3" />
            Find Path
          </button>
        </div>
      </div>
    </div>
  );
}
