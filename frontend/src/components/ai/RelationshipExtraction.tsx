import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Network,
  FileText,
  Users,
  Link,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  RefreshCw,
  Zap
} from 'lucide-react';
import { api } from '../../lib/api';

interface ExtractedRelationship {
  id: string;
  source_entity: {
    id: string;
    name: string;
    type: string;
  };
  target_entity: {
    id: string;
    name: string;
    type: string;
  };
  relationship_type: 'family' | 'business' | 'financial' | 'legal' | 'social' | 'other';
  confidence: number;
  evidence: string[];
  context: string;
  source_document?: string;
  extracted_at: string;
}

interface RelationshipExtractionProps {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
  }>;
  entities: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  onRelationshipAdd?: (relationship: ExtractedRelationship) => void;
  onRelationshipEdit?: (relationshipId: string, updates: Partial<ExtractedRelationship>) => void;
}

export function RelationshipExtraction({
  documents,
  entities,
  onRelationshipAdd,
  onRelationshipEdit
}: RelationshipExtractionProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [relationships, setRelationships] = useState<ExtractedRelationship[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState(0.5);

  // Mock relationships for demo
  const mockRelationships: ExtractedRelationship[] = [
    {
      id: 'rel_001',
      source_entity: { id: 'ent_001', name: 'John Smith', type: 'person' },
      target_entity: { id: 'ent_002', name: 'ABC Corp', type: 'company' },
      relationship_type: 'business',
      confidence: 0.89,
      evidence: ['CEO of ABC Corp', 'Authorized signatory'],
      context: 'John Smith is identified as the CEO and authorized signatory for ABC Corporation in multiple bank documents.',
      source_document: 'bank_statement_001.pdf',
      extracted_at: new Date().toISOString()
    },
    {
      id: 'rel_002',
      source_entity: { id: 'ent_003', name: 'Jane Doe', type: 'person' },
      target_entity: { id: 'ent_001', name: 'John Smith', type: 'person' },
      relationship_type: 'family',
      confidence: 0.76,
      evidence: ['Spouse relationship', 'Joint account holder'],
      context: 'Jane Doe is listed as the spouse of John Smith on joint bank account applications.',
      source_document: 'account_application.pdf',
      extracted_at: new Date().toISOString()
    },
    {
      id: 'rel_003',
      source_entity: { id: 'ent_002', name: 'ABC Corp', type: 'company' },
      target_entity: { id: 'ent_004', name: 'XYZ Bank', type: 'company' },
      relationship_type: 'financial',
      confidence: 0.92,
      evidence: ['Primary banking relationship', 'Account holder'],
      context: 'ABC Corporation maintains its primary business account with XYZ Bank.',
      source_document: 'bank_statement_002.pdf',
      extracted_at: new Date().toISOString()
    }
  ];

  // Initialize with mock data
  useMemo(() => {
    if (relationships.length === 0) {
      setRelationships(mockRelationships);
    }
  }, []);

  const extractRelationships = async () => {
    setIsExtracting(true);
    try {
      const response = await api.post('/ai/extract-relationships', {
        documents: selectedDocument ? documents.filter(d => d.id === selectedDocument) : documents,
        entities: entities
      });

      const newRelationships: ExtractedRelationship[] = response.relationships || [];
      setRelationships(prev => [...prev, ...newRelationships]);

      newRelationships.forEach(rel => onRelationshipAdd?.(rel));
    } catch (error) {
      console.error('Relationship extraction failed:', error);
      // Keep mock data for demo
    } finally {
      setIsExtracting(false);
    }
  };

  // Filter relationships
  const filteredRelationships = useMemo(() => {
    return relationships.filter(rel => {
      const matchesType = filterType === 'all' || rel.relationship_type === filterType;
      const meetsConfidence = rel.confidence >= minConfidence;
      return matchesType && meetsConfidence;
    });
  }, [relationships, filterType, minConfidence]);

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'family': return '👨‍👩‍👧‍👦';
      case 'business': return '💼';
      case 'financial': return '💰';
      case 'legal': return '⚖️';
      case 'social': return '🤝';
      default: return '🔗';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50 dark:bg-green-500/10';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
    return 'text-red-600 bg-red-50 dark:bg-red-500/10';
  };

  const relationshipTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'family', label: 'Family' },
    { value: 'business', label: 'Business' },
    { value: 'financial', label: 'Financial' },
    { value: 'legal', label: 'Legal' },
    { value: 'social', label: 'Social' },
    { value: 'other', label: 'Other' }
  ];

  const exportRelationships = (format: 'json' | 'csv') => {
    const data = filteredRelationships.map(rel => ({
      source_entity: rel.source_entity.name,
      source_type: rel.source_entity.type,
      relationship: rel.relationship_type,
      target_entity: rel.target_entity.name,
      target_type: rel.target_entity.type,
      confidence: rel.confidence,
      evidence: rel.evidence.join('; '),
      context: rel.context,
      source_document: rel.source_document
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relationships.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relationships.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Relationship Extraction
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered extraction of entity relationships from documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {filteredRelationships.length} relationships
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Extract Relationships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Document Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Source Documents</label>
                  <select
                    value={selectedDocument || ''}
                    onChange={(e) => setSelectedDocument(e.target.value || null)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                  >
                    <option value="">All documents ({documents.length})</option>
                    {documents.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extract Button */}
                <Button
                  onClick={extractRelationships}
                  disabled={isExtracting || documents.length === 0}
                  className="w-full"
                >
                  {isExtracting ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-1" />
                  )}
                  {isExtracting ? 'Extracting...' : 'Extract Relationships'}
                </Button>

                {/* Filters */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium mb-1">Relationship Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                    >
                      {relationshipTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Min Confidence: {(minConfidence * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={minConfidence}
                      onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Export Options */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm font-medium mb-2">Export</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportRelationships('json')}
                      disabled={filteredRelationships.length === 0}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportRelationships('csv')}
                      disabled={filteredRelationships.length === 0}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Relationships List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Extracted Relationships ({filteredRelationships.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRelationships.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No relationships extracted yet</p>
                  <p className="text-sm mt-1">
                    {relationships.length === 0
                      ? 'Run relationship extraction to analyze documents'
                      : 'Try adjusting your filters'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRelationships.map((relationship) => (
                    <Card key={relationship.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {getRelationshipIcon(relationship.relationship_type)}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {relationship.source_entity.name}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {relationship.relationship_type}
                                </span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {relationship.target_entity.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded capitalize ${getConfidenceColor(relationship.confidence)}`}>
                                  {(relationship.confidence * 100).toFixed(0)}% confidence
                                </span>
                                <span className="text-xs text-slate-500">
                                  {relationship.source_document && `From: ${relationship.source_document}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Context */}
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                          {relationship.context}
                        </p>

                        {/* Evidence */}
                        <div className="mb-3">
                          <div className="text-xs text-slate-500 mb-1">Supporting Evidence:</div>
                          <div className="flex flex-wrap gap-1">
                            {relationship.evidence.map((evidence, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded"
                              >
                                {evidence}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span>
                            Extracted {new Date(relationship.extracted_at).toLocaleDateString()}
                          </span>
                          <span>
                            {relationship.source_entity.type} → {relationship.target_entity.type}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics */}
      {relationships.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Network className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">{relationships.length}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Total Relationships</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">
                  {relationships.filter(r => r.confidence >= 0.8).length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">High Confidence</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">
                  {new Set(relationships.map(r => r.relationship_type)).size}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Relationship Types</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <FileText className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-amber-600">
                  {new Set(relationships.map(r => r.source_document).filter(Boolean)).size}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Source Documents</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}