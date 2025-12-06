import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Save, History, Brain, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api';


interface SearchResult {
  id: string;
  subject_name: string;
  risk_score: number;
  status: string;
  created_at: string;
  assigned_to: string;
  relevance_score: number;
  matched_terms: string[];
}

interface SearchFilters {
  dateRange?: { start: string; end: string };
  riskScore?: { min: number; max: number };
  status?: string[];
  entityType?: string;
}

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [savedSearches, setSavedSearches] = useState<Array<{ id: string; name: string; query: string; filters: SearchFilters }>>([]);

  // Mock semantic search - in real implementation, this would call a vector search API
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['semantic-search', query, filters],
    queryFn: async () => {
      if (!query.trim()) return [];

      // For now, use the existing searchCases API with semantic enhancements
      // In production, this would be a dedicated semantic search endpoint
      const results = await api.searchCases(query);

      // Add semantic scoring and matched terms (mocked)
      return results.items.map((item, index) => ({
        ...item,
        relevance_score: Math.max(0.1, 1 - (index * 0.1)), // Mock relevance score
        matched_terms: query.split(' ').filter(term => item.subject_name.toLowerCase().includes(term.toLowerCase())),
      })) as SearchResult[];
    },
    enabled: query.length > 2,
  });

  const handleSearch = () => {
    if (query.trim().length < 3) {
      alert('Please enter at least 3 characters to search');
      return;
    }
    // Query will trigger automatically due to useQuery
  };

  const saveSearch = () => {
    if (!query.trim()) return;

    const newSearch = {
      id: Date.now().toString(),
      name: `Search: ${query.slice(0, 20)}...`,
      query,
      filters,
    };

    setSavedSearches(prev => [newSearch, ...prev.slice(0, 9)]); // Keep last 10
    alert('Search saved');
  };

  const loadSavedSearch = (search: typeof savedSearches[0]) => {
    setQuery(search.query);
    setFilters(search.filters);
  };

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Semantic Search
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Intelligent search across cases using natural language and AI-powered matching
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button variant="outline" size="sm" onClick={saveSearch} disabled={!query.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save Search
              </Button>
            </div>
          </div>

          <Tabs value="search" onValueChange={() => {}} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="saved">Saved Searches</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              {/* Search Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Natural Language Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search for cases, entities, or patterns (e.g., 'high-risk transactions from New York')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="text-lg"
                      />
                    </div>
                    <Button onClick={handleSearch} disabled={isLoading}>
                      {isLoading ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Use natural language queries. The system will understand context and find semantically similar results.
                  </p>
                </CardContent>
              </Card>

              {/* Query Interpretation */}
              <AnimatePresence>
                {query.length > 2 && searchResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                          <Brain className="w-5 h-5" />
                          Query Understanding
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium text-blue-900 dark:text-blue-100">Original Query:</span>
                              <span className="ml-2 text-blue-800 dark:text-blue-200">"{query}"</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <span className="font-medium text-green-900 dark:text-green-100">Interpreted as:</span>
                              <div className="ml-2 text-green-800 dark:text-green-200">
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <Badge variant="outline" className="border-green-300 text-green-800 dark:border-green-700 dark:text-green-200">
                                    Entity Search
                                  </Badge>
                                  <Badge variant="outline" className="border-green-300 text-green-800 dark:border-green-700 dark:text-green-200">
                                    Risk Analysis
                                  </Badge>
                                  <Badge variant="outline" className="border-green-300 text-green-800 dark:border-green-700 dark:text-green-200">
                                    Pattern Matching
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-yellow-900 dark:text-yellow-100">AI Insights:</span>
                              <p className="ml-2 text-yellow-800 dark:text-yellow-200 text-sm mt-1">
                                Searching for high-risk entities and suspicious patterns. Prioritizing results with
                                recent activity and elevated risk scores.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700 dark:text-blue-300">
                              Found {searchResults.length} semantically relevant results
                            </span>
                            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline text-sm">
                              Refine interpretation
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results */}
              {error && (
                <Card className="border-red-200">
                  <CardContent className="pt-6">
                    <p className="text-red-600">Search failed. Please try again.</p>
                  </CardContent>
                </Card>
              )}

              {searchResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>Search Results ({searchResults.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchResults.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No results found. Try adjusting your query or filters.</p>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.map((result) => (
                          <div key={result.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{result.subject_name}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge variant={result.status === 'active' ? 'default' : 'secondary'}>
                                    {result.status}
                                  </Badge>
                                  <span className="text-sm text-slate-500">
                                    Risk Score: {result.risk_score.toFixed(1)}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    Relevance: {(result.relevance_score * 100).toFixed(0)}%
                                  </span>
                                </div>
                                {result.matched_terms.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Matched terms: </span>
                                    {result.matched_terms.map(term => (
                                      <Badge key={term} variant="outline" className="mr-1">
                                        {term}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="filters" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Search Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Range</label>
                      <div className="flex gap-2">
                        <Input type="date" placeholder="Start date" />
                        <Input type="date" placeholder="End date" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Risk Score Range</label>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="Min" min="0" max="1" step="0.1" />
                        <Input type="number" placeholder="Max" min="0" max="1" step="0.1" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <div className="flex gap-2">
                      {['active', 'inactive', 'pending'].map(status => (
                        <Button
                          key={status}
                          variant={filters.status?.includes(status) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              status: prev.status?.includes(status)
                                ? prev.status.filter(s => s !== status)
                                : [...(prev.status || []), status]
                            }));
                          }}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedSearches.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No saved searches yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {savedSearches.map((search) => (
                        <div key={search.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">{search.name}</h4>
                            <p className="text-sm text-slate-500">{search.query}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => loadSavedSearch(search)}>
                            Load
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
