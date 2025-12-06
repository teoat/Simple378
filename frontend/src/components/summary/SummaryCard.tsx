import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle } from 'lucide-react';


interface Metric {
  label: string;
  value: string | number;
  status?: 'complete' | 'pending' | 'error';
}

interface SummaryCardProps {
  title: string;
  icon: ReactNode;
  metrics: Metric[];
  status: 'complete' | 'partial' | 'pending';
  delay?: number;
}

export const SummaryCard: FC<SummaryCardProps> = ({
  title,
  icon,
  metrics,
  status,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>
        {status === 'complete' && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
            <Check className="w-3 h-3" />
            Complete
          </span>
        )}
      </div>

      <div className="space-y-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {metric.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {metric.value}
              </span>
              {metric.status && (
                <div title={`Status: ${metric.status}`}>
                  {metric.status === 'complete' && (
                    <Check className="w-4 h-4 text-emerald-500" />
                  )}
                  {metric.status === 'pending' && (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                  {metric.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
