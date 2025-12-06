import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  FileText,
  Link,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Evidence {
  id: string;
  filename: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'other';
  size: number;
  upload_date: string;
  tags: string[];
  extracted_text?: string;
  metadata?: Record<string, any>;
  correlations?: string[]; // IDs of related evidence
  risk_score?: number;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

interface EvidenceCorrelationProps {
  evidence: Evidence[];
  transactions: Transaction[];
  onEvidenceClick?: (evidence: Evidence) => void;
  onCorrelationClick?: (evidenceId: string, transactionId: string) => void;
}

export function EvidenceCorrelationViewer({
  evidence,
  transactions,
  onEvidenceClick,
  onCorrelationClick
}: EvidenceCorrelationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showCorrelations, setShowCorrelations] = useState(true);

  // Filter evidence based on search and type
  const filteredEvidence = useMemo(() => {
    return evidence.filter(item => {
      const matchesSearch = !searchTerm ||
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.extracted_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = filterType === 'all' || item.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [evidence, searchTerm, filterType]);

  // Find correlations between evidence and transactions
  const correlations = useMemo(() => {
    const correlationMap: Record<string, Transaction[]> = {};

    filteredEvidence.forEach(evidence => {
      correlationMap[evidence.id] = [];

      // Simple correlation logic - can be enhanced with AI
      transactions.forEach(transaction => {
        let correlationScore = 0;

        // Date proximity (within 7 days)
        const evidenceDate = new Date(evidence.upload_date);
        const txDate = new Date(transaction.date);
        const daysDiff = Math.abs((evidenceDate.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) correlationScore += 0.3;

        // Amount similarity (if evidence mentions amounts)
        if (evidence.extracted_text) {
          const text = evidence.extracted_text.toLowerCase();
          const amountStr = transaction.amount.toString();
          if (text.includes(amountStr) || text.includes(transaction.amount.toFixed(2))) {
            correlationScore += 0.5;
          }
        }

        // Description similarity
        if (evidence.extracted_text && transaction.description) {
          const textWords = evidence.extracted_text.toLowerCase().split(/\s+/);
          const descWords = transaction.description.toLowerCase().split(/\s+/);
          const commonWords = textWords.filter(word => descWords.includes(word) && word.length > 3);
          if (commonWords.length > 0) {
            correlationScore += 0.2 * Math.min(commonWords.length, 3);
          }
        }

        // Tag matching
        if (evidence.tags.some(tag =>
          transaction.description.toLowerCase().includes(tag.toLowerCase()) ||
          transaction.category.toLowerCase().includes(tag.toLowerCase())
        )) {
          correlationScore += 0.3;
        }

        if (correlationScore >= 0.4) { // Threshold for correlation
          correlationMap[evidence.id].push({
            ...transaction,
            correlation_score: correlationScore
          });
        }
      });

      // Sort by correlation score
      correlationMap[evidence.id].sort((a, b) => (b as any).correlation_score - (a as any).correlation_score);
    });

    return correlationMap;
  }, [filteredEvidence, transactions]);

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📎';
    }
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-slate-500';
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-blue-600';
    return 'text-green-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Evidence Correlation Viewer
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Analyze relationships between evidence files and transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showCorrelations ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCorrelations(!showCorrelations)}
          >
            <Link className="h-4 w-4 mr-1" />
            {showCorrelations ? 'Hide' : 'Show'} Correlations
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Evidence Files ({filteredEvidence.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search evidence..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                  >
                    <option value="all">All Types</option>
                    <option value="document">Documents</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvidence.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedEvidence(item);
                      onEvidenceClick?.(item);
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEvidence?.id === item.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getEvidenceIcon(item.type)}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {item.filename}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                            <span>{formatFileSize(item.size)}</span>
                            <span>{new Date(item.upload_date).toLocaleDateString()}</span>
                            {item.risk_score && (
                              <span className={getRiskColor(item.risk_score)}>
                                Risk: {item.risk_score}
                              </span>
                            )}
                          </div>
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="text-xs text-slate-500">
                                  +{item.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Correlation indicator */}
                      {showCorrelations && correlations[item.id]?.length > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Link className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {correlations[item.id].length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Preview text */}
                    {item.extracted_text && (
                      <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm text-slate-700 dark:text-slate-300">
                        {item.extracted_text.length > 100
                          ? `${item.extracted_text.substring(0, 100)}...`
                          : item.extracted_text
                        }
                      </div>
                    )}
                  </div>
                ))}

                {filteredEvidence.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No evidence files found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Correlations Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Correlations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvidence ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {selectedEvidence.filename}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {correlations[selectedEvidence.id]?.length || 0} correlated transactions
                    </p>
                  </div>

                  {correlations[selectedEvidence.id]?.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {correlations[selectedEvidence.id].map((transaction) => (
                        <div
                          key={transaction.id}
                          onClick={() => onCorrelationClick?.(selectedEvidence.id, transaction.id)}
                          className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              ${transaction.amount.toLocaleString()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              (transaction as any).correlation_score > 0.7 ? 'bg-green-100 text-green-700' :
                              (transaction as any).correlation_score > 0.5 ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {(transaction as any).correlation_score * 100}% match
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No correlations found</p>
                      <p className="text-xs mt-1">This evidence doesn't appear to be related to any transactions</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an evidence file</p>
                  <p className="text-xs mt-1">to view correlations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}