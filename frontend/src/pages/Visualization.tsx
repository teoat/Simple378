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
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MilestoneTracker } from '../components/visualization/MilestoneTracker';
import { FraudDetectionPanel } from '../components/visualization/FraudDetectionPanel';
import { VisualizationDashboard } from '../components/visualization/VisualizationDashboard';
import { VisualizationNetwork, GraphData, FinancialData } from '../components/visualization/VisualizationNetwork';
import { Modal } from '../components/ui/Modal';
import { PhaseControlPanel } from '../components/visualization/PhaseControlPanel';
import { api } from '../lib/api';

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading visualization...</p>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Financial Visualization
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Case {caseId} - Interactive financial analysis and fraud detection
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              📊 KPI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div data-testid="kpi-card" className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Inflow</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${(data?.total_inflow || 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">All incoming transactions</p>
              </div>

              <div data-testid="kpi-card" className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Total Outflow</span>
                  <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${(data?.total_outflow || 0).toLocaleString()}
                </div>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">All outgoing transactions</p>
              </div>

              <div data-testid="kpi-card" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Net Cashflow</span>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </div>
                <div className={`text-2xl font-bold ${(data?.net_cashflow || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${Math.abs(data?.net_cashflow || 0).toLocaleString()}
                </div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                  {(data?.net_cashflow || 0) >= 0 ? 'Surplus' : 'Deficit'}
                </p>
              </div>

              <div data-testid="kpi-card" className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Suspect Items</span>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {data?.suspect_transactions || 0}
                </div>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Flagged transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid - 2x2 Layout as per spec */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cashflow Balance Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                💸 Cashflow Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data && <VisualizationDashboard data={data} />}
            </CardContent>
          </Card>

          {/* Milestone Tracker Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                🏁 Milestone Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneTracker 
                milestones={data?.milestones}
                onMilestoneClick={(milestone) => setSelectedMilestone(milestone)}
              />
            </CardContent>
          </Card>

          {/* Fraud Detection Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                🕵️‍♂️ Fraud Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FraudDetectionPanel 
                indicators={data?.fraud_indicators}
                riskScore={data?.risk_score}
              />
            </CardContent>
          </Card>

          {/* Network & Flow Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-indigo-500" />
                📊 Network & Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VisualizationNetwork 
                graphData={graphData} 
                financialData={data} 
                isLoading={graphLoading} 
              />
            </CardContent>
          </Card>
        </div>

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
      </div>
    </div>
  );
}
