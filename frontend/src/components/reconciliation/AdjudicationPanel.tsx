import { useState } from 'react';
import { ArrowUp, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface AdjudicationCase {
  id: string;
  caseNumber: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  submittedDate: string;
  notes?: string;
}

interface AdjudicationPanelProps {
  cases?: AdjudicationCase[];
  onEscalate?: (caseId: string, assignedTo: string) => void;
}

export function AdjudicationPanel({ cases = [], onEscalate }: AdjudicationPanelProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [assignTo, setAssignTo] = useState('');

  const defaultCases: AdjudicationCase[] = [
    {
      id: 'adj1',
      caseNumber: 'ADJ-2025-001',
      description: 'Transaction amount mismatch - Manual review required',
      priority: 'high',
      submittedDate: '2025-12-01',
      notes: 'Discrepancy of $5,000 between systems',
    },
    {
      id: 'adj2',
      caseNumber: 'ADJ-2025-002',
      description: 'Date variance - Source vs Target systems',
      priority: 'medium',
      submittedDate: '2025-12-03',
      notes: '2-day difference, needs clarification',
    },
    {
      id: 'adj3',
      caseNumber: 'ADJ-2025-003',
      description: 'Missing transaction in target system',
      priority: 'high',
      submittedDate: '2025-12-05',
    },
  ];

  const displayCases = cases.length > 0 ? cases : defaultCases;
  const selectedCase = displayCases.find(c => c.id === selectedCaseId);

  const handleEscalate = () => {
    if (selectedCaseId && assignTo && onEscalate) {
      onEscalate(selectedCaseId, assignTo);
      setNewNote('');
      setAssignTo('');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    };
    return config[priority] || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjudication Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 h-96">
          {/* Case List */}
          <div className="overflow-y-auto border border-slate-200 rounded p-3 space-y-2">
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              Cases ({displayCases.length})
            </h4>
            {displayCases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCaseId(caseItem.id)}
                className={`p-2 rounded border cursor-pointer transition-all ${
                  selectedCaseId === caseItem.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <ArrowUp
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      caseItem.priority === 'high'
                        ? 'text-red-600'
                        : caseItem.priority === 'medium'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{caseItem.caseNumber}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {caseItem.description}
                    </p>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded mt-1 ${getPriorityBadge(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Case Details */}
          <div className="border border-slate-200 rounded p-3 flex flex-col">
            {selectedCase ? (
              <>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Case Details</h4>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <div>
                    <p className="text-xs text-slate-500">Case Number</p>
                    <p className="text-sm font-medium">{selectedCase.caseNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Description</p>
                    <p className="text-sm">{selectedCase.description}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Submitted</p>
                    <p className="text-sm">{selectedCase.submittedDate}</p>
                  </div>
                  {selectedCase.notes && (
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-xs text-slate-500">Notes</p>
                      <p className="text-sm">{selectedCase.notes}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Add Note</label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add notes..."
                      className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Assign To</label>
                    <select
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select team member...</option>
                      <option value="john">John Smith</option>
                      <option value="jane">Jane Doe</option>
                      <option value="mike">Mike Johnson</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleEscalate}
                  disabled={!assignTo}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Escalate
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p className="text-sm">Select a case to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
