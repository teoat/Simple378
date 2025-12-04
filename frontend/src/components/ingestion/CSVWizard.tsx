import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadZone } from './UploadZone';
import { Check, Table } from 'lucide-react';
import Papa from 'papaparse';

interface CSVWizardProps {
  onComplete: (data: Record<string, unknown>[]) => void;
  onCancel: () => void;
}

type WizardStep = 'upload' | 'mapping' | 'validation' | 'preview';

export function CSVWizard({ onComplete, onCancel }: CSVWizardProps) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const SYSTEM_FIELDS = [
    { id: 'date', label: 'Transaction Date', required: true },
    { id: 'amount', label: 'Amount', required: true },
    { id: 'description', label: 'Description', required: true },
    { id: 'category', label: 'Category', required: false },
    { id: 'merchant', label: 'Merchant', required: false },
  ];

  const handleFileUpload = (files: File[]) => {
    const file = files[0];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data as Record<string, unknown>[]);
        setHeaders(results.meta.fields || []);
        
        // Auto-map columns
        const mapping: Record<string, string> = {};
        (results.meta.fields || []).forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('date')) mapping['date'] = header;
          else if (lowerHeader.includes('amount') || lowerHeader.includes('debit') || lowerHeader.includes('credit')) mapping['amount'] = header;
          else if (lowerHeader.includes('desc') || lowerHeader.includes('memo')) mapping['description'] = header;
        });
        setColumnMapping(mapping);
        setStep('mapping');
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
      }
    });
  };

  const handleMappingChange = (systemField: string, csvHeader: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [systemField]: csvHeader
    }));
  };

  const handleFinish = () => {
    // Transform data based on mapping
    const mappedData = parsedData.map(row => {
      const newRow: Record<string, unknown> = {};
      Object.entries(columnMapping).forEach(([sysField, csvHeader]) => {
        newRow[sysField] = row[csvHeader];
      });
      return newRow;
    });
    onComplete(mappedData);
  };

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Step {step === 'upload' ? 1 : step === 'mapping' ? 2 : 3} of 3</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <Table className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Upload CSV File</h3>
                <p className="text-slate-500 dark:text-slate-400">Select a CSV file containing transaction data</p>
              </div>
              <UploadZone onUpload={handleFileUpload} />
            </motion.div>
          )}

          {step === 'mapping' && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Map Columns</h3>
              <div className="grid gap-4">
                {SYSTEM_FIELDS.map(field => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="font-medium text-slate-700 dark:text-slate-300">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <p className="text-xs text-slate-500">System Field</p>
                    </div>
                    <div className="md:col-span-2">
                      <select
                        value={columnMapping[field.id] || ''}
                        onChange={(e) => handleMappingChange(field.id, e.target.value)}
                        aria-label={`Map ${field.label} to a CSV column`}
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Column...</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
        >
          Cancel
        </button>
        
        {step === 'mapping' && (
          <button
            onClick={handleFinish}
            disabled={SYSTEM_FIELDS.filter(f => f.required).some(f => !columnMapping[f.id])}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Import Data
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
