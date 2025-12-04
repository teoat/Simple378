import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ProcessingStage = 'upload' | 'virus_scan' | 'ocr' | 'metadata' | 'forensics' | 'indexing' | 'complete';

interface Stage {
  id: ProcessingStage;
  label: string;
  icon: React.ReactNode;
}

const stages: Stage[] = [
  { id: 'upload', label: 'Upload', icon: '📤' },
  { id: 'virus_scan', label: 'Virus Scan', icon: '🛡️' },
  { id: 'ocr', label: 'OCR', icon: '📄' },
  { id: 'metadata', label: 'Metadata', icon: '🏷️' },
  { id: 'forensics', label: 'Forensics', icon: '🔍' },
  { id: 'indexing', label: 'Indexing', icon: '📚' },
  { id: 'complete', label: 'Complete', icon: '✅' },
];

interface ProcessingPipelineProps {
  currentStage: ProcessingStage;
  progress?: number;
  error?: string;
  estimatedTimeRemaining?: number; // in seconds
}

export function ProcessingPipeline({ 
  currentStage, 
  progress = 0, 
  error,
  estimatedTimeRemaining 
}: ProcessingPipelineProps) {
  const currentStageIndex = stages.findIndex(s => s.id === currentStage);
  const isComplete = currentStage === 'complete';
  const hasError = !!error;

  const getStageStatus = (stageIndex: number): 'pending' | 'processing' | 'complete' | 'error' => {
    if (hasError && stageIndex === currentStageIndex) return 'error';
    if (stageIndex < currentStageIndex) return 'complete';
    if (stageIndex === currentStageIndex && !isComplete) return 'processing';
    return 'pending';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Processing Pipeline</h3>
        {estimatedTimeRemaining && !isComplete && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Estimated time remaining: {formatTime(estimatedTimeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full transition-colors",
              hasError ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-cyan-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{Math.round(progress)}%</span>
          <span>{currentStage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
      </div>

      {/* Stages */}
      <div className="relative">
        <div className="flex justify-between items-start">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            const isActive = index === currentStageIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center flex-1 relative z-10">
                {/* Stage Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all border-2",
                    status === 'complete' && "bg-green-500/20 border-green-500/50 text-green-500",
                    status === 'processing' && "bg-purple-500/20 border-purple-500/50 text-purple-500 animate-pulse",
                    status === 'error' && "bg-red-500/20 border-red-500/50 text-red-500",
                    status === 'pending' && "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400"
                  )}
                >
                  {status === 'complete' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : status === 'processing' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : status === 'error' ? (
                    <XCircle className="w-6 h-6" />
                  ) : (
                    <span>{stage.icon}</span>
                  )}
                </div>

                {/* Stage Label */}
                <span
                  className={cn(
                    "text-xs font-medium text-center",
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {stage.label}
                </span>

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-6 left-1/2 w-full h-0.5 -z-10",
                      index < currentStageIndex ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                    )}
                    style={{ width: 'calc(100% - 3rem)', marginLeft: '3rem' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm"
        >
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Processing Error</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

