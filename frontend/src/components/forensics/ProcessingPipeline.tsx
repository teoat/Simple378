import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertTriangle, FileText, Search, ShieldCheck, Binary } from 'lucide-react';

interface ProcessingPipelineProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  stages?: {
    upload: boolean;
    scanning: boolean;
    ocr: boolean;
    metadata: boolean;
    forensics: boolean;
  };
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ status }) => {
  const [currentStage, setCurrentStage] = useState(0);

  // Simulate stage progression when processing
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setCurrentStage(prev => (prev < 4 ? prev + 1 : prev));
      }, 1500); // 1.5s per stage
      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setCurrentStage(5); // All done
    } else {
      setCurrentStage(0);
    }
  }, [status]);

  const steps = [
    { label: 'Upload', icon: FileText },
    { label: 'Virus Scan', icon: ShieldCheck },
    { label: 'OCR Extraction', icon: Search },
    { label: 'Metadata', icon: Binary },
    { label: 'Forensics', icon: AlertTriangle },
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10" />
        <div 
            className="absolute top-1/2 left-0 h-1 bg-blue-500 transition-all duration-500"
            style={{ width: `${(currentStage / (steps.length - 1)) * 100}%` }} 
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStage || status === 'completed';
          const isActive = index === currentStage && status === 'processing';
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-500 animate-pulse' 
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-300'
                }`}
              >
                {isCompleted ? (
                   <CheckCircle2 className="w-6 h-6" />
                ) : isActive ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                   <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`text-xs font-medium ${
                isActive || isCompleted ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
