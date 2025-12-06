import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  showProcessing?: boolean;
  uploadId?: string;
}

export function UploadZone({ onUpload, showProcessing }: UploadZoneProps) {
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles);
    }
    setRejectedFiles(fileRejections);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: showProcessing
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-purple-400 bg-purple-500/10 dark:border-cyan-400 dark:bg-cyan-500/10 scale-[1.02]' 
            : 'border-slate-300 dark:border-slate-700 hover:border-purple-400/50 dark:hover:border-cyan-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }
          ${showProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className={`
            p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 transition-transform duration-300
            ${isDragActive ? 'scale-110 bg-purple-100 dark:bg-cyan-900/30' : ''}
          `}>
            <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-purple-500 dark:text-cyan-400' : 'text-slate-400'}`} />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            or click to browse from your computer
          </p>
          
          <div className="flex gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">PDF</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">JPG</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">PNG</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">CSV</span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">XLSX</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Max file size: 50MB
          </p>
        </div>

        {/* Glassmorphism overlay when active */}
        {isDragActive && (
          <div className="absolute inset-0 backdrop-blur-sm bg-white/10 dark:bg-slate-900/10 pointer-events-none" />
        )}
      </div>

      {/* Rejected Files Error */}
      <AnimatePresence>
        {rejectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Upload Failed</h4>
              <ul className="mt-1 text-sm text-red-700 dark:text-red-300 space-y-1">
                {rejectedFiles.map(({ file, errors }) => (
                  <li key={file.name}>
                    <span className="font-semibold">{file.name}:</span> {errors.map(e => e.message).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              aria-label="Dismiss error"
              onClick={() => setRejectedFiles([])}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
