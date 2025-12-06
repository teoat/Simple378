import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface Conflict {
  id: string;
  sourceId: string;
  targetId: string;
  sourceAmount: number;
  targetAmount: number;
  sourceDate: string;
  targetDate: string;
  discrepancy: number;
}

interface ConflictResolverProps {
  conflicts?: Conflict[];
  onResolve?: (conflictId: string, resolution: 'accepted' | 'rejected') => void;
  isLoading?: boolean;
}

export function ConflictResolver({ conflicts = [], onResolve, isLoading = false }: ConflictResolverProps) {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);

  const defaultConflicts: Conflict[] = [
    {
      id: 'c1',
      sourceId: 's1',
      targetId: 't1',
      sourceAmount: 150000,
      targetAmount: 149999,
      sourceDate: '2025-12-01',
      targetDate: '2025-12-02',
      discrepancy: 1,
    },
    {
      id: 'c2',
      sourceId: 's3',
      targetId: 't3',
      sourceAmount: 200000,
      targetAmount: 205000,
      sourceDate: '2025-12-05',
      targetDate: '2025-12-06',
      discrepancy: 5000,
    },
  ];

  const displayConflicts = conflicts.length > 0 ? conflicts : defaultConflicts;
  const selected = displayConflicts.find(c => c.id === selectedConflict);

  const handleResolve = (resolution: 'accepted' | 'rejected') => {
    if (selectedConflict && onResolve) {
      onResolve(selectedConflict, resolution);
      setSelectedConflict(null);
    }
  };

  const getDiscrepancyColor = (discrepancy: number) => {
    const percent = Math.abs(discrepancy) / 200000;
    if (percent < 0.001) return 'bg-green-50 border-green-200';
    if (percent < 0.01) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getDiscrepancyIcon = (discrepancy: number) => {
    const percent = Math.abs(discrepancy) / 200000;
    if (percent < 0.001) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (percent < 0.01) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-slate-500">Loading conflicts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conflict Resolution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 h-96">
          {/* Conflict List */}
          <div className="overflow-y-auto border border-slate-200 rounded p-3 space-y-2">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Conflicts ({displayConflicts.length})</h4>
            {displayConflicts.map((conflict) => (
              <div
                key={conflict.id}
                onClick={() => setSelectedConflict(conflict.id)}
                className={`p-2 rounded border cursor-pointer transition-all ${
                  selectedConflict === conflict.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                } ${getDiscrepancyColor(conflict.discrepancy)}`}
              >
                <div className="flex items-start gap-2">
                  {getDiscrepancyIcon(conflict.discrepancy)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{conflict.sourceId} vs {conflict.targetId}</p>
                    <p className="text-xs text-slate-500">Δ ${Math.abs(conflict.discrepancy).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conflict Details */}
          <div className="border border-slate-200 rounded p-3 flex flex-col">
            {selected ? (
              <>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Details</h4>
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-xs text-slate-500">Source Transaction</p>
                    <p className="text-sm font-medium">{selected.sourceId}</p>
                    <p className="text-sm">Amount: ${selected.sourceAmount.toLocaleString()}</p>
                    <p className="text-sm">Date: {selected.sourceDate}</p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-xs text-slate-500">Target Transaction</p>
                    <p className="text-sm font-medium">{selected.targetId}</p>
                    <p className="text-sm">Amount: ${selected.targetAmount.toLocaleString()}</p>
                    <p className="text-sm">Date: {selected.targetDate}</p>
                  </div>
                  <div className="border-t pt-2 bg-slate-50 p-2 rounded">
                    <p className="text-xs text-slate-500">Discrepancy</p>
                    <p className={`text-lg font-bold ${
                      Math.abs(selected.discrepancy) < 100 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${Math.abs(selected.discrepancy).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleResolve('accepted')}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResolve('rejected')}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p className="text-sm">Select a conflict to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
