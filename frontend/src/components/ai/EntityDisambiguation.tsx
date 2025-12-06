import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Users,
  Link,
  Unlink,
  AlertTriangle,
  CheckCircle,
  Search,
  Merge,
  Split,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../../lib/api';

interface Entity {
  id: string;
  name: string;
  type: 'person' | 'company' | 'account' | 'address';
  aliases: string[];
  confidence: number;
  sources: string[];
  metadata: Record<string, any>;
}

interface EntityMatch {
  entity1: Entity;
  entity2: Entity;
  similarity_score: number;
  match_reasons: string[];
  confidence: number;
  suggested_action: 'merge' | 'separate' | 'review';
}

interface EntityDisambiguationProps {
  entities: Entity[];
  onEntityMerge?: (entityIds: string[]) => void;
  onEntitySeparate?: (entityId: string) => void;
  onEntityUpdate?: (entityId: string, updates: Partial<Entity>) => void;
}

export function EntityDisambiguation({
  entities,
  onEntityMerge,
  onEntitySeparate,
  onEntityUpdate
}: EntityDisambiguationProps) {
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<EntityMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter entities based on search and type
  const filteredEntities = useMemo(() => {
    return entities.filter(entity => {
      const matchesSearch = !searchTerm ||
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = filterType === 'all' || entity.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [entities, searchTerm, filterType]);

  // Analyze entities for potential matches
  const analyzeEntities = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post('/ai/entity-disambiguation', {
        entities: filteredEntities
      });

      setMatches(response.matches || []);
    } catch (error) {
      console.error('Entity analysis failed:', error);
      // Generate mock matches for demo
      generateMockMatches();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockMatches = () => {
    const mockMatches: EntityMatch[] = [];

    // Find similar names
    for (let i = 0; i < filteredEntities.length; i++) {
      for (let j = i + 1; j < filteredEntities.length; j++) {
        const entity1 = filteredEntities[i];
        const entity2 = filteredEntities[j];

        // Simple similarity check
        const name1 = entity1.name.toLowerCase();
        const name2 = entity2.name.toLowerCase();

        let similarity = 0;
        const reasons: string[] = [];

        // Exact match
        if (name1 === name2) {
          similarity = 1.0;
          reasons.push('Exact name match');
        }
        // Partial match
        else if (name1.includes(name2) || name2.includes(name1)) {
          similarity = 0.8;
          reasons.push('Partial name match');
        }
        // Same first name
        else if (name1.split(' ')[0] === name2.split(' ')[0]) {
          similarity = 0.6;
          reasons.push('Same first name');
        }

        if (similarity > 0.5) {
          mockMatches.push({
            entity1,
            entity2,
            similarity_score: similarity,
            match_reasons: reasons,
            confidence: similarity,
            suggested_action: similarity > 0.8 ? 'merge' : 'review'
          });
        }
      }
    }

    setMatches(mockMatches);
  };

  const toggleEntitySelection = (entityId: string) => {
    setSelectedEntities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entityId)) {
        newSet.delete(entityId);
      } else {
        newSet.add(entityId);
      }
      return newSet;
    });
  };

  const mergeSelectedEntities = () => {
    if (selectedEntities.size >= 2) {
      onEntityMerge?.(Array.from(selectedEntities));
      setSelectedEntities(new Set());
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return '👤';
      case 'company': return '🏢';
      case 'account': return '💳';
      case 'address': return '📍';
      default: return '📄';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50 dark:bg-green-500/10';
    if (score >= 0.7) return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10';
    if (score >= 0.5) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
    return 'text-red-600 bg-red-50 dark:bg-red-500/10';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'merge': return 'text-green-600 bg-green-50 dark:bg-green-500/10';
      case 'separate': return 'text-red-600 bg-red-50 dark:bg-red-500/10';
      case 'review': return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  const entityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'person', label: 'People' },
    { value: 'company', label: 'Companies' },
    { value: 'account', label: 'Accounts' },
    { value: 'address', label: 'Addresses' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Entity Disambiguation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered entity matching and deduplication
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {filteredEntities.length} entities
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Entities ({filteredEntities.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search entities..."
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
                    {entityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEntities.map((entity) => (
                  <div
                    key={entity.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedEntities.has(entity.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => toggleEntitySelection(entity.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEntities.has(entity.id)}
                      onChange={() => toggleEntitySelection(entity.id)}
                      className="rounded"
                    />
                    <span className="text-lg">{getEntityIcon(entity.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {entity.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded capitalize ${getConfidenceColor(entity.confidence)}`}>
                          {entity.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(entity.confidence)}`}>
                          {(entity.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      {entity.aliases.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-slate-500">Aliases:</span>
                          {entity.aliases.slice(0, 2).map((alias, idx) => (
                            <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {alias}
                            </span>
                          ))}
                          {entity.aliases.length > 2 && (
                            <span className="text-xs text-slate-500">
                              +{entity.aliases.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredEntities.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No entities found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>

              {/* Bulk Actions */}
              {selectedEntities.size > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedEntities.size} entities selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEntities(new Set())}
                      >
                        Clear
                      </Button>
                      {selectedEntities.size >= 2 && (
                        <Button
                          size="sm"
                          onClick={mergeSelectedEntities}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Merge className="h-3 w-3 mr-1" />
                          Merge Entities
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Entity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={analyzeEntities}
                  disabled={isAnalyzing || filteredEntities.length < 2}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-1" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze for Matches'}
                </Button>

                {matches.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      Potential Matches ({matches.length})
                    </h4>

                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {matches.map((match, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded ${getActionColor(match.suggested_action)}`}>
                              {match.suggested_action.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(match.confidence)}`}>
                              {(match.similarity_score * 100).toFixed(0)}% similar
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{getEntityIcon(match.entity1.type)}</span>
                              <span className="text-sm font-medium">{match.entity1.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{getEntityIcon(match.entity2.type)}</span>
                              <span className="text-sm font-medium">{match.entity2.name}</span>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="text-xs text-slate-500 mb-1">Match reasons:</div>
                            <div className="flex flex-wrap gap-1">
                              {match.match_reasons.map((reason, reasonIdx) => (
                                <span
                                  key={reasonIdx}
                                  className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matches.length === 0 && !isAnalyzing && (
                  <div className="text-center py-8 text-slate-500">
                    <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No matches found</p>
                    <p className="text-xs mt-1">Run analysis to identify potential duplicates</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Entity Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Entities:</span>
                  <span className="font-medium">{entities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Filtered:</span>
                  <span className="font-medium">{filteredEntities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Potential Matches:</span>
                  <span className="font-medium">{matches.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Selected:</span>
                  <span className="font-medium">{selectedEntities.size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}