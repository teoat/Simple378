import { FinancialSankey } from '../visualizations/FinancialSankey';

export function CaseFinancials() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 h-full">
      <FinancialSankey />
    </div>
  );
}