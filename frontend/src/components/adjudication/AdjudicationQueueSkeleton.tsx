

export function AdjudicationQueueSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Sidebar Skeleton */}
        <div className="col-span-3 flex flex-col h-full space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="col-span-9 h-full">
          <div className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 animate-pulse flex flex-col">
            <div className="h-20 border-b border-slate-200 dark:border-slate-800 p-6">
              <div className="h-8 w-1/3 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-1/4 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="h-10 w-full bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="grid grid-cols-2 gap-6">
                <div className="h-64 bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="h-64 bg-slate-300 dark:bg-slate-700 rounded" />
              </div>
            </div>
            <div className="h-32 border-t border-slate-200 dark:border-slate-800 p-6">
              <div className="h-full w-full bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
