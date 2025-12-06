import { type FieldMapping } from '../../types/ingestion';
import { FieldMapper } from './FieldMapper';

interface MappingStepProps {
  files: File[];
  onNext: () => void;
  onBack: () => void;
  mappings: FieldMapping[];
  onMappingChange: (mappings: FieldMapping[]) => void;
  sourceFields: string[];
}

export function MappingStep({ onNext, onBack, mappings, onMappingChange, sourceFields }: MappingStepProps) {
  const targetFields = [
    'date', 'description', 'amount', 'currency', 'category', 'merchant', 'status'
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Map Fields</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Link your CSV columns to the system's data model.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Mock Auto-Map Button (for Sprint 2) */}
          <button className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg border border-purple-200 opacity-50 cursor-not-allowed">
            ✨ Auto-Map (Coming Soon)
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <FieldMapper
          sourceFields={sourceFields}
          targetFields={targetFields}
          mappings={mappings}
          onMappingChange={onMappingChange}
        />
      </div>

      <div className="flex justify-between pt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={mappings.length === 0}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview Data
        </button>
      </div>
    </div>
  );
}
