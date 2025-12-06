import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Search, Filter, Plus, Briefcase, ChevronRight } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { subjectsApi } from '../lib/api';

interface Case {
  id: string;
  title: string;
  subject_name: string;
  status: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

export function CaseList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type && ['case_created', 'case_updated', 'case_deleted'].includes(lastMessage.type)) {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    }
  }, [lastMessage, queryClient]);

  const { data: cases, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => apiRequest<Case[]>('/cases/'),
    retry: false,
  });

  const filteredCases = cases?.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.includes(searchTerm)
  );

  const handleSelectCase = (caseId: string, checked: boolean) => {
    const newSelected = new Set(selectedCases);
    if (checked) {
      newSelected.add(caseId);
    } else {
      newSelected.delete(caseId);
    }
    setSelectedCases(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredCases) {
      setSelectedCases(new Set(filteredCases.map(c => c.id)));
    } else {
      setSelectedCases(new Set());
    }
  };

  const isAllSelected = filteredCases && filteredCases.length > 0 && selectedCases.size === filteredCases.length;
  const isIndeterminate = selectedCases.size > 0 && selectedCases.size < (filteredCases?.length || 0);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cases</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage and investigate fraud cases
          </p>
        </div>
        <button
          onClick={() => navigate('/cases/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by case ID, subject, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Batch Actions Bar */}
      {selectedCases.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedCases.size} case{selectedCases.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await subjectsApi.batchUpdateCases({
                      case_ids: Array.from(selectedCases),
                      status: 'under review'
                    });
                    queryClient.invalidateQueries({ queryKey: ['cases'] });
                    setSelectedCases(new Set());
                  } catch (error) {
                    console.error('Failed to batch update status:', error);
                  }
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md font-medium transition-colors"
              >
                Mark Under Review
              </button>
              <button
                onClick={async () => {
                  try {
                    await subjectsApi.batchUpdateCases({
                      case_ids: Array.from(selectedCases),
                      status: 'closed'
                    });
                    queryClient.invalidateQueries({ queryKey: ['cases'] });
                    setSelectedCases(new Set());
                  } catch (error) {
                    console.error('Failed to batch close cases:', error);
                  }
                }}
                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-md font-medium transition-colors"
              >
                Close Cases
              </button>
              <button
                onClick={() => {
                  // TODO: Implement batch export
                  console.log('Batch export for:', Array.from(selectedCases));
                }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md font-medium transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => setSelectedCases(new Set())}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-md font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Case</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Subject</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Risk</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Updated</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                </td>
              </tr>
            ) : filteredCases && filteredCases.length > 0 ? (
              filteredCases.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedCases.has(c.id) ? 'bg-blue-50 dark:bg-blue-500/5' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCases.has(c.id)}
                      onChange={(e) => handleSelectCase(c.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                        <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{c.title || `Case ${c.id.slice(0, 8)}`}</div>
                        <div className="text-sm text-slate-500">{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 text-slate-700 dark:text-slate-300 cursor-pointer"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    {c.subject_name || 'Unknown'}
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <span className={`font-semibold ${getRiskColor(c.risk_score)}`}>
                      {c.risk_score}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-slate-500 text-sm cursor-pointer"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    {new Date(c.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </td>
                </tr>
              ))
             ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No cases found</h3>
                  <p className="text-slate-500 mt-1">Create a new case to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
