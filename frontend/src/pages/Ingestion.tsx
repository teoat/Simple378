import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type IngestionStep = 1 | 2 | 3 | 4 | 5;

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

interface ColumnMapping {
  source: string;
  target: string;
  confidence: number;
}

export function Ingestion() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<IngestionStep>(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Mock file upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      const uploaded: UploadedFile[] = Array.from(files).map((file, idx) => ({
        id: `file_${Date.now()}_${idx}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'complete' as const
      }));
      return uploaded;
    },
    onSuccess: (data) => {
      setUploadedFiles(prev => [...prev, ...data]);
      // Auto-generate column mappings
      generateColumnMappings();
    }
  });

  const generateColumnMappings = () => {
    // Mock AI-generated mappings
    const mockMappings: ColumnMapping[] = [
      { source: 'Date', target: 'transaction_date', confidence: 0.95 },
      { source: 'Amount', target: 'amount', confidence: 0.98 },
      { source: 'Description', target: 'description', confidence: 0.92 },
      { source: 'Category', target: 'category', confidence: 0.85 },
      { source: 'Account', target: 'account_number', confidence: 0.90 }
    ];
    setColumnMappings(mockMappings);
  };

  const validateData = () => {
    // Mock validation
    const errors: string[] = [];
    if (uploadedFiles.length === 0) {
      errors.push('No files uploaded');
    }
    if (columnMappings.some(m => m.confidence < 0.8)) {
      errors.push('Some column mappings have low confidence');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      if (currentStep === 4) {
        // Validate before moving to confirmation
        if (validateData()) {
          setCurrentStep((currentStep + 1) as IngestionStep);
        }
      } else {
        setCurrentStep((currentStep + 1) as IngestionStep);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as IngestionStep);
    }
  };

  const handleSubmit = () => {
    // Final submission
    console.log('Submitting ingestion job...', { uploadedFiles, columnMappings });
    // Navigate to forensics or show success
    navigate('/forensics');
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const steps = [
    { number: 1, title: 'Upload', icon: Upload },
    { number: 2, title: 'Map', icon: FileText },
    { number: 3, title: 'Preview', icon: CheckCircle },
    { number: 4, title: 'Validate', icon: AlertCircle },
    { number: 5, title: 'Confirm', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Data Ingestion Wizard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Upload and process transaction data in 5 simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isComplete = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isActive 
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isComplete
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isComplete ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <Card className="min-h-[500px]">
          <CardHeader>
            <CardTitle>
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
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
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold mb-2">Upload Transaction Files</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Drag and drop files or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".csv,.xlsx,.xls,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button asChild>
                          <span className="cursor-pointer">
                            Select Files
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-slate-400 mt-4">
                        Supported formats: CSV, Excel, TXT (Max 100MB each)
                      </p>
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Uploaded Files ({uploadedFiles.length})</h4>
                        {uploadedFiles.map(file => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-slate-500">
                                  {(file.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                file.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {file.status}
                              </span>
                              <button
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Map Columns */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        🤖 AI Auto-Mapping
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        We've automatically mapped your columns based on intelligent analysis
                      </p>
                    </div>

                    <div className="space-y-3">
                      {columnMappings.map((mapping, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="text-right flex-1">
                              <p className="font-medium">{mapping.source}</p>
                              <p className="text-xs text-slate-500">Source Column</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-slate-400" />
                            <div className="flex-1">
                              <p className="font-medium">{mapping.target}</p>
                              <p className="text-xs text-slate-500">Target Field</p>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    mapping.confidence >= 0.9 ? 'bg-green-500' :
                                    mapping.confidence >= 0.8 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${mapping.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {(mapping.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Preview Data */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Review the first 10 rows of processed data
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            {columnMappings.map((m, idx) => (
                              <th key={idx} className="text-left p-3 font-semibold">
                                {m.target}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5].map(row => (
                            <tr key={row} className="border-b border-slate-100 dark:border-slate-900">
                              <td className="p-3">2024-{String(row).padStart(2, '0')}-15</td>
                              <td className="p-3">${(Math.random() * 1000).toFixed(2)}</td>
                              <td className="p-3">Sample Transaction {row}</td>
                              <td className="p-3">Category {row}</td>
                              <td className="p-3">ACC-{1000 + row}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-slate-500">
                      Showing 5 of 1,247 total rows
                    </p>
                  </div>
                )}

                {/* Step 4: Validate */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600 mb-3" />
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                          Validation Passed
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          All data meets quality standards
                        </p>
                      </div>
                      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <div className="text-3xl font-bold mb-2">1,247</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Total Records Validated
                        </p>
                      </div>
                    </div>

                    {validationErrors.length > 0 && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                          Validation Errors
                        </h4>
                        <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                          {validationErrors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Confirm */}
                {currentStep === 5 && (
                  <div className="space-y-6 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Ready to Process</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Your data is ready to be ingested into the system
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg text-left max-w-md mx-auto">
                      <h4 className="font-semibold mb-4">Summary</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-600 dark:text-slate-400">Files:</dt>
                          <dd className="font-medium">{uploadedFiles.length}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600 dark:text-slate-400">Total Records:</dt>
                          <dd className="font-medium">1,247</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600 dark:text-slate-400">Columns Mapped:</dt>
                          <dd className="font-medium">{columnMappings.length}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-600 dark:text-slate-400">Validation:</dt>
                          <dd className="font-medium text-green-600">Passed</dd>
                        </div>
                      </dl>
                    </div>

                    <Button onClick={handleSubmit} className="px-8">
                      <Download className="h-4 w-4 mr-2" />
                      Complete Ingestion
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentStep < 5 && (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 && uploadedFiles.length === 0}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
