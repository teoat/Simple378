import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  GitCompare,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface CaseData {
  id: string;
  name: string;
  risk_score: number;
  status: string;
  total_amount: number;
  transaction_count: number;
  evidence_count: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

interface CaseComparisonProps {
  availableCases: CaseData[];
  onCaseSelect?: (caseId: string) => void;
  maxComparisons?: number;
}

export function CaseComparison({
  availableCases,
  onCaseSelect,
  maxComparisons = 3
}: CaseComparisonProps) {
  const [selectedCases, setSelectedCases] = useState<CaseData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter available cases
  const filteredCases = useMemo(() => {
    return availableCases.filter(caseData =>
      !selectedCases.some(selected => selected.id === caseData.id) &&
      (caseData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       caseData.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [availableCases, selectedCases, searchTerm]);

  const addCase = (caseData: CaseData) => {
    if (selectedCases.length < maxComparisons) {
      setSelectedCases([...selectedCases, caseData]);
    }
  };

  const removeCase = (caseId: string) => {
    setSelectedCases(selectedCases.filter(c => c.id !== caseId));
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 dark:bg-red-500/10';
    if (score >= 60) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
    if (score >= 40) return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10';
    return 'text-green-600 bg-green-50 dark:bg-green-500/10';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'active':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10';
      case 'under review':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
      case 'escalated':
        return 'text-red-600 bg-red-50 dark:bg-red-500/10';
      case 'closed':
      case 'resolved':
        return 'text-green-600 bg-green-50 dark:bg-green-500/10';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate comparison metrics
  const comparisonMetrics = useMemo(() => {
    if (selectedCases.length === 0) return null;

    const avgRisk = selectedCases.reduce((sum, c) => sum + c.risk_score, 0) / selectedCases.length;
    const totalAmount = selectedCases.reduce((sum, c) => sum + c.total_amount, 0);
    const totalTransactions = selectedCases.reduce((sum, c) => sum + c.transaction_count, 0);
    const totalEvidence = selectedCases.reduce((sum, c) => sum + c.evidence_count, 0);

    const riskRange = {
      min: Math.min(...selectedCases.map(c => c.risk_score)),
      max: Math.max(...selectedCases.map(c => c.risk_score))
    };

    const amountRange = {
      min: Math.min(...selectedCases.map(c => c.total_amount)),
      max: Math.max(...selectedCases.map(c => c.total_amount))
    };

    return {
      avgRisk,
      totalAmount,
      totalTransactions,
      totalEvidence,
      riskRange,
      amountRange,
      caseCount: selectedCases.length
    };
  }, [selectedCases]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Case Comparison
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Compare multiple cases side by side to identify patterns and differences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {selectedCases.length} of {maxComparisons} selected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Case Selection Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                />

                {/* Available Cases */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCases.slice(0, 10).map((caseData) => (
                    <button
                      key={caseData.id}
                      onClick={() => addCase(caseData)}
                      disabled={selectedCases.length >= maxComparisons}
                      className="w-full text-left p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {caseData.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${getRiskColor(caseData.risk_score)}`}>
                          Risk: {caseData.risk_score}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatCurrency(caseData.total_amount)}
                        </span>
                      </div>
                    </button>
                  ))}

                  {filteredCases.length === 0 && (
                    <div className="text-center py-4 text-slate-500">
                      <p className="text-sm">No more cases available</p>
                      <p className="text-xs mt-1">Maximum {maxComparisons} cases selected</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison View */}
        <div className="lg:col-span-3">
          {selectedCases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GitCompare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Select Cases to Compare
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose up to {maxComparisons} cases from the panel to start comparing
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Metrics */}
              {comparisonMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-blue-600">
                          {comparisonMetrics.avgRisk.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Avg Risk Score
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(comparisonMetrics.totalAmount)}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Total Amount
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <FileText className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-purple-600">
                          {comparisonMetrics.totalTransactions}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Total Transactions
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-emerald-600">
                          {comparisonMetrics.totalEvidence}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Total Evidence
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Case Comparison Cards */}
              <div className="grid gap-4" style={{
                gridTemplateColumns: `repeat(${Math.min(selectedCases.length, 3)}, minmax(0, 1fr))`
              }}>
                {selectedCases.map((caseData, index) => (
                  <Card key={caseData.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base truncate">
                            {caseData.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(caseData.status)}`}>
                              {caseData.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getRiskColor(caseData.risk_score)}`}>
                              Risk: {caseData.risk_score}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCase(caseData.id)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Total Amount</span>
                          <span className="font-medium">{formatCurrency(caseData.total_amount)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Transactions</span>
                          <span className="font-medium">{caseData.transaction_count}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Evidence Files</span>
                          <span className="font-medium">{caseData.evidence_count}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
                          <span className="font-medium text-xs">{formatDate(caseData.created_at)}</span>
                        </div>
                      </div>

                      {/* Risk vs Average Comparison */}
                      {comparisonMetrics && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                            Risk vs Average
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(caseData.risk_score / 100) * 100}%`
                                }}
                              />
                            </div>
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-amber-500 h-2 rounded-full"
                                style={{
                                  width: `${(comparisonMetrics.avgRisk / 100) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-blue-600">This case</span>
                            <span className="text-amber-600">Average</span>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {caseData.tags && caseData.tags.length > 0 && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                            Tags
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {caseData.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comparison Insights */}
              {selectedCases.length > 1 && comparisonMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Comparison Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Risk Score Range
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {comparisonMetrics.riskRange.min} - {comparisonMetrics.riskRange.max}
                            <span className="ml-2 text-xs">
                              (Δ{comparisonMetrics.riskRange.max - comparisonMetrics.riskRange.min})
                            </span>
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Amount Range
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {formatCurrency(comparisonMetrics.amountRange.min)} - {formatCurrency(comparisonMetrics.amountRange.max)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Key Observations
                        </h4>
                        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          {comparisonMetrics.riskRange.max - comparisonMetrics.riskRange.min > 30 && (
                            <li>• Significant risk score variation across cases</li>
                          )}
                          {comparisonMetrics.amountRange.max / Math.max(comparisonMetrics.amountRange.min, 1) > 5 && (
                            <li>• Large discrepancy in transaction amounts</li>
                          )}
                          {selectedCases.some(c => c.status === 'escalated') && (
                            <li>• Some cases have been escalated for review</li>
                          )}
                          {selectedCases.every(c => c.evidence_count > 0) && (
                            <li>• All cases have supporting evidence</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}