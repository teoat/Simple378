import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { api } from '../../lib/api';

interface CaseOutcomePrediction {
  prediction: string;
  confidence: number;
  reasoning: string;
  factors: string[];
  risk_assessment: string;
  recommendations: string[];
}

interface RiskForecast {
  forecast: Array<{
    date: string;
    risk_score: number;
  }>;
  trend: string;
  confidence: number;
  reasoning: string;
}

interface ResourceEstimate {
  estimated_time: string;
  estimated_cost: number;
  personnel_needed: string[];
  confidence: number;
  based_on_similar_cases: number;
}

interface PatternAlert {
  type: string;
  severity: string;
  message: string;
  action_required: string;
}

export function PredictiveDashboard() {
  const { caseId } = useParams<{ caseId: string }>();
  const [activeTab, setActiveTab] = useState<'outcome' | 'risk' | 'resources' | 'alerts'>('outcome');

  // Fetch predictive data
  const { data: outcomePrediction, isLoading: outcomeLoading } = useQuery<CaseOutcomePrediction>({
    queryKey: ['predictive', 'outcome', caseId],
    queryFn: () => api.get(`/predictive/cases/${caseId}/outcome-prediction`),
    enabled: !!caseId
  });

  const { data: riskForecast, isLoading: riskLoading } = useQuery<RiskForecast>({
    queryKey: ['predictive', 'risk', caseId],
    queryFn: () => api.get(`/predictive/cases/${caseId}/risk-forecast`),
    enabled: !!caseId
  });

  const { data: resourceEstimate, isLoading: resourceLoading } = useQuery<ResourceEstimate>({
    queryKey: ['predictive', 'resources', caseId],
    queryFn: () => api.get(`/predictive/cases/${caseId}/resource-estimate`),
    enabled: !!caseId
  });

  const { data: patternAlerts, isLoading: alertsLoading } = useQuery<PatternAlert[]>({
    queryKey: ['predictive', 'alerts', caseId],
    queryFn: () => api.get(`/predictive/cases/${caseId}/pattern-alerts`),
    enabled: !!caseId
  });

  const tabs = [
    { id: 'outcome', label: 'Outcome Prediction', icon: Target },
    { id: 'risk', label: 'Risk Forecast', icon: TrendingUp },
    { id: 'resources', label: 'Resource Estimate', icon: Users },
    { id: 'alerts', label: 'Pattern Alerts', icon: AlertTriangle }
  ];

  const getOutcomeColor = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50 dark:bg-green-500/10';
      case 'denied': return 'text-red-600 bg-red-50 dark:bg-red-500/10';
      case 'escalated': return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-500/10';
      case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-500/10';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Predictive Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered insights and predictions for case {caseId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Powered by AI Analysis
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Outcome Prediction Tab */}
        {activeTab === 'outcome' && (
          <div className="space-y-6">
            {outcomeLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : outcomePrediction ? (
              <>
                {/* Prediction Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Case Outcome Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${getOutcomeColor(outcomePrediction.prediction)}`}>
                          {outcomePrediction.prediction.toUpperCase()}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Predicted Outcome</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {(outcomePrediction.confidence * 100).toFixed(0)}%
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Confidence Level</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-slate-900 dark:text-slate-100">
                          {outcomePrediction.risk_assessment}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Risk Assessment</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Factors and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Factors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {outcomePrediction.factors.map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {outcomePrediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Reasoning */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Reasoning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300">{outcomePrediction.reasoning}</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No prediction data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Risk Forecast Tab */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            {riskLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : riskForecast ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Risk Score Forecast (30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Trend:</span>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          riskForecast.trend === 'increasing' ? 'bg-red-100 text-red-700' :
                          riskForecast.trend === 'decreasing' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {riskForecast.trend === 'increasing' && <TrendingUp className="h-3 w-3" />}
                          {riskForecast.trend === 'decreasing' && <TrendingDown className="h-3 w-3" />}
                          <span className="capitalize">{riskForecast.trend}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Confidence:</span>
                        <span className="text-blue-600 font-medium">
                          {(riskForecast.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Forecast Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {riskForecast.forecast.slice(0, 7).map((point, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(point.date).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${point.risk_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {point.risk_score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No forecast data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Resource Estimate Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {resourceLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : resourceEstimate ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Estimated Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {resourceEstimate.estimated_time}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Based on {resourceEstimate.based_on_similar_cases} similar cases
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Estimated Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${resourceEstimate.estimated_cost.toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {(resourceEstimate.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      Personnel Needed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {resourceEstimate.personnel_needed.map((person, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span className="text-sm">{person}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No resource estimate available</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Pattern Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {alertsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : patternAlerts && patternAlerts.length > 0 ? (
              <div className="space-y-4">
                {patternAlerts.map((alert, idx) => (
                  <Card key={idx} className={`border-l-4 ${
                    alert.severity === 'high' ? 'border-l-red-500' :
                    alert.severity === 'medium' ? 'border-l-amber-500' :
                    'border-l-green-500'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'high' ? 'text-red-500' :
                              alert.severity === 'medium' ? 'text-amber-500' :
                              'text-green-500'
                            }`} />
                            <span className={`text-sm font-medium px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              {alert.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-900 dark:text-slate-100 mb-2">
                            {alert.message}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Action Required:</strong> {alert.action_required}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No pattern alerts detected</p>
                  <p className="text-sm text-slate-500 mt-1">Case appears to be within normal parameters</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}