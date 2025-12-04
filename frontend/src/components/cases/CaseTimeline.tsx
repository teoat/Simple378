import { Timeline } from '../visualizations/Timeline';

export function CaseTimeline() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-full">
      <Timeline />
    </div>
  );
}