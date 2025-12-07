import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { TrendingDown } from 'lucide-react';

interface WaterfallDataPoint {
  name: string;
  value: number;
  cumulativeValue: number;
  isTotal?: boolean;
  isDeduction?: boolean;
}

interface WaterfallChartProps {
  totalCashflow: number;
  mirrorTransactions: number;
  personalExpenses: number;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: WaterfallDataPoint;
  }>;
}

// Define tooltip outside component to avoid React warning
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  const isDeduction = data.isDeduction;
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {data.name}
      </p>
      <p className={`text-sm ${isDeduction ? 'text-red-600' : 'text-green-600'}`}>
        {isDeduction ? '-' : ''}${Math.abs(data.value).toLocaleString()}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Running Total: ${data.cumulativeValue.toLocaleString()}
      </p>
    </div>
  );
};

export function WaterfallChart({
  totalCashflow,
  mirrorTransactions,
  personalExpenses,
  height = 400
}: WaterfallChartProps) {
  const data = useMemo(() => {
    const projectTransactions = totalCashflow - mirrorTransactions - personalExpenses;
    
    const points: WaterfallDataPoint[] = [
      {
        name: 'Total Cashflow',
        value: totalCashflow,
        cumulativeValue: totalCashflow,
        isTotal: true
      },
      {
        name: 'Mirror Transactions',
        value: -mirrorTransactions,
        cumulativeValue: totalCashflow - mirrorTransactions,
        isDeduction: true
      },
      {
        name: 'Personal Expenses',
        value: -personalExpenses,
        cumulativeValue: totalCashflow - mirrorTransactions - personalExpenses,
        isDeduction: true
      },
      {
        name: 'Project Total',
        value: projectTransactions,
        cumulativeValue: projectTransactions,
        isTotal: true
      }
    ];
    
    return points;
  }, [totalCashflow, mirrorTransactions, personalExpenses]);

  const getBarColor = (point: WaterfallDataPoint) => {
    if (point.isTotal) return '#3b82f6'; // Blue for totals
    if (point.isDeduction) return '#ef4444'; // Red for deductions
    return '#10b981'; // Green for additions
  };

  if (!totalCashflow) {
    return (
      <div className="py-12 text-center">
        <TrendingDown className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">No cashflow data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="waterfall-chart">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-slate-700 dark:text-slate-300">Total</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-slate-700 dark:text-slate-300">Excluded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-slate-700 dark:text-slate-300">Project</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis
            dataKey="name"
            angle={-15}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cumulativeValue" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
            <LabelList
              dataKey="cumulativeValue"
              position="top"
              formatter={(value: unknown) => {
                if (typeof value === 'number') {
                  return `$${(value / 1000).toFixed(0)}K`;
                }
                return '';
              }}
              style={{ fontSize: 11, fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-2">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            ${totalCashflow.toLocaleString()} 
            <span className="text-red-600 mx-2">−</span>
            ${mirrorTransactions.toLocaleString()}
            <span className="text-red-600 mx-2">−</span>
            ${personalExpenses.toLocaleString()}
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            = ${(totalCashflow - mirrorTransactions - personalExpenses).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Net Project Transactions
          </div>
        </div>
      </div>
    </div>
  );
}
