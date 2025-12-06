import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Loader2, Check, FileCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import clsx from 'clsx';

interface PDFGeneratorProps {
  caseId: string;
  onGenerate?: (template: string) => void;
}

type TemplateType = 'executive' | 'standard' | 'detailed' | 'compliance';

const templates: { id: TemplateType; label: string; pages: string; desc: string }[] = [
  { id: 'executive', label: 'Executive Summary', pages: '2-3 pages', desc: 'High-level overview for C-suite' },
  { id: 'standard', label: 'Standard Report', pages: '8-12 pages', desc: 'Full investigation details' },
  { id: 'detailed', label: 'Detailed Audit', pages: '15+ pages', desc: 'Complete audit trail & evidence' },
  { id: 'compliance', label: 'Compliance (SAR)', pages: '10-15 pages', desc: 'Regulatory submission format' },
];

export const PDFGenerator: FC<PDFGeneratorProps> = ({ caseId, onGenerate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setCompleted(true);
          onGenerate?.(selectedTemplate + '_' + caseId);
          setTimeout(() => setCompleted(false), 3000); // Reset success state
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
            Report Generation
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate court-admissible PDF reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            className={clsx(
              "flex flex-col items-start p-3 rounded-lg border text-left transition-all",
              selectedTemplate === t.id
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <span className="font-medium text-sm text-slate-900 dark:text-white flex justify-between w-full">
              {t.label}
              {selectedTemplate === t.id && <Check className="w-4 h-4 text-blue-500" />}
            </span>
            <span className="text-xs text-slate-500 mt-1">{t.pages} • {t.desc}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || completed}
          className={clsx(
            "w-full sm:w-auto relative overflow-hidden",
            completed ? "bg-emerald-600 hover:bg-emerald-700" : ""
          )}
        >
          <AnimatePresence mode='wait'>
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </motion.div>
            ) : completed ? (
               <motion.div
                key="success"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Report Ready
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate {templates.find(t => t.id === selectedTemplate)?.label}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Progress bar background */}
          {isGenerating && (
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          )}
        </Button>
        
        {completed && (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"
            >
                Saved to case files
            </motion.div>
        )}
      </div>
    </div>
  );
};
