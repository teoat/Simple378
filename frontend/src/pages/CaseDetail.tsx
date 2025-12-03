import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { Clock, FileText, Network, DollarSign } from 'lucide-react';
import { EntityGraph } from '../components/visualizations/EntityGraph';
import { Timeline } from '../components/visualizations/Timeline';
import { FinancialSankey } from '../components/visualizations/FinancialSankey';

const tabs = [
  { name: 'Overview', id: 'overview', icon: FileText },
  { name: 'Graph Analysis', id: 'graph', icon: Network },
  { name: 'Timeline', id: 'timeline', icon: Clock },
  { name: 'Financials', id: 'financials', icon: DollarSign },
];

export function CaseDetail()  {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => api.getCase(id!),
    enabled: !!id,
  });

  useQuery({
    queryKey: ['case', id, 'timeline'],
    queryFn: () => api.getCaseTimeline(id!),
    enabled: !!id && activeTab === 'timeline',
  });

  useQuery({
    queryKey: ['graph', caseData?.subject_name],
    queryFn: () => api.getGraph(caseData!.subject_name),
    enabled: !!caseData?.subject_name && activeTab === 'graph',
  });

  if (caseLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Case not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
            Case: {caseData.id}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Subject: {caseData.subject_name} | Status: <span className="font-medium text-yellow-600">{caseData.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700">
            Escalate
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Approve Decision
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                activeTab === tab.name
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
                'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium'
              )}
            >
              <tab.icon
                className={cn(
                  activeTab === tab.name ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500',
                  'mr-2 h-5 w-5'
                )}
                aria-hidden="true"
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Case Details</h3>
              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Risk Score</dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white">85/100</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Assigned To</dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white">Alice Smith</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Description</dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                    Suspicious structuring activity detected across multiple accounts.
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Case Summary
              </h3>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                {caseData.description || 'No description available'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Risk Score</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{caseData.risk_score}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Assigned To</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{caseData.assigned_to}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Graph Analysis' && (
          <div className="rounded-lg bg-white p-4 shadow dark:bg-slate-800">
            <EntityGraph />
          </div>
        )}
        {activeTab === 'Financials' && (
          <div className="rounded-lg bg-white p-4 shadow dark:bg-slate-800">
            <FinancialSankey />
          </div>
        )}
        {activeTab === 'Timeline' && (
           <div className="rounded-lg bg-white p-4 shadow dark:bg-slate-800">
            <Timeline />
          </div>
        )}
        {activeTab === 'Evidence' && (
           <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800 h-96 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Evidence Files Placeholder</span>
          </div>
        )}
      </div>
    </div>
  );
}
