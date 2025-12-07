import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Share2, MoreHorizontal, Shield, Clock, FileText, Activity, Brain, MessageSquare, BarChart3 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { EvidenceLibrary } from '../components/cases/EvidenceLibrary';
import { RiskTrendWidget } from '../components/dashboard/RiskTrendWidget';
import { PredictiveDashboard } from '../components/predictive/PredictiveDashboard';
import { useAI } from '../context/AIContext';

interface CaseData {
  id: string;
  // title removed, rely on subject_name
  status: string;
  risk_score: number;
  subject_name: string;
  created_at: string;
  updated_at: string;
  description?: string;
}

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'evidence' | 'timeline' | 'predictive'>('overview');
  const { setIsOpen, setCurrentCaseId, sendMessage } = useAI();

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => apiRequest<CaseData>(`/cases/${id}`),
    retry: false,
    enabled: !!id,
  });

interface PredictiveResponse {
  predicted_score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

  const { data: aiRiskPrediction, isLoading: predictionLoading } = useQuery({
    queryKey: ['case', id, 'ai-risk-prediction'],
    queryFn: () => apiRequest<PredictiveResponse>(`/cases/${id}/ai-risk-prediction`),
    retry: false,
    enabled: !!id,
  });

  const openAIAssistant = () => {
    if (id) {
      setCurrentCaseId(id);
      setIsOpen(true);
      // Send initial case context message
      setTimeout(() => {
        sendMessage(`I'm looking at case ${caseData?.subject_name || id}. Can you help me analyze this case?`, id);
      }, 500);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'active':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      case 'under review':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
      case 'escalated':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'analysis', label: 'Analysis', icon: Activity },
    { id: 'evidence', label: 'Evidence Library', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'predictive', label: 'Predictive Analytics', icon: Brain },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cases')}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Back to cases"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {caseData?.subject_name || `Case #${id?.slice(0, 8)}`}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseData?.status || 'Open')}`}>
                {caseData?.status || 'Open'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Last updated: {caseData?.updated_at ? new Date(caseData.updated_at).toLocaleDateString() : 'Today'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/visualization/${id}`)}
            className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900/70"
            aria-label="View Visualization"
          >
            <BarChart3 className="h-4 w-4" />
            Visualization
          </button>
          <button
            onClick={openAIAssistant}
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70"
            aria-label="Open AI Assistant"
          >
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </button>
          <button
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Share case"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="More options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Risk Score</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {caseData?.risk_score ?? 75}/100
            </p>
           </div>
           <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
             <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
               <Activity className="h-5 w-5" />
               <span className="text-sm font-medium">AI Risk Prediction</span>
             </div>
             {predictionLoading ? (
               <div className="mt-2 flex items-center gap-2">
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                 <span className="text-sm text-slate-500">Analyzing...</span>
               </div>
             ) : aiRiskPrediction ? (
               <div className="mt-2 space-y-2">
                 <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                   {aiRiskPrediction?.predicted_score?.toFixed(1) ?? 'N/A'}/100
                 </p>
                 <div className="flex items-center gap-2 text-xs">
                   <span className={`px-2 py-1 rounded-full ${
                     aiRiskPrediction?.trend === 'increasing' ? 'bg-red-100 text-red-700' :
                     aiRiskPrediction?.trend === 'decreasing' ? 'bg-green-100 text-green-700' :
                     'bg-slate-100 text-slate-700'
                   }`}>
                     {aiRiskPrediction?.trend || 'stable'}
                   </span>
                   <span className="text-slate-500">
                     {aiRiskPrediction?.confidence ? (aiRiskPrediction.confidence * 100).toFixed(0) : 0}% confidence
                   </span>
                 </div>
               </div>
             ) : (
               <p className="mt-2 text-sm text-slate-500">Prediction unavailable</p>
             )}
           </div>
           <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
             <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
               <FileText className="h-5 w-5" />
               <span className="text-sm font-medium">Subject</span>
             </div>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {caseData?.subject_name || 'Unknown'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Created</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString() : 'Today'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-medium">Activity</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              12 events
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-800">
          <nav className="-mb-px flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Case Overview</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {caseData?.description || 'No description available. Add details about this case to provide context for investigators.'}
                </p>
                <div className="mt-6">
                    <h4 className="font-medium text-slate-900 dark:text-slate-200 mb-2">Automated Heuristic Analysis</h4>
                    <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/30">
                            <Shield className="h-4 w-4" />
                            <span><strong>Structuring Detected:</strong> 4 transactions just below $10,000 threshold within 24h.</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-2 rounded border border-amber-100 dark:border-amber-900/30">
                            <Activity className="h-4 w-4" />
                            <span><strong>Velocity Spike:</strong> Unusually high transaction volume between 2:00 AM and 4:00 AM.</span>
                        </li>
                    </ul>
                </div>
              </div>
              
              <div className="h-[300px]">
                <RiskTrendWidget 
                    currentScore={caseData?.risk_score ?? 75}
                    forecastScore={82}
                    data={[
                        { date: '2025-11-01', score: 45 },
                        { date: '2025-11-08', score: 48 },
                        { date: '2025-11-15', score: 52 },
                        { date: '2025-11-22', score: 65 },
                        { date: '2025-11-29', score: 70 },
                        { date: '2025-12-06', score: 75 },
                        { date: '2025-12-13', score: 78, isForecast: true },
                        { date: '2025-12-20', score: 80, isForecast: true },
                        { date: '2025-12-27', score: 82, isForecast: true },
                    ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'evidence' && <EvidenceLibrary caseId={id || ''} />}

          {activeTab === 'analysis' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Graph Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Network visualization and relationship analysis tools will appear here.
              </p>
            </div>
          )}

           {activeTab === 'timeline' && (
             <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
               <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Event Timeline</h3>
               <p className="text-slate-600 dark:text-slate-400">
                 Chronological list of case events and activities.
               </p>
             </div>
           )}

           {activeTab === 'predictive' && <PredictiveDashboard />}
        </div>
      </main>
    </div>
  );
}
