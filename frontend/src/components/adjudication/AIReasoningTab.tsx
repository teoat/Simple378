import { useQuery } from '@tanstack/react-query';
import { Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface AIReasoningTabProps {
  subjectId: string;
}

export function AIReasoningTab({ subjectId }: AIReasoningTabProps) {
  const { data: aiAnalysis, isLoading, error } = useQuery({
    queryKey: ['ai-analysis', subjectId],
    queryFn: () => api.getAIAnalysis(subjectId),
    enabled: !!subjectId,
  });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading AI analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !aiAnalysis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p className="text-sm">Failed to load AI analysis</p>
        </div>
      </div>
    );
  }

  const findings = aiAnalysis.findings || {};
  const confidence = aiAnalysis.verdict ? 85 : 0; // Placeholder confidence calculation

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Analysis</h3>
      </div>

      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-purple-600 dark:text-purple-300">Confidence Score</span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">{confidence}%</span>
        </div>
        <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${confidence}%` }}></div>
        </div>
      </div>

      {aiAnalysis.verdict && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <h4 className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-2">Verdict</h4>
          <p className="text-slate-900 dark:text-white">{aiAnalysis.verdict}</p>
        </div>
      )}

      {Object.keys(findings).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Findings</h4>
          {Object.entries(findings).map(([key, value]) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{String(value)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
