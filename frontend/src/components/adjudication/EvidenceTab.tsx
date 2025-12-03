import React from 'react';
import { FileText, Image, File } from 'lucide-react';

interface EvidenceTabProps {
  alertId: string;
}

export function EvidenceTab({ alertId }: EvidenceTabProps) {
  // Placeholder data
  const evidence = [
    { id: 1, name: 'receipt_001.pdf', type: 'pdf', size: '1.2 MB', date: '2024-03-10' },
    { id: 2, name: 'transaction_log.csv', type: 'csv', size: '450 KB', date: '2024-03-11' },
    { id: 3, name: 'invoice_scan.jpg', type: 'image', size: '2.4 MB', date: '2024-03-12' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Supporting Evidence</h3>
      <div className="grid grid-cols-2 gap-4">
        {evidence.map((item) => (
          <div key={item.id} className="group cursor-pointer p-4 rounded-xl border border-white/10 dark:border-slate-700/20 bg-white/5 dark:bg-slate-800/10 hover:bg-white/10 dark:hover:bg-slate-800/20 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                {item.type === 'pdf' ? <FileText className="w-6 h-6" /> :
                 item.type === 'image' ? <Image className="w-6 h-6" /> :
                 <File className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 dark:text-white truncate">{item.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.size} • {item.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
