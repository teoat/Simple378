import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';

interface UploadHistoryProps {
  onView?: (uploadId: string) => void;
}

export function UploadHistory({ onView }: UploadHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'complete' | 'failed'>('all');

  // Mock data for now - replace with real API call
  const uploads = [
    { id: '1', filename: 'receipt_001.pdf', type: 'pdf', status: 'complete', date: '2024-03-12T10:30:00Z', size: 1024000 },
    { id: '2', filename: 'transactions.csv', type: 'csv', status: 'complete', date: '2024-03-12T11:15:00Z', size: 450000 },
    { id: '3', filename: 'invoice_scan.jpg', type: 'image', status: 'processing', date: '2024-03-12T12:00:00Z', size: 2400000 },
  ];

  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || upload.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20 dark:border-slate-700/30 p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upload History</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm rounded-lg backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 text-sm rounded-lg backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30 text-slate-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="complete">Complete</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredUploads.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No uploads found
          </div>
        ) : (
          filteredUploads.map((upload) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-slate-800/10 border border-white/10 dark:border-slate-700/20 hover:bg-white/10 dark:hover:bg-slate-800/20 transition-all group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">{upload.filename}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatFileSize(upload.size)}</span>
                    <span>{new Date(upload.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(upload.status)}`}>
                  {upload.status}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {onView && (
                  <button
                    onClick={() => onView(upload.id)}
                    className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700/50 transition-colors"
                    title="View details"
                  >
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                  </button>
                )}
                <button
                  className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700/50 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-green-500" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700/50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

