import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { TransactionRow } from '../components/reconciliation/TransactionRow';
import { FileUploader } from '../components/forensics/FileUploader';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { ReconciliationSkeleton } from '../components/reconciliation/ReconciliationSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { ArrowRight, CheckCircle, Upload, FileText } from 'lucide-react';

export function Reconciliation() {
  const [threshold, setThreshold] = useState(0.8);
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'expense' | 'bank' } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['reconciliation', 'expenses'],
    queryFn: api.getExpenses,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['reconciliation', 'transactions'],
    queryFn: api.getTransactions,
  });

  const autoReconcileMutation = useMutation({
    mutationFn: () => api.autoReconcile(threshold),
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
      <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Transaction Reconciliation</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Match expenses with bank transactions automatically or manually
          </p>
        </div>
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
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium border border-blue-400/20 disabled:opacity-50"
          >
            <CheckCircle className="h-5 w-5" />
            {autoReconcileMutation.isPending ? 'Running...' : 'Auto-Reconcile'}
          </button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
          {/* Expenses Column */}
          <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Expenses
              </h2>
              <Badge variant="info">{expenses?.length ?? 0} items</Badge>
            </div>
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
                <EmptyState
                  icon={FileText}
                  title="No expenses found"
                  description="Upload expense reports to begin reconciliation"
                  className="py-12"
                />
              )}
            </div>
          </div>

          {/* Match Indicator */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="h-12 w-12 text-purple-400 dark:text-cyan-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Drag to match</span>
            </div>
          </div>

          {/* Transactions Column */}
          <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Transactions
              </h2>
              <Badge variant="success">{transactions?.length ?? 0} items</Badge>
            </div>
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
                <EmptyState
                  icon={Upload}
                  title="No transactions found"
                  description="Upload bank statements to begin reconciliation"
                  className="py-12"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
