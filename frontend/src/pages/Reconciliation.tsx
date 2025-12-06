import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { TransactionRow } from '../components/reconciliation/TransactionRow';
import { FileUploader } from '../components/forensics/FileUploader';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { ReconciliationSkeleton } from '../components/reconciliation/ReconciliationSkeleton';
import { ArrowRight, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';

export function Reconciliation() {
  const [threshold, setThreshold] = useState(0.8);
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'expense' | 'bank' } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const queryClient = useQueryClient();

  // Mock account status data
  const accountStatuses = [
    { id: 'bca-4589', name: 'BCA **** 4589', status: 'complete', coverage: 100, transactions: 145 },
    { id: 'mandiri-7823', name: 'Mandiri **** 7823', status: 'partial', coverage: 67, transactions: 67 },
    { id: 'bni-1256', name: 'BNI **** 1256', status: 'complete', coverage: 100, transactions: 89 },
    { id: 'bri-9012', name: 'BRI **** 9012', status: 'missing', coverage: 0, transactions: 0 },
    { id: 'cimb-3456', name: 'CIMB **** 3456', status: 'missing', coverage: 0, transactions: 0 },
  ];

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['reconciliation', 'expenses'],
    queryFn: api.getExpenses,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['reconciliation', 'transactions'],
    queryFn: api.getTransactions,
  });

  const autoReconcileMutation = useMutation({
    mutationFn: async () => {
      const result = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/api/v1/reconciliation/auto-reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold }),
      });
      if (!result.ok) throw new Error('Auto-reconciliation failed');
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      toast.success('Auto-reconciliation completed');
    },
    onError: (error) => {
      toast.error(`Reconciliation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const [subjectId, setSubjectId] = useState('');
  const [bankName, setBankName] = useState('');

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => api.uploadTransactions(files[0], subjectId, bankName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      toast.success('Transactions uploaded successfully');
      setSubjectId('');
      setBankName('');
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleFileUpload = (files: File[]) => {
    if (!subjectId || !bankName) {
      toast.error('Please enter Subject ID and Bank Name');
      return;
    }
    if (files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  const handleDragStart = (id: string, type: 'expense' | 'bank') => {
    setDraggedItem({ id, type });
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.type !== (expenses?.find(e => e.id === id) ? 'expense' : 'bank')) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string, targetType: 'expense' | 'bank') => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedItem) return;

    // Only allow matching between different types
    if (draggedItem.type === targetType) {
      toast.error('Cannot match items of the same type');
      return;
    }

    try {
      await api.createMatch(draggedItem.id, targetId);
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      toast.success('Match created successfully');
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    } catch {
      toast.error('Failed to create match');
    }

    setDraggedItem(null);
  };

  const isLoading = expensesLoading || transactionsLoading;

  if (isLoading) {
    return (
      <PageErrorBoundary pageName="Reconciliation">
        <ReconciliationSkeleton />
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="Reconciliation">
      <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transaction Reconciliation</h1>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            Confidence Threshold:
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="font-medium">{Math.round(threshold * 100)}%</span>
          </label>
          <button
            onClick={() => autoReconcileMutation.mutate()}
            disabled={autoReconcileMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-blue-600/90 dark:bg-blue-500/90 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 font-medium border border-blue-400/20 disabled:opacity-50"
          >
            <CheckCircle className="h-5 w-5" />
            {autoReconcileMutation.isPending ? 'Running...' : 'Auto-Reconcile'}
          </button>
        </div>
      </div>

      {/* Account Status Overview */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Bank Account Status</h2>
          <button
            onClick={() => setSimulationMode(!simulationMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              simulationMode
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Zap className="h-4 w-4" />
            {simulationMode ? 'Disable Simulation' : 'Enable Simulation'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {accountStatuses.map((account) => {
            const getStatusIcon = () => {
              switch (account.status) {
                case 'complete': return <CheckCircle className="h-5 w-5 text-green-500" />;
                case 'partial': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
                case 'missing': return <Clock className="h-5 w-5 text-red-500" />;
                default: return <Clock className="h-5 w-5 text-slate-400" />;
              }
            };

            const getStatusColor = () => {
              switch (account.status) {
                case 'complete': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
                case 'partial': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
                case 'missing': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
                default: return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50';
              }
            };

            return (
              <div key={account.id} className={`p-4 rounded-lg border ${getStatusColor()}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{account.name}</span>
                  {getStatusIcon()}
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div>Status: <span className="capitalize font-medium">{account.status}</span></div>
                  <div>Coverage: {account.coverage}%</div>
                  <div>Transactions: {account.transactions}</div>
                </div>
              </div>
            );
          })}
        </div>

        {simulationMode && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Simulation Mode Active</span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              Estimating missing transactions from 2 accounts based on historical patterns and expense claims.
            </p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upload Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subject ID (UUID)
            </label>
            <input
              type="text"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="e.g. Chase"
            />
          </div>
        </div>
        <FileUploader onUpload={handleFileUpload} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Column */}
          <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Expenses ({expenses?.length ?? 0})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {expenses?.map((expense) => (
                <div
                  key={expense.id}
                  draggable={expense.status !== 'matched'}
                  onDragStart={() => handleDragStart(expense.id, 'expense')}
                  onDragOver={(e) => handleDragOver(e, expense.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, expense.id, 'expense')}
                  className={dragOverId === expense.id ? 'ring-2 ring-blue-500 rounded-xl' : ''}
                >
                  <TransactionRow
                    id={expense.id}
                    type="expense"
                    date={expense.date}
                    description={expense.description}
                    amount={expense.amount}
                    status={expense.status as 'matched' | 'unmatched' | 'flagged'}
                  />
                </div>
              ))}
              {expenses?.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No expenses found
                </div>
              )}
            </div>
          </div>

          {/* Match Indicator with Visual Connections */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <ArrowRight className="h-12 w-12 text-purple-400 dark:text-cyan-400" />
                {/* Animated connection lines for visual feedback */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse" />
                  <div className="absolute top-1/2 right-0 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                </div>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Drag to match</span>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Match Rate: 78% • 15 Unmatched • 8 Flagged
              </div>
            </div>
          </div>

          {/* Transactions Column */}
          <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Transactions ({transactions?.length ?? 0})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  draggable={transaction.status !== 'matched'}
                  onDragStart={() => handleDragStart(transaction.id, 'bank')}
                  onDragOver={(e) => handleDragOver(e, transaction.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, transaction.id, 'bank')}
                  className={dragOverId === transaction.id ? 'ring-2 ring-blue-500 rounded-xl' : ''}
                >
                  <TransactionRow
                    id={transaction.id}
                    type="bank"
                    date={transaction.date}
                    description={transaction.description}
                    amount={transaction.amount}
                    status={transaction.status as 'matched' | 'unmatched' | 'flagged'}
                  />
                </div>
              ))}
              {transactions?.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
