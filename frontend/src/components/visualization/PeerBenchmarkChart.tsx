import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label
} from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface BenchmarkDataPoint {
  caseId: string;
  caseName: string;
  totalAmount: number;
  riskScore: number;
  isCurrentCase?: boolean;
  percentile?: number;
}

interface PeerBenchmarkChartProps {
  currentCase: {
    id: string;
    name: string;
    totalAmount: number;
    riskScore: number;
  };
  benchmarkData?: BenchmarkDataPoint[];
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: BenchmarkDataPoint;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {data.isCurrentCase ? '● YOU' : data.caseName}
      </p>
      <div className="text-sm space-y-1">
        <p className="text-slate-600 dark:text-slate-400">
          Amount: <span className="font-medium">${data.totalAmount.toLocaleString()}</span>
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Risk Score: <span className="font-medium">{data.riskScore}/100</span>
        </p>
        {data.percentile !== undefined && (
          <p className={`font-medium ${
            data.percentile >= 90 ? 'text-red-600' :
            data.percentile >= 75 ? 'text-amber-600' :
            'text-green-600'
          }`}>
            {data.percentile}th percentile
          </p>
        )}
      </div>
    </div>
  );
};

export function PeerBenchmarkChart({
  currentCase,
  benchmarkData = [],
  height = 400
}: PeerBenchmarkChartProps) {
  const { chartData, stats } = useMemo(() => {
    // Add current case to data
    const allData: BenchmarkDataPoint[] = [
      {
        caseId: currentCase.id,
        caseName: currentCase.name,
        totalAmount: currentCase.totalAmount,
        riskScore: currentCase.riskScore,
        isCurrentCase: true
      },
      ...benchmarkData
    ];

    // Calculate percentile for current case
    const sortedByRisk = [...allData].sort((a, b) => a.riskScore - b.riskScore);
    const currentIndex = sortedByRisk.findIndex(d => d.isCurrentCase);
    const percentile = Math.round((currentIndex / (sortedByRisk.length - 1)) * 100);

    // Update current case with percentile
    allData[0].percentile = percentile;

    // Calculate statistics
    const riskScores = allData.filter(d => !d.isCurrentCase).map(d => d.riskScore);
    const avgRisk = riskScores.length > 0
      ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
      : 0;
    const maxRisk = riskScores.length > 0 ? Math.max(...riskScores) : 100;

    return {
      chartData: allData,
      stats: {
        percentile,
        avgRisk: Math.round(avgRisk),
        maxRisk,
        totalCases: allData.length
      }
    };
  }, [currentCase, benchmarkData]);

  const getRiskCategory = (percentile: number) => {
    if (percentile >= 90) return { label: 'Very High Risk', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (percentile >= 75) return { label: 'High Risk', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    if (percentile >= 50) return { label: 'Medium Risk', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    return { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
  };

  const riskCategory = getRiskCategory(stats.percentile);

  if (benchmarkData.length === 0) {
    return (
      <div className="py-12 text-center">
        <TrendingUp className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          No benchmark data available for comparison
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Benchmark data comes from similar historical cases
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-lg p-4 ${riskCategory.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${riskCategory.color}`} />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Risk Category
            </span>
          </div>
          <p className={`text-lg font-bold ${riskCategory.color}`}>
            {riskCategory.label}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {stats.percentile}th percentile
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Your Risk Score
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {currentCase.riskScore} / 100
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Peer Average
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {stats.avgRisk} / 100
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Cases Compared
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {stats.totalCases - 1}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis
            type="number"
            dataKey="totalAmount"
            name="Total Amount"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          >
            <Label value="Total Transaction Amount" offset={-40} position="insideBottom" />
          </XAxis>
          <YAxis
            type="number"
            dataKey="riskScore"
            name="Risk Score"
            domain={[0, 100]}
          >
            <Label value="Risk Score" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference lines */}
          <ReferenceLine
            y={stats.avgRisk}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            label={{ value: 'Avg Risk', position: 'right', fill: '#64748b' }}
          />

          <Scatter data={chartData} fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isCurrentCase ? '#ef4444' : '#3b82f6'}
                fillOpacity={entry.isCurrentCase ? 1 : 0.6}
                r={entry.isCurrentCase ? 8 : 5}
                stroke={entry.isCurrentCase ? '#dc2626' : 'none'}
                strokeWidth={entry.isCurrentCase ? 2 : 0}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-700" />
          <span className="text-slate-700 dark:text-slate-300">Your Case</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full opacity-60" />
          <span className="text-slate-700 dark:text-slate-300">Peer Cases</span>
        </div>
      </div>

      {/* Analysis */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Benchmark Analysis
        </h4>
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          {stats.percentile >= 90 ? (
            <p className="text-red-600 dark:text-red-400 font-medium">
              ⚠️ This case is in the top 10% of risk among similar cases. Immediate investigation recommended.
            </p>
          ) : stats.percentile >= 75 ? (
            <p className="text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ This case shows higher risk than 75% of comparable cases. Enhanced monitoring suggested.
            </p>
          ) : stats.percentile >= 50 ? (
            <p>
              This case shows moderate risk compared to peers. Continue standard monitoring.
            </p>
          ) : (
            <p className="text-green-600 dark:text-green-400">
              ✓ This case shows lower risk than most comparable cases.
            </p>
          )}
          <p>
            Compared against {stats.totalCases - 1} similar cases based on transaction volume and pattern.
          </p>
        </div>
      </div>
    </div>
  );
}
