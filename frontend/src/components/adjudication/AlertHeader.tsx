import React from 'react';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

interface Alert {
  id: string;
  subject_name: string;
  risk_score: number;
  triggered_rules: string[];
  created_at: string;
  status: 'pending' | 'flagged' | 'resolved';
}

export function AlertHeader({ alert }: { alert: Alert }) {
  return (
    <div className="p-6 border-b border-white/10 dark:border-slate-700/20 bg-white/5 dark:bg-slate-800/10">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {alert.subject_name}
            </h2>
            <span className="px-2 py-1 rounded text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              ID: {alert.id}
            </span>
          </div>
          <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Detected: {new Date(alert.created_at).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Status: <span className="capitalize text-slate-700 dark:text-slate-200">{alert.status}</span>
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Risk Score</div>
          <div className={`text-3xl font-bold ${
            alert.risk_score > 80 ? 'text-red-500' :
            alert.risk_score > 60 ? 'text-orange-500' : 'text-yellow-500'
          }`}>
            {alert.risk_score}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {alert.triggered_rules.map((rule, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            {rule}
          </div>
        ))}
      </div>
    </div>
  );
}
