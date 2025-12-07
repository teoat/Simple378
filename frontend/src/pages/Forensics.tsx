import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Network, Eye, AlertTriangle, FileText, Clock, Brain, Link, FileSearch, Upload, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import toast from 'react-hot-toast';
import { ProcessingPipeline } from '../components/forensics/ProcessingPipeline';
import ForceGraph2D from 'react-force-graph-2d';

interface ForensicEntity {
  id: string;
  name: string;
  type: 'person' | 'company' | 'account' | 'address';
  risk_score: number;
  connections: number;
  last_activity: string;
  entity_name_a?: string;
  entity_name_b?: string;
  similarity_score?: number;
  reason?: string;
}

interface AnalysisResult {
  file_path: string;
  file_type: string;
  metadata: Record<string, unknown>;
  manipulation_analysis: {
    ela_score: number;
    is_suspicious: boolean;
    details: string;
  };
  summary: string;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
}

interface EntityResolutionRequest {
  entity_id: string;
  search_criteria: Record<string, unknown>;
}

interface EntityResolutionResponse {
  matches: ForensicEntity[];
  confidence: number;
}

export function Forensics() {
  const [activeTab, setActiveTab] = useState<'entity' | 'document'>('entity');
  
  // Graph Refs
  const fgRef = useRef<any>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 0, height: 0 });
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Document Forensics State
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Entity Forensics State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<ForensicEntity | null>(null);
  const [entityMatches, setEntityMatches] = useState<ForensicEntity[]>([]);

  // Calculate generic graph data based on selected entity
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });

  useEffect(() => {
    if (graphContainerRef.current) {
      setGraphDimensions({
        width: graphContainerRef.current.offsetWidth,
        height: graphContainerRef.current.offsetHeight
      });
    }
  }, [selectedEntity, activeTab]);

  // Generate graph data when selectedEntity changes
  const graphDataMemo = useMemo(() => {
    if (!selectedEntity) {
      return { nodes: [], links: [] };
    }

    // Generate mock network for visualization
    const nodes: GraphNode[] = [{ id: selectedEntity.id, name: selectedEntity.name, val: 20, color: '#3b82f6' }];
    const links: GraphLink[] = [];
    const connectionCount = Math.min(selectedEntity.connections, 10); // Limit for visual sanity

    for (let i = 0; i < connectionCount; i++) {
      const id = `conn-${i}`;
      nodes.push({ id, name: `Associate ${i+1}`, val: 10, color: '#64748b' });
      links.push({ source: selectedEntity.id, target: id });
    }

    return { nodes, links };
  }, [selectedEntity]);

  useEffect(() => {
    setGraphData(graphDataMemo);
  }, [graphDataMemo]);

  // Entity Query
  const { data: entities, isLoading } = useQuery({
    queryKey: ['forensics', 'entities'],
    queryFn: () => apiRequest<ForensicEntity[]>('/forensics/entities'),
    retry: false,
  });

  // AI Entity Resolution mutation
  const entityResolutionMutation = useMutation({
    mutationFn: (entityData: EntityResolutionRequest) => apiRequest<EntityResolutionResponse>('/forensics/entity-resolution', {
      method: 'POST',
      body: JSON.stringify(entityData),
    }),
    onSuccess: (data: EntityResolutionResponse) => {
      setEntityMatches(data.matches);
      toast.success('Entity resolution complete');
    },
    onError: (error: unknown) => {
      console.error('Entity resolution failed:', error);
      toast.error('Resolution failed');
    }
  });

   // Document Analysis Mutation
  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/forensics/analyze', {
          method: 'POST',
          headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData
      });
      if (!res.ok) throw new Error('Analysis failed');
      return res.json();
    },
    onSuccess: (data: AnalysisResult) => {
      setTimeout(() => setAnalysisResult(data), 1000); // Slight delay to show 'Completing' state if we wanted
    },
    onError: (err) => {
      toast.error('Analysis failed: ' + (err as Error).message);
    }
  });

  const displayEntities = entities || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setAnalysisResult(null); // Reset
          analyzeMutation.mutate(e.target.files[0]);
      }
  };

  const getPipelineStatus = () => {
      if (analyzeMutation.isPending) return 'processing';
      if (analyzeMutation.isError) return 'error';
      if (analyzeMutation.isSuccess && analysisResult) return 'completed';
      return 'idle';
  };

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forensics & Investigation</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Deep dive analysis for entities and documents
            </p>
          </div>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('entity')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'entity' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
              >
                  Entity Resolution
              </button>
              <button 
                onClick={() => setActiveTab('document')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'document' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
              >
                  Document Forensics
              </button>
          </div>
        </div>

        {activeTab === 'entity' ? (
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
                  const entityData: EntityResolutionRequest = {
                    entity_id: 'some-id',
                    search_criteria: {
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
                    }
                  };
                  entityResolutionMutation.mutate(entityData);
                }}
                disabled={entityResolutionMutation.isPending || displayEntities.length < 2}
                className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Brain className="h-3 w-3" />
                {entityResolutionMutation.isPending ? 'Analyzing...' : 'AI Resolve'}
              </button>
            </div>

            {/* Entity Cards */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : displayEntities.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No entities found.</p>
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
                            {entity.connections} conns
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
                          {((match.similarity_score || 0) * 100).toFixed(0)}% match
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

                {/* Network Visualization */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Network Graph</h3>
                    <Network className="w-5 h-5 text-slate-400" />
                  </div>
                  <div ref={graphContainerRef} className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden relative">
                    {/* Force Graph */}
                    {graphDimensions.width > 0 && (
                      <ForceGraph2D
                         ref={fgRef}
                         width={graphDimensions.width}
                         height={300}
                         graphData={graphData}
                         nodeLabel="name"
                          nodeColor={(node: any) => node.color}
                         nodeRelSize={6}
                         linkColor={() => "#cbd5e1"}
                      />
                    )}
                    {selectedEntity.connections === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
                            No connections found
                        </div>
                    )}
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
        ) : (
            // Document Forensics Content
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center hover:border-blue-500 transition-colors">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Upload Document for Analysis</h3>
                        <p className="text-slate-500 mb-6">Support for PDF, JPG, PNG. Max size 25MB.</p>
                        
                        <input 
                            type="file" 
                            id="doc-upload" 
                            className="hidden" 
                            onChange={handleFileUpload}
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={analyzeMutation.isPending}
                        />
                        <label 
                            htmlFor="doc-upload" 
                            className={`inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors ${analyzeMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {analyzeMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <FileSearch className="w-4 h-4" />}
                            {analyzeMutation.isPending ? "Analyzing..." : "Select Document"}
                        </label>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            <Brain className="w-4 h-4" /> Analysis Capabilities
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Metadata Extraction (EXIF/XMP)</li>
                            <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Manipulation Detection (ELA & Signatures)</li>
                            <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Security Scan (Virus/Malware)</li>
                        </ul>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[400px]">
                         <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-slate-400" />
                                    Analysis Pipeline
                                </h3>
                            </div>
                            
                            {analyzeMutation.isPending || analysisResult ? (
                                <div className="p-6">
                                     <ProcessingPipeline status={getPipelineStatus()} />
                                     
                                     {analysisResult && (
                                         <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                             {/* Verdict */}
                                            <div className={`p-4 rounded-lg flex items-start gap-4 mb-6 ${
                                                analysisResult.manipulation_analysis.is_suspicious 
                                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800' 
                                                : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800'
                                            }`}>
                                                {analysisResult.manipulation_analysis.is_suspicious 
                                                    ? <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                                                    : <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                                                }
                                                <div>
                                                    <h4 className={`font-bold ${
                                                        analysisResult.manipulation_analysis.is_suspicious ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'
                                                    }`}>
                                                        {analysisResult.manipulation_analysis.is_suspicious ? "Tampering Detected" : "No Anomalies Found"}
                                                    </h4>
                                                    <p className="text-sm mt-1 opacity-90">{analysisResult.summary}</p>
                                                </div>
                                            </div>

                                            {/* Metadata Grid */}
                                            <div>
                                                <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-slate-500">Metadata</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                                                        <span className="block text-xs text-slate-400">File Type</span>
                                                        <span className="font-medium truncate">{analysisResult.file_type}</span>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                                                        <span className="block text-xs text-slate-400">Software</span>
                                                        <span className="font-medium truncate">{analysisResult.metadata.Software as string || "N/A"}</span>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                                                        <span className="block text-xs text-slate-400">Created</span>
                                                        <span className="font-medium truncate">{analysisResult.metadata.CreateDate as string || "Unknown"}</span>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                                                        <span className="block text-xs text-slate-400">ELA Score</span>
                                                        <span className="font-medium truncate">{analysisResult.manipulation_analysis.ela_score?.toFixed(3) || "0.00"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                         </div>
                                     )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                                    <FileSearch className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Upload a file to trigger the detailed analysis pipeline</p>
                                </div>
                            )}
                    </div>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
}
