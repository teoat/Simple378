import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { KPICard } from '../components/visualization/KPICard';
import { ExpenseChart } from '../components/visualization/ExpenseChart';
import { BalanceTreemap } from '../components/visualization/BalanceTreemap';
import { CashFlowWaterfall } from '../components/visualization/CashFlowWaterfall';
import { AIInsightPanel } from '../components/visualization/AIInsightPanel';
import { api } from '../lib/api';

export function Visualization() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ['kpis'],
    queryFn: api.getFinancialKPIs,
  });

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: api.getExpenseTrend,
  });

  const { data: balanceSheet, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balanceSheet'],
    queryFn: api.getBalanceSheet,
  });

  return (
    <PageErrorBoundary pageName="Financial Visualization">
      <div className="p-6 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Visualization</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Real-time insights into your financial health
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
              Dashboard
            </button>
            <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              Reports
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
              <Calendar className="w-4 h-4" />
              {dateRange}
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Burn Rate"
            value={kpis?.burn_rate ? `$${kpis.burn_rate.value.toLocaleString()}` : '...'}
            trend={kpis?.burn_rate ? `${kpis.burn_rate.trend}% vs last month` : ''}
            trendDirection={(kpis?.burn_rate?.direction as 'up' | 'down' | 'neutral') || 'neutral'}
            icon={TrendingDown}
            status="warning"
          />
          <KPICard
            title="Cash On Hand"
            value={kpis?.cash_on_hand ? `$${kpis.cash_on_hand.value.toLocaleString()}` : '...'}
            trend="Stable"
            trendDirection="neutral"
            icon={DollarSign}
            status="success"
          />
          <KPICard
            title="Monthly Revenue"
            value={kpis?.monthly_revenue ? `$${kpis.monthly_revenue.value.toLocaleString()}` : '...'}
            trend="8% vs last month"
            trendDirection="up"
            icon={TrendingUp}
            status="success"
          />
          <KPICard
            title="Outstanding Debt"
            value={kpis?.outstanding_debt ? `$${kpis.outstanding_debt.value.toLocaleString()}` : '...'}
            trend="Down 20%"
            trendDirection="down"
            icon={CreditCard}
            status="neutral"
          />
        </div>

        {/* Main Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Expense Chart - Takes up 2 cols */}
          <div className="lg:col-span-2">
            {!isLoadingExpenses && expenses ? (
              <ExpenseChart data={expenses} />
            ) : (
              <div className="h-[400px] bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
            )}
          </div>
          
          {/* AI Panel - Takes up 1 col */}
          <div className="lg:col-span-1">
            <AIInsightPanel />
          </div>
        </div>

        {/* Secondary Chart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isLoadingBalance && balanceSheet ? (
            <BalanceTreemap data={balanceSheet} />
          ) : (
            <div className="h-[400px] bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
          )}
          <CashFlowWaterfall />
        </div>

      </div>
    </PageErrorBoundary>
  );
}
