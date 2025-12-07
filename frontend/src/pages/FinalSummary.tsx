import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileInput, GitMerge, Gavel, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { SuccessBanner } from '../components/summary/SuccessBanner';
import { SummaryCard } from '../components/summary/SummaryCard';
import { KeyFindings, Finding } from '../components/summary/KeyFindings';
import { ChartEmbed } from '../components/summary/ChartEmbed';
import { PDFGenerator } from '../components/summary/PDFGenerator';
import { ActionButtons } from '../components/summary/ActionButtons';
import { Button } from '../components/ui/Button';
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
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500">Generating Case Summary...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div>Error loading case data</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate('/cases')} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Cases
            </Button>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Case Summary / <span className="text-slate-500 font-normal">{caseId}</span>
            </h1>
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
             
             {/* Additional context or quick stats could go here */}
             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-sm opacity-80">
                 <h4 className="font-semibold mb-2">Analyst Note</h4>
                 <p>This case exceeds the threshold for automatic reporting. Please review all findings before generating the final compliance PDF.</p>
             </div>

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
