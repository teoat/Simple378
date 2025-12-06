import { FC } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Clock, Database } from 'lucide-react';
import clsx from 'clsx';

interface SuccessBannerProps {
  status: 'success' | 'partial' | 'failed';
  dataQuality: number; // 0-100
  daysToResolution: number;
  caseId: string;
}

export const SuccessBanner: FC<SuccessBannerProps> = ({
  status,
  dataQuality,
  daysToResolution,
  caseId,
}) => {
  const isSuccess = status === 'success';
  const isFailed = status === 'failed';

  const bgColor = isSuccess
    ? 'bg-emerald-50 dark:bg-emerald-900/10'
    : isFailed
      ? 'bg-red-50 dark:bg-red-900/10'
      : 'bg-amber-50 dark:bg-amber-900/10';

  const borderColor = isSuccess
    ? 'border-emerald-200 dark:border-emerald-800'
    : isFailed
      ? 'border-red-200 dark:border-red-800'
      : 'border-amber-200 dark:border-amber-800';

  const textColor = isSuccess
    ? 'text-emerald-900 dark:text-emerald-100'
    : isFailed
      ? 'text-red-900 dark:text-red-100'
      : 'text-amber-900 dark:text-amber-100';

  return (
    <div className={clsx('rounded-xl border p-6 mb-8', bgColor, borderColor)}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            {isSuccess ? (
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            ) : isFailed ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            )}
          </motion.div>
          <div>
            <h2 className={clsx('text-2xl font-bold', textColor)}>
              {isSuccess
                ? 'SUCCESS! CASE CLOSED'
                : isFailed
                  ? 'CASE CLOSED - FAILED'
                  : 'CASE CLOSED - INCOMPLETE'}
            </h2>
            <p className="text-sm opacity-80 mt-1">
              Case ID: <span className="font-mono font-medium">{caseId}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
              <Database className={clsx('w-5 h-5', textColor)} />
            </div>
            <div>
              <div className="text-xs font-medium opacity-70 uppercase tracking-wider">
                Data Quality
              </div>
              <div className={clsx('text-xl font-bold font-mono', textColor)}>
                {dataQuality.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
              <Clock className={clsx('w-5 h-5', textColor)} />
            </div>
            <div>
              <div className="text-xs font-medium opacity-70 uppercase tracking-wider">
                Resolution Time
              </div>
              <div className={clsx('text-xl font-bold font-mono', textColor)}>
                {daysToResolution} days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
