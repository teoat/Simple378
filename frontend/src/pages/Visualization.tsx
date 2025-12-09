import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  Share2,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Tooltip } from '../components/ui/Tooltip';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { MilestoneTracker } from '../components/visualization/MilestoneTracker';
import { FraudDetectionPanel } from '../components/visualization/FraudDetectionPanel';
import { VisualizationDashboard } from '../components/visualization/VisualizationDashboard';
import { VisualizationNetwork, GraphData, FinancialData } from '../components/visualization/VisualizationNetwork';
import { Modal } from '../components/ui/Modal';
import { PhaseControlPanel } from '../components/visualization/PhaseControlPanel';
import { api } from '../lib/api';

type ViewType = 'cashflow' | 'milestones' | 'fraud' | 'graphs';

interface CategoryData {
  id: string;
  name: string;
  amount: number;
  transactions: number;
  isExcluded?: boolean;
}

// Extending FinancialData to include extra fields used in Visualization.tsx
interface FullFinancialData extends FinancialData {
  total_inflow: number;
  total_outflow: number;
  net_cashflow: number;
  suspect_transactions: number;
  risk_score: number;
  milestones: Array<{
    id: string;
    name: string;
    date: string;
    amount: number;
    status: 'complete' | 'pending' | 'alert' | 'upcoming';
    description?: string;
    phase?: string;
  }>;
  income_breakdown?: {
    income_sources: CategoryData;
    mirror_transactions: CategoryData;
    external_transfers: CategoryData;
  };
  expense_breakdown?: {
    personal_expenses: CategoryData;
    operational_expenses: CategoryData;
    project_expenses: CategoryData;
  };
  fraud_indicators: Array<{
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    amount: number;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export function Visualization() {
  const { caseId } = useParams<{ caseId: string }>();
  const [view, setView] = useState<ViewType>('cashflow');
  const [selectedMilestone, setSelectedMilestone] = useState<FullFinancialData['milestones'][0] | null>(null);

  // Fetch financial visualization data
  const { data, isLoading, isError, error, refetch } = useQuery<FullFinancialData>({
    queryKey: ['visualization', caseId],
    queryFn: () => api.get<FullFinancialData>(`/cases/${caseId}/financials`),
    enabled: !!caseId
  });

  // Fetch graph data for network visualization
  const { data: graphData, isLoading: graphLoading } = useQuery<GraphData>({
    queryKey: ['graph', caseId],
    queryFn: () => api.get<GraphData>(`/graph/${caseId}`),
    enabled: !!caseId
  });

  const tabs: Array<{ id: ViewType; label: string; icon: typeof DollarSign }> = [
    { id: 'cashflow', label: 'Cashflow Analysis', icon: DollarSign },
    { id: 'milestones', label: 'Milestone Tracker', icon: Calendar },
    { id: 'fraud', label: 'Fraud Detection', icon: AlertTriangle },
    { id: 'graphs', label: 'Network & Flow', icon: Share2 }
  ];

  const handleExport = () => {
    if (!data) return;

    // Dynamically import exportUtils to avoid server-side dependency issues
    import('../lib/exportUtils').then(({ generatePDFReport, exportToCSV }) => {
      // 1. Export CSV
      const cashflowHeaders = [
        { key: 'date', header: 'Date' },
        { key: 'inflow', header: 'Inflow' },
        { key: 'outflow', header: 'Outflow' },
        { key: 'balance', header: 'Balance' }
      ];
      exportToCSV(data.cashflow_data, `case_${caseId}_cashflow`, cashflowHeaders);

      // 2. Generate PDF Report
      const tableData = {
        headers: ['Type', 'Severity', 'Amount', 'Count', 'Description'],
        rows: data.fraud_indicators.map(i => [
          i.type,
          i.severity.toUpperCase(),
          `$${i.amount.toLocaleString()}`,
          i.count,
          i.description
        ])
      };

      const pdf = generatePDFReport([
        { 
          type: 'heading',
          content: 'Financial Analysis Report' 
        },
        {
          type: 'text',
          content: `Case ID: ${caseId}\nRisk Score: ${data.risk_score}/100\nNet Cashflow: $${data.net_cashflow.toLocaleString()}`
        },
        {
          type: 'table',
          content: {
            title: 'Fraud Indicators',
            headers: tableData.headers,
            rows: tableData.rows
          }
        },
        {
          type: 'heading',
          content: 'Milestones'
        },
        {
          type: 'table',
          content: {
            title: 'Key Events',
            headers: ['Date', 'Event', 'Amount', 'Status'],
            rows: data.milestones.map(m => [
              m.date,
              m.name,
              `$${m.amount.toLocaleString()}`,
              m.status
            ])
          }
        }
      ], {
        title: 'Fraud Detection Financial Report',
        subtitle: `Generated for Case ${caseId}`,
        author: 'Simple378 Investigator'
      });

      pdf.save(`case_${caseId}_report.pdf`);
    });
  };

  const handleShare = () => {
    console.log('Sharing visualization...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="container mx-auto max-w-7xl space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <LoadingSkeleton variant="text" width="300px" height="32px" />
              <LoadingSkeleton variant="text" width="450px" height="20px" />
            </div>
            <div className="flex gap-3">
              <LoadingSkeleton variant="rectangular" width="100px" height="40px" />
              <LoadingSkeleton variant="rectangular" width="100px" height="40px" />
              <LoadingSkeleton variant="rectangular" width="100px" height="40px" />
            </div>
          </div>
          
          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LoadingSkeleton variant="card" count={4} />
          </div>
          
          {/* Content Skeleton */}
          <LoadingSkeleton variant="card" height="400px" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center" data-testid="error-state">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Error loading data
          </h3>
          <p className="text-slate-500 mt-2">
            {(error as Error)?.message || 'Failed to load visualization data'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Cases', href: '/cases' },
            { label: `Case ${caseId}`, href: `/cases/${caseId}` },
            { label: 'Financial Visualization' }
          ]} 
        />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Financial Visualization
              </h1>
              <Badge variant="info" size="sm">
                Live Data
              </Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Case {caseId} - Interactive financial analysis and fraud detection
            </p>
          </div>
          <div className="flex gap-3">
            <Tooltip content="Refresh all data">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </Tooltip>
            <Tooltip content="Share visualization">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </Tooltip>
            <Tooltip content="Export to PDF & CSV">
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="kpi-card" className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                Total Inflow
                <Tooltip content="Sum of all incoming transactions">
                  <Info className="h-3 w-3 text-green-500/70" />
                </Tooltip>
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${(data?.total_inflow || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                <p className="text-xs text-green-600/70 dark:text-green-400/70">All incoming transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="kpi-card" className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                Total Outflow
                <Tooltip content="Sum of all outgoing transactions">
                  <Info className="h-3 w-3 text-red-500/70" />
                </Tooltip>
              </CardTitle>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${(data?.total_outflow || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                <p className="text-xs text-red-600/70 dark:text-red-400/70">All outgoing transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="kpi-card" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                Net Cashflow
                <Tooltip content="Difference between inflow and outflow">
                  <Info className="h-3 w-3 text-blue-500/70" />
                </Tooltip>
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(data?.net_cashflow || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                ${Math.abs(data?.net_cashflow || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={(data?.net_cashflow || 0) >= 0 ? 'success' : 'warning'} size="sm">
                  {(data?.net_cashflow || 0) >= 0 ? 'Surplus' : 'Deficit'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="kpi-card" className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                Suspect Items
                <Tooltip content="Transactions flagged for review">
                  <Info className="h-3 w-3 text-amber-500/70" />
                </Tooltip>
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {data?.suspect_transactions || 0}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {(data?.suspect_transactions || 0) > 0 ? (
                  <Badge variant="warning" size="sm" animated>
                    Needs Review
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    All Clear
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  view === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'cashflow' && data && (
            <VisualizationDashboard data={data} />
          )}

          {view === 'milestones' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    Financial Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MilestoneTracker 
                    milestones={data?.milestones}
                    onMilestoneClick={(milestone) => setSelectedMilestone(milestone)}
                  />
                </CardContent>
              </Card>

              {/* Milestone Action Modal */}
              <Modal
                isOpen={!!selectedMilestone}
                onClose={() => setSelectedMilestone(null)}
                title="Manage Milestone Phase"
              >
                {selectedMilestone && (
                  <PhaseControlPanel 
                    milestone={selectedMilestone} 
                    onStatusUpdate={() => {
                      refetch();
                      setSelectedMilestone(null);
                    }} 
                  />
                )}
              </Modal>
            </>
          )}

          {view === 'fraud' && (
            <FraudDetectionPanel 
              indicators={data?.fraud_indicators}
              riskScore={data?.risk_score}
            />
          )}

          {view === 'graphs' && (
            <VisualizationNetwork 
              graphData={graphData} 
              financialData={data} 
              isLoading={graphLoading} 
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
