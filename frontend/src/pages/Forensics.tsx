import React, { useState } from 'react';
import { FileUploader } from '../components/forensics/FileUploader';
import { FileText, Image, ShieldCheck, Search } from 'lucide-react';

export function Forensics() {
  const [analyzedFiles, setAnalyzedFiles] = useState<any[]>([]);

  const handleUpload = (files: File[]) => {
    // Simulate analysis results
    const newResults = files.map((file, index) => ({
      id: `FILE-${Date.now()}-${index}`,
      name: file.name,
      type: file.type.includes('image') ? 'Image' : 'Document',
      metadata: {
        created: '2023-10-15 14:30:00',
        device: 'iPhone 14 Pro',
        location: '37.7749° N, 122.4194° W',
      },
      flags: index % 2 === 0 ? ['Metadata mismatch'] : [],
      status: 'Analyzed',
    }));
    setAnalyzedFiles((prev) => [...newResults, ...prev]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
          Forensics Lab
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload documents and images for metadata extraction and tampering detection.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
            <h3 className="mb-4 text-base font-semibold leading-6 text-slate-900 dark:text-white">
              Upload Evidence
            </h3>
            <FileUploader onUpload={handleUpload} />
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white shadow dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="text-base font-semibold leading-6 text-slate-900 dark:text-white">
                Analysis Results
              </h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {analyzedFiles.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  <Search className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-2">No files analyzed yet.</p>
                </div>
              ) : (
                analyzedFiles.map((file) => (
                  <div key={file.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                          {file.type === 'Image' ? (
                            <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                            {file.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono">{file.id}</span>
                            <span>•</span>
                            <span>{file.type}</span>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Created:</span>
                              <span className="ml-2 text-slate-900 dark:text-white">{file.metadata.created}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Device:</span>
                              <span className="ml-2 text-slate-900 dark:text-white">{file.metadata.device}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          {file.status}
                        </span>
                        {file.flags.length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {file.flags.length} Issues Found
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
