import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeftRight, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  Link2,
  Search 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { VirtualTransactionList } from '../components/reconciliation/VirtualTransactionList';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

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

type ReconciliationView = 'all' | 'matched' | 'unmatched' | 'conflicts';

export function Reconciliation() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ReconciliationView>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInternal, setSelectedInternal] = useState<string | null>(null);
  const [selectedExternal, setSelectedExternal] = useState<string | null>(null);

  // Fetch internal transactions
  const { data: internalTransactions = [], isLoading: loadingInternal } = useQuery<Transaction[]>({
    queryKey: ['reconciliation', 'internal'],
    queryFn: () => api.get<Transaction[]>('/reconciliation/transactions?source=internal')
  });

  // Fetch external transactions
  const { data: externalTransactions = [], isLoading: loadingExternal } = useQuery<Transaction[]>({
    queryKey: ['reconciliation', 'external'],
    queryFn: () => api.get<Transaction[]>('/reconciliation/transactions?source=external')
  });

  // Auto-reconciliation mutation
  const autoReconcileMutation = useMutation({
    mutationFn: () => api.post<{ matched: number; conflicts: number }>('/reconciliation/auto-match', {}),
    onSuccess: (data) => {
      toast.success(`Auto-reconciliation complete: ${data.matched} matched, ${data.conflicts} conflicts`);
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    }
  });

  // Manual match mutation
  const manualMatchMutation = useMutation({
    mutationFn: ({ internalId, externalId }: { internalId: string; externalId: string }) => 
      api.post('/reconciliation/match', { internal_id: internalId, external_id: externalId }),
    onSuccess: () => {
      toast.success('Transactions matched successfully');
      setSelectedInternal(null);
      setSelectedExternal(null);
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    }
  });

  // Unmatch mutation
  const unmatchMutation = useMutation({
    mutationFn: (transactionId: string) => api.delete(`/reconciliation/match/${transactionId}`),
    onSuccess: () => {
      toast.success('Match removed');
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    }
  });

  // Filter transactions based on view
  const filterByView = useCallback((transactions: Transaction[]) => {
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
  }, [view]);

  // Search filter
  const filterBySearch = useCallback((transactions: Transaction[]) => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.description.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query) ||
      t.account.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredInternal = useMemo(() => 
    filterBySearch(filterByView(internalTransactions)),
    [internalTransactions, filterByView, filterBySearch]
  );

  const filteredExternal = useMemo(() => 
    filterBySearch(filterByView(externalTransactions)),
    [externalTransactions, filterByView, filterBySearch]
  );

  // Stats
  const stats = useMemo(() => ({
    totalInternal: internalTransactions.length,
    totalExternal: externalTransactions.length,
    matched: internalTransactions.filter(t => t.matchStatus === 'matched').length,
    unmatched: internalTransactions.filter(t => t.matchStatus === 'unmatched').length,
    conflicts: internalTransactions.filter(t => t.matchStatus === 'conflict' || t.matchStatus === 'pending').length,
    matchRate: Math.round((internalTransactions.filter(t => t.matchStatus === 'matched').length / (internalTransactions.length || 1)) * 100) || 0
  }), [internalTransactions, externalTransactions]);

  const handleManualMatch = () => {
    if (selectedInternal && selectedExternal) {
      manualMatchMutation.mutate({ internalId: selectedInternal, externalId: selectedExternal });
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
              Use AI/ML to automatically match internal records with external bank statements
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => autoReconcileMutation.mutate()}
              disabled={autoReconcileMutation.isPending}
            >
              <Zap className={`h-4 w-4 mr-2 ${autoReconcileMutation.isPending ? 'animate-pulse' : ''}`} />
              {autoReconcileMutation.isPending ? 'AI Matching...' : 'AI Auto-Match'}
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
                    variant={view === v ? 'primary' : 'outline'}
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
            <CardContent className="h-[600px] p-0">
              {filteredInternal.length > 0 ? (
                <VirtualTransactionList
                   transactions={filteredInternal}
                   selectedId={selectedInternal}
                   onSelect={(id) => setSelectedInternal(selectedInternal === id ? null : id)}
                   onUnmatch={(id) => unmatchMutation.mutate(id)}
                   colorTheme="blue"
                   height={600}
                />
              ) : (
                <div className="text-center py-24 text-slate-500">
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
            <CardContent className="h-[600px] p-0">
              {filteredExternal.length > 0 ? (
                <VirtualTransactionList
                   transactions={filteredExternal}
                   selectedId={selectedExternal}
                   onSelect={(id) => setSelectedExternal(selectedExternal === id ? null : id)}
                   onUnmatch={(id) => unmatchMutation.mutate(id)}
                   colorTheme="purple"
                   height={600}
                />
              ) : (
                <div className="text-center py-24 text-slate-500">
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
