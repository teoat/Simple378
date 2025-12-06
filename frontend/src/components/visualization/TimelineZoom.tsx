import { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, Filter } from 'lucide-react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface TimelineEvent {
  date: string;
  event: string;
  amount: number;
  category: string;
}

interface CashflowData {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface TimelineFilters {
  timeRange: string;
  entityType: string;
}

interface TimelineZoomProps {
  data?: CashflowData[];
  filters?: TimelineFilters;
  events?: TimelineEvent[];
  isLoading?: boolean;
}

export function TimelineZoom({ data, filters, isLoading = false }: TimelineZoomProps) {
  const [timeRange, setTimeRange] = useState(filters?.timeRange || '30d');
  const [entityType, setEntityType] = useState(filters?.entityType || 'all');

  const events = useMemo(() => {
    let filteredData = data || [];

    // Apply time range filter
    if (timeRange !== 'all') {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filteredData = filteredData.filter(flow => new Date(flow.date) >= cutoff);
    }

    // Apply entity type filter (for future use)
    // Currently all data is included

    return filteredData?.map(flow => ({
      date: flow.date,
      event: `Net: $${(flow.inflow - flow.outflow).toFixed(2)}`,
      amount: flow.inflow - flow.outflow,
      category: (flow.inflow - flow.outflow) >= 0 ? 'inflow' : 'outflow'
    })) || [];
  }, [data, timeRange, entityType]);
  const [zoomLevel, setZoomLevel] = useState(1);

  const defaultEvents = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 3600000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      event: ['Deposit', 'Withdrawal', 'Transfer', 'Fee'][Math.floor(Math.random() * 4)],
      amount: Math.floor(Math.random() * 100000) + 10000,
      category: ['operating', 'vendor', 'dispute'][Math.floor(Math.random() * 3)],
    }));
  }, []);

  const chartData = events.length > 0 ? events : defaultEvents;
  // const displayedData = data.slice(Math.floor(data.length * (1 - 1 / zoomLevel)));


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline with Zoom</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-slate-500">Loading timeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction Timeline</CardTitle>
          <div className="flex items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded text-xs"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded text-xs"
              >
                <option value="all">All Types</option>
                <option value="inflow">Inflows</option>
                <option value="outflow">Outflows</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 px-2 py-1">{zoomLevel.toFixed(1)}x</span>
              <button
                onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={100}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
              formatter={(value: any) => `$${(value as number).toLocaleString()}`}
            />
            <Bar dataKey="amount" fill="#3b82f6" name="Amount" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
