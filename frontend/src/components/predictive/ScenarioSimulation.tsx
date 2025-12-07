import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Play,
  Settings,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Zap,
  Target,
  LucideIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

interface ScenarioResult {
  scenario: string;
  baseline_outcome?: string;
  simulated_outcome?: string;
  impact?: string;
  confidence?: number;
  factors_affected?: string[];
  monthly_capacity?: number;
  burn_rate?: number;
  bottlenecks?: string[];
  recommendations?: string[];
  affected_cases?: number;
  risk_increase?: number;
  critical_dependencies?: string[];
  overall_risk?: number;
}

interface ScenarioParamConfig {
  type: 'text' | 'number' | 'textarea';
  label: string;
  placeholder?: string;
  default?: string | number;
  min?: number;
  max?: number;
  step?: number;
}

interface ScenarioDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  params: Record<string, ScenarioParamConfig>;
}

export function ScenarioSimulation() {
  const [activeScenario, setActiveScenario] = useState<string>('what_if');
  const [scenarioParams, setScenarioParams] = useState<Record<string, unknown>>({});

  const handleScenarioChange = (id: string) => {
    setActiveScenario(id);
    setScenarioParams({});
  };

  const scenarios: ScenarioDef[] = [
    {
      id: 'what_if',
      name: 'What-If Analysis',
      description: 'Simulate how changes affect case outcomes',
      icon: Target,
      params: {
        scenario: { type: 'text', label: 'Scenario Description', placeholder: 'e.g., Increase review threshold by 20%' },
        changes: { type: 'textarea', label: 'Specific Changes', placeholder: 'Describe the changes to simulate...' }
      }
    },
    {
      id: 'burn_rate',
      name: 'Burn Rate Prediction',
      description: 'Predict resource utilization and capacity',
      icon: TrendingUp,
      params: {
        case_load: { type: 'number', label: 'Monthly Case Load', default: 50 },
        avg_resolution_time: { type: 'number', label: 'Avg Resolution Time (days)', default: 14 }
      }
    },
    {
      id: 'vendor_stress',
      name: 'Vendor Stress Testing',
      description: 'Test vendor dependency impacts',
      icon: AlertTriangle,
      params: {
        vendor_id: { type: 'text', label: 'Vendor ID', placeholder: 'e.g., VENDOR_001' },
        stress_factor: { type: 'number', label: 'Stress Factor (0-2)', default: 1.0, min: 0, max: 2, step: 0.1 }
      }
    },
    {
      id: 'dependency_risk',
      name: 'Dependency Risk Modeling',
      description: 'Analyze system dependency risks',
      icon: Zap,
      params: {
        dependencies: { type: 'textarea', label: 'Dependencies (one per line)', placeholder: 'External API\nDatabase Service\nCloud Storage' }
      }
    }
  ];

  const runSimulationMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<ScenarioResult>('/predictive/simulation/scenario', data),
    onSuccess: (data) => {
      console.log('Simulation result:', data);
    }
  });

  const handleRunSimulation = () => {
    const scenario = scenarios.find(s => s.id === activeScenario);
    if (!scenario) return;

    const params = {
      scenario_type: activeScenario,
      parameters: scenarioParams
    };

    runSimulationMutation.mutate(params);
  };

  const updateParam = (key: string, value: unknown) => {
    setScenarioParams((prev: Record<string, unknown>) => ({
      ...prev,
      [key]: value
    }));
  };

  const renderParameterInput = (key: string, config: ScenarioParamConfig) => {
    const value = scenarioParams[key] ?? config.default ?? '';

    switch (config.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => updateParam(key, e.target.value)}
            placeholder={config.placeholder}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => updateParam(key, parseFloat(e.target.value))}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            step={config.step}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => updateParam(key, e.target.value)}
            placeholder={config.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        );
      default:
        return null;
    }
  };

  const renderResults = (result: ScenarioResult) => {
    if (activeScenario === 'what_if') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Baseline</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize">
                    {result.baseline_outcome}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Simulated</div>
                  <div className="text-2xl font-bold text-blue-600 capitalize">
                    {result.simulated_outcome}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Impact</div>
                  <div className={`text-2xl font-bold capitalize ${
                    result.impact === 'positive' ? 'text-green-600' :
                    result.impact === 'negative' ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {result.impact}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Factors Affected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.factors_affected?.map((factor, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    {factor}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeScenario === 'burn_rate') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Monthly Capacity</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.monthly_capacity}
                  </div>
                  <div className="text-sm text-slate-500">cases/month</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Burn Rate</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${result.burn_rate?.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500">per month</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Bottlenecks</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {result.bottlenecks?.length || 0}
                  </div>
                  <div className="text-sm text-slate-500">identified</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {result.bottlenecks && result.bottlenecks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Identified Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.bottlenecks.map((bottleneck, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-slate-700 dark:text-slate-300">{bottleneck}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeScenario === 'vendor_stress') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Affected Cases</div>
                  <div className="text-2xl font-bold text-red-600">
                    {result.affected_cases}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Risk Increase</div>
                  <div className="text-2xl font-bold text-amber-600">
                    +{result.risk_increase}%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Settings className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-medium text-slate-600 dark:text-slate-400">Stress Factor</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(scenarioParams.stress_factor as number) || 1.0}x
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (activeScenario === 'dependency_risk') {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dependency Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Risk Level:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (result.overall_risk || 0) > 0.7 ? 'bg-red-100 text-red-700' :
                    (result.overall_risk || 0) > 0.4 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {((result.overall_risk || 0) * 100).toFixed(0)}% Risk
                  </span>
                </div>

                {result.critical_dependencies && result.critical_dependencies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Critical Dependencies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.critical_dependencies.map((dep: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-full text-sm">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {result.recommendations?.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Scenario Simulation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Test different scenarios and predict outcomes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Predictive Modeling
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Choose Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scenarios.map((scenario) => {
                  const Icon = scenario.icon;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioChange(scenario.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        activeScenario === scenario.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          activeScenario === scenario.id ? 'text-blue-500' : 'text-slate-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {scenario.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {scenario.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parameters and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(scenarios.find(s => s.id === activeScenario)?.params || {}).map(([key, config]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {config.label}
                    </label>
                    {renderParameterInput(key, config)}
                  </div>
                ))}

                <Button
                  onClick={handleRunSimulation}
                  disabled={runSimulationMutation.isPending}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {runSimulationMutation.isPending ? 'Running Simulation...' : 'Run Simulation'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {runSimulationMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                {renderResults(runSimulationMutation.data)}
              </CardContent>
            </Card>
          )}

          {runSimulationMutation.isError && (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="text-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>Simulation failed. Please check your parameters and try again.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}