import { motion } from 'framer-motion';

export function CaseListSkeleton() {
  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
      </div>

      {/* Controls Skeleton */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-800/20 p-4 rounded-2xl border border-white/20 dark:border-slate-700/30">
        <div className="flex gap-4">
          <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-white/10 dark:border-slate-700/20 p-4">
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-white/5 dark:divide-slate-700/20">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 grid grid-cols-7 gap-4"
            >
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse ml-auto"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

