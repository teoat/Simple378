import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConfirmStepProps {
  fileCount: number;
  transactionCount: number;
}

export function ConfirmStep({ fileCount, transactionCount }: ConfirmStepProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 animate-in zoom-in duration-500">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Import Successful!</h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-10">
        We successfully processed <span className="font-semibold text-slate-900 dark:text-white">{fileCount} file(s)</span> and 
        imported <span className="font-semibold text-slate-900 dark:text-white">{transactionCount} transactions</span>.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => navigate('/cases')}
          className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors w-full sm:w-auto"
        >
          View All Cases
        </button>
        <button
          onClick={() => navigate('/reconciliation')}
          className="group px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          Start Reconciliation
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
