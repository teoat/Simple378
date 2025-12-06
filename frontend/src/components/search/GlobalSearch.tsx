import { useNavigate } from 'react-router-dom';

// ... inside component ...
  const navigate = useNavigate();

// ... inside handleResultClick ...
  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Default navigation based on result type
      if (result._index === 'cases') {
        navigate(`/cases/${result.id}`);
      } else if (result._index === 'transactions') {
        // Navigate to case that contains this transaction
        // This would need additional logic to find the case ID
        console.log('Transaction clicked:', result);
      }
    }
    setIsOpen(false);
    setQuery('');
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'case': return '📁';
      case 'transaction': return '💳';
      case 'evidence': return '📄';
      default: return '📄';
    }
  };

  const getResultSubtitle = (result: SearchResult) => {
    if (result._index === 'cases') {
      return `Risk Score: ${result.risk_score || 0}`;
    } else if (result._index === 'transactions') {
      return `$${result.amount?.toLocaleString() || 0} - ${result.date || ''}`;
    }
    return '';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              title="Save/Load presets"
            >
              <Bookmark className="h-3 w-3 text-slate-400" />
            </button>
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length > 0 || suggestions?.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Filters and Facets */}
          {query.length > 2 && (
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                <Filter className="h-3 w-3" />
                Filter by:
              </div>
              <div className="flex gap-2 mb-3">
                {['cases', 'transactions'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedFilters.includes(filter)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Facets */}
              {showFacets && searchResults?.facets && (
                <div className="space-y-2">
                  {Object.entries(searchResults.facets).map(([indexName, facets]: [string, any]) => (
                    <div key={indexName} className="text-xs">
                      <div className="font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">
                        {indexName} Filters:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(facets).map(([facetName, facetData]: [string, any]) => (
                          <div key={facetName} className="flex flex-wrap gap-1">
                            {Object.entries(facetData).slice(0, 3).map(([value, count]: [string, any]) => (
                              <button
                                key={value}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                                onClick={() => {
                                  // Add facet filter
                                  setSelectedFilters(prev => [...prev, `${facetName}:${value}`]);
                                }}
                              >
                                {facetName}: {value} ({count})
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-slate-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2" />
              Searching...
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchResults?.hits && (
            <div className="max-h-80 overflow-y-auto">
              {searchResults.hits.length > 0 ? (
                searchResults.hits.map((result: SearchResult) => (
                  <button
                    key={`${result._index}_${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getResultIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {result.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {getResultSubtitle(result)}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {result._index} • {result.type}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : query.length > 2 ? (
                <div className="p-4 text-center text-slate-500">
                  No results found for "{query}"
                </div>
              ) : null}
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && !searchResults?.hits?.length && suggestions?.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">Suggestions:</div>
              </div>
              {suggestions.map((suggestion: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setQuery(suggestion)}
                  className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Presets Dropdown */}
      {showPresets && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Search Presets</h4>
            <button
              onClick={() => setShowPresets(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Save Current Search */}
          <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Save Current Search</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
              />
              <button
                onClick={() => {
                  if (presetName && (query || selectedFilters.length > 0)) {
                    savePresetMutation.mutate({
                      name: presetName,
                      config: {
                        query,
                        filters: selectedFilters,
                        timestamp: new Date().toISOString()
                      }
                    });
                  }
                }}
                disabled={!presetName || (!query && selectedFilters.length === 0) || savePresetMutation.isPending}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {savePresetMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Saved Presets */}
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Saved Presets</div>
            {presets && presets.length > 0 ? (
              <div className="space-y-2">
                {presets.map((preset: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(preset.config.query || '');
                      setSelectedFilters(preset.config.filters || []);
                      setShowPresets(false);
                      setIsOpen(true);
                    }}
                    className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{preset.name}</div>
                      <div className="text-xs text-slate-500">
                        {preset.config.query ? `"${preset.config.query}"` : 'Filters only'}
                        {preset.config.filters?.length > 0 && ` + ${preset.config.filters.length} filters`}
                      </div>
                    </div>
                    <Clock className="h-3 w-3 text-slate-400" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-4">
                No saved presets yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}