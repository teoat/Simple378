export function CategorizationSkeleton() {
  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-80 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96 animate-pulse"></div>
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-lg bg-white/10 dark:bg-slate-800/20 p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30">
        <div className="flex items-center gap-4 flex-1">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1 max-w-md animate-pulse"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-40 animate-pulse"></div>
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
      </div>

      {/* Transaction Table */}
      <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-8 gap-4">
                {Array.from({ length: 8 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={`h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${
                      colIndex === 0 ? 'w-4' : 'w-full'
                    }`}
                    style={{
                      animationDelay: `${(rowIndex * 8 + colIndex) * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}