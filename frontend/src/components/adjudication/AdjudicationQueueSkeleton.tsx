import { motion } from 'framer-motion';

export function AdjudicationQueueSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Sidebar Skeleton */}
        <div className="col-span-3 flex flex-col h-full">
          <div className="mb-4 flex justify-between items-center">
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          
          <div className="flex-1 space-y-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="backdrop-blur-md bg-white/5 dark:bg-slate-900/20 rounded-xl p-4 border border-white/10 dark:border-slate-700/20"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                    <div className="h-3 w-12 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-32 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                  <div className="h-3 w-20 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                  <div className="flex gap-1.5 mt-2">
                    <div className="h-4 w-16 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="col-span-9 h-full">
          <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/40 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl h-full p-6">
            <div className="space-y-6">
              {/* Header Skeleton */}
              <div className="space-y-3">
                <div className="h-8 w-48 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="flex gap-2 border-b border-white/10 dark:border-slate-700/20 pb-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                ))}
              </div>

              {/* Content Skeleton */}
              <div className="space-y-4">
                <div className="h-32 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>
                <div className="h-32 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>
                <div className="h-32 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>
              </div>

              {/* Decision Panel Skeleton */}
              <div className="mt-auto pt-6 border-t border-white/10 dark:border-slate-700/20">
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

