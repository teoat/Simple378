import { FileUp, Database, Link, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SourceSelectionProps {
  selected: 'file' | 'database' | 'api';
  onSelect: (source: 'file' | 'database' | 'api') => void;
  onNext: () => void;
}

interface SourceOption {
  id: 'file' | 'database' | 'api';
  icon: LucideIcon;
  label: string;
  description: string;
}

export function SourceSelection({ selected, onSelect, onNext }: SourceSelectionProps) {
  const options: SourceOption[] = [
    {
      id: 'file',
      icon: FileUp,
      label: 'File Upload',
      description: 'Upload CSV, JSON, Excel, or PDF bank statements',
    },
    {
      id: 'database',
      icon: Database,
      label: 'Database',
      description: 'Connect directly to SQL or NoSQL databases',
    },
    {
      id: 'api',
      icon: Link,
      label: 'API Feed',
      description: 'Configure REST or GraphQL data feeds',
    },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select Data Source</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Choose where your transaction data is coming from.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "group relative flex flex-col items-center p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl",
              selected === option.id
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700"
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-300",
              selected === option.id
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-slate-800 group-hover:text-blue-500"
            )}>
              <option.icon className="w-8 h-8" />
            </div>
            
            <h3 className={cn(
              "text-lg font-bold mb-2",
              selected === option.id ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white"
            )}>
              {option.label}
            </h3>
            
            <p className="text-sm text-center text-slate-500 dark:text-slate-400">
              {option.description}
            </p>

            {selected === option.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          Continue to Upload
        </button>
      </div>
    </div>
  );
}
