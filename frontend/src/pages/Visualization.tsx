import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type ViewType = 'cashflow' | 'milestones' | 'fraud';

interface FinancialData {
  total_inflow: number;
  total_outflow: number;
  net_cashflow: number;
  suspect_transactions: number;
  milestones: Array<{
    id: string;
    name: string;
    date: string;
    amount: number;
    status: 'complete' | 'pending' | 'alert';
  }>;
  fraud_indicators: Array<{
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    amount: number;
  }>;
}

export function Visualization() {
  const { caseId } = useParams<{ caseId: string }>();
  const [view, setView] = useState<ViewType>('cashflow');

  // Fetch financial visualization data
  const { data, isLoading, refetch } = useQuery<FinancialData>({
    queryKey: ['visualization', caseId],
    queryFn: async () => {
      // Mock data for development - replace with real API
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        total_inflow: 1250000,
        total_outflow: 1180000,
        net_cashflow: 70000,
        suspect_transactions: 12,
        milestones: [
          { id: '1', name: 'Initial Deposit', date: '2024-01-15', amount: 500000, status: 'complete' },
          { id: '2', name: 'Large Transfer', date: '2024-02-10', amount: 450000, status: 'alert' },
          { id: '3', name: 'Final Payment', date: '2024-03-05', amount: 300000, status: 'pending' }
        ],
        fraud_indicators: [
          { id: '1', type: 'Layering', severity: 'high', description: 'Multiple transfers through shell companies', amount: 450000 },
          { id: '2', type: 'Unusual Pattern', severity: 'medium', description: 'Transactions outside business hours', amount: 125000 },
          { id: '3', type: 'Jurisdictional Risk', severity: 'high', description: 'Transfers to high-risk countries', amount: 200000 }
        ]
      };
    },
    enabled: !!caseId
  });

  const tabs: Array<{ id: ViewType; label: string; icon: typeof DollarSign }> = [
    { id: 'cashflow', label: 'Cashflow Analysis', icon: DollarSign },
    { id: 'milestones', label: 'Milestone Tracker', icon: Calendar },
    { id: 'fraud', label: 'Fraud Detection', icon: AlertTriangle }
  ];

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
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Inflow</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(data?.total_inflow || 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">All incoming transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Outflow</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${(data?.total_outflow || 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">All outgoing transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Net Cashflow</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(data?.net_cashflow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(data?.net_cashflow || 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(data?.net_cashflow || 0) >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Suspect Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {data?.suspect_transactions || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Flagged transactions</p>
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
          {view === 'cashflow' && (
            <Card>
              <CardHeader>
                <CardTitle>Cashflow Balance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">Cashflow chart will be implemented here</p>
                    <p className="text-xs text-slate-400 mt-2">Using Recharts for interactive visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {view === 'milestones' && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${
                          milestone.status === 'complete' ? 'bg-green-500' :
                          milestone.status === 'alert' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {milestone.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(milestone.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          ${milestone.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {milestone.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {view === 'fraud' && (
            <Card>
              <CardHeader>
                <CardTitle>Fraud Detection Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.fraud_indicators.map((indicator) => (
                    <div
                      key={indicator.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        indicator.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                        indicator.severity === 'medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-5 w-5 ${
                              indicator.severity === 'high' ? 'text-red-500' :
                              indicator.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                            }`} />
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {indicator.type}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              indicator.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                              indicator.severity === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            }`}>
                              {indicator.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {indicator.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            ${indicator.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
