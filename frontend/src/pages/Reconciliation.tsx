import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeftRight, 
  Check, 
  X, 
  AlertTriangle, 
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Link2,
  Unlink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

// Types
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  account: string;
  category: string;
  source: 'internal' | 'external';
  matchStatus: 'matched' | 'unmatched' | 'pending' | 'conflict';
  matchedWith?: string;
  confidence?: number;
}

interface Match {
  internalId: string;
  externalId: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'manual';
}

type ReconciliationView = 'all' | 'matched' | 'unmatched' | 'conflicts';

// Mock data
const mockInternalTransactions: Transaction[] = [
  { id: 'INT001', date: '2024-03-15', description: 'Vendor Payment - Acme Corp', amount: 15000, account: 'ACC-001', category: 'Operations', source: 'internal', matchStatus: 'matched', matchedWith: 'EXT001', confidence: 0.98 },
  { id: 'INT002', date: '2024-03-14', description: 'Office Supplies', amount: 450.50, account: 'ACC-002', category: 'Supplies', source: 'internal', matchStatus: 'unmatched' },
  { id: 'INT003', date: '2024-03-13', description: 'Consulting Fee - Smith LLC', amount: 8500, account: 'ACC-001', category: 'Services', source: 'internal', matchStatus: 'pending', matchedWith: 'EXT003', confidence: 0.72 },
  { id: 'INT004', date: '2024-03-12', description: 'Equipment Purchase', amount: 25000, account: 'ACC-003', category: 'CapEx', source: 'internal', matchStatus: 'conflict', matchedWith: 'EXT004', confidence: 0.65 },
  { id: 'INT005', date: '2024-03-11', description: 'Software License', amount: 1200, account: 'ACC-002', category: 'IT', source: 'internal', matchStatus: 'matched', matchedWith: 'EXT005', confidence: 0.95 },
  { id: 'INT006', date: '2024-03-10', description: 'Travel Expense - Conference', amount: 3200, account: 'ACC-004', category: 'Travel', source: 'internal', matchStatus: 'unmatched' }
];

const mockExternalTransactions: Transaction[] = [
  { id: 'EXT001', date: '2024-03-15', description: 'ACME CORP Payment', amount: 15000, account: 'BANK-001', category: 'Outgoing', source: 'external', matchStatus: 'matched', matchedWith: 'INT001', confidence: 0.98 },
  { id: 'EXT002', date: '2024-03-14', description: 'STAPLES Purchase', amount: 445.00, account: 'BANK-001', category: 'Outgoing', source: 'external', matchStatus: 'unmatched' },
  { id: 'EXT003', date: '2024-03-13', description: 'Smith Consulting Fee', amount: 8750, account: 'BANK-002', category: 'Outgoing', source: 'external', matchStatus: 'pending', matchedWith: 'INT003', confidence: 0.72 },
  { id: 'EXT004', date: '2024-03-12', description: 'Tech Equipment Inc', amount: 24500, account: 'BANK-001', category: 'Outgoing', source: 'external', matchStatus: 'conflict', matchedWith: 'INT004', confidence: 0.65 },
  { id: 'EXT005', date: '2024-03-11', description: 'Software License Adobe', amount: 1200, account: 'BANK-002', category: 'Outgoing', source: 'external', matchStatus: 'matched', matchedWith: 'INT005', confidence: 0.95 },
  { id: 'EXT006', date: '2024-03-09', description: 'UNKNOWN TRANSFER', amount: 5000, account: 'BANK-003', category: 'Unknown', source: 'external', matchStatus: 'unmatched' }
];

export function Reconciliation() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ReconciliationView>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInternal, setSelectedInternal] = useState<string | null>(null);
  const [selectedExternal, setSelectedExternal] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Fetch internal transactions
  const { data: internalTransactions = mockInternalTransactions, isLoading: loadingInternal } = useQuery<Transaction[]>({
    queryKey: ['reconciliation', 'internal'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockInternalTransactions;
    }
  });

  // Fetch external transactions
  const { data: externalTransactions = mockExternalTransactions, isLoading: loadingExternal } = useQuery<Transaction[]>({
    queryKey: ['reconciliation', 'external'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockExternalTransactions;
    }
  });

  // Auto-reconciliation mutation
  const autoReconcileMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { matched: 3, conflicts: 1 };
    },
    onSuccess: (data) => {
      toast.success(`Auto-reconciliation complete: ${data.matched} matched, ${data.conflicts} conflicts`);
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    }
  });

  // Manual match mutation
  const manualMatchMutation = useMutation({
    mutationFn: async ({ internalId, externalId }: { internalId: string; externalId: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { internalId, externalId, success: true };
    },
    onSuccess: () => {
      toast.success('Transactions matched successfully');
      setSelectedInternal(null);
      setSelectedExternal(null);
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    }
  });

  // Unmatch mutation
  const unmatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { unmatchedId: matchId };
    },
    onSuccess: () => {
      toast.success('Match removed');
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    }
  });

  // Filter transactions based on view
  const filterByView = (transactions: Transaction[]) => {
    switch (view) {
      case 'matched':
        return transactions.filter(t => t.matchStatus === 'matched');
      case 'unmatched':
        return transactions.filter(t => t.matchStatus === 'unmatched');
      case 'conflicts':
        return transactions.filter(t => t.matchStatus === 'conflict' || t.matchStatus === 'pending');
      default:
        return transactions;
    }
  };

  // Search filter
  const filterBySearch = (transactions: Transaction[]) => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.description.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query) ||
      t.account.toLowerCase().includes(query)
    );
  };

  const filteredInternal = useMemo(() => 
    filterBySearch(filterByView(internalTransactions)),
    [internalTransactions, view, searchQuery]
  );

  const filteredExternal = useMemo(() => 
    filterBySearch(filterByView(externalTransactions)),
    [externalTransactions, view, searchQuery]
  );

  // Stats
  const stats = useMemo(() => ({
    totalInternal: internalTransactions.length,
    totalExternal: externalTransactions.length,
    matched: internalTransactions.filter(t => t.matchStatus === 'matched').length,
    unmatched: internalTransactions.filter(t => t.matchStatus === 'unmatched').length,
    conflicts: internalTransactions.filter(t => t.matchStatus === 'conflict' || t.matchStatus === 'pending').length,
    matchRate: Math.round((internalTransactions.filter(t => t.matchStatus === 'matched').length / internalTransactions.length) * 100) || 0
  }), [internalTransactions]);

  const handleManualMatch = () => {
    if (selectedInternal && selectedExternal) {
      manualMatchMutation.mutate({ internalId: selectedInternal, externalId: selectedExternal });
    }
  };

  const getStatusBadge = (status: Transaction['matchStatus'], confidence?: number) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'matched':
        return <span className={`${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}>Matched</span>;
      case 'unmatched':
        return <span className={`${baseClasses} bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400`}>Unmatched</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`}>Review ({Math.round((confidence || 0) * 100)}%)</span>;
      case 'conflict':
        return <span className={`${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}>Conflict</span>;
      default:
        return null;
    }
  };

  const isLoading = loadingInternal || loadingExternal;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading reconciliation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="container mx-auto max-w-[1800px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Transaction Reconciliation
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Match internal records with external bank statements
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => autoReconcileMutation.mutate()}
              disabled={autoReconcileMutation.isPending}
            >
              <Zap className={`h-4 w-4 mr-2 ${autoReconcileMutation.isPending ? 'animate-pulse' : ''}`} />
              {autoReconcileMutation.isPending ? 'Processing...' : 'Auto-Reconcile'}
            </Button>
            <Button 
              onClick={handleManualMatch}
              disabled={!selectedInternal || !selectedExternal || manualMatchMutation.isPending}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Match Selected
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalInternal}</div>
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Internal Records</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalExternal}</div>
              <p className="text-sm text-purple-600/70 dark:text-purple-400/70">External Records</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.matched}</div>
              <p className="text-sm text-green-600/70 dark:text-green-400/70">Matched</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-600 dark:text-slate-400">{stats.unmatched}</div>
              <p className="text-sm text-slate-600/70 dark:text-slate-400/70">Unmatched</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.conflicts}</div>
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Needs Review</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                {(['all', 'matched', 'unmatched', 'conflicts'] as ReconciliationView[]).map((v) => (
                  <Button
                    key={v}
                    variant={view === v ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView(v)}
                  >
                    {v === 'all' && 'All'}
                    {v === 'matched' && <><Check className="h-3 w-3 mr-1" /> Matched</>}
                    {v === 'unmatched' && <><X className="h-3 w-3 mr-1" /> Unmatched</>}
                    {v === 'conflicts' && <><AlertTriangle className="h-3 w-3 mr-1" /> Review</>}
                  </Button>
                ))}
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-Column Transaction Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Internal Transactions */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  Internal Records
                </CardTitle>
                <span className="text-sm text-slate-500">{filteredInternal.length} records</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {filteredInternal.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedInternal === transaction.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : transaction.matchStatus === 'matched'
                        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                    onClick={() => setSelectedInternal(selectedInternal === transaction.id ? null : transaction.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-slate-500">{transaction.id}</span>
                          {getStatusBadge(transaction.matchStatus, transaction.confidence)}
                        </div>
                        <p className="font-medium truncate">{transaction.description}</p>
                        <p className="text-sm text-slate-500">{transaction.date} • {transaction.account}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${transaction.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{transaction.category}</p>
                      </div>
                    </div>
                    {transaction.matchedWith && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Matched with: <span className="font-mono">{transaction.matchedWith}</span>
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            unmatchMutation.mutate(transaction.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Unlink className="h-3 w-3" /> Unmatch
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredInternal.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No transactions found
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Transactions */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  External Records
                </CardTitle>
                <span className="text-sm text-slate-500">{filteredExternal.length} records</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {filteredExternal.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedExternal === transaction.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : transaction.matchStatus === 'matched'
                        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                    onClick={() => setSelectedExternal(selectedExternal === transaction.id ? null : transaction.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-slate-500">{transaction.id}</span>
                          {getStatusBadge(transaction.matchStatus, transaction.confidence)}
                        </div>
                        <p className="font-medium truncate">{transaction.description}</p>
                        <p className="text-sm text-slate-500">{transaction.date} • {transaction.account}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${transaction.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{transaction.category}</p>
                      </div>
                    </div>
                    {transaction.matchedWith && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Matched with: <span className="font-mono">{transaction.matchedWith}</span>
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            unmatchMutation.mutate(transaction.id);
                          }}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Unlink className="h-3 w-3" /> Unmatch
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredExternal.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Match Preview */}
        {(selectedInternal || selectedExternal) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 mb-1">Internal</p>
                      <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                        {selectedInternal || '—'}
                      </p>
                    </div>
                    <ArrowLeftRight className="h-8 w-8 text-slate-400" />
                    <div className="text-center">
                      <p className="text-sm text-slate-500 mb-1">External</p>
                      <p className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                        {selectedExternal || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedInternal(null);
                        setSelectedExternal(null);
                      }}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      onClick={handleManualMatch}
                      disabled={!selectedInternal || !selectedExternal}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Create Match
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
