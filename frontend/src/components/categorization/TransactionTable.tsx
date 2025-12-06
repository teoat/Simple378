import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

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

interface AISuggestion {
  transactionId: string;
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  categories: string[];
  selectedTransactions: Set<string>;
  onSelectTransaction: (transactionId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onCategorize: (transactionId: string, category: string) => void;
  aiSuggestions: AISuggestion[];
  isLoading: boolean;
}

export function TransactionTable({
  transactions,
  categories,
  selectedTransactions,
  onSelectTransaction,
  onSelectAll,
  onCategorize,
  aiSuggestions,
  isLoading,
}: TransactionTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const getAISuggestion = (transactionId: string) => {
    return aiSuggestions.find(s => s.transactionId === transactionId);
  };

  const toggleRowExpansion = (transactionId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-4 text-left">
              <input
                type="checkbox"
                checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
              />
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI Suggestion
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {transactions.map((transaction) => {
            const aiSuggestion = getAISuggestion(transaction.id);
            const isExpanded = expandedRows.has(transaction.id);

            return (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                  selectedTransactions.has(transaction.id) && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.has(transaction.id)}
                    onChange={(e) => onSelectTransaction(transaction.id, e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-900 dark:text-white font-medium">
                      {transaction.description}
                    </span>
                    {aiSuggestion && (
                      <Bot className="h-4 w-4 text-blue-500" title="AI suggestion available" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4">
                  {transaction.category ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {transaction.category}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                      Uncategorize
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getConfidenceIcon(transaction.confidence)}
                    <span className={cn("text-sm font-medium", getConfidenceColor(transaction.confidence))}>
                      {(transaction.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {aiSuggestion ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {aiSuggestion.suggestedCategory}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({(aiSuggestion.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {!transaction.category && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            onCategorize(transaction.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                        disabled={isLoading}
                      >
                        <option value="">Categorize</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    )}

                    {aiSuggestion && !transaction.category && (
                      <button
                        onClick={() => onCategorize(transaction.id, aiSuggestion.suggestedCategory)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        disabled={isLoading}
                      >
                        Apply AI
                      </button>
                    )}

                    <button
                      onClick={() => toggleRowExpansion(transaction.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            All transactions categorized
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Great job! All transactions have been properly categorized.
          </p>
        </div>
      )}
    </div>
  );
}