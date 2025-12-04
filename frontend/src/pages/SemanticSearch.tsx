import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, Target, Clock, Filter, Calendar, BarChart3, Zap } from 'lucide-react';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import toast from 'react-hot-toast';

interface SearchResult {
  document_id: string;
  content: string;
  score: number;
  semantic_score?: number;
  keyword_score?: number;
  metadata: {
    case_id?: string;
    subject_id?: string;
    file_type?: string;
    filename?: string;
    uploaded_by?: string;
  };
}

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'semantic' | 'hybrid'>('semantic');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([]);

  const fileTypeOptions = ['pdf', 'image', 'text', 'document'];
  const riskLevelOptions = ['low', 'medium', 'high', 'critical'];

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get search suggestions
  const { data: suggestionData } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const response = await fetch(`/api/v1/vector/suggestions?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.suggestions || [];
    },
    enabled: query.length >= 2,
  });

  // Update suggestions when data changes
  useEffect(() => {
    if (suggestionData) {
      setSuggestions(suggestionData);
      setShowSuggestions(suggestionData.length > 0);
    }
  }, [suggestionData]);

  const { data: searchResults, refetch, isLoading } = useQuery({
    queryKey: ['vector-search', query, searchMode, dateFrom, dateTo, selectedFileTypes, selectedRiskLevels],
    queryFn: async () => {
      if (!query.trim()) return [];
      setIsSearching(true);
      try {
        const endpoint = searchMode === 'hybrid' ? '/api/v1/vector/hybrid-search' : '/api/v1/vector/search';
        const filters: Record<string, string | string[]> = {};

        if (dateFrom) filters.date_from = dateFrom;
        if (dateTo) filters.date_to = dateTo;
        if (selectedFileTypes.length > 0) filters.file_types = selectedFileTypes;
        if (selectedRiskLevels.length > 0) filters.risk_levels = selectedRiskLevels;

        const requestBody: {
          query: string;
          limit: number;
          score_threshold: number;
          keyword_boost?: number;
          filters?: Record<string, string | string[]>;
        } = {
          query: query.trim(),
          limit: 20,
          score_threshold: 0.6,
        };

        if (searchMode === 'hybrid') {
          requestBody.keyword_boost = 0.3;
        }

        if (Object.keys(filters).length > 0) {
          requestBody.filters = filters;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const results = await response.json();
        return results;
      } finally {
        setIsSearching(false);
      }
    },
    enabled: false, // Only run when manually triggered
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    refetch();
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const getFileTypeIcon = (fileType?: string) => {
    // Return appropriate icon based on file type
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('text')) return '📝';
    return '📄';
  };

  return (
    <PageErrorBoundary>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Semantic Document Search
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search through indexed documents using natural language queries
          </p>
        </div>

        {/* Search Controls */}
        <div className={`max-w-4xl mx-auto space-y-4 ${isMobile ? 'px-4' : ''}`}>
          {/* Search Mode Toggle & Personalization */}
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-center items-center space-x-4'}`}>
            <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${isMobile ? 'flex flex-col w-full' : 'flex'}`}>
              <button
                onClick={() => setSearchMode('semantic')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'semantic'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                } ${isMobile ? 'flex-1' : ''}`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                {isMobile ? 'Semantic' : 'Semantic Search'}
              </button>
              <button
                onClick={() => setSearchMode('hybrid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'hybrid'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                } ${isMobile ? 'flex-1' : ''}`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                {isMobile ? 'Hybrid' : 'Hybrid Search'}
              </button>
            </div>

            {/* Personalization Buttons */}
            <div className={`flex ${isMobile ? 'justify-center space-x-4' : 'space-x-2'}`}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors ${
                  isMobile ? 'flex flex-col items-center space-y-1' : ''
                }`}
                title="Search History"
              >
                <History className="w-5 h-5" />
                {isMobile && <span className="text-xs">History</span>}
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors ${
                  isMobile ? 'flex flex-col items-center space-y-1' : ''
                }`}
                title="Search Templates"
              >
                <Bookmark className="w-5 h-5" />
                {isMobile && <span className="text-xs">Templates</span>}
              </button>
            </div>
          </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search for documents, evidence, or case details..."
                className="w-full pl-10 pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors"
                  aria-label="Toggle advanced filters"
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <Search className="w-4 h-4 inline mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    aria-label="Filter from date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    aria-label="Filter to date"
                  />
                </div>

                {/* File Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    File Types
                  </label>
                  <div className="space-y-1">
                    {fileTypeOptions.map(type => (
                      <label key={type} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={selectedFileTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFileTypes([...selectedFileTypes, type]);
                            } else {
                              setSelectedFileTypes(selectedFileTypes.filter(t => t !== type));
                            }
                          }}
                          className="mr-2"
                        />
                        {type.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Risk Levels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <BarChart3 className="w-4 h-4 inline mr-1" />
                    Risk Levels
                  </label>
                  <div className="space-y-1">
                    {riskLevelOptions.map(level => (
                      <label key={level} className="flex items-center text-sm capitalize">
                        <input
                          type="checkbox"
                          checked={selectedRiskLevels.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRiskLevels([...selectedRiskLevels, level]);
                            } else {
                              setSelectedRiskLevels(selectedRiskLevels.filter(l => l !== level));
                            }
                          }}
                          className="mr-2"
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search History Panel */}
          {showHistory && searchHistory?.history && (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Search History
                </h3>
              </div>
              <div className="p-2">
                {searchHistory.history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No search history yet</p>
                ) : (
                  searchHistory.history.map((item: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleHistorySelect(item)}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.query}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.result_count} results • {item.search_type} • {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Search className="w-4 h-4 text-gray-400 ml-2" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Search Templates Panel */}
          {showTemplates && searchTemplates?.templates && (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Bookmark className="w-5 h-5 mr-2" />
                  Search Templates
                </h3>
              </div>
              <div className="p-2">
                {searchTemplates.templates.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No templates saved yet</p>
                ) : (
                  searchTemplates.templates.map((template: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {template.description || 'No description'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                            "{template.query}"
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {template.is_public && <Users className="w-3 h-3 text-blue-500" title="Shared template" />}
                          <Bookmark className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Search Results ({searchResults.length})
              </h2>
              {searchResults.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing most relevant matches
                </span>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search query or upload more documents for indexing.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {searchResults.map((result: SearchResult, index: number) => (
                  <div
                    key={`${result.document_id}-${index}`}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getFileTypeIcon(result.metadata.file_type)}
                        </span>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {result.metadata.filename || `Document ${result.document_id.slice(0, 8)}`}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {result.document_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                          <Target className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {formatScore(result.score)}
                          </span>
                        </div>
                        {searchMode === 'hybrid' && result.semantic_score !== undefined && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <div>Semantic: {formatScore(result.semantic_score)}</div>
                            <div>Keywords: {formatScore(result.keyword_score ?? 0)}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                        {result.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        {result.metadata.file_type && (
                          <span className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{result.metadata.file_type}</span>
                          </span>
                        )}
                        {result.metadata.case_id && (
                          <span>Case: {result.metadata.case_id.slice(0, 8)}...</span>
                        )}
                        {result.metadata.subject_id && (
                          <span>Subject: {result.metadata.subject_id.slice(0, 8)}...</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Indexed recently</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        {!searchResults && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Modes Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                    Semantic Search
                  </h3>
                </div>
                <div className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                  <p>• <strong>AI-Powered:</strong> Understands meaning and context</p>
                  <p>• <strong>Smart Matching:</strong> Finds related concepts, not just keywords</p>
                  <p>• <strong>Best for:</strong> Exploring ideas and discovering connections</p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
                  <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                    Hybrid Search
                  </h3>
                </div>
                <div className="space-y-2 text-green-800 dark:text-green-200 text-sm">
                  <p>• <strong>Dual Approach:</strong> Combines AI understanding with exact terms</p>
                  <p>• <strong>Balanced Results:</strong> More precise and relevant matches</p>
                  <p>• <strong>Best for:</strong> Finding specific information quickly</p>
                </div>
              </div>
            </div>

            {/* Features Overview */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-3">
                Advanced Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-800 dark:text-purple-200 text-sm">
                <div>
                  <p className="font-medium mb-1">🔍 Smart Filtering</p>
                  <p>Filter by date ranges, file types, and risk levels</p>
                </div>
                <div>
                  <p className="font-medium mb-1">💡 Auto-Suggestions</p>
                  <p>Get intelligent query suggestions as you type</p>
                </div>
                <div>
                  <p className="font-medium mb-1">📊 Relevance Scoring</p>
                  <p>Results ranked by semantic similarity and importance</p>
                </div>
                <div>
                  <p className="font-medium mb-1">🔄 Real-time Updates</p>
                  <p>Search across newly indexed documents instantly</p>
                </div>
              </div>
            </div>

            {/* Personalization Features */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-100 mb-3">
                Personalization Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-indigo-800 dark:text-indigo-200 text-sm">
                <div>
                  <p className="font-medium mb-1 flex items-center">
                    <History className="w-4 h-4 mr-1" />
                    Search History
                  </p>
                  <p>Access your recent searches and quickly repeat them</p>
                </div>
                <div>
                  <p className="font-medium mb-1 flex items-center">
                    <Bookmark className="w-4 h-4 mr-1" />
                    Saved Templates
                  </p>
                  <p>Create and reuse search configurations for common tasks</p>
                </div>
                <div>
                  <p className="font-medium mb-1 flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Smart Recommendations
                  </p>
                  <p>Get personalized suggestions based on your search patterns</p>
                </div>
                <div>
                  <p className="font-medium mb-1 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Team Collaboration
                  </p>
                  <p>Share search templates and collaborate on investigations</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>💡 <strong>Tips:</strong> Try queries like "suspicious transactions", "evidence of fraud", or "financial irregularities"</p>
                <p>🎯 <strong>Pro Tip:</strong> Use Hybrid Search for precise results, Semantic Search for exploration</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageErrorBoundary>
  );
}