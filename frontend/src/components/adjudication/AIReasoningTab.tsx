import React from 'react';
import { Sparkles, AlertTriangle, Check } from 'lucide-react';

interface AIReasoningTabProps {
  alertId: string;
}

export function AIReasoningTab({ alertId }: AIReasoningTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Analysis</h3>
      </div>

      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-purple-600 dark:text-purple-300">Confidence Score</span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">92%</span>
        </div>
        <div className="w-full bg-purple-200 dark:bg-purple-900 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Indicators</h4>
        
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Velocity Mismatch</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Transaction frequency exceeds historical baseline by 400%.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Phantom Expense</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Invoice #12345 matches known shell company pattern.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mitigating Factors</h4>
        
        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
          <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Verified Identity</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Subject has completed KYC verification level 3.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
