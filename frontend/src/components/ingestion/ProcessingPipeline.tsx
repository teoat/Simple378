import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';

export type ProcessingStage = 'upload' | 'virus_scan' | 'ocr' | 'metadata' | 'forensics' | 'indexing' | 'complete' | 'error';

interface ProcessingPipelineProps {
  currentStage: ProcessingStage;
  progress: number;
  estimatedTimeRemaining?: number;
  error?: string;
}

const STAGES: { id: ProcessingStage; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'virus_scan', label: 'Virus Scan' },
  { id: 'ocr', label: 'OCR' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'forensics', label: 'Forensics' },
  { id: 'indexing', label: 'Indexing' },
];

export function ProcessingPipeline({ currentStage, progress, estimatedTimeRemaining, error }: ProcessingPipelineProps) {
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);
  const isComplete = currentStage === 'complete';
  const isError = currentStage === 'error';

  return (
    <div className="w-full space-y-6 p-6 backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Loader2 className={`w-5 h-5 ${isComplete ? 'hidden' : 'animate-spin text-blue-500'}`} />
          {isComplete ? 'Processing Complete' : isError ? 'Processing Failed' : 'Processing File...'}
        </h3>
        {estimatedTimeRemaining !== undefined && !isComplete && !isError && (
          <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
            ~{estimatedTimeRemaining}s remaining
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${isError ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Stages Stepper */}
      <div className="relative flex justify-between">
        {/* Connecting Line */}
        <div className="absolute top-3 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />

        {STAGES.map((stage, index) => {
          let status: 'pending' | 'active' | 'complete' | 'error' = 'pending';
          
          if (isError && index === currentStageIndex) status = 'error';
          else if (isComplete || index < currentStageIndex) status = 'complete';
          else if (index === currentStageIndex) status = 'active';

          return (
            <div key={stage.id} className="flex flex-col items-center gap-2">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 border-2
                ${status === 'complete' ? 'bg-green-500 border-green-500 text-white' : ''}
                ${status === 'active' ? 'bg-blue-500 border-blue-500 text-white' : ''}
                ${status === 'error' ? 'bg-red-500 border-red-500 text-white' : ''}
                ${status === 'pending' ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600' : ''}
              `}>
                {status === 'complete' && <CheckCircle className="w-4 h-4" />}
                {status === 'active' && <Loader2 className="w-3 h-3 animate-spin" />}
                {status === 'error' && <AlertCircle className="w-4 h-4" />}
                {status === 'pending' && <Circle className="w-3 h-3 text-slate-300 dark:text-slate-600" />}
              </div>
              <span className={`
                text-xs font-medium transition-colors duration-300
                ${status === 'active' ? 'text-blue-600 dark:text-blue-400' : ''}
                ${status === 'complete' ? 'text-green-600 dark:text-green-400' : ''}
                ${status === 'error' ? 'text-red-600 dark:text-red-400' : ''}
                ${status === 'pending' ? 'text-slate-400 dark:text-slate-500' : ''}
              `}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
