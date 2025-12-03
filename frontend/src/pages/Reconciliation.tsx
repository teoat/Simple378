import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { TransactionRow } from '../components/reconciliation/TransactionRow';
import { FileUploader } from '../components/forensics/FileUploader';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function Reconciliation() {
  const [threshold, setThreshold] = useState(0.8);
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
    mutationFn: async () => {
      const result = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/reconciliation/auto-reconcile`, {
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

  const isLoading = expensesLoading || transactionsLoading;

  return (
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="h-5 w-5" />
            {autoReconcileMutation.isPending ? 'Running...' : 'Auto-Reconcile'}
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
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

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Column */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Expenses ({expenses?.length ?? 0})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {expenses?.map((expense) => (
                <TransactionRow
                  key={expense.id}
                  id={expense.id}
                  type="expense"
                  date={expense.date}
                  description={expense.description}
                  amount={expense.amount}
                  status={expense.status as 'matched' | 'unmatched' | 'flagged'}
                />
              ))}
              {expenses?.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No expenses found
                </div>
              )}
            </div>
          </div>

          {/* Match Indicator */}
          <div className="hidden lg:flex items-center justify-center">
            <ArrowRight className="h-12 w-12 text-slate-300" />
          </div>

          {/* Transactions Column */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Transactions ({transactions?.length ?? 0})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {transactions?.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  id={transaction.id}
                  type="bank"
                  date={transaction.date}
                  description={transaction.description}
                  amount={transaction.amount}
                  status={transaction.status as 'matched' | 'unmatched' | 'flagged'}
                />
              ))}
              {transactions?.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
