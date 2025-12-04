import { motion } from 'framer-motion';

export function ForensicsSkeleton() {
  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
      </div>

      {/* Upload Zone Skeleton */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-xl p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Processing Pipeline Skeleton */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
        <div className="space-y-6">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          <div className="flex justify-between">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* History Skeleton */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

