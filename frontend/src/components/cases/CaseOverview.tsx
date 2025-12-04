import { Timeline } from '../visualizations/Timeline';

interface CaseOverviewProps {
  caseData: {
    id: string;
    subject_name: string;
    description?: string;
    risk_score: number;
    created_at: string;
  };
}

export function CaseOverview({ caseData }: CaseOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Main Info */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Case Summary</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {caseData.description || 'No description available for this case.'}
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Alerts</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Evidence</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">5</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Linked Entities</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">8</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Days Open</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-full">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <Timeline />
        </div>
      </div>
    </div>
  );
}