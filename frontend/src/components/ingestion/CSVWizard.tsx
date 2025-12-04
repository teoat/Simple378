import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';

const parseCSV = (text: string): string[][] => {
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: true,
    header: false,
  });
  
  if (result.errors.length > 0) {
    console.warn('CSV parsing errors:', result.errors);
  }
  
  return result.data;
};

interface CSVWizardProps {
  onComplete: (mappedData: unknown[]) => void;
  onCancel: () => void;
}

type Step = 1 | 2 | 3 | 4;

const SYSTEM_FIELDS = [
  'date',
  'amount',
  'description',
  'beneficiary',
  'transaction_id',
  'category',
  'currency',
];

export function CSVWizard({ onComplete, onCancel }: CSVWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);
      
      if (data && data.length > 0) {
        setHeaders(data[0] || []);
        setCsvData(data.slice(1, 11)); // Preview first 10 rows
        // Auto-map headers
        const autoMapping: Record<string, string> = {};
        data[0].forEach((header) => {
          const lowerHeader = header.toLowerCase();
          const matchedField = SYSTEM_FIELDS.find(field => 
            lowerHeader.includes(field) || field.includes(lowerHeader)
          );
          if (matchedField) {
            autoMapping[header] = matchedField;
          }
        });
        setMapping(autoMapping);
        setStep(2);
      } else {
        setErrors(['CSV file appears to be empty']);
      }
    } catch (error) {
      setErrors([`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  const handleMappingChange = (csvColumn: string, systemField: string) => {
    setMapping({ ...mapping, [csvColumn]: systemField });
  };

  const validateMapping = () => {
    const requiredFields = ['date', 'amount'];
    const mappedFields = Object.values(mapping);
    const missing = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missing.length > 0) {
      setErrors([`Required fields not mapped: ${missing.join(', ')}`]);
      return false;
    }
    setErrors([]);
    return true;
  };

  const handleNext = () => {
    if (step === 2) {
      if (validateMapping()) {
        setStep(3);
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleFinish = () => {
    // Transform data with mapping
    const mappedData = csvData.map(row => {
      const mapped: Record<string, string> = {};
      headers.forEach((header, index) => {
        const systemField = mapping[header];
        if (systemField) {
          mapped[systemField] = row[index] || '';
        }
      });
      return mapped;
    });
    onComplete(mappedData);
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-2xl border border-white/20 dark:border-slate-700/30 p-6 shadow-2xl max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">CSV Import Wizard</h2>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}
                `}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 text-center">
              <FileSpreadsheet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Select a CSV file to import
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Map CSV Columns</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {headers.map((header) => (
                <div key={header} className="flex items-center gap-4 p-3 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-slate-800/10">
                  <div className="flex-1 font-medium text-slate-900 dark:text-white">{header}</div>
                  <span className="text-slate-400">→</span>
                  <select
                    value={mapping[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select Field --</option>
                    {SYSTEM_FIELDS.map((field) => (
                      <option key={field} value={field}>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            {errors.length > 0 && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                {errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {err}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 dark:border-slate-700/20">
                    {Object.keys(mapping).map((header) => (
                      <th key={header} className="px-4 py-2 text-left text-slate-500 dark:text-slate-400">
                        {mapping[header]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-white/5 dark:border-slate-700/10">
                      {headers.map((header, j) => (
                        <td key={j} className="px-4 py-2 text-slate-900 dark:text-white">
                          {row[j]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ready to Import</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {csvData.length} rows will be imported
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-6 pt-6 border-t border-white/10 dark:border-slate-700/20">
        <button
          onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : onCancel()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-slate-800/20 hover:bg-white/20 dark:hover:bg-slate-800/30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Import
          </button>
        )}
      </div>
    </div>
  );
}

