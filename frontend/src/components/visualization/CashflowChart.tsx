import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface CashflowDataPoint {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface CashflowChartProps {
  data?: CashflowDataPoint[];
  height?: number;
}

// Generate mock data if none provided
const generateMockData = (): CashflowDataPoint[] => {
  const data: CashflowDataPoint[] = [];
  let balance = 500000;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(2024, 0, i + 1);
    const inflow = Math.random() * 50000 + 10000;
    const outflow = Math.random() * 45000 + 8000;
    balance = balance + inflow - outflow;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      balance: Math.round(balance)
    });
  }
  
  return data;
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CashflowChart({ data, height = 400 }: CashflowChartProps) {
  const chartData = useMemo(() => data || generateMockData(), [data]);
  
  const averageBalance = useMemo(() => {
    const sum = chartData.reduce((acc, item) => acc + item.balance, 0);
    return sum / chartData.length;
  }, [chartData]);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#94a3b8' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            className="text-xs"
            tick={{ fill: '#94a3b8' }}
            tickLine={{ stroke: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-slate-600 dark:text-slate-400">{value}</span>}
          />
          <ReferenceLine 
            y={averageBalance} 
            stroke="#8b5cf6" 
            strokeDasharray="5 5" 
            label={{ value: 'Avg Balance', fill: '#8b5cf6', fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            name="Balance"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBalance)"
          />
          <Area
            type="monotone"
            dataKey="inflow"
            name="Inflow"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInflow)"
          />
          <Area
            type="monotone"
            dataKey="outflow"
            name="Outflow"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOutflow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
