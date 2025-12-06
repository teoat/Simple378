export function ForensicsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
      <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded" />
      
      <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
