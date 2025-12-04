import React, { useState } from 'react';
import { FileText, Download, Copy, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ForensicResultsProps {
  filename: string;
  fileUrl?: string;
  fileType: string;
  metadata?: Record<string, unknown>;
  ocrText?: string;
  forensicFlags?: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }>;
}

export function ForensicResults({
  filename,
  fileUrl,
  fileType,
  metadata = {},
  ocrText,
  forensicFlags = [],
}: ForensicResultsProps) {
  const [activeTab, setActiveTab] = useState<'metadata' | 'ocr' | 'forensics'>('metadata');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getFlagColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400';
      case 'medium':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400';
      case 'low':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400';
    }
  };

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType.toLowerCase());
  const isPdf = fileType.toLowerCase() === 'pdf';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Original File Preview */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Original Document</h3>
          {fileUrl && (
            <a
              href={fileUrl}
              download={filename}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg backdrop-blur-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 border border-blue-400/30 transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>

        <div className="rounded-lg overflow-hidden border border-white/10 dark:border-slate-700/20 bg-slate-900/50 min-h-[400px] flex items-center justify-center">
          {isImage && fileUrl ? (
            <img src={fileUrl} alt={filename} className="max-w-full max-h-[500px] object-contain" />
          ) : isPdf ? (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">{filename}</p>
              <p className="text-slate-500 text-xs mt-2">PDF preview not available</p>
            </div>
          ) : (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">{filename}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Extracted Data */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Extracted Data & Analysis</h3>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 dark:border-slate-700/20">
            {['metadata', 'ocr', 'forensics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              {Object.keys(metadata).length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No metadata available</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-start p-3 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-slate-800/10 border border-white/10 dark:border-slate-700/20"
                    >
                      <div className="flex-1 min-w-0">
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </dt>
                        <dd className="text-sm text-slate-900 dark:text-white break-words">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </dd>
                      </div>
                      <button
                        onClick={() => handleCopy(String(value))}
                        className="ml-2 p-1.5 rounded hover:bg-white/10 dark:hover:bg-slate-700/50 transition-colors"
                        title="Copy value"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="space-y-4">
              {!ocrText ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No OCR text available</p>
              ) : (
                <div className="relative">
                  <div className="p-4 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-slate-800/10 border border-white/10 dark:border-slate-700/20 max-h-[400px] overflow-y-auto">
                    <pre className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap font-mono">
                      {ocrText}
                    </pre>
                  </div>
                  <button
                    onClick={() => handleCopy(ocrText)}
                    className="absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-slate-800/20 hover:bg-white/20 dark:hover:bg-slate-800/30 transition-colors"
                    title="Copy OCR text"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'forensics' && (
            <div className="space-y-4">
              {forensicFlags.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 rounded-lg backdrop-blur-sm bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                  <p className="text-green-600 dark:text-green-400 font-medium">No manipulation detected</p>
                  <p className="text-green-500 dark:text-green-500 text-sm mt-1">File appears authentic</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {forensicFlags.map((flag, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${getFlagColor(flag.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium mb-1">{flag.type}</p>
                          <p className="text-sm opacity-90">{flag.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

