import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AlertList } from '../components/adjudication/AlertList';
import { AlertCard } from '../components/adjudication/AlertCard';
import { api } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAdjudicationQueue } from '../hooks/useAdjudicationQueue.tsx';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { AdjudicationQueueSkeleton } from '../components/adjudication/AdjudicationQueueSkeleton';
import { AIReasoningTab } from '../components/adjudication/AIReasoningTab';
import toast from 'react-hot-toast';
import type { AnalysisResult } from '../types/api';

type Alert = {
  id: string;
  subject_id: string;
  subject_name: string;
  risk_score: number;
  triggered_rules: string[];
  created_at: string;
  status: 'flagged' | 'resolved' | 'pending';
};

// Map AnalysisResult from API to Alert interface for UI display
function mapAnalysisResultToAlert(result: AnalysisResult) {
  // Extract triggered rules from indicators
  const triggered_rules = result.indicators
    .filter(ind => ind.confidence > 0.5)
    .map(ind => ind.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

  // Map adjudication_status to status
  const statusMap: Record<string, 'pending' | 'flagged' | 'resolved'> = {
    pending: 'pending',
    flagged: 'flagged',
    reviewed: 'resolved',
  };

  return {
    id: result.id,
    subject_id: result.subject_id,
    subject_name: `Subject ${result.subject_id.slice(0, 8)}`, // Will be enhanced when subject data is available
    risk_score: Math.round(result.risk_score),
    triggered_rules: triggered_rules.length > 0 ? triggered_rules : ['Pending Analysis'],
    created_at: result.created_at,
    status: statusMap[result.adjudication_status] || 'under review',
  };
}



export function AdjudicationQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derive state directly from URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = (searchParams.get('sort_by') || 'priority') as 'risk_score' | 'created_at' | 'priority';
  const sortOrder = (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc';

  // Update URL helpers
  const updatePage = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const updateSort = (key: string, order: 'asc' | 'desc') => {
    setSearchParams(prev => {
      prev.set('sort_by', key);
      prev.set('sort_order', order);
      prev.set('page', '1'); // Reset to first page on sort change
      return prev;
    });
  };

  const { data: queueData, isLoading, error } = useQuery({
    queryKey: ['adjudication-queue', page, sortBy, sortOrder],
    queryFn: () => api.getAdjudicationQueue(page, 20, sortBy, sortOrder),
    refetchInterval: 30000,
    placeholderData: (previousData) => previousData,
  });

  // Map API data to alerts
  const alerts: any[] = queueData?.items.map(mapAnalysisResultToAlert) || [];
  
  // Auto-select first alert if none selected
  const effectiveSelectedId = selectedId || (alerts.length > 0 ? alerts[0].id : null);

  const selectedAlert = alerts.find(a => a.id === effectiveSelectedId) || null as any;

  const { handleDecision, submitDecisionMutation } = useAdjudicationQueue(alerts, selectedId, setSelectedId);

  // WebSocket integration for real-time updates
  useWebSocket('/ws', {
    onMessage: (message) => {
      if (message.type === 'alert_added') {
        toast.success('New alert added to queue', {
          icon: '🔔',
          duration: 3000,
        });
        // queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
      } else if (message.type === 'alert_resolved') {
        const resolvedId = message.payload?.analysis_id || message.payload?.id;
        if (resolvedId === selectedId) {
          // Current alert was resolved by another user
          toast('This alert was resolved by another analyst', {
            icon: 'ℹ️',
            duration: 3000,
          });
          // Move to next alert
          const currentIndex = alerts.findIndex(a => a.id === selectedId);
          if (currentIndex < alerts.length - 1) {
            setSelectedId(alerts[currentIndex + 1].id);
          } else if (alerts.length > 1) {
            setSelectedId(alerts[0].id);
          } else {
            setSelectedId(null);
          }
        }
        // queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
      } else if (message.type === 'queue_updated') {
        // queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
      }
    },
  });

  if (isLoading) {
    return (
      <PageErrorBoundary pageName="Adjudication Queue">
        <AdjudicationQueueSkeleton />
      </PageErrorBoundary>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-lg shadow-sm max-w-md">
          <h3 className="font-semibold mb-2">Error loading queue</h3>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary pageName="Adjudication Queue">
      <div className="h-full p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Column: Alert List (col-span-3) */}
          <div className="col-span-3 flex flex-col h-full">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Queue</h2>
              <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs font-medium">
                {queueData?.total || 0} Pending
              </span>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              {alerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                    {page > 1 ? 'Page is empty' : 'Queue is empty'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {page > 1 ? 'No alerts on this page' : 'All alerts have been reviewed'}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden">
                  <AlertList 
                    alerts={alerts} 
                    selectedId={selectedId} 
                    onSelect={setSelectedId}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={updateSort}
                  />
                </div>
              )}
              
              {/* Pagination Controls - Always visible if we have data or are on a non-first page */}
              {(queueData?.total || 0) > 0 || page > 1 ? (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => updatePage(Math.max(1, page - 1))}
                    disabled={page === 1 || isLoading}
                    className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Page {page} of {queueData?.pages || 1}
                  </span>
                  <button
                    onClick={() => updatePage(Math.min(queueData?.pages || 1, page + 1))}
                    disabled={page === (queueData?.pages || 1) || isLoading}
                    className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Center Column: Alert Details (col-span-6) */}
          <div className="col-span-6 h-full">
            <AlertCard 
              alert={selectedAlert} 
              onDecision={handleDecision}
              disabled={submitDecisionMutation.isPending}
            />
          </div>

          {/* Right Column: AI Assistant / Additional Info (col-span-3) */}
          <div className="col-span-3 flex flex-col h-full bg-white/10 dark:bg-slate-900/40 rounded-2xl border border-white/20 dark:border-slate-700/30 backdrop-blur-xl shadow-2xl shadow-purple-500/5 overflow-hidden p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">AI Assistant</h3>
            {selectedAlert && (
              <AIReasoningTab subjectId={selectedAlert.subject_id} />
            )}
            {!selectedAlert && (
              <div className="flex-1 flex items-center justify-center text-center text-slate-500 dark:text-slate-400">
                Select an alert to see AI reasoning.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
