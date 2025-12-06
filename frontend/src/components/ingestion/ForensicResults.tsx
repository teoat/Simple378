import { useState } from 'react';
import { FileText, Image as ImageIcon, AlertTriangle, CheckCircle, Copy, Download, ZoomIn } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForensicResultsProps {
  filename: string;
  fileType: string;
  metadata: Record<string, unknown>;
  ocrText?: string;
  forensicFlags: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export function ForensicResults({ filename, fileType, metadata, ocrText, forensicFlags }: ForensicResultsProps) {
  const [activeTab, setActiveTab] = useState<'metadata' | 'ocr' | 'forensics'>('metadata');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      {/* Left Panel: File Preview */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            {fileType.includes('pdf') ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            {filename}
          </h3>
          <div className="flex gap-2">
            <button aria-label="Zoom in" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ZoomIn className="w-4 h-4 text-slate-500" />
            </button>
            <button aria-label="Download file" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-100 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group">
          {/* Placeholder for actual file preview */}
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {fileType.includes('pdf') ? (
                <FileText className="w-10 h-10 text-slate-400" />
              ) : (
                <ImageIcon className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400">Preview not available in this demo</p>
          </div>
        </div>
      </div>

      {/* Right Panel: Analysis Results */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-xl flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/10 dark:border-slate-700/30">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'metadata' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Metadata
            {activeTab === 'metadata' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('forensics')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'forensics' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Forensics
            {forensicFlags.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full">
                {forensicFlags.length}
              </span>
            )}
            {activeTab === 'forensics' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'ocr' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            OCR Text
            {activeTab === 'ocr' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-900 dark:text-white font-mono truncate max-w-[200px]">
                      {String(value)}
                    </span>
                    <button aria-label="Copy to clipboard" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {Object.keys(metadata).length === 0 && (
                <p className="text-center text-slate-500 py-8">No metadata extracted</p>
              )}
            </div>
          )}

          {activeTab === 'forensics' && (
            <div className="space-y-3">
              {forensicFlags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-12 h-12 mb-2" />
                  <p className="font-medium">No manipulation detected</p>
                  <p className="text-sm opacity-80">File appears authentic</p>
                </div>
              ) : (
                forensicFlags.map((flag, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      flag.severity === 'high' 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                        : flag.severity === 'medium'
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 shrink-0 ${
                        flag.severity === 'high' ? 'text-red-500' : flag.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      <div>
                        <h4 className={`text-sm font-semibold ${
                          flag.severity === 'high' ? 'text-red-800 dark:text-red-200' : flag.severity === 'medium' ? 'text-orange-800 dark:text-orange-200' : 'text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {flag.type}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          flag.severity === 'high' ? 'text-red-700 dark:text-red-300' : flag.severity === 'medium' ? 'text-orange-700 dark:text-orange-300' : 'text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {flag.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap h-full overflow-y-auto">
              {ocrText || 'No text extracted.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
