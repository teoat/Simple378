import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CashFlowData {
  name: string;
  uv: number;
  type: 'positive' | 'negative' | 'total';
}

interface CashFlowWaterfallProps {
  data?: CashFlowData[];
}

const defaultData: CashFlowData[] = [
  { name: 'Revenue', uv: 4000, type: 'positive' },
  { name: 'COGS', uv: -2400, type: 'negative' },
  { name: 'OpEx', uv: -1000, type: 'negative' },
  { name: 'Interest', uv: -200, type: 'negative' },
  { name: 'Tax', uv: -100, type: 'negative' },
  { name: 'Net Income', uv: 300, type: 'total' },
];

export function CashFlowWaterfall({ data = defaultData }: CashFlowWaterfallProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cash Flow Waterfall</h3>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
             cursor={{ fill: 'transparent' }}
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="uv">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.type === 'positive' ? '#22c55e' : 
                  entry.type === 'negative' ? '#ef4444' : 
                  '#3b82f6'
                } 
                radius={[4, 4, 0, 0]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
