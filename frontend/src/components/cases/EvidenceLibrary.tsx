import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { evidenceApi, EvidenceType } from '../../lib/evidenceApi';
import { FileText, MessageSquare, Video, Image as ImageIcon, Upload, Loader2, Download, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface EvidenceLibraryProps {
  caseId: string;
}

export function EvidenceLibrary({ caseId }: EvidenceLibraryProps) {
  const [filter, setFilter] = useState<EvidenceType | 'all'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const { data: evidenceList, isLoading } = useQuery({
    queryKey: ['evidence', caseId],
    queryFn: () => evidenceApi.list(caseId),
  });

  const filteredList = evidenceList?.filter(item => 
    filter === 'all' ? true : item.type === filter
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await evidenceApi.upload(caseId, file, (progress) => {
        setUploadProgress(progress);
      });
      toast.success('Evidence uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['evidence', caseId] });
    } catch (error) {
      toast.error('Failed to upload evidence');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      e.target.value = '';
    }
  };

  const icons = {
    [EvidenceType.DOCUMENT]: FileText,
    [EvidenceType.CHAT]: MessageSquare,
    [EvidenceType.VIDEO]: Video,
    [EvidenceType.PHOTO]: ImageIcon,
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'document', 'chat', 'video', 'photo'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                filter === type
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} ({evidenceList?.filter(e => type === 'all' ? true : e.type === type).length || 0})
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors shadow-sm font-medium",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Upload Evidence'}
          </label>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredList?.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No evidence found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Upload files to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredList?.map((item) => {
            const Icon = icons[item.type] || FileText;
            return (
              <div 
                key={item.id} 
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-lg",
                      item.type === 'document' && "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
                      item.type === 'chat' && "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
                      item.type === 'video' && "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
                      item.type === 'photo' && "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]" title={item.filename}>
                        {item.filename}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">{item.type}</span>
                        <span>•</span>
                        <span>{formatBytes(item.size_bytes)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    item.processing_status === 'completed' && "bg-emerald-500",
                    item.processing_status === 'processing' && "bg-blue-500 animate-pulse",
                    item.processing_status === 'failed' && "bg-red-500",
                    item.processing_status === 'pending' && "bg-slate-300"
                  )} title={`Status: ${item.processing_status}`} />
                </div>

                {/* Metadata Preview */}
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
                  {item.type === 'document' && (
                    <div className="flex justify-between">
                      <span>Pages:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-200">{item.document?.page_count || '-'}</span>
                    </div>
                  )}
                  {item.type === 'chat' && (
                    <div className="flex justify-between">
                      <span>Messages:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-200">{item.chat?.message_count || '-'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-200">{new Date(item.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button className="flex p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
