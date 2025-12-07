import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertList } from '../components/adjudication/AlertList';
import { AlertCard } from '../components/adjudication/AlertCard';
import { DecisionPanel } from '../components/adjudication/DecisionPanel';
import { ContextTabs } from '../components/adjudication/ContextTabs';
import { AdjudicationQueueSkeleton } from '../components/adjudication/AdjudicationQueueSkeleton';
import { apiRequest } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';
import { Filter, RefreshCw, ArrowUpDown, Undo2 } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

interface Alert {
  id: string;
  subject_id: string;
  subject_name: string;
  risk_score: number;
  status: 'pending' | 'flagged' | 'resolved';
  decision?: 'confirmed_fraud' | 'false_positive' | 'escalated' | null;
  created_at: string;
  triggered_rules: string[];
  adjudication_status: string;
}

interface QueueResponse {
  items: Alert[];
  total: number;
  page: number;
  pages: number;
}



export function AdjudicationQueue() {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(() => {
    // Initialize with first alert ID if data is available immediately
    return null;
  });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'flagged'>('pending');
  const [sortBy, setSortBy] = useState<'risk_score' | 'created_at'>('risk_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const queryClient = useQueryClient();
  const undoTimeoutRef = useRef<NodeJS.Timeout>();

  // WebSocket integration for real-time updates
  const { lastMessage } = useWebSocket('/ws');

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'queue_updated') {
        queryClient.invalidateQueries({ queryKey: ['adjudication', 'queue'] });
      } else if (lastMessage.type === 'alert_resolved') {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (lastMessage.payload?.resolver_id && lastMessage.payload.resolver_id !== currentUser.id) {
          toast('Alert resolved by another analyst', { icon: '👥' });
          queryClient.invalidateQueries({ queryKey: ['adjudication', 'queue'] });
        }
      }
    }
  }, [lastMessage, queryClient]);

  // Fetch queue
  const { data: queueData, isLoading, refetch } = useQuery<QueueResponse>({
    queryKey: ['adjudication', 'queue', page, statusFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      return apiRequest<QueueResponse>(`/adjudication/queue?${params}`);
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  // Auto-select first alert if none selected
  const effectiveSelectedId = selectedAlertId ||
    (queueData?.items && queueData.items.length > 0 ? queueData.items[0].id : null);

  // Undo mutation
  const undoMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest(`/adjudication/${alertId}/revert`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast.success('Decision reverted successfully');
      queryClient.invalidateQueries({ queryKey: ['adjudication', 'queue'] });
    },
    onError: (err) => {
      toast.error('Failed to revert: ' + (err as Error).message);
    }
  });

  // Submit decision mutation
  const decisionMutation = useMutation({
    mutationFn: async ({ 
      alertId, 
      decision, 
      comment 
    }: { 
      alertId: string; 
      decision: 'approve' | 'reject' | 'escalate'; 
      comment?: string;
    }) => {
      const decisionMap = {
        approve: 'confirmed_fraud',
        reject: 'false_positive',
        escalate: 'escalated'
      };

      return apiRequest(`/adjudication/${alertId}/decision`, {
        method: 'POST',
        body: JSON.stringify({
          decision: decisionMap[decision],
          notes: comment
        })
      });
    },
    onMutate: async ({ alertId }) => {
      await queryClient.cancelQueries({ queryKey: ['adjudication', 'queue'] });
      const previousData = queryClient.getQueryData<QueueResponse>(['adjudication', 'queue', page, statusFilter, sortBy, sortOrder]);
      
      if (previousData) {
        queryClient.setQueryData<QueueResponse>(
          ['adjudication', 'queue', page, statusFilter, sortBy, sortOrder],
          {
            ...previousData,
            items: previousData.items.filter(a => a.id !== alertId),
            total: previousData.total - 1
          }
        );
      }

      const currentIndex = previousData?.items.findIndex(a => a.id === alertId) || 0;
      const nextAlert = previousData?.items[currentIndex + 1] || previousData?.items[currentIndex - 1];
      if (nextAlert) {
        setSelectedAlertId(nextAlert.id);
      } else {
        setSelectedAlertId(null);
      }

      return { previousData };
    },
    onSuccess: (_, { decision, alertId }) => {
      const actionLabel = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'escalated';
      
      // Clear undo after 5 seconds
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
      }, 5000);

      // Show undo toast
      toast((t) => (
        <div className="flex items-center gap-3">
          <span>Alert {actionLabel}</span>
          <button
            onClick={() => {
              undoMutation.mutate(alertId);
              toast.dismiss(t.id);
              if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
            }}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm font-medium flex items-center gap-1"
          >
            <Undo2 className="w-3 h-3" />
            Undo
          </button>
        </div>
      ), { duration: 5000 });

      refetch();
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adjudication', 'queue', page, statusFilter, sortBy, sortOrder], context.previousData);
      }
      toast.error('Failed to submit decision: ' + (err as Error).message);
    }
  });

  const handleDecision = (decision: 'approve' | 'reject' | 'escalate', confidence: string, comment?: string) => {
    if (!effectiveSelectedId) return;

    decisionMutation.mutate({
      alertId: effectiveSelectedId,
      decision,
      comment: comment || `Decision: ${decision} (Confidence: ${confidence})`
    });
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const selectedAlert = queueData?.items.find(a => a.id === effectiveSelectedId);

  // Keyboard shortcuts
  useHotkeys('ctrl+r,cmd+r', (e) => {
    e.preventDefault();
    refetch();
    toast('Queue refreshed');
  });

  if (isLoading) {
    return <AdjudicationQueueSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adjudication Queue
            </h1>
            <p className="text-slate-400 mt-1">
              {queueData?.total || 0} alerts pending review
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Control */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'risk_score' | 'created_at')}
                className="bg-transparent text-sm text-slate-300 px-3 py-2 outline-none"
                aria-label="Sort by"
              >
                <option value="risk_score">Risk Score</option>
                <option value="created_at">Date</option>
              </select>
              <button
                onClick={toggleSort}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                <ArrowUpDown className={`w-4 h-4 text-slate-300 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-1">
              {(['all', 'pending', 'flagged'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    statusFilter === filter
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-slate-300 hover:text-white transition-all"
              aria-label="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Split View */}
        <div className="grid grid-cols-12 gap-6">
          {/* Alert List - Left Pane */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  Alert Queue
                </h2>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                  {queueData?.items.length || 0}
                </span>
              </div>

              {queueData?.items && queueData.items.length > 0 ? (
                <AlertList
                  alerts={queueData.items}
                  selectedId={effectiveSelectedId}
                  onSelect={setSelectedAlertId}
                />
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>No alerts in queue</p>
                  <p className="text-sm mt-1">All clear! 🎉</p>
                </div>
              )}

              {/* Pagination */}
              {queueData && queueData.pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-400">
                    Page {page} of {queueData.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(queueData.pages, p + 1))}
                    disabled={page === queueData.pages}
                    className="px-3 py-1 text-sm text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Alert Detail - Right Pane */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            {selectedAlert ? (
              <div className="space-y-4">
                {/* Alert Card */}
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl">
                  <AlertCard alert={selectedAlert} onDecision={handleDecision} />
                </div>

                {/* Context Tabs */}
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
                  <ContextTabs alertId={selectedAlert.id} subjectId={selectedAlert.subject_id} activeTab="context" onTabChange={() => {}} />
                </div>

                {/* Decision Panel */}
                <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl">
                  <DecisionPanel 
                    onDecision={handleDecision}
                    disabled={decisionMutation.isPending}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-12 text-center shadow-2xl">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Alert Selected</h3>
                  <p className="text-slate-400">
                    Select an alert from the queue to review and take action
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
