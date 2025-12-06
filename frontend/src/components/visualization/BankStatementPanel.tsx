import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface DataCategory {
  id: string;
  name: string;
  amount: number;
  transactions: number;
  description?: string;
  isExcluded?: boolean;
}

interface BankStatementPanelProps {
  mirrorTransactions: DataCategory;
  incomeSources: DataCategory;
  externalTransfers: DataCategory;
  className?: string;
}

export function BankStatementPanel({ 
  mirrorTransactions, 
  incomeSources, 
  externalTransfers,
  className 
}: BankStatementPanelProps) {
  


  return (
    <Card className={`h-full border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <ArrowDownLeft className="h-5 w-5 text-blue-500" />
            Bank Statements (Source)
          </span>
          <span className="text-sm font-normal text-slate-500">Inflow Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Income Sources (Valid) */}
        <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400">
                <ArrowDownLeft className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Income Sources</span>
            </div>
            <span className="font-bold text-green-700 dark:text-green-400">
              ${incomeSources.amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 pl-9">
            {incomeSources.description || 'Salary, Revenue, Loans'}
          </p>
        </div>

        {/* Mirror Transactions (Excluded) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-bl">
            EXCLUDED
          </div>
          <div className="flex items-center justify-between mb-1 opacity-75">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-500">
                <ArrowRightLeft className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Mirror Transactions</span>
            </div>
            <span className="font-bold text-slate-500">
              ${mirrorTransactions.amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-400 pl-9">
            Internal transfers between owned accounts
          </p>
        </div>

        {/* External Transfers */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">External Sources</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400">
              ${externalTransfers.amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 pl-9">
            Wires, Remittances, Third-party funding
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
          <span className="text-slate-500">Total Valid Inflow:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
             ${(incomeSources.amount + externalTransfers.amount).toLocaleString()}
          </span>
        </div>

      </CardContent>
    </Card>
  );
}
