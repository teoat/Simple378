import React from 'react';

interface HistoryTabProps {
  alertId: string;
}

export function HistoryTab({ alertId }: HistoryTabProps) {
  const history = [
    { id: 1, action: 'Flagged', user: 'System AI', date: '2024-03-12 10:30 AM', comment: 'Automated flag triggered by velocity rule.' },
    { id: 2, action: 'Viewed', user: 'Analyst Jane', date: '2024-03-12 11:15 AM', comment: '' },
    { id: 3, action: 'Note Added', user: 'Analyst Jane', date: '2024-03-12 11:20 AM', comment: 'Investigating connection to Entity A.' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Activity History</h3>
      <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-6">
        {history.map((item) => (
          <div key={item.id} className="relative pl-6">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-slate-900 dark:text-white">{item.action}</span>
              <span className="text-xs text-slate-500">{item.date}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">by {item.user}</p>
            {item.comment && (
              <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300">
                {item.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
