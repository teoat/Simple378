import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { Loader2 } from 'lucide-react';

interface HistoryTabProps {
  alertId: string;
}

export function HistoryTab({ alertId }: HistoryTabProps) {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['adjudication-history', alertId],
    queryFn: () => apiRequest(`/adjudication/history/${alertId}`),
    enabled: !!alertId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p className="text-sm">Failed to load history</p>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">No history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Activity History</h3>
      <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-6">
        {history.map((item: any) => (
          <div key={item.id} className="relative pl-6">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-slate-900 dark:text-white capitalize">{item.decision?.replace(/_/g, ' ')}</span>
              <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">by {item.reviewer_id.slice(0, 8)}</p>
            {item.reviewer_notes && (
              <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300">
                {item.reviewer_notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
