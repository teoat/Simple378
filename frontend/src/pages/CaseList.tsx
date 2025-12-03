import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CaseSearch } from '../components/cases/CaseSearch';
import { CaseFilters } from '../components/cases/CaseFilters';
import { RiskBar } from '../components/cases/RiskBar';
import { StatusBadge } from '../components/cases/StatusBadge';
import { QuickPreview } from '../components/cases/QuickPreview';

export function CaseList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['cases', { search: searchQuery, status: statusFilter !== 'all' ? statusFilter : undefined }],
    queryFn: () => api.getCases({ 
      search: searchQuery || undefined, 
      status: statusFilter !== 'all' ? statusFilter : undefined 
    }),
  });

  const handleMouseMove = (e: React.MouseEvent, id: string) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    setHoveredCase(id);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm">
          Error loading cases: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Case Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and investigate fraud cases</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 font-medium">
          <Plus className="h-5 w-5" />
          New Case
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <CaseSearch 
          value={searchQuery} 
          onChange={setSearchQuery} 
          className="w-full md:w-96"
        />
        <CaseFilters 
          status={statusFilter} 
          onStatusChange={setStatusFilter}
          className="w-full md:w-auto"
        />
      </div>

      {/* Data Grid */}
      <div className="relative">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-48">Risk Score</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {data?.items.map((case_) => (
                    <motion.tr 
                      key={case_.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors relative"
                      onMouseMove={(e) => handleMouseMove(e, case_.id)}
                      onMouseLeave={() => setHoveredCase(null)}
                    >
                      <td className="px-6 py-4">
                        <Link 
                          to={`/cases/${case_.id}`} 
                          className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          #{case_.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {case_.subject_name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{case_.subject_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBar score={case_.risk_score} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={case_.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {case_.assigned_to}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-500">
                        {new Date(case_.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {data?.items.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">No cases found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.items.length > 0 && (
          <div className="flex justify-between items-center mt-6 px-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{data.items.length}</span> of <span className="font-medium text-slate-900 dark:text-white">{data.total}</span> cases
            </p>
            <div className="flex gap-2">
              <button 
                disabled={data.page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button 
                disabled={data.page === data.pages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Preview Hover Card */}
        {data?.items.map((case_) => (
          <QuickPreview
            key={`preview-${case_.id}`}
            isOpen={hoveredCase === case_.id}
            data={case_}
            position={mousePos}
          />
        ))}
      </div>
    </div>
  );
}
