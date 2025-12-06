export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-800/10"
          >
            <div className="flex justify-between items-start animate-pulse">
              <div className="space-y-3 flex-1">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div 
            key={i} 
            className="h-[400px] rounded-2xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur-lg dark:bg-slate-800/10"
          >
            <div className="animate-pulse space-y-4 h-full">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-[300px] w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed Skeleton */}
      <div className="rounded-2xl border border-white/20 bg-white/5 p-6 shadow-xl backdrop-blur-lg dark:bg-slate-800/10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
