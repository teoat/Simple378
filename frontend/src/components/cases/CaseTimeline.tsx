import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Calendar,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

interface ChartDataPoint {
  date: string;
  transactions: number;
  transactionAmount: number;
  analysis: number;
  evidence: number;
  comments: number;
  riskScore: number | null;
}

interface TimelineEvent {
  id: string;
  date: string;
  type: 'transaction' | 'analysis' | 'evidence' | 'comment' | 'status_change';
  title: string;
  description?: string;
  amount?: number;
  risk_score?: number;
  user?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

interface TimelineFilters {
  dateRange: {
    start: string;
    end: string;
  };
  eventTypes: string[];
  categories: string[];
  users: string[];
  minAmount?: number;
  maxAmount?: number;
}

interface CaseTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  filters?: Partial<TimelineFilters>;
  onFiltersChange?: (filters: Partial<TimelineFilters>) => void;
  height?: number;
}

export function CaseTimeline({
  events,
  onEventClick,
  filters = {},
  onFiltersChange,
  height = 400
}: CaseTimelineProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState({
    transactions: true,
    analysis: true,
    evidence: true,
    comments: true
  });

  // Memoize default date range to avoid impure render calls
  const [defaultDateRange] = useState(() => ({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  }));

  // Default filters
  const defaultFilters: TimelineFilters = useMemo(() => ({
    dateRange: filters.dateRange || defaultDateRange,
    eventTypes: filters.eventTypes || ['transaction', 'analysis', 'evidence', 'comment', 'status_change'],
    categories: filters.categories || [],
    users: filters.users || [],
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount
  }), [filters, defaultDateRange]);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const startDate = new Date(defaultFilters.dateRange.start);
      const endDate = new Date(defaultFilters.dateRange.end);

      // Date range filter
      if (eventDate < startDate || eventDate > endDate) {
        return false;
      }

      // Event type filter
      if (!defaultFilters.eventTypes.includes(event.type)) {
        return false;
      }

      // Category filter
      if (defaultFilters.categories.length > 0 && event.category) {
        if (!defaultFilters.categories.includes(event.category)) {
          return false;
        }
      }

      // User filter
      if (defaultFilters.users.length > 0 && event.user) {
        if (!defaultFilters.users.includes(event.user)) {
          return false;
        }
      }

      // Amount filters
      if (event.amount !== undefined) {
        if (defaultFilters.minAmount !== undefined && event.amount < defaultFilters.minAmount) {
          return false;
        }
        if (defaultFilters.maxAmount !== undefined && event.amount > defaultFilters.maxAmount) {
          return false;
        }
      }

      return true;
    });
  }, [events, defaultFilters]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const groupedByDate = filteredEvents.reduce((acc, event) => {
      if (!event.date) return acc; // Skip events without date
      const date = new Date(event.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          transactions: 0,
          transactionAmount: 0,
          analysis: 0,
          evidence: 0,
          comments: 0,
          riskScore: null as number | null
        };
      }

      if (event.type === 'transaction') {
        acc[date].transactions += 1;
        acc[date].transactionAmount += event.amount || 0;
      } else if (event.type === 'analysis') {
        acc[date].analysis += 1;
        if (event.risk_score !== undefined) {
          acc[date].riskScore = event.risk_score;
        }
      } else if (event.type === 'evidence') {
        acc[date].evidence += 1;
      } else if (event.type === 'comment') {
        acc[date].comments += 1;
      }

      return acc;
    }, {} as Record<string, ChartDataPoint>);

    return Object.values(groupedByDate).sort((a: ChartDataPoint, b: ChartDataPoint) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredEvents]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(events.map(e => e.category).filter((c): c is string => !!c))];
    const users = [...new Set(events.map(e => e.user).filter((u): u is string => !!u))];
    const eventTypes = [...new Set(events.map(e => e.type))];

    return { categories, users, eventTypes };
  }, [events]);

  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'transaction': return '💳';
      case 'analysis': return '📊';
      case 'evidence': return '📄';
      case 'comment': return '💬';
      case 'status_change': return '🔄';
      default: return '📝';
    }
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Case Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>

        {/* Series visibility toggles */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">Show:</span>
          {Object.entries(visibleSeries).map(([key, visible]) => (
            <button
              key={key}
              onClick={() => toggleSeries(key as keyof typeof visibleSeries)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                visible
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {key}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-3">Timeline Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <div className="space-y-1">
                  <input
                    type="date"
                    value={defaultFilters.dateRange.start}
                    onChange={(e) => onFiltersChange?.({
                      ...defaultFilters,
                      dateRange: { ...defaultFilters.dateRange, start: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded"
                    aria-label="Start Date"
                  />
                  <input
                    type="date"
                    value={defaultFilters.dateRange.end}
                    onChange={(e) => onFiltersChange?.({
                      ...defaultFilters,
                      dateRange: { ...defaultFilters.dateRange, end: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded"
                    aria-label="End Date"
                  />
                </div>
              </div>

              {/* Event Types */}
              <div>
                <label className="block text-sm font-medium mb-1">Event Types</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filterOptions.eventTypes.map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={defaultFilters.eventTypes.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...defaultFilters.eventTypes, type]
                            : defaultFilters.eventTypes.filter(t => t !== type);
                          onFiltersChange?.({ ...defaultFilters, eventTypes: newTypes });
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {filterOptions.categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Categories</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filterOptions.categories.map(category => (
                      <label key={category} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={defaultFilters.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...defaultFilters.categories, category]
                              : defaultFilters.categories.filter(c => c !== category);
                            onFiltersChange?.({ ...defaultFilters, categories: newCategories });
                          }}
                          className="rounded"
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium mb-1">Amount Range</label>
                <div className="space-y-1">
                  <input
                    type="number"
                    placeholder="Min amount"
                    value={defaultFilters.minAmount || ''}
                    onChange={(e) => onFiltersChange?.({
                      ...defaultFilters,
                      minAmount: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Max amount"
                    value={defaultFilters.maxAmount || ''}
                    onChange={(e) => onFiltersChange?.({
                      ...defaultFilters,
                      maxAmount: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e2e8f0)',
                  borderRadius: '6px'
                }}
                formatter={(value: number | string, name: string) => {
                  if (typeof value === 'number') {
                    if (name === 'transactionAmount') {
                      return [`$${value.toLocaleString()}`, 'Transaction Amount'];
                    }
                    if (name === 'riskScore') {
                      return [value, 'Risk Score'];
                    }
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
              />
              <Legend />

              {visibleSeries.transactions && (
                <Bar
                  yAxisId="left"
                  dataKey="transactions"
                  fill="#3b82f6"
                  name="Transactions"
                  radius={[2, 2, 0, 0]}
                />
              )}

              {visibleSeries.analysis && (
                <Bar
                  yAxisId="left"
                  dataKey="analysis"
                  fill="#10b981"
                  name="Analysis Events"
                  radius={[2, 2, 0, 0]}
                />
              )}

              {visibleSeries.evidence && (
                <Bar
                  yAxisId="left"
                  dataKey="evidence"
                  fill="#f59e0b"
                  name="Evidence Added"
                  radius={[2, 2, 0, 0]}
                />
              )}

              {visibleSeries.comments && (
                <Bar
                  yAxisId="left"
                  dataKey="comments"
                  fill="#8b5cf6"
                  name="Comments"
                  radius={[2, 2, 0, 0]}
                />
              )}

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="riskScore"
                stroke="#ef4444"
                strokeWidth={2}
                name="Risk Score"
                connectNulls={false}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Event List */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Recent Events ({filteredEvents.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredEvents.slice(-10).reverse().map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <span className="text-lg">{getEventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {event.title}
                    </h5>
                    {event.amount && (
                      <span className="text-sm text-green-600 font-medium">
                        ${event.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {new Date(event.date).toLocaleDateString()} • {event.user || 'System'}
                  </p>
                  {event.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 truncate">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}