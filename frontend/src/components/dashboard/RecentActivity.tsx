import { AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const activity = [
  {
    id: 1,
    type: 'flag',
    content: 'Flagged suspicious transaction',
    target: 'Case #1234',
    date: '1h ago',
    icon: AlertTriangle,
    iconBackground: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    id: 2,
    type: 'review',
    content: 'Completed review for',
    target: 'Subject: John Doe',
    date: '3h ago',
    icon: CheckCircle,
    iconBackground: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 3,
    type: 'upload',
    content: 'Uploaded new evidence',
    target: 'bank_statement_nov.pdf',
    date: '5h ago',
    icon: FileText,
    iconBackground: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
];

export function RecentActivity() {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activity.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== activity.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-900 ${event.iconBackground}`}
                  >
                    <event.icon className={`h-5 w-5 ${event.iconColor}`} aria-hidden="true" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {event.content}{' '}
                      <span className="font-medium text-slate-900 dark:text-white">{event.target}</span>
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                    <time dateTime={event.date}>{event.date}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
