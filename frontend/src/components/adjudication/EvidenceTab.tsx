import { useQuery } from '@tanstack/react-query';
import { FileText, Image, File, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface EvidenceTabProps {
  alertId: string;
}

export function EvidenceTab({ alertId }: EvidenceTabProps) {
  const { data: evidence, isLoading, error } = useQuery({
    queryKey: ['evidence', alertId],
    queryFn: () => api.getEvidenceForAnalysis(alertId),
    enabled: !!alertId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading evidence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p className="text-sm">Failed to load evidence</p>
        </div>
      </div>
    );
  }

  if (!evidence || evidence.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No evidence files found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Supporting Evidence</h3>
      <div className="grid grid-cols-2 gap-4">
        {evidence.map((item) => {
          const fileType = item.filename?.split('.').pop()?.toLowerCase() || 'file';
          const isPdf = fileType === 'pdf';
          const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileType);
          
          return (
            <div key={item.id} className="group cursor-pointer p-4 rounded-xl border border-white/10 dark:border-slate-700/20 bg-white/5 dark:bg-slate-800/10 hover:bg-white/10 dark:hover:bg-slate-800/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  {isPdf ? <FileText className="w-6 h-6" /> :
                   isImage ? <Image className="w-6 h-6" /> :
                   <File className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 dark:text-white truncate">{item.filename}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.file_type} • {new Date(item.upload_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
