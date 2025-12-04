import { FileText, CheckCircle, Clock, AlertCircle, Eye, Trash2 } from 'lucide-react';

interface UploadHistoryItem {
  id: string;
  filename: string;
  type: string;
  status: 'processing' | 'complete' | 'failed';
  size: string;
  uploadedAt: string;
}

interface UploadHistoryProps {
  onView: (id: string) => void;
}

// Mock data for now
const MOCK_HISTORY: UploadHistoryItem[] = [
  { id: '1', filename: 'invoice_2024_001.pdf', type: 'PDF', status: 'complete', size: '2.4 MB', uploadedAt: '2 mins ago' },
  { id: '2', filename: 'receipt_scan.jpg', type: 'JPG', status: 'processing', size: '1.1 MB', uploadedAt: '5 mins ago' },
  { id: '3', filename: 'bank_statement.csv', type: 'CSV', status: 'failed', size: '450 KB', uploadedAt: '1 hour ago' },
];

export function UploadHistory({ onView }: UploadHistoryProps) {
  return (
    <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-white/10 dark:border-slate-700/30">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Uploads</h3>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {MOCK_HISTORY.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">{item.filename}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.size}</span>
                  <span>•</span>
                  <span>{item.uploadedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                item.status === 'complete' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                item.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
              }`}>
                {item.status === 'complete' && <CheckCircle className="w-3 h-3" />}
                {item.status === 'processing' && <Clock className="w-3 h-3 animate-pulse" />}
                {item.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                <span className="capitalize">{item.status}</span>
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onView(item.id)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
