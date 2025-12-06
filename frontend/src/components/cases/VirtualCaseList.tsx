import { useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Briefcase, ChevronRight } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface Case {
  id: string;
  title: string;
  subject_name: string;
  status: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

interface VirtualCaseListProps {
  height?: number;
  itemHeight?: number;
}

export function VirtualCaseList({ height = 600, itemHeight = 80 }: VirtualCaseListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => apiRequest<Case[]>('/cases/'),
    retry: false,
  });

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    return cases.filter(
      (c) =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.includes(searchTerm)
    );
  }, [cases, searchTerm]);

  const parentRef = useVirtualizer({
    count: filteredCases.length,
    getScrollElement: () => document.getElementById('virtual-case-list'),
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'active':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      case 'under review':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
      case 'escalated':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
      case 'closed':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    if (score >= 40) return 'text-blue-600 dark:text-blue-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by case ID, subject, or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Virtualized List */}
      <div
        id="virtual-case-list"
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        style={{ height }}
      >
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="col-span-4">Case</div>
            <div className="col-span-3">Subject</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Risk</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        <div
          className="overflow-auto"
          style={{
            height: height - 60, // Subtract header height
            contain: 'strict',
          }}
        >
          <div
            style={{
              height: `${parentRef.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {parentRef.getVirtualItems().map((virtualItem) => {
              const c = filteredCases[virtualItem.index];
              return (
                <div
                  key={c.id}
                  className="absolute top-0 left-0 w-full border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  style={{
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  onClick={() => navigate(`/cases/${c.id}`)}
                >
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {c.title || `Case ${c.id.slice(0, 8)}`}
                            </div>
                            <div className="text-sm text-slate-500">{c.id}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 text-slate-700 dark:text-slate-300">
                        {c.subject_name || 'Unknown'}
                      </div>
                      <div className="col-span-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className={`font-semibold ${getRiskColor(c.risk_score)}`}>
                          {c.risk_score}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No cases found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}