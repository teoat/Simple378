import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileInput, GitMerge, Gavel, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { SuccessBanner } from '../components/summary/SuccessBanner';
import { SummaryCard } from '../components/summary/SummaryCard';
import { KeyFindings, Finding } from '../components/summary/KeyFindings';
import { ChartEmbed } from '../components/summary/ChartEmbed';
import { PDFGenerator } from '../components/summary/PDFGenerator';
import { ActionButtons } from '../components/summary/ActionButtons';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Badge } from '../components/ui/Badge';
import { Tooltip } from '../components/ui/Tooltip';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { apiRequest } from '../lib/api';


interface CaseSummaryData {
  id: string;
  status: 'success' | 'partial' | 'failed';
  dataQuality: number;
  daysToResolution: number;
  ingestion: {
    records: number;
    files: number;
    completion: number;
    status: 'complete' | 'partial' | 'pending';
  };
  reconciliation: {
    matchRate: number;
    newRecords: number;
    rejected: number;
    status: 'complete' | 'partial' | 'pending';
  };
  adjudication: {
    resolved: number;
    avgTime: string;
    totalAlerts: number;
    status: 'complete' | 'partial' | 'pending';
  };
  findings: Finding[];
}

export const FinalSummary: FC = () => {
  const { caseId = 'CASE-001' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CaseSummaryData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiRequest<CaseSummaryData>(`/summary/${caseId}`);
        setData(result);
      } catch (error) {
        toast.error('Failed to load case summary');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
        fetchData();
    }
  }, [caseId]);

  const handleArchive = async () => {
    try {
        await apiRequest(`/summary/${caseId}/archive`, { method: 'POST' });
        toast.success('Case archived successfully');
        navigate('/cases');
    } catch (error) {
        toast.error('Failed to archive case');
        console.error(error);
    }
  };

  const handleEmail = () => {
    // This might be a future API integration
    toast.success('Summary report sent to stakeholders');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };
  
  const handleGenerateReport = async (template: string) => {
      try {
          // Handle both "template" and "template_caseId" formats safely
          const actualTemplate = template.includes('_') 
            ? template.split('_')[0] 
            : template;
            
          await apiRequest(`/summary/${caseId}/report`, { 
              method: 'POST',
              body: JSON.stringify({ template: actualTemplate })
          });
          toast.success(`Generated ${actualTemplate} report`);
      } catch (error) {
          toast.error('Failed to generate report');
          console.error(error);
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <LoadingSkeleton variant="rectangular" width="120px" height="32px" />
          </div>
          
          {/* Success Banner Skeleton */}
          <LoadingSkeleton variant="card" height="120px" />
          
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LoadingSkeleton variant="card" count={3} />
              </div>
              <LoadingSkeleton variant="card" height="300px" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LoadingSkeleton variant="card" count={4} />
              </div>
            </div>
            <div className="space-y-6">
              <LoadingSkeleton variant="card" height="200px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div>Error loading case data</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Cases', href: '/cases' },
            { label: `Case ${caseId}`, href: `/cases/${caseId}` },
            { label: 'Summary' }
          ]}
          className="mb-6"
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Case Summary
            </h1>
            <Badge variant="neutral" size="md">
              {caseId}
            </Badge>
            <Tooltip content={data ? `Data quality: ${data.dataQuality}%` : 'Loading...'}>
              <Badge 
                variant={data && data.dataQuality >= 90 ? 'success' : data && data.dataQuality >= 70 ? 'info' : 'warning'} 
                size="sm"
              >
                {data ? `${data.dataQuality}% Quality` : 'Loading...'}
              </Badge>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip content="Days to resolution">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{data ? `${data.daysToResolution} days` : 'Loading...'}</span>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Success Banner */}
        <SuccessBanner
          status={data.status}
          dataQuality={data.dataQuality}
          daysToResolution={data.daysToResolution}
          caseId={caseId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Content Column (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pipeline Stage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                title="Ingestion"
                icon={<FileInput className="w-5 h-5" />}
                status={data.ingestion.status}
                delay={0.1}
                metrics={[
                  { label: 'Records', value: data.ingestion.records.toLocaleString() },
                  { label: 'Files', value: data.ingestion.files },
                  { label: 'Status', value: '100%', status: 'complete' },
                ]}
              />
              <SummaryCard
                title="Reconciliation"
                icon={<GitMerge className="w-5 h-5" />}
                status={data.reconciliation.status}
                delay={0.2}
                metrics={[
                  { label: 'Match Rate', value: `${data.reconciliation.matchRate}%` },
                  { label: 'New', value: data.reconciliation.newRecords },
                  { label: 'Rejected', value: data.reconciliation.rejected, status: 'complete' },
                ]}
              />
              <SummaryCard
                title="Adjudication"
                icon={<Gavel className="w-5 h-5" />}
                status={data.adjudication.status}
                delay={0.3}
                metrics={[
                  { label: 'Resolved', value: `${data.adjudication.resolved}/${data.adjudication.totalAlerts}` },
                  { label: 'Avg Time', value: data.adjudication.avgTime },
                  { label: 'Status', value: 'Done', status: 'complete' },
                ]}
              />
            </div>

            {/* Key Findings */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
            >
                <KeyFindings
                  findings={data.findings}
                  caseId={caseId}
                  editable={true}
                />
            </motion.div>

            {/* Visualizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <ChartEmbed chartType="risk_distribution" title="Risk Distribution" />
                 <ChartEmbed chartType="timeline" title="Transaction Volume" />
                 <ChartEmbed chartType="network" title="Entity Network" />
                 <ChartEmbed chartType="cashflow" title="Cashflow Analysis" />
            </div>

          </div>

          {/* Sidebar Column (Right 1/3) */}
          <div className="space-y-6">
             <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
             >
                <PDFGenerator caseId={caseId} onGenerate={handleGenerateReport} />
             </motion.div>
             
             {/* Case Metrics Summary */}
             <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
             >
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Case Metrics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Status</span>
                    <Badge 
                      variant={data?.status === 'success' ? 'success' : data?.status === 'partial' ? 'warning' : 'error'} 
                      size="sm"
                    >
                      {data?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Data Quality</span>
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{data?.dataQuality || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Time to Resolve</span>
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{data?.daysToResolution || 0} days</span>
                  </div>
                </div>
             </motion.div>
             
             {/* Analyst Note */}
             <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-6 border border-amber-200 dark:border-amber-800"
             >
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                  <FileInput className="h-4 w-4" />
                  Analyst Note
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This case exceeds the threshold for automatic reporting. Please review all findings before generating the final compliance PDF.
                </p>
             </motion.div>

          </div>
        </div>

        {/* Bottom Actions */}
        <ActionButtons
          onArchive={handleArchive}
          onEmail={handleEmail}
          onCopy={handleCopy}
          onContinue={() => navigate('/cases')}
        />
      </div>
    </div>
  );
};
