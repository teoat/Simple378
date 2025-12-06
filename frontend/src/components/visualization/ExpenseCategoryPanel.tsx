import { ShoppingBag, Briefcase, Calculator, Archive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface DataCategory {
  id: string;
  name: string;
  amount: number;
  transactions: number;
  description?: string;
  isExcluded?: boolean;
}

interface ExpenseCategoryPanelProps {
  personalExpenses: DataCategory;
  operationalExpenses: DataCategory;
  projectExpenses: DataCategory;
  className?: string;
}

export function ExpenseCategoryPanel({
  personalExpenses,
  operationalExpenses,
  projectExpenses,
  className
}: ExpenseCategoryPanelProps) {
  return (
    <Card className={`h-full border-l-4 border-l-orange-500 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-orange-500" />
            Expense Breakdown
          </span>
          <span className="text-sm font-normal text-slate-500">Outflow Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Personal Expenses (Excluded) */}
        <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-[10px] font-bold text-red-600 dark:text-red-300 rounded-bl">
            EXCLUDED
          </div>
          <div className="flex items-center justify-between mb-1 opacity-90">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Personal Expenses</span>
            </div>
            <span className="font-bold text-red-700 dark:text-red-400">
              ${personalExpenses.amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 pl-9">
            Lifestyle, entertainment, non-business
          </p>
        </div>

        {/* Operational Expenses */}
        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-600 dark:text-amber-400">
                <Archive className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Operational</span>
            </div>
            <span className="font-bold text-amber-700 dark:text-amber-400">
              ${operationalExpenses.amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 pl-9">
            Rent, Payroll, Utilities, Admin
          </p>
        </div>

        {/* Project Specific (Project) */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 ring-1 ring-blue-500/20">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                <Calculator className="h-4 w-4" />
              </span>
              <span className="font-bold text-blue-900 dark:text-blue-100">Project Specific</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400">
              ${projectExpenses.amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 pl-9">
            Direct case/project related costs
          </p>
        </div>

         <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
          <span className="text-slate-500">Total Valid Outflow:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
             ${(operationalExpenses.amount + projectExpenses.amount).toLocaleString()}
          </span>
        </div>

      </CardContent>
    </Card>
  );
}
