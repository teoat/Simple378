import { useState, useEffect } from 'react';
import { type FieldMapping } from '../../types/ingestion';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { RedactionAnalysisPanel } from './RedactionAnalysisPanel';

interface PreviewStepProps {
  uploadId: string;
  mappings: FieldMapping[];
  onNext: () => void;
  onBack: () => void;
}

export function PreviewStep({ uploadId, mappings, onNext, onBack }: PreviewStepProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);

  const getMappingObj = () => {
    return mappings.reduce((acc, curr) => {
      acc[curr.targetField] = curr.sourceField;
      return acc;
    }, {} as Record<string, string>);
  };

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const mappingObj = getMappingObj();
        const result = await api.previewMapping(uploadId, mappingObj);
        setData(result);
      } catch (error) {
        toast.error('Failed to load preview');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (uploadId && mappings.length > 0) {
      fetchPreview();
    }
  }, [uploadId, mappings]);

  const handleAnalyze = async () => {
    try {
      setAnalysisLoading(true);
      const mappingObj = getMappingObj();
      // Optional: Ask for balances in a modal, currently passing undefined
      const results = await api.analyzeRedactions(uploadId, mappingObj);
      setAnalysisResults(results);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Analysis failed');
      console.error(error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Preview Data</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Verify your data looks correct before importing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px] gap-4">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
               <p className="text-slate-500">Generating preview...</p>
            </div>
          ) : data.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-[300px] gap-4">
               <p className="text-slate-500">No data could be mapped. Please check your mappings.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {Object.keys(data[0]).map(key => (
                      <th key={key} className="px-6 py-4 whitespace-nowrap capitalize">
                        {key.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800">
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {Object.values(row).map((val, idx) => (
                        <td key={idx} className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
                  Showing first 10 rows of {data.length}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
           <RedactionAnalysisPanel 
             results={analysisResults}
             loading={analysisLoading}
             onAnalyze={handleAnalyze}
           />
        </div>
      </div>

      <div className="flex justify-between pt-8 max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={loading || data.length === 0}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm & Import
        </button>
      </div>
    </div>
  );
}
