import { CheckCircle, AlertCircle, Clock, Database } from 'lucide-react';

export interface PipelineStage {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'pending';
  metric: string;
  metricLabel: string;
  details?: string;
}

interface PipelineHealthStatusProps {
  stages: PipelineStage[];
}

export function PipelineHealthStatus({ stages }: PipelineHealthStatusProps) {
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pipeline Health Monitor</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-8 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-2xl ${
                stage.status === 'healthy' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
                stage.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                stage.status === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              } border-2 flex items-center justify-center mb-3 shadow-sm transition-transform hover:scale-105`}>
                {getStatusIcon(stage.status)}
              </div>
              <h4 className="font-medium text-slate-900 dark:text-slate-200 text-sm mb-1">{stage.name}</h4>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{stage.metric}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">{stage.metricLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
