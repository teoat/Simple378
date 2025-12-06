import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  FileText,
  Brain,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { api } from '../../lib/api';

interface CaseSummary {
  id: string;
  case_id: string;
  summary_type: 'executive' | 'detailed' | 'risk' | 'evidence' | 'timeline';
  title: string;
  content: string;
  key_findings: string[];
  recommendations: string[];
  confidence_score: number;
  generated_at: string;
  model_used: string;
  word_count: number;
}

interface AutomatedCaseSummariesProps {
  caseId: string;
  onSummarySelect?: (summary: CaseSummary) => void;
  onGenerateSummary?: (type: string) => void;
}

export function AutomatedCaseSummaries({
  caseId,
  onSummarySelect,
  onGenerateSummary
}: AutomatedCaseSummariesProps) {
  const [selectedSummary, setSelectedSummary] = useState<CaseSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<CaseSummary[]>([]);
  const [showDetails, setShowDetails] = useState(true);

  // Mock data - in real implementation, this would come from API
  const mockSummaries: CaseSummary[] = [
    {
      id: 'exec_001',
      case_id: caseId,
      summary_type: 'executive',
      title: 'Executive Summary',
      content: 'This case involves a complex financial investigation with multiple transactions totaling $2.3M across 15 different accounts. The primary suspect has been identified with high confidence based on transaction patterns and evidence correlation.',
      key_findings: [
        'Total transaction volume: $2.3M across 15 accounts',
        'Primary suspect identified with 85% confidence',
        'Evidence includes bank statements and witness testimony',
        'Risk score elevated due to international transfers'
      ],
      recommendations: [
        'Escalate to senior investigation team',
        'Request additional evidence from international partners',
        'Monitor suspect accounts for 90 days',
        'Prepare case for prosecution review'
      ],
      confidence_score: 0.87,
      generated_at: new Date().toISOString(),
      model_used: 'claude-3-sonnet',
      word_count: 124
    },
    {
      id: 'risk_001',
      case_id: caseId,
      summary_type: 'risk',
      title: 'Risk Assessment Summary',
      content: 'The case presents multiple high-risk indicators including unusual transaction patterns, international money movement, and connections to known high-risk jurisdictions. Risk mitigation strategies should focus on immediate account monitoring and enhanced due diligence.',
      key_findings: [
        'High-risk transaction patterns detected',
        'International jurisdiction exposure',
        'Unusual velocity in fund movements',
        'Potential structuring indicators present'
      ],
      recommendations: [
        'Implement enhanced transaction monitoring',
        'Conduct enhanced due diligence on all parties',
        'Freeze suspicious accounts pending investigation',
        'Engage compliance team for regulatory reporting'
      ],
      confidence_score: 0.92,
      generated_at: new Date().toISOString(),
      model_used: 'claude-3-sonnet',
      word_count: 98
    },
    {
      id: 'evidence_001',
      case_id: caseId,
      summary_type: 'evidence',
      title: 'Evidence Analysis Summary',
      content: 'The evidence package includes 23 documents, 15 transaction records, and 8 witness statements. Key evidence includes bank records showing suspicious patterns and documentary evidence of intent. Chain of custody has been maintained throughout the investigation.',
      key_findings: [
        '23 documents collected and analyzed',
        '15 transaction records with suspicious patterns',
        '8 witness statements obtained',
        'Chain of custody fully documented'
      ],
      recommendations: [
        'Strengthen evidence with additional witness interviews',
        'Obtain court orders for additional financial records',
        'Document all evidence handling procedures',
        'Prepare evidence for legal review'
      ],
      confidence_score: 0.89,
      generated_at: new Date().toISOString(),
      model_used: 'claude-3-sonnet',
      word_count: 87
    }
  ];

  // Initialize with mock data
  useMemo(() => {
    if (summaries.length === 0) {
      setSummaries(mockSummaries);
    }
  }, []);

  const generateSummary = async (type: string) => {
    setIsGenerating(type);
    try {
      // In real implementation, this would call the AI service
      const response = await api.post('/ai/generate-summary', {
        case_id: caseId,
        summary_type: type
      });

      const newSummary: CaseSummary = response.summary;
      setSummaries(prev => [...prev, newSummary]);
      onGenerateSummary?.(type);
    } catch (error) {
      console.error('Summary generation failed:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportSummary = (summary: CaseSummary, format: 'txt' | 'pdf') => {
    const content = `
${summary.title}
Generated: ${new Date(summary.generated_at).toLocaleString()}
Model: ${summary.model_used}
Confidence: ${(summary.confidence_score * 100).toFixed(1)}%

${summary.content}

Key Findings:
${summary.key_findings.map(f => `• ${f}`).join('\n')}

Recommendations:
${summary.recommendations.map(r => `• ${r}`).join('\n')}
    `.trim();

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${summary.title.replace(/\s+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getSummaryIcon = (type: string) => {
    switch (type) {
      case 'executive': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'detailed': return <FileText className="h-4 w-4 text-green-500" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'evidence': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'timeline': return <TrendingUp className="h-4 w-4 text-amber-500" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50 dark:bg-green-500/10';
    if (score >= 0.8) return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10';
    if (score >= 0.7) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
    return 'text-red-600 bg-red-50 dark:bg-red-500/10';
  };

  const summaryTypes = [
    { id: 'executive', label: 'Executive Summary', description: 'High-level overview for stakeholders' },
    { id: 'detailed', label: 'Detailed Analysis', description: 'Comprehensive case breakdown' },
    { id: 'risk', label: 'Risk Assessment', description: 'Focus on risk factors and mitigation' },
    { id: 'evidence', label: 'Evidence Summary', description: 'Evidence collection and analysis' },
    { id: 'timeline', label: 'Timeline Summary', description: 'Chronological case progression' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Automated Case Summaries
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-generated summaries and analysis reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showDetails ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          <Brain className="h-5 w-5 text-purple-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Types */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summaryTypes.map((type) => {
                  const existingSummary = summaries.find(s => s.summary_type === type.id);
                  return (
                    <div key={type.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSummaryIcon(type.id)}
                          <span className="font-medium text-sm">{type.label}</span>
                        </div>
                        {existingSummary && (
                          <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                            Generated
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                        {type.description}
                      </p>
                      <Button
                        size="sm"
                        variant={existingSummary ? 'outline' : 'default'}
                        onClick={() => generateSummary(type.id)}
                        disabled={isGenerating === type.id}
                        className="w-full"
                      >
                        {isGenerating === type.id ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Brain className="h-3 w-3 mr-1" />
                        )}
                        {existingSummary ? 'Regenerate' : 'Generate'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summaries List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Summaries ({summaries.length})</span>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Brain className="h-4 w-4" />
                  AI-Powered
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summaries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No summaries generated yet</p>
                  <p className="text-sm mt-1">Select a summary type to generate AI-powered analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {summaries.map((summary) => (
                    <div
                      key={summary.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedSummary?.id === summary.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => {
                        setSelectedSummary(summary);
                        onSummarySelect?.(summary);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getSummaryIcon(summary.summary_type)}
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {summary.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(summary.confidence_score)}`}>
                            {(summary.confidence_score * 100).toFixed(0)}%
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(summary.content);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => exportSummary(summary, 'txt')}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">
                        {summary.content}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span>{summary.word_count} words</span>
                          <span>{summary.model_used}</span>
                          <span>{new Date(summary.generated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Key findings: {summary.key_findings.length}</span>
                          <span>Recommendations: {summary.recommendations.length}</span>
                        </div>
                      </div>

                      {showDetails && selectedSummary?.id === summary.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-slate-900 dark:text-slate-100">
                                Key Findings
                              </h5>
                              <ul className="space-y-1">
                                {summary.key_findings.map((finding, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-slate-900 dark:text-slate-100">
                                Recommendations
                              </h5>
                              <ul className="space-y-1">
                                {summary.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Stats */}
      {summaries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <FileText className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">{summaries.length}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Summaries Generated</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">
                  {(summaries.reduce((sum, s) => sum + s.confidence_score, 0) / summaries.length * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Avg Confidence</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">
                  {summaries.reduce((sum, s) => sum + s.key_findings.length, 0)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Key Findings</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-amber-600">
                  {summaries.reduce((sum, s) => sum + s.recommendations.length, 0)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Recommendations</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}