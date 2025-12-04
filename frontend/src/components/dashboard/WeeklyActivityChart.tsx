import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ActivityData {
  day: string;
  cases: number;
  reviews: number;
}

// Mock data
const data: ActivityData[] = [
  { day: 'Mon', cases: 12, reviews: 8 },
  { day: 'Tue', cases: 18, reviews: 12 },
  { day: 'Wed', cases: 15, reviews: 10 },
  { day: 'Thu', cases: 25, reviews: 18 },
  { day: 'Fri', cases: 20, reviews: 15 },
  { day: 'Sat', cases: 8, reviews: 5 },
  { day: 'Sun', cases: 5, reviews: 3 },
];

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
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
        <p className="mb-2 text-sm font-medium text-slate-300">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function WeeklyActivityChart() {
  const totalActivity = data.reduce((sum, item) => sum + item.cases + item.reviews, 0);
  const totalCases = data.reduce((sum, item) => sum + item.cases, 0);
  const totalReviews = data.reduce((sum, item) => sum + item.reviews, 0);
  const avgPerDay = (totalActivity / data.length).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="h-full w-full rounded-2xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur-lg dark:bg-slate-800/10"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Weekly Activity
        </h3>
        <select 
          className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm text-slate-300 backdrop-blur-sm focus:border-purple-500 focus:outline-none"
          aria-label="Select time range for activity chart"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>
      
      {/* Screen reader summary */}
      <div className="sr-only" role="region" aria-label="Weekly Activity Summary">
        <p>
          Weekly activity chart showing {data.length} days of data. 
          Total cases: {totalCases}. 
          Total reviews: {totalReviews}. 
          Average activity per day: {avgPerDay} items.
        </p>
      </div>
      
      <div className="h-[300px] w-full" role="img" aria-label={`Area chart showing weekly activity trends over ${data.length} days. Average of ${avgPerDay} items per day, with ${totalCases} cases and ${totalReviews} reviews total.`} aria-live="polite">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cases"
              name="New Cases"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCases)"
              style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))' }}
            />
            <Area
              type="monotone"
              dataKey="reviews"
              name="Reviews"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorReviews)"
              style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
