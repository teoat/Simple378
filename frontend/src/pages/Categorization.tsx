import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { CategorizationSkeleton } from '../components/categorization/CategorizationSkeleton';
import { TransactionTable } from '../components/categorization/TransactionTable';
import { CategoryPanel } from '../components/categorization/CategoryPanel';
import { BulkActions } from '../components/categorization/BulkActions';
import { AISuggestions } from '../components/categorization/AISuggestions';
import { RuleBuilder } from '../components/categorization/RuleBuilder';
import { Search, Filter, Bot, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string | null;
  confidence: number;
  source: string;
  ai_suggestion?: string;
  ai_confidence?: number;
}

interface CategoryRule {
  id: string;
  name: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  category: string;
  confidence: number;
  isActive: boolean;
}

export function Categorization() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [filterUncategorized, setFilterUncategorized] = useState(false);
  const queryClient = useQueryClient();

  // Fetch transactions needing categorization
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['categorization', 'transactions', searchQuery, selectedCategory, filterUncategorized],
    queryFn: () => api.getCategorizationTransactions({
      search: searchQuery,
      category: selectedCategory,
      uncategorized: filterUncategorized,
    }),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch available categories
  const { data: categories } = useQuery({
    queryKey: ['categorization', 'categories'],
    queryFn: () => api.getCategorizationCategories(),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch AI suggestions
  const { data: aiSuggestions } = useQuery({
    queryKey: ['categorization', 'ai-suggestions'],
    queryFn: () => api.getCategorizationAISuggestions(),
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Categorize transaction mutation
  const categorizeMutation = useMutation({
    mutationFn: ({ transactionId, category }: { transactionId: string; category: string }) =>
      api.categorizeTransaction(transactionId, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorization'] });
      toast.success('Transaction categorized successfully');
    },
    onError: (error) => {
      toast.error(`Categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Bulk categorize mutation
  const bulkCategorizeMutation = useMutation({
    mutationFn: ({ transactionIds, category }: { transactionIds: string[]; category: string }) =>
      api.bulkCategorizeTransactions(transactionIds, category),
    onSuccess: (_, { transactionIds }) => {
      queryClient.invalidateQueries({ queryKey: ['categorization'] });
      toast.success(`Successfully categorized ${transactionIds.length} transactions`);
      setSelectedTransactions(new Set());
    },
    onError: (error) => {
      toast.error(`Bulk categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Calculate progress stats
  const progressStats = useMemo(() => {
    if (!transactions) return { total: 0, categorized: 0, uncategorized: 0, progress: 0 };

    const { total, categorized, uncategorized } = transactions;
    const progress = total > 0 ? (categorized / total) * 100 : 0;

    return { total, categorized, uncategorized, progress };
  }, [transactions]);

  const handleCategorize = (transactionId: string, category: string) => {
    categorizeMutation.mutate({ transactionId, category });
  };

  const handleBulkCategorize = (category: string) => {
    if (selectedTransactions.size === 0) {
      toast.error('Please select transactions to categorize');
      return;
    }
    bulkCategorizeMutation.mutate({
      transactionIds: Array.from(selectedTransactions),
      category
    });
  };

  const handleSelectTransaction = (transactionId: string, selected: boolean) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(transactionId);
      } else {
        newSet.delete(transactionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (!transactions?.transactions) return;

    if (selected) {
      setSelectedTransactions(new Set(transactions.transactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  if (transactionsLoading) {
    return (
      <PageErrorBoundary pageName="Transaction Categorization">
        <CategorizationSkeleton />
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="Transaction Categorization">
      <div className="p-8 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Transaction Categorization
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Automatically categorize transactions with AI assistance and manual review
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRuleBuilder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Settings className="h-4 w-4" />
              Rules
            </motion.button>
          </div>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Categorization Progress</h2>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-slate-600 dark:text-slate-400">
                {progressStats.categorized} of {progressStats.total} transactions categorized
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {progressStats.progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressStats.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{progressStats.uncategorized} remaining</span>
              <span>{progressStats.categorized} completed</span>
            </div>
          </div>
        </motion.div>

        {/* AI Suggestions Panel */}
        {aiSuggestions && aiSuggestions.length > 0 && (
          <AISuggestions
            suggestions={aiSuggestions}
            onApplySuggestion={(transactionId, category) => handleCategorize(transactionId, category)}
          />
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-lg bg-white/10 dark:bg-slate-800/20 p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories?.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={filterUncategorized}
                onChange={(e) => setFilterUncategorized(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              Show uncategorized only
            </label>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTransactions.size > 0 && (
          <BulkActions
            selectedCount={selectedTransactions.size}
            categories={categories || []}
            onBulkCategorize={handleBulkCategorize}
            onClearSelection={() => setSelectedTransactions(new Set())}
            isLoading={bulkCategorizeMutation.isPending}
          />
        )}

        {/* Transaction Table */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
          <TransactionTable
            transactions={transactions?.transactions || []}
            categories={categories || []}
            selectedTransactions={selectedTransactions}
            onSelectTransaction={handleSelectTransaction}
            onSelectAll={handleSelectAll}
            onCategorize={handleCategorize}
            aiSuggestions={aiSuggestions || []}
            isLoading={categorizeMutation.isPending}
          />
        </div>

        {/* Rule Builder Modal */}
        <AnimatePresence>
          {showRuleBuilder && (
            <RuleBuilder
              onClose={() => setShowRuleBuilder(false)}
              onSave={(rule) => {
                // Save rule to local storage as placeholder until backend API is available
                const existingRules = JSON.parse(localStorage.getItem('categorizationRules') || '[]');
                const newRule = { ...rule, id: Date.now().toString() };
                existingRules.push(newRule);
                localStorage.setItem('categorizationRules', JSON.stringify(existingRules));
                setShowRuleBuilder(false);
                toast.success('Rule saved successfully');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </PageErrorBoundary>
  );
}