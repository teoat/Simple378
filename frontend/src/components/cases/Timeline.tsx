import { useState } from 'react';
import { Calendar, Filter, ChevronDown, FileText, Upload, AlertCircle, User, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimelineEvent {
  id: string;
  type: 'document_upload' | 'note_added' | 'risk_update' | 'status_change' | 'assignment' | 'ai_analysis' | 'case_created';
  timestamp: string;
  actor?: string;
  message: string;
  metadata?: Record<string, string | number>;
}

interface TimelineProps {
  caseId: string;
  events?: TimelineEvent[];
}

const EVENT_ICONS = {
  document_upload: Upload,
  note_added: FileText,
  risk_update: TrendingUp,
  status_change: AlertCircle,
  assignment: User,
  ai_analysis: AlertCircle,
  case_created: Calendar,
};

const EVENT_COLORS = {
  document_upload: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  note_added: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  risk_update: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  status_change: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  assignment: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  ai_analysis: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  case_created: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400',
};

// Mock data for demonstration
const MOCK_EVENTS: TimelineEvent[] = [
  {
    id: 'evt_6',
    type: 'document_upload',
    timestamp: '2025-12-06T10:30:00Z',
    actor: 'J. Smith',
    message: 'Document uploaded "Bank Statement Nov.pdf"',
  },
  {
    id: 'evt_5',
    type: 'note_added',
    timestamp: '2025-12-06T08:15:00Z',
    actor: 'J. Smith',
    message: 'Note added: "Suspicious pattern detected in wire transfers"',
  },
  {
    id: 'evt_4',
    type: 'risk_update',
    timestamp: '2025-12-05T16:00:00Z',
    message: 'Risk score increased: 78 → 85',
    metadata: { from: 78, to: 85 },
  },
  {
    id: 'evt_3',
    type: 'ai_analysis',
    timestamp: '2025-12-05T14:30:00Z',
    message: 'AI analysis completed',
  },
  {
    id: 'evt_2',
    type: 'assignment',
    timestamp: '2025-12-05T09:00:00Z',
    actor: 'System',
    message: 'Case assigned to A. Jones',
  },
  {
    id: 'evt_1',
    type: 'case_created',
    timestamp: '2025-11-25T11:00:00Z',
    message: 'Case created from alert #5678',
  },
];

export function Timeline({ caseId: _caseId, events = MOCK_EVENTS }: TimelineProps) {
  const [filter, setFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredEvents = events
    .filter(event => filter === 'all' || event.type === filter)
    .sort((a, b) => {
      const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    });

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = new Date(event.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Case Timeline
        </h3>
        <div className="flex items-center gap-3">
          {/* Event Type Filter */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <option value="all">All Events</option>
              <option value="document_upload">Documents</option>
              <option value="note_added">Notes</option>
              <option value="risk_update">Risk Updates</option>
              <option value="status_change">Status Changes</option>
              <option value="assignment">Assignments</option>
              <option value="ai_analysis">AI Analysis</option>
            </select>
            <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              sortOrder === 'asc' && "rotate-180"
            )} />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="sticky top-0 z-10 mb-4 flex items-center gap-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur py-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {date}
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Events for this date */}
            <div className="relative space-y-4 pl-6">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

              {dateEvents.map((event, _index) => {
                const Icon = EVENT_ICONS[event.type];
                const colorClass = EVENT_COLORS[event.type];

                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "relative z-10 flex h-6 w-6 items-center justify-center rounded-full",
                      colorClass
                    )}>
                      <Icon className="h-3 w-3" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {event.message}
                            </p>
                            {event.actor && (
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                by {event.actor}
                              </p>
                            )}
                          </div>
                          <time className="text-xs text-slate-400 whitespace-nowrap">
                            {new Date(event.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </time>
                        </div>

                        {/* Metadata */}
                        {event.metadata && (
                          <div className="mt-3 flex gap-4 text-xs">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <div key={key} className="text-slate-500 dark:text-slate-400">
                                <span className="font-medium capitalize">{key}:</span>{' '}
                                <span className="text-slate-700 dark:text-slate-300">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No events found for this filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
