import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

interface RiskTrendData {
  date: string;
  score: number;
  isForecast?: boolean;
}

interface RiskTrendWidgetProps {
  data: RiskTrendData[];
  currentScore: number;
  forecastScore: number;
}

export function RiskTrendWidget({ data, currentScore, forecastScore }: RiskTrendWidgetProps) {
  const trend = forecastScore > currentScore ? 'Increasing' : forecastScore < currentScore ? 'Decreasing' : 'Stable';
  const trendColor = trend === 'Increasing' ? 'text-red-500' : trend === 'Decreasing' ? 'text-green-500' : 'text-yellow-500';

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Risk Forecast (30 Day)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text">
            {currentScore}
          </span>
          <span className="text-slate-400">→</span>
          <span className={`text-2xl font-bold ${trendColor}`}>
            {forecastScore}
          </span>
          <span className={`text-xs ml-2 px-2 py-0.5 rounded-full border ${
            trend === 'Increasing' ? 'border-red-200 bg-red-50 text-red-600' : 
            trend === 'Decreasing' ? 'border-green-200 bg-green-50 text-green-600' : 
            'border-yellow-200 bg-yellow-50 text-yellow-600'
          }`}>
            {trend}
          </span>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  color: '#f8fafc' 
                }}
              />
              <ReferenceLine x={data.find(d => d.isForecast)?.date} stroke="#94a3b8" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
