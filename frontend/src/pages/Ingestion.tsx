import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useWebSocket } from '../hooks/useWebSocket';
import { subjectsApi, apiRequest } from '../lib/api';
import toast from 'react-hot-toast';

type IngestionStep = 1 | 2 | 3 | 4 | 5;

interface UploadInitResponse {
  file_id: string;
  headers: string[];
  suggested_mapping: Record<string, string>;
}

interface ColumnMapping {
  source: string;
  target: string | null;
  confidence: number;
  reasoning?: string;
}

interface ValidationStats {
    total_rows_sampled: number;
    valid_rows: number;
    issues: string[];
}

interface PreviewResponse {
    rows: any[];
    validation: ValidationStats;
}

export function Ingestion() {
  const navigate = useNavigate();
  const { lastMessage } = useWebSocket();
  const [currentStep, setCurrentStep] = useState<IngestionStep>(1);
  
  // Form State
  const [subjectId, setSubjectId] = useState('');
  const [bankName, setBankName] = useState('');
  
  // Data State
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  
  // Progress State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>('Initializing');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch Subjects
  const { data: subjectsData, isError: subjectsError } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.getSubjects({ limit: 100 }),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Don't fail silently - allow component to render even if query fails
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // WebSocket Listener
  useEffect(() => {
    if (lastMessage) {
        if (lastMessage.type === 'upload_progress' && lastMessage.payload.upload_id === fileId) {
            setUploadProgress(lastMessage.payload.progress);
        }
        if (lastMessage.type === 'processing_stage' && lastMessage.payload.upload_id === fileId) {
            setProcessingStage(lastMessage.payload.stage);
        }
        if (lastMessage.type === 'processing_complete' && lastMessage.payload.upload_id === fileId) {
            setIsProcessing(false);
            setUploadProgress(100);
            setProcessingStage('Complete');
            toast.success('Ingestion successful!');
            setTimeout(() => navigate(`/cases/${subjectId}`), 1000);
        }
        if (lastMessage.type === 'processing_error' && lastMessage.payload.upload_id === fileId) {
            setIsProcessing(false);
            toast.error(`Processing failed: ${lastMessage.payload.error}`);
        }
    }
  }, [lastMessage, fileId, subjectId, navigate]);

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiRequest<UploadInitResponse>('/ingestion/upload-init', {
        method: 'POST',
        body: formData,
      }); 
      return res;
    },
    onSuccess: (data, variables) => {
      setFileId(data.file_id);
      setFileName(variables.name);
      
      // Convert mapping dict to UI array
      const initialMappings = data.headers.map(header => {
        const target = Object.entries(data.suggested_mapping || {}).find(([_, v]) => v === header)?.[0] || null;
        return {
          source: header,
          target: target,
          confidence: target ? 0.9 : 0.0,
          reasoning: target ? 'AI Suggested Match' : undefined
        };
      });
      setColumnMappings(initialMappings);
      toast.success('File uploaded and analyzed');
      handleNext();
    },
    onError: (err) => {
        const error = err as Error;
        toast.error('Upload failed: ' + error.message);
    }
  });

  // Preview Query
  const { data: previewResponse, isLoading: isLoadingPreview, isError: previewError } = useQuery({
    queryKey: ['ingestion', 'preview', fileId, columnMappings],
    queryFn: async () => {
      if (!fileId) return null;
      // Convert UI mappings back to Dict for API
      const mappingDict: Record<string, string> = {};
      columnMappings.forEach(m => {
        if (m.target) mappingDict[m.target] = m.source;
      });
      
      // The backend now returns { rows, validation }
      return apiRequest<PreviewResponse>('/ingestion/mapping/preview', {
        method: 'POST',
        body: JSON.stringify({
          file_id: fileId,
          mapping: mappingDict,
          limit: 5
        })
      });
    },
    enabled: currentStep === 3 && !!fileId,
    retry: 2,
    retryDelay: 1000,
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!fileId || !subjectId || !bankName) throw new Error("Missing required fields");
      setIsProcessing(true);
      setUploadProgress(0);
      setProcessingStage('Starting...');

       // Convert UI mappings back to Dict for API
      const mappingDict: Record<string, string> = {};
      columnMappings.forEach(m => {
        if (m.target) mappingDict[m.target] = m.source;
      });

      return apiRequest('/ingestion/process-mapped', {
        method: 'POST',
        body: JSON.stringify({
          file_id: fileId,
          mapping: mappingDict,
          subject_id: subjectId,
          bank_name: bankName
        })
      });
    },
    onError: (err) => {
      setIsProcessing(false);
      const error = err as Error;
      toast.error('Processing failed request: ' + error.message);
    }
    // Success handled by WebSocket
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (!subjectId || !bankName) {
        toast.error('Please select Subject and enter Bank Name first');
        return;
      }
      uploadMutation.mutate(files[0]);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => (prev + 1) as IngestionStep);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(prev => (prev - 1) as IngestionStep);
  };

  const updateMapping = (source: string, newTarget: string | null) => {
    setColumnMappings(prev => prev.map(m => 
      m.source === source ? { ...m, target: newTarget, confidence: 1.0, reasoning: 'Manual selection' } : m
    ));
  };

  const steps = [
    { number: 1, title: 'Upload', icon: Upload },
    { number: 2, title: 'Map', icon: FileText },
    { number: 3, title: 'Preview', icon: CheckCircle },
    { number: 4, title: 'Validate', icon: AlertCircle },
    { number: 5, title: 'Process', icon: CheckCircle }
  ];
  
  const targetFields = ['date', 'amount', 'description', 'category', 'reference', 'currency', 'account_number', 'balance'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Data Ingestion Wizard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Upload and process transaction data</p>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-between px-4">
           {steps.map((step, idx) => {
             const Icon = step.icon;
             const isActive = currentStep === step.number;
             const isComplete = currentStep > step.number;
             return (
               <div key={step.number} className="flex items-center flex-1 last:flex-none">
                 <div className="flex flex-col items-center relative z-10">
                   <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                     isActive ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 
                     isComplete ? 'border-green-600 bg-green-600 text-white' : 
                     'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
                   }`}>
                     <Icon className="h-5 w-5" />
                   </div>
                   <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-slate-500'}`}>
                     {step.title}
                   </span>
                 </div>
                 {idx < steps.length - 1 && (
                   <div className={`flex-1 h-0.5 mx-2 -mt-6 transition-colors duration-500 ${isComplete ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                 )}
               </div>
             );
           })}
        </div>

        <Card className="min-h-[500px] border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Upload */}
                {currentStep === 1 && (
                  <div className="space-y-6 max-w-xl mx-auto">
                    {/* Error Alert for Subject Loading */}
                    {subjectsError && (
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">Unable to Load Subjects</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              The backend service is unavailable. You can still continue by entering a subject ID manually below.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {subjectsError ? 'Enter Subject ID' : 'Select Subject'}
                        </label>
                        {subjectsError ? (
                          <Input 
                            placeholder="Enter subject ID manually" 
                            value={subjectId} 
                            onChange={e => setSubjectId(e.target.value)} 
                            className="bg-white dark:bg-slate-900"
                          />
                        ) : (
                          <select
                              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={subjectId}
                              onChange={(e) => setSubjectId(e.target.value)}
                          >
                              <option value="">Select a subject...</option>
                              {((subjectsData as any)?.items || (subjectsData as any) || []).map((subject: any) => (
                                  <option key={subject.id} value={subject.id}>
                                      {subject.subject_name || subject.id}
                                  </option>
                              ))}
                          </select>
                        )}
                        <p className="text-xs text-slate-500">Target subject for these transactions.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Bank</label>
                        <Input 
                           placeholder="e.g. Chase" 
                           value={bankName} 
                           onChange={e => setBankName(e.target.value)} 
                           className="bg-white dark:bg-slate-900"
                        />
                         <p className="text-xs text-slate-500">Originating institution (e.g., Chase, Wells Fargo).</p>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Upload Transaction CSV</h3>
                      <p className="text-slate-500 mb-6 max-w-xs mx-auto text-sm">Drag and drop your file here, or click to browse.</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors cursor-pointer shadow-lg shadow-blue-600/20">
                         {uploadMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Select CSV File"}
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 2: Mapping */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                   <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-800 p-4 rounded-lg flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-full shrink-0">
                         <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">AI Auto-Mapping Active</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            We've analyzed the file structure and suggested mappings. Please verify them below.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                        {columnMappings.map((mapping, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors bg-white dark:bg-slate-900">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate" title={mapping.source}>{mapping.source}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Source Column</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <select 
                                    className={`w-full p-2.5 border rounded-lg bg-white dark:bg-slate-950 text-sm transition-colors ${
                                        mapping.target 
                                        ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20' 
                                        : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                                    }`}
                                    value={mapping.target || ''}
                                    onChange={(e) => updateMapping(mapping.source, e.target.value || null)}
                                >
                                    <option value="">Do not import</option>
                                    {targetFields.map(field => (
                                    <option key={field} value={field}>{field}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-8 flex justify-center shrink-0">
                                {mapping.target && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                            </div>
                        </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Preview */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {previewError ? (
                      <div className="flex flex-col items-center justify-center py-24">
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg p-6 max-w-md">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Preview Failed</h4>
                              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                Unable to generate preview. The backend service may be unavailable.
                              </p>
                              <Button 
                                onClick={() => handlePrevious()} 
                                variant="outline"
                                className="w-full"
                              >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : isLoadingPreview ? (
                      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                        <Loader2 className="animate-spin h-8 w-8 mb-4 text-blue-600" />
                        <p>Generating preview...</p>
                      </div>
                    ) : (
                      previewResponse && (
                        <>
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        {Object.keys(previewResponse.rows[0] || {}).map(key => (
                                        <th key={key} className="px-4 py-3 whitespace-nowrap">{key}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                                    {previewResponse.rows.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{String(val)}</td>
                                        ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            </div>
                            <p className="text-center text-sm text-slate-500">Showing first 5 rows</p>
                        </>
                      )
                    )}
                  </div>
                )}

                {/* Step 4: Validate */}
                {currentStep === 4 && (
                   <div className="max-w-xl mx-auto space-y-8 py-8">
                     {previewError ? (
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Validation Unavailable</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                                  Unable to validate data. You can skip validation and proceed to processing at your own risk.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                     ) : isLoadingPreview ? (
                        <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                     ) : (
                        <>
                        <div className="text-center">
                            {previewResponse?.validation?.issues?.length === 0 && previewResponse?.validation?.valid_rows > 0 ? (
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full mb-6">
                                    <CheckCircle className="h-10 w-10" />
                                </div>
                            ) : (
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full mb-6">
                                    <AlertTriangle className="h-10 w-10" />
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {previewResponse?.validation?.issues?.length === 0 ? "Data Looks Good" : "Validation Issues Found"}
                            </h3>
                            <p className="text-slate-500 mt-2">
                                We analyzed a sample of {previewResponse?.validation?.total_rows_sampled} rows.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                                 <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                    {previewResponse?.validation?.valid_rows}
                                 </div>
                                 <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Valid Rows</div>
                             </div>
                             <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                                 <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                    {previewResponse?.validation?.total_rows_sampled}
                                 </div>
                                 <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Sampled</div>
                             </div>
                        </div>

                        {previewResponse?.validation?.issues && previewResponse.validation.issues.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
                                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Potential Issues
                                </h4>
                                <ul className="list-disc list-inside text-sm text-amber-800 dark:text-amber-200 space-y-1">
                                    {Array.from(new Set(previewResponse.validation.issues)).map((issue, i) => (
                                        <li key={i}>{issue} (multiple occurrences)</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        </>
                     )}
                   </div>
                )}
                
                {/* Step 5: Process */}
                {currentStep === 5 && (
                  <div className="text-center py-12 max-w-lg mx-auto space-y-8">
                    {!isProcessing && !submitMutation.isPending ? (
                         <>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Ready to Ingest</h3>
                                <p className="text-slate-500">Confirm the details below to start processing.</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-3">
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                    <span className="text-slate-500">File Name</span>
                                    <span className="font-medium">{fileName}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                    <span className="text-slate-500">Target Subject</span>
                                    <span className="font-medium font-mono text-sm">{subjectId}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                    <span className="text-slate-500">Bank</span>
                                    <span className="font-medium">{bankName}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-slate-500">Mapped Columns</span>
                                    <span className="font-medium text-blue-600">{columnMappings.filter(m => m.target).length}</span>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => submitMutation.mutate()} 
                                disabled={submitMutation.isPending} 
                                className="w-full py-6 text-lg shadow-xl shadow-blue-500/20"
                            >
                                Start Ingestion
                            </Button>
                         </>
                    ) : (
                        <div className="py-8 space-y-8">
                             <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                                 {/* Circular Progress */}
                                 <svg className="w-full h-full transform -rotate-90">
                                     <circle
                                         cx="96"
                                         cy="96"
                                         r="88"
                                         stroke="currentColor"
                                         strokeWidth="12"
                                         fill="transparent"
                                         className="text-slate-100 dark:text-slate-800"
                                     />
                                     <circle
                                         cx="96"
                                         cy="96"
                                         r="88"
                                         stroke="currentColor"
                                         strokeWidth="12"
                                         fill="transparent"
                                         strokeDasharray={2 * Math.PI * 88}
                                         strokeDashoffset={2 * Math.PI * 88 * (1 - uploadProgress / 100)}
                                         className="text-blue-600 transition-all duration-500 ease-out"
                                     />
                                 </svg>
                                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                                     <span className="text-4xl font-bold text-slate-900 dark:text-white">{uploadProgress}%</span>
                                 </div>
                             </div>

                             <div className="space-y-2">
                                 <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 animate-pulse">
                                     {processingStage}...
                                 </h4>
                                 <p className="text-sm text-slate-500">Please do not close this window.</p>
                             </div>
                        </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer Nav */}
        <div className="flex justify-between px-1">
           <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || isProcessing}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back
           </Button>
           {currentStep < 5 && (
             <Button onClick={handleNext} disabled={currentStep === 1 && (!subjectId || !bankName || !fileId)}>
               Next Step <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
           )}
        </div>
      </div>
    </div>
  );
}
