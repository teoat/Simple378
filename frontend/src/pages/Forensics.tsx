import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Network, Eye, AlertTriangle, FileText, Clock, Brain, Link } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface ForensicEntity {
  id: string;
  name: string;
  type: 'person' | 'company' | 'account' | 'address';
  risk_score: number;
  connections: number;
  last_activity: string;
}

export function Forensics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<ForensicEntity | null>(null);
  const [entityMatches, setEntityMatches] = useState<any[]>([]);

  const { data: entities, isLoading } = useQuery({
    queryKey: ['forensics', 'entities'],
    queryFn: () => apiRequest<ForensicEntity[]>('/forensics/entities'),
    retry: false,
  });

  // AI Entity Resolution mutation
  const entityResolutionMutation = useMutation({
    mutationFn: (entityData: any) => apiRequest('/forensics/entity-resolution', {
      method: 'POST',
      body: JSON.stringify(entityData),
    }),
    onSuccess: (data: any) => {
      setEntityMatches(data);
    },
    onError: (error: any) => {
      console.error('Entity resolution failed:', error);
    }
  });

  // Mock data for demo
  const mockEntities: ForensicEntity[] = [
    { id: '1', name: 'John Doe', type: 'person', risk_score: 85, connections: 12, last_activity: '2025-01-15' },
    { id: '2', name: 'Acme Corp', type: 'company', risk_score: 72, connections: 45, last_activity: '2025-01-14' },
    { id: '3', name: 'Account #1234', type: 'account', risk_score: 91, connections: 8, last_activity: '2025-01-15' },
    { id: '4', name: '123 Main St', type: 'address', risk_score: 45, connections: 3, last_activity: '2025-01-10' },
  ];

  const displayEntities = entities || mockEntities;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'person': return '👤';
      case 'company': return '🏢';
      case 'account': return '💳';
      case 'address': return '📍';
      default: return '📄';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10';
    if (score >= 60) return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10';
    if (score >= 40) return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10';
    return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10';
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forensic Analysis</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Entity resolution, network analysis, and pattern detection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entity List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {['All', 'Person', 'Company', 'Account'].map((filter) => (
                <button
                  key={filter}
                  className="px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  {filter}
                </button>
              ))}

              {/* AI Entity Resolution Button */}
              <button
                onClick={() => {
                  const entityData = {
                    entities: displayEntities.map(e => ({
                      id: e.id,
                      name: e.name,
                      type: e.type,
                      aliases: [],
                      context: `Risk score: ${e.risk_score}, connections: ${e.connections}`,
                      metadata: { risk_score: e.risk_score, connections: e.connections }
                    })),
                    context_data: {
                      investigation_type: 'fraud_detection',
                      total_entities: displayEntities.length
                    }
                  };
                  entityResolutionMutation.mutate(entityData);
                }}
                disabled={entityResolutionMutation.isPending}
                className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Brain className="h-3 w-3" />
                {entityResolutionMutation.isPending ? 'Analyzing...' : 'AI Resolve'}
              </button>
            </div>

            {/* Entity Cards */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                displayEntities.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => setSelectedEntity(entity)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedEntity?.id === entity.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getTypeIcon(entity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {entity.name}
                        </h3>
                        <p className="text-sm text-slate-500 capitalize">{entity.type}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${getRiskColor(entity.risk_score)}`}>
                            Risk: {entity.risk_score}
                          </span>
                          <span className="text-slate-400">
                            {entity.connections} connections
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* AI Entity Resolution Results */}
            {entityMatches.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Link className="h-5 w-5 text-blue-500" />
                  AI Entity Resolution Results
                </h3>
                <div className="space-y-3">
                  {entityMatches.map((match, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{match.entity_name_a}</span>
                          <span className="text-blue-500">↔</span>
                          <span className="font-medium">{match.entity_name_b}</span>
                        </div>
                        <span className="text-sm bg-blue-100 dark:bg-blue-500/20 px-2 py-1 rounded">
                          {(match.similarity_score * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {match.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedEntity ? (
              <div className="space-y-6">
                {/* Entity Header */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{getTypeIcon(selectedEntity.type)}</span>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {selectedEntity.name}
                        </h2>
                        <p className="text-slate-500 capitalize">{selectedEntity.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-semibold ${getRiskColor(selectedEntity.risk_score)}`}>
                      Risk Score: {selectedEntity.risk_score}
                    </span>
                  </div>
                </div>

                {/* Network Visualization Placeholder */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Network Graph</h3>
                    <Network className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center">
                    <p className="text-slate-400">Interactive network visualization</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                    <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">3</p>
                    <p className="text-sm text-slate-500">Red Flags</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                    <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">8</p>
                    <p className="text-sm text-slate-500">Documents</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                    <Clock className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">45</p>
                    <p className="text-sm text-slate-500">Transactions</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Select an Entity</h3>
                  <p className="text-slate-500 mt-1">Choose an entity from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
