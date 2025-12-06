import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { AlertTriangle, TrendingUp, Shield, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface FraudIndicator {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  amount: number;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface FraudDetectionPanelProps {
  indicators?: FraudIndicator[];
  riskScore?: number;
}

const defaultIndicators: FraudIndicator[] = [
  { id: '1', type: 'Layering', severity: 'high', description: 'Multiple rapid transfers', amount: 450000, count: 12, trend: 'up' },
  { id: '2', type: 'Structuring', severity: 'high', description: 'Split transactions below threshold', amount: 89000, count: 18, trend: 'stable' },
  { id: '3', type: 'Round-trip', severity: 'medium', description: 'Circular fund movement', amount: 200000, count: 5, trend: 'down' },
  { id: '4', type: 'Velocity', severity: 'medium', description: 'Unusual transaction frequency', amount: 125000, count: 28, trend: 'up' },
  { id: '5', type: 'Offshore', severity: 'low', description: 'High-risk jurisdiction transfers', amount: 75000, count: 3, trend: 'stable' }
];

const SEVERITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6'
};

const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}K`;

export function FraudDetectionPanel({ indicators = defaultIndicators, riskScore = 72 }: FraudDetectionPanelProps) {
  const chartData = useMemo(() => 
    indicators.map(i => ({
      name: i.type,
      amount: i.amount,
      count: i.count,
      severity: i.severity
    }))
  , [indicators]);

  const severityDistribution = useMemo(() => {
    const dist = { high: 0, medium: 0, low: 0 };
    indicators.forEach(i => {
      dist[i.severity] += i.amount;
    });
    return [
      { name: 'High Risk', value: dist.high, color: SEVERITY_COLORS.high },
      { name: 'Medium Risk', value: dist.medium, color: SEVERITY_COLORS.medium },
      { name: 'Low Risk', value: dist.low, color: SEVERITY_COLORS.low }
    ];
  }, [indicators]);

  const totalAmount = useMemo(() => 
    indicators.reduce((sum, i) => sum + i.amount, 0)
  , [indicators]);

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: 'High Risk', color: 'text-red-500', bg: 'bg-red-500' };
    if (score >= 40) return { label: 'Medium Risk', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { label: 'Low Risk', color: 'text-green-500', bg: 'bg-green-500' };
  };

  const risk = getRiskLevel(riskScore);

  return (
    <div className="space-y-6">
       {/* Risk Score Header */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white"
         >
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <Shield className="h-8 w-8 text-slate-400" />
               <Brain className="h-5 w-5 text-blue-400" />
             </div>
             <span className={`px-3 py-1 rounded-full text-sm font-medium ${risk.bg}`}>
               {risk.label}
             </span>
           </div>
          <div className="text-5xl font-bold mb-2">{riskScore}</div>
           <p className="text-slate-400 text-sm">AI-Calculated Risk Score</p>
          <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${riskScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={risk.bg}
              style={{ height: '100%' }}
            />
          </div>
        </motion.div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-semibold">Flagged Amount</span>
          </div>
          <div className="text-3xl font-bold text-red-600">
            ${totalAmount.toLocaleString()}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Across {indicators.length} indicator types
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            <span className="font-semibold">Alert Trend</span>
          </div>
          <div className="text-3xl font-bold text-amber-600">
            +{indicators.filter(i => i.trend === 'up').length}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Indicators trending up this period
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold mb-4">Flagged Amount by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'var(--tooltip-bg, #fff)', 
                  border: '1px solid var(--tooltip-border, #e2e8f0)' 
                }}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Indicator List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold">Fraud Indicators Detail</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {indicators.map((indicator) => (
            <motion.div
              key={indicator.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: SEVERITY_COLORS[indicator.severity] }} />
                  <div>
                    <p className="font-medium">{indicator.type}</p>
                    <p className="text-sm text-slate-500">{indicator.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${indicator.amount.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">{indicator.count} occurrences</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
