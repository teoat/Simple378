import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface DataQualityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  actionText: string;
  actionHandler: () => void;
}

interface DataQualityAlertsProps {
  alerts: DataQualityAlert[];
}

export function DataQualityAlerts({ alerts }: DataQualityAlertsProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Data Quality Alerts</h3>
        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full font-medium">
          {alerts.length} Active
        </span>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-l-4 ${
              alert.type === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' :
              alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500' :
              'bg-blue-50 dark:bg-blue-900/10 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-semibold text-sm ${
                  alert.type === 'critical' ? 'text-red-700 dark:text-red-400' :
                  alert.type === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                  'text-blue-700 dark:text-blue-400'
                }`}>
                  {alert.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {alert.description}
                </p>
              </div>
              <button 
                onClick={alert.actionHandler}
                className="text-sm font-medium hover:underline text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {alert.actionText}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
