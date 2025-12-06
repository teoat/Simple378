import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Filter, Search, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export function TransactionCategorization() {
  const { caseId } = useParams<{ caseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const uncategorizedOnly = searchParams.get('uncategorized') === 'true';

  // Fetch transactions
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['categorization-transactions', searchQuery, categoryFilter, uncategorizedOnly],
    queryFn: () => api.getCategorizationTransactions({
      search: searchQuery || undefined,
      category: categoryFilter || undefined,
      uncategorized: uncategorizedOnly || undefined,
    }),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categorization-categories'],
    queryFn: () => api.getCategorizationCategories(),
  });

  const handleBulkCategorize = async () => {
    if (selectedIds.length === 0 || !selectedCategory) {
      toast.error('Please select transactions and a category');
      return;
    }

    try {
      await api.bulkCategorizeTransactions(selectedIds, selectedCategory);
      toast.success(`Categorized ${selectedIds.length} transactions`);
      setSelectedIds([]);
      setSelectedCategory('');
      refetch();
    } catch (error) {
      toast.error('Failed to categorize transactions');
      console.error(error);
    }
  };

  const handleSingleCategorize = async (transactionId: string, category: string) => {
    try {
      await api.categorizeTransaction(transactionId, category);
      toast.success('Transaction categorized');
      refetch();
    } catch (error) {
      toast.error('Failed to categorize');
      console.error(error);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === (data?.transactions.length || 0)) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.transactions.map(t => t.id) || []);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full p-6 bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  const transactions = data?.transactions || [];
  const stats = {
    total: data?.total || 0,
    categorized: data?.categorized || 0,
    uncategorized: data?.uncategorized || 0,
  };

  return (
    <div className="h-full p-6 bg-slate-50 dark:bg-slate-950 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Transaction Categorization
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Organize and categorize your transactions for better insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl px-4 py-2 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-2 shadow-sm border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs text-emerald-700 dark:text-emerald-400">Categorized</div>
              <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{stats.categorized}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2 shadow-sm border border-amber-200 dark:border-amber-800">
              <div className="text-xs text-amber-700 dark:text-amber-400">Uncategorized</div>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-100">{stats.uncategorized}</div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchParams({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setSearchParams({ category: e.target.value })}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => setSearchParams({ uncategorized: (!uncategorizedOnly).toString() })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                uncategorizedOnly 
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Uncategorized Only
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedIds.length} selected
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={handleBulkCategorize}
                disabled={!selectedCategory}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Category
              </button>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Transaction Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === transactions.length && transactions.length > 0}
                    onChange={selectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">AI Suggestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tx.id)}
                      onChange={() => toggleSelection(tx.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                    {tx.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-slate-900 dark:text-white">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {tx.category ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        <Tag className="w-3 h-3" />
                        {tx.category}
                      </span>
                    ) : (
                      <select
                        onChange={(e) => handleSingleCategorize(tx.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                      >
                        <option value="">Uncategorized</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {tx.ai_suggestion && (
                      <button
                        onClick={() => handleSingleCategorize(tx.id, tx.ai_suggestion!)}
                        className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tx.ai_suggestion} ({Math.round((tx.ai_confidence || 0) * 100)}%)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              No transactions found matching your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
