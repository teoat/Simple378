
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: '2024-03-01', transactions: 12, risk: 2 },
  { date: '2024-03-02', transactions: 19, risk: 5 },
  { date: '2024-03-03', transactions: 8, risk: 1 },
  { date: '2024-03-04', transactions: 25, risk: 8 },
  { date: '2024-03-05', transactions: 15, risk: 3 },
  { date: '2024-03-06', transactions: 22, risk: 6 },
  { date: '2024-03-07', transactions: 30, risk: 10 },
];

export function Timeline() {
  return (
    <div className="h-[400px] w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Transaction Timeline</h3>
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
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis 
            dataKey="date" 
            className="text-xs text-slate-500 dark:text-slate-400" 
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-xs text-slate-500 dark:text-slate-400" 
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: '#1e293b' }}
          />
          <Legend />
          <Bar dataKey="transactions" name="Total Transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="risk" name="High Risk Events" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
