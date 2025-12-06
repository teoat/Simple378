import { useState, useMemo } from 'react';
import {
  Sankey,
  Tooltip,
  ResponsiveContainer,
  Treemap,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRightLeft,
  BarChart3,
  PieChart as PieChartIcon,
  GitBranch
} from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  source_account?: string;
  destination_account?: string;
  category: string;
  type: 'credit' | 'debit';
  counterparty?: string;
}

interface FinancialFlowProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  height?: number;
}

export function FinancialFlowAnalysis({
  transactions,
  onTransactionClick,
  height = 500
}: FinancialFlowProps) {
  const [viewMode, setViewMode] = useState<'sankey' | 'treemap' | 'bar' | 'pie'>('sankey');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    if (timeRange === 'all') return transactions;

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return transactions.filter(tx => new Date(tx.date) >= cutoff);
  }, [transactions, timeRange]);

  // Prepare Sankey data - showing flow from sources to destinations
  const sankeyData = useMemo(() => {
    const nodes: Array<{ name: string }> = [];
    const links: Array<{ source: number; target: number; value: number }> = [];
    const nodeMap = new Map<string, number>();

    const addNode = (name: string) => {
      if (!nodeMap.has(name)) {
        nodeMap.set(name, nodes.length);
        nodes.push({ name });
      }
      return nodeMap.get(name)!;
    };

    // Group transactions by source -> destination
    const flows = filteredTransactions.reduce((acc, tx) => {
      const source = tx.source_account || tx.category || 'Unknown Source';
      const target = tx.destination_account || tx.counterparty || tx.category || 'Unknown Destination';

      const key = `${source}->${target}`;
      if (!acc[key]) {
        acc[key] = { source, target, value: 0, count: 0 };
      }
      acc[key].value += Math.abs(tx.amount);
      acc[key].count += 1;

      return acc;
    }, {} as Record<string, { source: string; target: string; value: number; count: number }>);

    // Create nodes and links
    Object.values(flows).forEach(flow => {
      const sourceIndex = addNode(flow.source);
      const targetIndex = addNode(flow.target);
      links.push({
        source: sourceIndex,
        target: targetIndex,
        value: flow.value
      });
    });

    return { nodes, links };
  }, [filteredTransactions]);

  // Prepare treemap data - showing transaction amounts by category
  const treemapData = useMemo(() => {
    const categoryTotals = filteredTransactions.reduce((acc, tx) => {
      const category = tx.category;
      if (!acc[category]) {
        acc[category] = { name: category, size: 0, count: 0 };
      }
      acc[category].size += Math.abs(tx.amount);
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { name: string; size: number; count: number }>);

    return Object.values(categoryTotals);
  }, [filteredTransactions]);

  // Prepare bar chart data - monthly transaction volumes
  const barChartData = useMemo(() => {
    const monthlyData = filteredTransactions.reduce((acc, tx) => {
      const month = new Date(tx.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          month,
          inflow: 0,
          outflow: 0,
          net: 0,
          count: 0
        };
      }

      if (tx.type === 'credit') {
        acc[month].inflow += tx.amount;
      } else {
        acc[month].outflow += Math.abs(tx.amount);
      }
      acc[month].net = acc[month].inflow - acc[month].outflow;
      acc[month].count += 1;

      return acc;
    }, {} as Record<string, { month: string; inflow: number; outflow: number; net: number; count: number }>);

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  // Prepare pie chart data - transaction distribution by category
  const pieChartData = useMemo(() => {
    const categoryData = filteredTransactions.reduce((acc, tx) => {
      const category = tx.category;
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      acc[category].value += Math.abs(tx.amount);
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { name: string; value: number; count: number }>);

    return Object.values(categoryData);
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const renderSankeyTooltip = (props: any) => {
    if (!props.payload || !props.payload[0]) return null;

    const data = props.payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-medium">{data.source?.name || data.target?.name}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Flow Amount: {formatCurrency(data.value)}
        </p>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Financial Flow Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>

            {/* View Mode Selector */}
            <div className="flex gap-1">
              {[
                { id: 'sankey', icon: GitBranch, label: 'Flow' },
                { id: 'treemap', icon: BarChart3, label: 'Categories' },
                { id: 'bar', icon: TrendingUp, label: 'Monthly' },
                { id: 'pie', icon: PieChartIcon, label: 'Distribution' }
              ].map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  variant={viewMode === id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(id as any)}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(filteredTransactions.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0))}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Inflow</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(filteredTransactions.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + Math.abs(tx.amount), 0))}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Outflow</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              filteredTransactions.reduce((sum, tx) => sum + (tx.type === 'credit' ? tx.amount : -Math.abs(tx.amount)), 0) >= 0
                ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(filteredTransactions.reduce((sum, tx) => sum + (tx.type === 'credit' ? tx.amount : -Math.abs(tx.amount)), 0)))}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Net Flow</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTransactions.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Transactions</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height }}>
          {viewMode === 'sankey' && sankeyData.nodes.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankeyData}
                nodePadding={15}
                margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                link={{ stroke: '#ddd' }}
              >
                <Tooltip content={renderSankeyTooltip} />
              </Sankey>
            </ResponsiveContainer>
          )}

          {viewMode === 'treemap' && treemapData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                nameKey="name"
                stroke="#fff"
                fill="#8884d8"
              >
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Total Amount']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
              </Treemap>
            </ResponsiveContainer>
          )}

          {viewMode === 'bar' && barChartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'inflow' ? 'Inflow' : name === 'outflow' ? 'Outflow' : 'Net Flow'
                  ]}
                />
                <Bar dataKey="inflow" fill="#10b981" name="inflow" />
                <Bar dataKey="outflow" fill="#ef4444" name="outflow" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'pie' && pieChartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}

          {((viewMode === 'sankey' && sankeyData.nodes.length === 0) ||
            (viewMode === 'treemap' && treemapData.length === 0) ||
            (viewMode === 'bar' && barChartData.length === 0) ||
            (viewMode === 'pie' && pieChartData.length === 0)) && (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transaction data available for the selected time range</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Recent Transactions ({filteredTransactions.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredTransactions.slice(-5).reverse().map((tx) => (
              <div
                key={tx.id}
                onClick={() => onTransactionClick?.(tx)}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {tx.description}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(tx.date).toLocaleDateString()} • {tx.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}