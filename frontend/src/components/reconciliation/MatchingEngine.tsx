import { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface MatchResult {
  id: string;
  sourceId: string;
  targetId: string;
  confidence: number;
  algorithm: string;
}

interface MatchingEngineProps {
  matches?: MatchResult[];
  isProcessing?: boolean;
  onRunMatching?: () => void;
}

export function MatchingEngine({ matches = [], isProcessing = false, onRunMatching }: MatchingEngineProps) {
  const [algorithm, setAlgorithm] = useState<'exact' | 'fuzzy' | 'ml'>('exact');
  const [threshold, setThreshold] = useState(0.85);
  const [processing, setProcessing] = useState(false);

  const defaultMatches: MatchResult[] = [
    { id: 'm1', sourceId: 's1', targetId: 't1', confidence: 0.99, algorithm: 'exact' },
    { id: 'm2', sourceId: 's2', targetId: 't2', confidence: 0.92, algorithm: 'fuzzy' },
    { id: 'm3', sourceId: 's3', targetId: 't3', confidence: 0.78, algorithm: 'ml' },
  ];

  const displayMatches = matches.length > 0 ? matches : defaultMatches;

  const handleRunMatching = () => {
    setProcessing(true);
    if (onRunMatching) {
      onRunMatching();
    }
    setTimeout(() => setProcessing(false), 2000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100';
    if (confidence >= 0.75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-700';
    if (confidence >= 0.75) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Engine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as 'exact' | 'fuzzy' | 'ml')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={processing || isProcessing}
            >
              <option value="exact">Exact Match</option>
              <option value="fuzzy">Fuzzy Match</option>
              <option value="ml">ML-based</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confidence Threshold: {(threshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full"
              disabled={processing || isProcessing}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRunMatching}
              disabled={processing || isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
            >
              {processing || isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Matching
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Match Results ({displayMatches.length})</h4>
          <div className="space-y-2">
            {displayMatches.map((match) => {
              const meetsThreshold = match.confidence >= threshold;
              const color = getConfidenceColor(match.confidence);
              const textColor = getConfidenceTextColor(match.confidence);

              return (
                <div key={match.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {match.sourceId} ↔ {match.targetId}
                    </p>
                    <p className="text-xs text-slate-500">{match.algorithm}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 bg-slate-200 rounded-full overflow-hidden w-24`}>
                      <div
                        className={`h-full ${color} transition-all`}
                        style={{ width: `${match.confidence * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${color} ${textColor}`}>
                      {(match.confidence * 100).toFixed(0)}%
                    </span>
                    {meetsThreshold ? (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ Match
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        Below threshold
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            <span className="font-medium">Matched:</span> {displayMatches.filter(m => m.confidence >= threshold).length} /{' '}
            {displayMatches.length} transactions
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
