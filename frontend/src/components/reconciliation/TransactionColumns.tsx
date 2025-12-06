import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference: string;
  status: 'matched' | 'unmatched' | 'dispute';
}

interface TransactionColumnsProps {
  sourceTransactions?: Transaction[];
  targetTransactions?: Transaction[];
  isLoading?: boolean;
}

export function TransactionColumns({
  sourceTransactions = [],
  targetTransactions = [],
  isLoading = false,
}: TransactionColumnsProps) {
  const [searchSource, setSearchSource] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  const defaultSourceTransactions: Transaction[] = [
    {
      id: 's1',
      date: '2025-12-01',
      description: 'Vendor Payment - ABC Corp',
      amount: 150000,
      reference: 'INV-001',
      status: 'matched',
    },
    {
      id: 's2',
      date: '2025-12-02',
      description: 'Operating Expenses',
      amount: 25000,
      reference: 'EXP-001',
      status: 'unmatched',
    },
    {
      id: 's3',
      date: '2025-12-05',
      description: 'Transfer to XYZ Ltd',
      amount: 200000,
      reference: 'TRF-001',
      status: 'dispute',
    },
  ];

  const defaultTargetTransactions: Transaction[] = [
    {
      id: 't1',
      date: '2025-12-01',
      description: 'Payment ABC',
      amount: 150000,
      reference: 'PY-2025-001',
      status: 'matched',
    },
    {
      id: 't2',
      date: '2025-12-03',
      description: 'Operational Cost',
      amount: 25000,
      reference: 'PY-2025-002',
      status: 'unmatched',
    },
    {
      id: 't3',
      date: '2025-12-06',
      description: 'External Transfer',
      amount: 200000,
      reference: 'PY-2025-003',
      status: 'dispute',
    },
  ];

  const source = sourceTransactions.length > 0 ? sourceTransactions : defaultSourceTransactions;
  const target = targetTransactions.length > 0 ? targetTransactions : defaultTargetTransactions;

  const filteredSource = source.filter(
    t => t.description.toLowerCase().includes(searchSource.toLowerCase()) ||
         t.reference.toLowerCase().includes(searchSource.toLowerCase())
  );

  const filteredTarget = target.filter(
    t => t.description.toLowerCase().includes(searchTarget.toLowerCase()) ||
         t.reference.toLowerCase().includes(searchTarget.toLowerCase())
  );

  const statusConfig = {
    matched: { color: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
    unmatched: { color: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700' },
    dispute: { color: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-slate-500">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  const renderColumn = (transactions: Transaction[], search: string, setSearch: Function, expanded: string | null, setExpanded: Function, columnTitle: string) => (
    <div className="flex-1 flex flex-col">
      <h3 className="font-semibold mb-3">{columnTitle}</h3>
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {transactions.map(transaction => {
          const config = statusConfig[transaction.status];
          const isExpanded = expanded === transaction.id;

          return (
            <div
              key={transaction.id}
              className={`${config.color} border border-slate-200 rounded p-2 cursor-pointer hover:shadow-sm transition-all`}
              onClick={() => setExpanded(isExpanded ? null : transaction.id)}
            >
              <div className="flex items-start gap-2">
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{transaction.reference}</p>
                  <p className="text-xs text-slate-600 truncate">{transaction.description}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.badge}`}>
                      {transaction.status}
                    </span>
                    <span className="font-semibold text-sm">
                      ${transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <p>Date: {transaction.date}</p>
                  <p>ID: {transaction.id}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Reconciliation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 h-96">
          {renderColumn(filteredSource, searchSource, setSearchSource, expandedSource, setExpandedSource, 'Source System')}
          <div className="w-px bg-slate-200" />
          {renderColumn(filteredTarget, searchTarget, setSearchTarget, expandedTarget, setExpandedTarget, 'Target System')}
        </div>
      </CardContent>
    </Card>
  );
}
