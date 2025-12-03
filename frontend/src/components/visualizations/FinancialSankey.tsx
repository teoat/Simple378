import React from 'react';

export function FinancialSankey() {
  return (
    <div className="h-[400px] w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Financial Flow</h3>
      <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <svg
            className="mx-auto h-48 w-full max-w-lg"
            viewBox="0 0 800 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Source Nodes */}
            <rect x="50" y="50" width="20" height="100" fill="#3b82f6" rx="4" />
            <text x="40" y="100" textAnchor="end" className="fill-slate-900 text-sm font-medium dark:fill-white">Income</text>
            
            <rect x="50" y="250" width="20" height="100" fill="#10b981" rx="4" />
            <text x="40" y="300" textAnchor="end" className="fill-slate-900 text-sm font-medium dark:fill-white">Investments</text>

            {/* Target Nodes */}
            <rect x="730" y="100" width="20" height="80" fill="#ef4444" rx="4" />
            <text x="760" y="140" textAnchor="start" className="fill-slate-900 text-sm font-medium dark:fill-white">Expenses</text>

            <rect x="730" y="220" width="20" height="80" fill="#f59e0b" rx="4" />
            <text x="760" y="260" textAnchor="start" className="fill-slate-900 text-sm font-medium dark:fill-white">Savings</text>

            {/* Flows */}
            <path d="M 70 100 C 400 100, 400 140, 730 140" stroke="#3b82f6" strokeWidth="40" strokeOpacity="0.2" fill="none" />
            <path d="M 70 300 C 400 300, 400 260, 730 260" stroke="#10b981" strokeWidth="40" strokeOpacity="0.2" fill="none" />
          </svg>
          <p className="mt-4 text-sm">Simplified Visualization (Sankey placeholder)</p>
        </div>
      </div>
    </div>
  );
}
