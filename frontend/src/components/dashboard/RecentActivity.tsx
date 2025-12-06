import { motion } from 'framer-motion';
import { Clock, User, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'alert': return AlertTriangle;
    case 'review': return CheckCircle;
    case 'case': return FileText;
    default: return Clock;
  }
};

const getActivityColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'alert': return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'review': return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'case': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    default: return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
  }
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/5 p-8 text-center backdrop-blur-lg dark:bg-slate-800/10">
        <Clock className="mb-4 h-12 w-12 text-slate-600 dark:text-slate-500" />
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur-lg dark:bg-slate-800/10">
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        Recent Activity
      </h3>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {activities.map((activity, activityIdx) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <motion.li 
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: activityIdx * 0.05 }}
              >
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div className={`relative flex h-10 w-10 items-center justify-center rounded-full border ${colorClass} ring-8 ring-white/5 dark:ring-slate-900/5`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.message}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <User className="h-3 w-3 text-slate-400" />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {activity.user}
                          </p>
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-right text-xs text-slate-500 dark:text-slate-400">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
