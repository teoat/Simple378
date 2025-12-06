import React, { useCallback, useState, useEffect } from 'react';
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProcessingPipeline, type ProcessingStage } from '../ingestion/ProcessingPipeline';
import { useWebSocket } from '../../hooks/useWebSocket';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  showProcessing?: boolean;
  uploadId?: string;
}

export function FileUploader({ onUpload, showProcessing = false, uploadId }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('upload');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');

  // WebSocket integration for processing updates
  useWebSocket('/ws', {
    onMessage: (message: any) => {
      if (message.type === 'upload_progress' && message.payload?.upload_id === uploadId) {
        setProgress(message.payload.progress || 0);
      } else if (message.type === 'processing_stage' && message.payload?.upload_id === uploadId) {
        setCurrentStage(message.payload.stage || 'upload');
        setProgress(message.payload.progress || 0);
      } else if (message.type === 'processing_complete' && message.payload?.upload_id === uploadId) {
        setCurrentStage('complete');
        setProgress(100);
        setUploadStatus('success');
      } else if (message.type === 'processing_error' && message.payload?.upload_id === uploadId) {
        setError(message.payload.error || 'Processing failed');
        setUploadStatus('error');
      }
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploadStatus('uploading');
    setCurrentStage('upload');
    setProgress(0);
    setError('');
    
    // Call the onUpload callback - parent component handles actual upload
    onUpload(files);
    
    // Reset after a delay if not using processing pipeline
    if (!showProcessing) {
      setTimeout(() => {
        setUploadStatus('success');
        setFiles([]);
        setTimeout(() => setUploadStatus('idle'), 3000);
      }, 2000);
    }
  };

  useEffect(() => {
    if (uploadStatus === 'uploading' && showProcessing) {
      // Simulate stage progression if no WebSocket updates
      const stages: ProcessingStage[] = ['upload', 'virus_scan', 'ocr', 'metadata', 'forensics', 'indexing', 'complete'];
      let stageIndex = 0;
      
      const interval = setInterval(() => {
        if (stageIndex < stages.length - 1) {
          stageIndex++;
          setCurrentStage(stages[stageIndex]);
          setProgress((stageIndex / (stages.length - 1)) * 100);
        } else {
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [uploadStatus, showProcessing]);

  return (
    <div className="space-y-4">
      {showProcessing && uploadStatus === 'uploading' && (
        <ProcessingPipeline
          currentStage={currentStage}
          progress={progress}
          error={error}
          estimatedTimeRemaining={Math.max(0, Math.round((100 - progress) * 0.5))}
        />
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors backdrop-blur-sm',
          isDragging
            ? 'border-purple-500 dark:border-cyan-500 bg-purple-50/50 dark:bg-purple-900/20'
            : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50',
          uploadStatus === 'uploading' && 'opacity-50 pointer-events-none'
        )}
      >
        <Upload className="h-12 w-12 text-slate-400" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Click to upload
          </span>{' '}
          or drag and drop
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          PDF, PNG, JPG up to 10MB
        </p>
        <input
          type="file"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleFileInput}
          multiple
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          
          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpload}
              disabled={uploadStatus === 'uploading'}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : uploadStatus === 'success' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Uploaded
                </>
              ) : (
                'Upload Files'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
