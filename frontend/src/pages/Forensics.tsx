import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { UploadZone } from '../components/ingestion/UploadZone';
import { ProcessingPipeline, type ProcessingStage } from '../components/ingestion/ProcessingPipeline';
import { ForensicResults } from '../components/ingestion/ForensicResults';
import { CSVWizard } from '../components/ingestion/CSVWizard';
import { UploadHistory } from '../components/ingestion/UploadHistory';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { ForensicsSkeleton } from '../components/ingestion/ForensicsSkeleton';
import { FileSpreadsheet } from 'lucide-react';

export function Forensics() {
  const [results, setResults] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string>('');
  const [showCSVWizard, setShowCSVWizard] = useState(false);
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('upload');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Show skeleton during initial load if needed
  const isLoading = false; // Add loading state if needed

  const uploadMutation = useMutation({
    mutationFn: api.analyzeFile,
    onSuccess: (data) => {
      setResults(data);
      setCurrentStage('complete');
      setProcessingProgress(100);
      toast.success('Analysis complete');
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStage('upload');
      setProcessingProgress(0);
    },
  });

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setCurrentFile(file);
      setResults(null);
      setUploadId(`upload_${Date.now()}`);
      setCurrentStage('upload');
      setProcessingProgress(0);
      uploadMutation.mutate(file);
      
      // Simulate processing stages
      const stages: ProcessingStage[] = ['upload', 'virus_scan', 'ocr', 'metadata', 'forensics', 'indexing'];
      let stageIndex = 0;
      const interval = setInterval(() => {
        if (stageIndex < stages.length) {
          setCurrentStage(stages[stageIndex]);
          setProcessingProgress((stageIndex / stages.length) * 100);
          stageIndex++;
        } else {
          clearInterval(interval);
        }
      }, 1500);
    }
  };

  const handleCSVComplete = async (mappedData: unknown[]) => {
    try {
      // Add placeholder subject_id as required by backend
      const subjectId = "00000000-0000-0000-0000-000000000000"; 
      
      const transactions = (mappedData as Record<string, unknown>[]).map(d => ({
        ...d,
        subject_id: subjectId,
        source_bank: "Manual Import",
        currency: "USD" // Default currency
      }));

      await api.batchImportTransactions(transactions);
      toast.success(`Successfully imported ${mappedData.length} transactions`);
      setShowCSVWizard(false);
    } catch (error) {
      toast.error('Failed to import transactions');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <PageErrorBoundary pageName="Forensics & Ingestion">
        <ForensicsSkeleton />
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="Forensics & Ingestion">
      <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Forensics & Ingestion</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload files for metadata extraction, OCR, and forensic analysis
          </p>
        </div>
        <button
          onClick={() => setShowCSVWizard(true)}
          className="flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-purple-600/90 dark:bg-purple-500/90 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20 font-medium border border-purple-400/20"
        >
          <FileSpreadsheet className="w-5 h-5" />
          CSV Import
        </button>
      </div>

      {/* CSV Wizard Modal */}
      {showCSVWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <CSVWizard
            onComplete={handleCSVComplete}
            onCancel={() => setShowCSVWizard(false)}
          />
        </div>
      )}

      {/* File Upload */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-2xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
        <UploadZone
          onUpload={handleFileUpload}
          showProcessing={uploadMutation.isPending}
          uploadId={uploadId}
        />
      </div>

      {/* Processing Pipeline */}
      {uploadMutation.isPending && (
        <ProcessingPipeline
          currentStage={currentStage}
          progress={processingProgress}
          estimatedTimeRemaining={Math.max(0, Math.round((100 - processingProgress) * 0.3))}
        />
      )}

      {/* Forensic Results */}
      {results && currentFile && (
        <ForensicResults
          filename={currentFile.name}
          fileType={currentFile.name.split('.').pop() || ''}
          metadata={results.metadata || {}}
          ocrText={results.ocr_text}
          forensicFlags={results.flags?.map((f: { message: string }) => ({
            type: 'Manipulation Check',
            message: f.message,
            severity: 'medium' as const,
          })) || []}
        />
      )}

      {/* Upload History */}
      <UploadHistory
        onView={(id) => {
          toast(`Viewing upload ${id}`, { icon: 'ℹ️' });
          // View functionality will be implemented with file retrieval API
          // Future: Fetch file by ID and display/download
        }}
      />
      </div>
    </PageErrorBoundary>
  );
}
