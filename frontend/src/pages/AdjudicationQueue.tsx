import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertList } from '../components/adjudication/AlertList';
import { AlertCard } from '../components/adjudication/AlertCard';
import { api } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { AdjudicationQueueSkeleton } from '../components/adjudication/AdjudicationQueueSkeleton';
import toast from 'react-hot-toast';

// Map AnalysisResult from API to Alert interface
function mapAnalysisResultToAlert(result: {
  id: string;
  subject_id: string;
  status: string;
  risk_score: number;
  created_at: string;
  adjudication_status: string;
  indicators: Array<{ type: string; confidence: number }>;
}): {
  id: string;
  subject_id: string;
  subject_name: string;
  risk_score: number;
  triggered_rules: string[];
  created_at: string;
  status: 'pending' | 'flagged' | 'resolved';
} {
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
    status: statusMap[result.adjudication_status] || 'pending',
  };
}

export function AdjudicationQueue() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch adjudication queue
  const { data: queueData, isLoading, error } = useQuery({
    queryKey: ['adjudication-queue'],
    queryFn: api.getAdjudicationQueue,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Map API data to alerts
  const alerts = queueData?.map(mapAnalysisResultToAlert) || [];
  
  // Set first alert as selected when data loads
  useEffect(() => {
    if (alerts.length > 0 && !selectedId) {
      setSelectedId(alerts[0].id);
    }
  }, [alerts.length, selectedId]);

  const selectedAlert = alerts.find(a => a.id === selectedId) || null;

  // WebSocket integration for real-time updates
  useWebSocket('/ws', {
    onMessage: (message) => {
      if (message.type === 'alert_added') {
        toast.success('New alert added to queue', {
          icon: '🔔',
          duration: 3000,
        });
        queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
      } else if (message.type === 'alert_resolved') {
        const resolvedId = message.payload?.analysis_id || message.payload?.id;
        if (resolvedId === selectedId) {
          // Current alert was resolved by another user
          toast.info('This alert was resolved by another analyst', {
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
        queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
      } else if (message.type === 'queue_updated') {
        queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
      }
    },
  });

  // Submit decision mutation
  const submitDecisionMutation = useMutation({
    mutationFn: ({ analysisId, decision, notes }: { analysisId: string; decision: string; notes?: string }) =>
      api.submitDecision(analysisId, decision, notes),
    onSuccess: () => {
      toast.success('Decision submitted successfully');
      // Invalidate and refetch queue
      queryClient.invalidateQueries({ queryKey: ['adjudication-queue'] });
      
      // Auto-advance to next alert
      const currentIndex = alerts.findIndex(a => a.id === selectedId);
      if (currentIndex < alerts.length - 1) {
        setSelectedId(alerts[currentIndex + 1].id);
      } else if (alerts.length > 1) {
        setSelectedId(alerts[0].id);
      } else {
        setSelectedId(null);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit decision: ${error.message}`);
    },
  });

  const handleDecision = (decision: 'approve' | 'reject' | 'escalate', confidence: string, comment?: string) => {
    if (!selectedId) return;

    // Map frontend decision to backend format
    const decisionMap: Record<string, string> = {
      approve: 'confirmed_fraud',
      reject: 'false_positive',
      escalate: 'escalated',
    };

    submitDecisionMutation.mutate({
      analysisId: selectedId,
      decision: decisionMap[decision] || decision,
      notes: comment,
    });
  };

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
      <div className="h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Sidebar: Queue */}
        <div className="col-span-3 flex flex-col h-full">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Queue</h2>
            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs font-medium">
              {alerts.length} Pending
            </span>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Queue is empty</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">All alerts have been reviewed</p>
              </div>
            ) : (
              <AlertList 
                alerts={alerts} 
                selectedId={selectedId} 
                onSelect={setSelectedId} 
              />
            )}
          </div>
        </div>

        {/* Main Content: Alert Details */}
        <div className="col-span-9 h-full">
          <AlertCard 
            alert={selectedAlert} 
            onDecision={handleDecision}
            disabled={submitDecisionMutation.isPending}
          />
        </div>
      </div>
    </PageErrorBoundary>
  );
}
