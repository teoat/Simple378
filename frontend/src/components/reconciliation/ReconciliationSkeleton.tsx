import { motion } from 'framer-motion';

export function ReconciliationSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="flex gap-4 items-center">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Upload Section Skeleton */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
      </div>

      {/* Columns Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Column */}
        <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Transactions Column */}
        <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

