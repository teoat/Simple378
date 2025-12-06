import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { SummarySkeleton } from '../components/summary/SummarySkeleton';
import { ExecutiveSummary } from '../components/summary/ExecutiveSummary';
import { KeyFindings } from '../components/summary/KeyFindings';
import { ReportGenerator } from '../components/summary/ReportGenerator';
import { CaseTimeline } from '../components/cases/CaseTimeline';
import { ArrowLeft, Download, Share, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export function Summary() {
  const { caseId } = useParams<{ caseId: string }>();

  const { data: caseSummary, isLoading } = useQuery({
    queryKey: ['case-summary', caseId],
    queryFn: () => api.getCaseSummary(caseId!),
    enabled: !!caseId,
  });

  if (isLoading) {
    return (
      <PageErrorBoundary pageName="Case Summary">
        <SummarySkeleton />
      </PageErrorBoundary>
    );
  }

  if (!caseSummary) {
    return (
      <PageErrorBoundary pageName="Case Summary">
        <div className="p-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Case Summary Not Found
              </h2>
              <p className="text-red-700 dark:text-red-300 mb-4">
                The requested case summary could not be found or you don't have permission to view it.
              </p>
              <Link
                to="/cases"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cases
              </Link>
            </div>
          </div>
        </div>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="Case Summary">
      <div className="p-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Link
                to="/cases"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Case Summary Report
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Case ID: {caseSummary.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                <Share className="h-4 w-4" />
                Share Report
              </motion.button>
            </div>
          </motion.div>

          {/* Success Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Investigation Complete</h2>
                <p className="text-green-100">
                  Case resolved with {caseSummary.confidence || 95}% confidence.
                  All evidence reviewed and decision finalized.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ExecutiveSummary data={caseSummary} />
          </motion.div>

          {/* Key Findings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <KeyFindings findings={caseSummary.findings || []} />
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              Investigation Timeline
            </h3>
            <CaseTimeline caseId={caseId!} />
          </motion.div>

          {/* Report Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ReportGenerator caseData={caseSummary} />
          </motion.div>

        </div>
      </div>
    </PageErrorBoundary>
  );
}