export function SummarySkeleton() {
  return (
    <div className="p-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl p-8 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-48 mb-2"></div>
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-96"></div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}