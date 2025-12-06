import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { StepProgress } from '../components/ingestion/StepProgress';
import { SourceSelection } from '../components/ingestion/SourceSelection';
import { UploadStep } from '../components/ingestion/UploadStep';
import { MappingStep } from '../components/ingestion/MappingStep';
import { PreviewStep } from '../components/ingestion/PreviewStep';
import { ConfirmStep } from '../components/ingestion/ConfirmStep';
import { type IngestionStep, type FieldMapping } from '../types/ingestion';
import { FileUp, Map, Eye, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

export function Ingestion() {
  const [currentStep, setCurrentStep] = useState<IngestionStep>('source');
  const [sourceType, setSourceType] = useState<'file' | 'database' | 'api'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New state for API integration
  const [uploadId, setUploadId] = useState<string>('');
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [importStats, setImportStats] = useState({ count: 0 });

  const steps = [
    { id: 'source', label: 'Source', icon: FileUp },
    { id: 'upload', label: 'Upload', icon: FileUp },
    { id: 'mapping', label: 'Mapping', icon: Map },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'confirm', label: 'Confirm', icon: CheckCircle },
  ];

  const handleSourceSelect = (source: 'file' | 'database' | 'api') => {
    setSourceType(source);
    setCurrentStep('upload');
  };

  const handleUpload = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    setFiles(uploadedFiles);

    try {
      // Create session and get headers
      const result = await api.createUploadSession(uploadedFiles[0]);
      setUploadId(result.upload_id);
      setDetectedHeaders(result.headers || []);
      toast.success('File uploaded and analyzed');
      setCurrentStep('mapping');
    } catch (error) {
      console.error(error);
      toast.error('Failed to process file');
      setFiles([]); // Reset on failure
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishImport = async () => {
    try {
      setIsProcessing(true);
      
      // Convert mappings array to object { target: source }
      const mappingObj = mappings.reduce((acc, curr) => {
        acc[curr.targetField] = curr.sourceField;
        return acc;
      }, {} as Record<string, string>);

      // TODO: Get subject_id and bank_name from user input or context
      // For now using placeholder values or we could add a step to select "Case/Subject"
      const result = await api.finishImport(
        uploadId, 
        mappingObj, 
        '00000000-0000-0000-0000-000000000000', // Default/New Subject UUID placeholder
        'Manual Upload'
      );
      
      setImportStats({ count: result.count });
      toast.success(`Successfully imported ${result.count} transactions`);
      setCurrentStep('confirm');
    } catch (error) {
      console.error(error);
      toast.error('Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageErrorBoundary pageName="Data Ingestion">
      <div className="p-6 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Data Ingestion</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Import and normalize your financial data
            </p>
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="max-w-4xl mx-auto py-4">
          <StepProgress currentStep={currentStep} steps={steps} />
        </div>

        {/* Wizard Step Content */}
        <div className="mt-8">
          {currentStep === 'source' && (
            <SourceSelection 
              selected={sourceType}
              onSelect={handleSourceSelect}
              onNext={() => setCurrentStep('upload')}
            />
          )}

          {currentStep === 'upload' && (
            <UploadStep 
              onUpload={handleUpload}
              isProcessing={isProcessing}
              files={files}
              onBack={() => setCurrentStep('source')}
              onNext={() => setCurrentStep('mapping')} // Controlled by handleUpload success
            />
          )}

          {currentStep === 'mapping' && (
            <MappingStep 
              files={files}
              mappings={mappings}
              onMappingChange={setMappings}
              sourceFields={detectedHeaders}
              onBack={() => setCurrentStep('upload')}
              onNext={() => setCurrentStep('preview')}
            />
          )}

          {currentStep === 'preview' && (
            <PreviewStep 
              uploadId={uploadId}
              mappings={mappings}
              onBack={() => setCurrentStep('mapping')}
              onNext={handleFinishImport}
            />
          )}

          {currentStep === 'confirm' && (
            <ConfirmStep 
              fileCount={files.length}
              transactionCount={importStats.count}
            />
          )}
        </div>
      </div>
    </PageErrorBoundary>
  );
}
