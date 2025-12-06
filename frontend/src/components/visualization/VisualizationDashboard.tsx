import { DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { CashflowChart } from './CashflowChart';
import { BankStatementPanel } from './BankStatementPanel';
import { ExpenseCategoryPanel } from './ExpenseCategoryPanel';
import { WaterfallChart } from './WaterfallChart';

interface CategoryData {
  id: string;
  name: string;
  amount: number;
  transactions: number;
  isExcluded?: boolean;
}

interface FinancialData {
  total_inflow: number;
  total_outflow: number;
  net_cashflow: number;
  cashflow_data: Array<{
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
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
  project_summary?: {
    net_project_transactions: number;
    mirror_excluded: number;
    personal_excluded: number;
    total_project_value: number;
  };
}

interface VisualizationDashboardProps {
  data?: FinancialData;
}

export function VisualizationDashboard({ data }: VisualizationDashboardProps) {
  if (!data) return null;

  // Use real breakdown if available, otherwise fall back to empty or mock (avoiding mock though)
  const income = data.income_breakdown || {
    income_sources: { id: 'income', name: 'Income Sources', amount: 0, transactions: 0 },
    mirror_transactions: { id: 'mirror', name: 'Mirror Transactions', amount: 0, transactions: 0 },
    external_transfers: { id: 'external', name: 'External Transfers', amount: 0, transactions: 0 }
  };

  const expense = data.expense_breakdown || {
    personal_expenses: { id: 'personal', name: 'Personal Expenses', amount: 0, transactions: 0 },
    operational_expenses: { id: 'ops', name: 'Operational Expenses', amount: 0, transactions: 0 },
    project_expenses: { id: 'project', name: 'Project Specific', amount: 0, transactions: 0 }
  };

  const projectSummary = data.project_summary || {
    net_project_transactions: 0,
    mirror_excluded: 0,
    personal_excluded: 0,
    total_project_value: 0
  };

  return (
    <div className="space-y-6">
      {/* Split View Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BankStatementPanel 
          mirrorTransactions={{
            ...income.mirror_transactions,
            isExcluded: true
          }}
          incomeSources={income.income_sources}
          externalTransfers={income.external_transfers}
        />
        <ExpenseCategoryPanel 
           personalExpenses={{
            ...expense.personal_expenses,
            isExcluded: true
          }}
          operationalExpenses={expense.operational_expenses}
          projectExpenses={expense.project_expenses}
        />
      </div>

      {/* Waterfall Chart - Shows the formula visually */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            Cashflow Breakdown (Waterfall)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WaterfallChart
            totalCashflow={data.total_inflow}
            mirrorTransactions={projectSummary.mirror_excluded}
            personalExpenses={projectSummary.personal_excluded}
          />
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Cashflow Balance Analysis
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                30 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CashflowChart data={data.cashflow_data} height={450} />
        </CardContent>
      </Card>
    </div>
  );
}
