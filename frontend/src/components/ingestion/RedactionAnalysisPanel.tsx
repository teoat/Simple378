import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface AnalysisResult {
  gaps: Array<{
    type: string;
    inferred_value: string;
    confidence: number;
    context: string;
  }>;
  balance_findings: Array<{
    type: string;
    inferred_value: number;
    confidence: number;
    context: string;
  }>;
  total_analyzed: number;
}

interface RedactionAnalysisPanelProps {
  results: AnalysisResult | null;
  loading: boolean;
  onAnalyze: () => void;
}

export function RedactionAnalysisPanel({ results, loading, onAnalyze }: RedactionAnalysisPanelProps) {
  if (!results && !loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Redaction Gap Analysis
        </h3>
        <p className="text-slate-500 mb-4">
          Analyze your data for missing sequence numbers and balance discrepancies.
        </p>
        <button
          onClick={onAnalyze}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Run Analysis
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500">Analyzing transaction patterns...</p>
      </div>
    );
  }

  if (!results) return null;

  const hasIssues = results.gaps.length > 0 || results.balance_findings.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
        <div>
           <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            Analysis Results
            {hasIssues ? (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-200">
                Issues Found
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-200">
                Clean
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Analyzed {results.total_analyzed} records
          </p>
        </div>
        <button 
           onClick={onAnalyze}
           className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Re-run
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Sequence Gaps */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            Sequence Gaps
            <span className="text-xs font-normal text-slate-500">
              ({results.gaps.length})
            </span>
          </h4>
          
          {results.gaps.length === 0 ? (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              No sequence gaps detected.
            </p>
          ) : (
             <div className="space-y-3">
               {results.gaps.map((gap, i) => (
                 <div key={i} className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-amber-900 dark:text-amber-100 text-sm">
                          Missing: {gap.inferred_value}
                        </span>
                        <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 rounded">
                          {Math.round(gap.confidence * 100)}% Conf.
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {gap.context}
                      </p>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* Balance Discrepancies */}
         <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            Balance Verification
            <span className="text-xs font-normal text-slate-500">
              ({results.balance_findings.length})
            </span>
          </h4>
          
           {results.balance_findings.length === 0 ? (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              No balance checks run (requires start/end balance).
            </p>
          ) : (
             <div className="space-y-3">
               {results.balance_findings.map((finding, i) => (
                 <div key={i} className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-red-900 dark:text-red-100 text-sm">
                          Discrepancy: {finding.inferred_value > 0 ? '+' : ''}{finding.inferred_value.toFixed(2)}
                        </span>
                        <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-1.5 rounded">
                           Critical
                        </span>
                      </div>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {finding.context}
                      </p>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
