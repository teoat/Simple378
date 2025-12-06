import { LucideIcon, Check } from 'lucide-react';

interface StepProgressProps {
  currentStep: string;
  steps: {
    id: string;
    label: string;
    icon?: LucideIcon;
  }[];
}

export function StepProgress({ currentStep, steps }: StepProgressProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full">
      <div className="relative flex justify-between">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 dark:bg-blue-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : isCurrent 
                      ? 'bg-white dark:bg-slate-800 border-blue-600 text-blue-600' 
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
              </div>
              <span 
                className={`text-xs font-medium transition-colors duration-300 ${
                  isCurrent 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
