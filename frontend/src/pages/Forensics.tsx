import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { FileUploader } from '../components/forensics/FileUploader';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export function Forensics() {
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: api.uploadFile,
    onSuccess: (data) => {
      setUploadedFileId(data.file_id);
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['forensics', uploadedFileId],
    queryFn: () => api.getForensicsResults(uploadedFileId!),
    enabled: !!uploadedFileId,
  });

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      uploadMutation.mutate(files[0]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forensics Lab</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload files for metadata extraction and manipulation detection
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <FileUploader
          onUpload={handleFileUpload}
        />
      </div>

      {/* Results */}
      {uploadedFileId && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Analysis Results
          </h2>

          {resultsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  Analyzing file...
                </p>
              </div>
            </div>
          ) : results ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {results.flags && results.flags.length > 0 ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">{results.flags.length} Issues Detected</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">No Issues Detected</span>
                  </>
                )}
              </div>

              {/* Metadata */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Metadata</h3>
                <div className="bg-slate-50 dark:bg-slate-900 rounded p-4">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(results.metadata || {}).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-slate-500 dark:text-slate-400">{key}</dt>
                        <dd className="text-slate-900 dark:text-white font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Flags */}
              {results.flags && results.flags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Flags</h3>
                  <ul className="space-y-2">
                    {results.flags.map((flag, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{flag.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
