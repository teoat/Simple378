import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ExecutiveSummaryProps {
  data: {
    id: string;
    subject_name: string;
    status: string;
    risk_score: number;
    created_at: string;
    completed_at?: string;
    ingestion_stats?: {
      records_processed: number;
      files_ingested: number;
    };
    reconciliation_stats?: {
      match_rate: number;
      conflicts_resolved: number;
    };
    adjudication_stats?: {
      decisions_made: number;
      avg_resolution_time: string;
    };
  };
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Executive Summary
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Investigation overview and key metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Case Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Case Status</span>
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
            {data.status}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Risk Score: <span className={`font-medium ${getRiskColor(data.risk_score)}`}>
              {data.risk_score}/100
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Timeline</span>
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">
            {formatDate(data.created_at)}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {data.completed_at ? `Completed: ${formatDate(data.completed_at)}` : 'In Progress'}
          </div>
        </div>

        {/* Ingestion Stats */}
        {data.ingestion_stats && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Ingestion</span>
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {data.ingestion_stats.records_processed.toLocaleString()}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {data.ingestion_stats.files_ingested} files processed
            </div>
          </div>
        )}

        {/* Adjudication Stats */}
        {data.adjudication_stats && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Adjudication</span>
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {data.adjudication_stats.decisions_made}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Avg: {data.adjudication_stats.avg_resolution_time}
            </div>
          </div>
        )}
      </div>

      {/* Reconciliation Stats */}
      {data.reconciliation_stats && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Reconciliation Results
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.reconciliation_stats.match_rate}%
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Match Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.reconciliation_stats.conflicts_resolved}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Conflicts Resolved</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}