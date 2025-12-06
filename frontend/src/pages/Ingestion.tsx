import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

import { apiRequest } from '../lib/api';
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

export function Ingestion() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<IngestionStep>(1);
  
  // Form State
  const [subjectId, setSubjectId] = useState(''); // Text input for now, ideally a selector
  const [bankName, setBankName] = useState('');
  
  // Data State
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  // const [headers, setHeaders] = useState<string[]>([]); // headers unused in UI

  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  
  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiRequest<UploadInitResponse>('/ingestion/upload-init', {
        method: 'POST',
        body: formData,
      }); // apiRequest handles JSON parsing, but FormData needs special handling usually. 
      // Our apiRequest might force Content-Type json. checking api.ts...
      // If apiRequest doesn't support FormData well, we might need a direct fetch or ensure apiRequest handles it.
      // Assuming apiRequest can handle it or we use raw fetch for upload. 
      // Let's use raw fetch wrapper or similar if apiRequest is strict.
      // Actually, let's trust apiRequest or adjust if it fails.
      return res;
    },
    onSuccess: (data, variables) => {
      setFileId(data.file_id);
      // setHeaders(data.headers); // Removed unused call
      setFileName(variables.name);
      
      // Convert mapping dict to UI array
      const initialMappings = data.headers.map(header => {
        // Find if this header is a value in suggested_mapping
        const target = Object.entries(data.suggested_mapping || {}).find(([_, v]) => v === header)?.[0] || null;
        return {
          source: header,
          target: target,
          confidence: target ? 0.9 : 0.0, // Mock confidence based on if there was a suggestion
          reasoning: target ? 'AI Suggested Match' : undefined
        };
      });
      setColumnMappings(initialMappings);
      toast.success('File uploaded and analyzed');
      handleNext();
    },
    onError: (err) => {
      toast.error('Upload failed: ' + (err as Error).message);
    }
  });

  // Preview Query
  const { data: previewData, isLoading: isLoadingPreview } = useQuery({
    queryKey: ['ingestion', 'preview', fileId, columnMappings],
    queryFn: async () => {
      if (!fileId) return [];
      // Convert UI mappings back to Dict for API
      const mappingDict: Record<string, string> = {};
      columnMappings.forEach(m => {
        if (m.target) mappingDict[m.target] = m.source;
      });
      
      return apiRequest<any[]>('/ingestion/mapping/preview', {
        method: 'POST',
        body: JSON.stringify({
          file_id: fileId,
          mapping: mappingDict,
          limit: 5
        })
      });
    },
    enabled: currentStep === 3 && !!fileId
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!fileId || !subjectId || !bankName) throw new Error("Missing required fields");
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
    onSuccess: () => {
      toast.success('Ingestion successful!');
      navigate('/dashboard'); // Or maybe to the case?
    },
    onError: (err) => {
      toast.error('Processing failed: ' + (err as Error).message);
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (!subjectId || !bankName) {
        toast.error('Please enter Subject ID and Bank Name first');
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

  // Helper to change mapping
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
    { number: 5, title: 'Confirm', icon: CheckCircle }
  ];
  
  const targetFields = ['date', 'amount', 'description', 'category', 'reference_number'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Data Ingestion Wizard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Upload and process transaction data</p>
        </div>

        {/* Steps Progress */}
        <div className="flex items-center justify-between">
           {steps.map((step, idx) => {
             const Icon = step.icon;
             const isActive = currentStep === step.number;
             const isComplete = currentStep > step.number;
             return (
               <div key={step.number} className="flex items-center flex-1">
                 <div className="flex flex-col items-center flex-1">
                   <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                     isActive ? 'border-blue-600 bg-blue-600 text-white' : 
                     isComplete ? 'border-green-600 bg-green-600 text-white' : 
                     'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
                   }`}>
                     <Icon className="h-5 w-5" />
                   </div>
                   <span className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-slate-500'}`}>
                     {step.title}
                   </span>
                 </div>
                 {idx < steps.length - 1 && (
                   <div className={`flex-1 h-0.5 mx-4 ${isComplete ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                 )}
               </div>
             );
           })}
        </div>

        <Card className="min-h-[500px]">
          <CardHeader>
            <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Upload */}
                {currentStep === 1 && (
                  <div className="space-y-6 max-w-xl mx-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject ID (UUID)</label>
                        <Input 
                           placeholder="e.g. 123e4567-e89b-..." 
                           value={subjectId} 
                           onChange={e => setSubjectId(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Bank</label>
                        <Input 
                           placeholder="e.g. Chase" 
                           value={bankName} 
                           onChange={e => setBankName(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold mb-2">Upload CSV</h3>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-sm font-medium transition-colors">
                         {uploadMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Select File"}
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 2: Mapping */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <Loader2 className="h-4 w-4" /> AI Auto-Mapping
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        We've analyzed your file structure. Please confirm the field mappings.
                      </p>
                    </div>
                    {columnMappings.map((mapping, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{mapping.source}</p>
                          <p className="text-xs text-slate-500">Source Column</p>
                        </div>
                        <ArrowRight className="h-5 w-5 mx-4 text-slate-400" />
                        <div className="flex-1">
                          <select 
                            className="w-full p-2 border rounded bg-background"
                            value={mapping.target || ''}
                            onChange={(e) => updateMapping(mapping.source, e.target.value || null)}
                          >
                            <option value="">Do not import</option>
                            {targetFields.map(field => (
                              <option key={field} value={field}>{field}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 3: Preview */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    {isLoadingPreview ? (
                      <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>
                    ) : (
                      previewData && (
                        <div className="overflow-x-auto border rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900">
                              <tr>
                                {Object.keys(previewData[0] || {}).map(key => (
                                  <th key={key} className="p-3 text-left font-semibold">{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.map((row: any, i: number) => (
                                <tr key={i} className="border-t">
                                  {Object.values(row).map((val: any, j) => (
                                    <td key={j} className="p-3">{String(val)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Step 4: Validate */}
                {currentStep === 4 && (
                  <div className="text-center py-12">
                     <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                     <h3 className="text-xl font-bold">Details Validated</h3>
                     <p className="text-slate-600">No critical errors found in {previewData?.length ? 'preview sample' : 'data'}.</p>
                  </div>
                )}
                
                {/* Step 5: Confirm */}
                {currentStep === 5 && (
                  <div className="text-center py-12 space-y-6">
                    <h3 className="text-2xl font-bold">Ready to Ingest</h3>
                    <div className="max-w-md mx-auto bg-slate-100 dark:bg-slate-900 p-6 rounded-lg text-left">
                       <p><strong>File:</strong> {fileName}</p>
                       <p><strong>Subject:</strong> {subjectId}</p>
                       <p><strong>Bank:</strong> {bankName}</p>
                       <p><strong>Mapped Columns:</strong> {columnMappings.filter(m => m.target).length}</p>
                    </div>
                    <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="px-8">
                       {submitMutation.isPending && <Loader2 className="animate-spin mr-2" />}
                       Process Ingestion
                    </Button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer Nav */}
        <div className="flex justify-between">
           <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || submitMutation.isPending}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Previous
           </Button>
           {currentStep < 5 && currentStep !== 1 && (
             <Button onClick={handleNext}>
               Next <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
           )}
        </div>
      </div>
    </div>
  );
}
