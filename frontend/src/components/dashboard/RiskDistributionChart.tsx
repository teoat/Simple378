import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface RiskData {
  range: string;
  count: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

// Mock data - in a real app this would come from props
const data: RiskData[] = [
  { range: '0-30', count: 45, riskLevel: 'Low' },
  { range: '31-60', count: 28, riskLevel: 'Medium' },
  { range: '61-80', count: 15, riskLevel: 'High' },
  { range: '81-100', count: 8, riskLevel: 'Critical' },
];

interface TooltipPayload {
  value: number;
  payload: RiskData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
        <p className="mb-1 text-sm font-medium text-slate-300">Risk Score: {label}</p>
        <p className="text-lg font-bold text-white">
          {payload[0].value} Cases
        </p>
        <p className="text-xs text-slate-400">
          {payload[0].payload.riskLevel} Risk Level
        </p>
      </div>
    );
  }
  return null;
};

export function RiskDistributionChart() {
  const totalCases = data.reduce((sum, item) => sum + item.count, 0);
  const highRiskCases = data.filter(d => d.riskLevel === 'High' || d.riskLevel === 'Critical')
    .reduce((sum, item) => sum + item.count, 0);
  const criticalCases = data.find(d => d.riskLevel === 'Critical')?.count || 0;
  const highRiskPercent = ((highRiskCases / totalCases) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full w-full rounded-2xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur-lg dark:bg-slate-800/10"
    >
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Risk Score Distribution
      </h3>
      
      {/* Enhanced screen reader summary */}
      <div className="sr-only" role="region" aria-label="Risk Distribution Summary">
        <p>
          Total cases: {totalCases}. 
          High risk cases: {data.find(d => d.riskLevel === 'High')?.count || 0} ({((data.find(d => d.riskLevel === 'High')?.count || 0) / totalCases * 100).toFixed(1)}%). 
          Critical cases: {criticalCases}. 
          Medium risk cases: {data.find(d => d.riskLevel === 'Medium')?.count || 0}. 
          Low risk cases: {data.find(d => d.riskLevel === 'Low')?.count || 0}.
        </p>
      </div>
      
      <div className="h-[300px] w-full" role="img" aria-label={`Bar chart showing risk distribution across ${data.length} categories. ${highRiskCases} high risk or critical cases out of ${totalCases} total (${highRiskPercent}%).`} aria-live="polite">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="range" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar 
              dataKey="count" 
              radius={[8, 8, 0, 0]} 
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="url(#barGradient)"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.3))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

