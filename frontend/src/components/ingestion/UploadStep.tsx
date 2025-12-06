import { UploadZone } from './UploadZone';

interface UploadStepProps {
  onUpload: (files: File[]) => void;
  isProcessing: boolean;
  onNext: () => void;
  onBack: () => void;
  files: File[];
}

export function UploadStep({ onUpload, isProcessing, onNext, onBack, files }: UploadStepProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Upload Files</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Upload your bank statements or transaction files.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-2xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
          <UploadZone
            onUpload={onUpload}
            showProcessing={isProcessing}
            uploadId="temp" // We can handle this better in the parent
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6">
             <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-600 flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
                 <div>
                   <p className="font-medium text-green-900 dark:text-green-100">File Ready</p>
                   <p className="text-sm text-green-700 dark:text-green-300">{files[0].name}</p>
                 </div>
               </div>
             </div>
          </div>
        )}
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
          disabled={files.length === 0}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Mapping
        </button>
      </div>
    </div>
  );
}
