import { useParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Clock, FileText, Network, DollarSign, ChevronLeft, Shield, AlertTriangle, CheckCircle, Download, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EntityGraph } from '../components/visualizations/EntityGraph';
import { RiskBar } from '../components/cases/RiskBar';
import { StatusBadge } from '../components/cases/StatusBadge';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { AIReasoningTab } from '../components/adjudication/AIReasoningTab';
import { CaseOverview } from '../components/cases/CaseOverview';
import { CaseTimeline } from '../components/cases/CaseTimeline';
import { CaseFinancials } from '../components/cases/CaseFinancials';
import { useCaseDetail } from '../hooks/useCaseDetail';

const tabs = [
  { name: 'Overview', id: 'overview', icon: FileText },
  { name: 'Graph Analysis', id: 'graph', icon: Network },
  { name: 'Timeline', id: 'timeline', icon: Clock },
  { name: 'Financials', id: 'financials', icon: DollarSign },
  { name: 'Evidence', id: 'evidence', icon: Shield },
];

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const { caseData, caseLoading, activeTab, setActiveTab, showHelp, setShowHelp } = useCaseDetail(id);

  if (caseLoading) {
    return (
      <div className="p-8 space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm">
          Case not found
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary pageName="Case Detail">
      <div className="p-8 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* Navigation */}
      <Link 
        to="/cases" 
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Cases
      </Link>

      {/* Header Card */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
              {caseData.subject_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{caseData.subject_name}</h1>
                <StatusBadge status={caseData.status} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mb-4">ID: {caseData.id}</p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Risk Score:</span>
                  <div className="w-32">
                    <RiskBar score={caseData.risk_score} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(caseData.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Edit className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Download className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            {/* Decision buttons moved to right column */}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                activeTab === tab.name
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
                'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200'
              )}
            >
              <tab.icon
                className={cn(
                  activeTab === tab.name ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500',
                  'mr-2 h-5 w-5 transition-colors duration-200'
                )}
                aria-hidden="true"
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* NEW GRID FOR TAB CONTENT AND RIGHT PANEL */}
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Center Column: Tab Content (col-span-9) */}
        <div className="col-span-9 h-full min-h-[500px]"> {/* min-h for consistent sizing */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
               {activeTab === 'Overview' && <CaseOverview caseData={caseData} />}

               {activeTab === 'Graph Analysis' && (
                 <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 h-full">
                   <EntityGraph />
                 </div>
               )}

               {activeTab === 'Financials' && <CaseFinancials />}

               {activeTab === 'Timeline' && <CaseTimeline />}

              {activeTab === 'Evidence' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center text-center border-dashed h-full">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Evidence Files</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    Upload and manage evidence files related to this case. Drag and drop files here or click to browse.
                  </p>
                  <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Upload Evidence
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Case Actions & Insights (col-span-3) */}
        <div className="col-span-3 flex flex-col h-full space-y-6">
          {/* Decision Buttons */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Actions</h3>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium shadow-sm w-full mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Escalate Case
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium w-full">
              <CheckCircle className="h-4 w-4" />
              Approve Case
            </button>
          </div>

          {/* AI Insight / AIReasoningTab */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">AI Insights</h3>
             {caseData ? (
               <AIReasoningTab subjectId={caseData.id} />
             ) : (
              <div className="flex-1 flex items-center justify-center text-center text-slate-500 dark:text-slate-400">
                No case data for AI reasoning.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Switch to Overview</span>
                  <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium">1</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Switch to Graph</span>
                  <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium">2</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Switch to Timeline</span>
                  <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium">3</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Switch to Financials</span>
                  <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium">4</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Switch to Evidence</span>
                  <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium">5</kbd>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Show/Hide Help</span>
                  <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium">Shift + ?</kbd>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageErrorBoundary>
  );
}
