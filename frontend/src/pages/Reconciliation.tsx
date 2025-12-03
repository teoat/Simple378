import { RefreshCw } from 'lucide-react';
import { TransactionRow } from '../components/reconciliation/TransactionRow';

const expenses = [
  { id: 'EXP-001', date: '2024-03-10', description: 'Business Lunch', amount: 125.50, status: 'unmatched', type: 'expense' },
  { id: 'EXP-002', date: '2024-03-11', description: 'Office Supplies', amount: 45.00, status: 'matched', type: 'expense' },
  { id: 'EXP-003', date: '2024-03-12', description: 'Uber Ride', amount: 22.30, status: 'flagged', type: 'expense' },
] as const;

const transactions = [
  { id: 'TXN-991', date: '2024-03-10', description: 'RESTAURANT 123', amount: 125.50, status: 'unmatched', type: 'bank' },
  { id: 'TXN-992', date: '2024-03-11', description: 'STAPLES #442', amount: 45.00, status: 'matched', type: 'bank' },
  { id: 'TXN-993', date: '2024-03-15', description: 'UNKNOWN VENDOR', amount: 500.00, status: 'unmatched', type: 'bank' },
] as const;

export function Reconciliation() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
            Reconciliation
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Match expenses to bank transactions to detect discrepancies.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Auto-Reconcile
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Expenses Column */}
        <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Submitted Expenses</h3>
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-300">
              {expenses.length} items
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {expenses.map((item) => (
              <TransactionRow key={item.id} {...item} />
            ))}
          </div>
        </div>

        {/* Bank Transactions Column */}
        <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Bank Transactions</h3>
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-300">
              {transactions.length} items
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {transactions.map((item) => (
              <TransactionRow key={item.id} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
