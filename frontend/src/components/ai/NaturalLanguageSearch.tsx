import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Search,
  Mic,
  MicOff,
  MessageSquare,
  Brain,
  Sparkles,
  Clock,
  User,
  FileText,
  TrendingUp
} from 'lucide-react';
import { api } from '../../lib/api';

interface NLQuery {
  id: string;
  query: string;
  intent: 'search' | 'analyze' | 'summarize' | 'compare' | 'predict';
  entities: string[];
  filters: Record<string, any>;
  timestamp: string;
}

interface NLSearchResult {
  type: 'case' | 'transaction' | 'evidence' | 'analysis';
  id: string;
  title: string;
  relevance: number;
  snippet: string;
  metadata: Record<string, any>;
}

interface NaturalLanguageSearchProps {
  onResultClick?: (result: NLSearchResult) => void;
  onQuerySubmit?: (query: NLQuery) => void;
  placeholder?: string;
}

interface NLSuggestionsResponse {
  suggestions: string[];
}

interface NLQueryResponse {
  processedQuery: NLQuery;
  results: NLSearchResult[];
  explanation?: string;
}

export function NaturalLanguageSearch({
  onResultClick,
  onQuerySubmit,
  placeholder = "Ask me anything about cases, transactions, or evidence..."
}: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<NLSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length > 2) {
      generateSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const generateSuggestions = async (input: string) => {
    try {
      // This would call an AI service to generate query suggestions
      const response = await api.post<NLSuggestionsResponse>('/ai/nl-suggestions', { query: input });
      setSuggestions(response.suggestions || []);
    } catch {
      // Fallback suggestions
      setSuggestions([
        `Find cases related to "${input}"`,
        `Show transactions for "${input}"`,
        `Analyze evidence about "${input}"`,
        `Compare cases involving "${input}"`
      ]);
    }
  };


  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const processNaturalLanguageQuery = async (userQuery: string) => {
    setIsLoading(true);

    try {
      // Add to conversation
      setConversation(prev => [...prev, {
        type: 'user',
        content: userQuery,
        timestamp: new Date().toISOString()
      }]);

      // Process with AI
      const response = await api.post<NLQueryResponse>('/ai/nl-query', {
        query: userQuery,
        context: conversation.slice(-5) // Last 5 messages for context
      });

      const nlQuery: NLQuery = response.processedQuery;
      const searchResults: NLSearchResult[] = response.results || [];

      // Add AI response to conversation
      setConversation(prev => [...prev, {
        type: 'ai',
        content: response.explanation || 'Here are the results for your query.',
        timestamp: new Date().toISOString()
      }]);

      setResults(searchResults);
      onQuerySubmit?.(nlQuery);

    } catch (error) {
      console.error('NL query processing failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      processNaturalLanguageQuery(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    processNaturalLanguageQuery(suggestion);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'case': return <FileText className="h-4 w-4" />;
      case 'transaction': return <TrendingUp className="h-4 w-4" />;
      case 'evidence': return <Search className="h-4 w-4" />;
      case 'analysis': return <Brain className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'text-green-600 bg-green-50 dark:bg-green-500/10';
    if (relevance >= 0.6) return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10';
    if (relevance >= 0.4) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
    return 'text-slate-600 bg-slate-50 dark:bg-slate-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Natural Language Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      className={`p-1 rounded ${
                        isListening
                          ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={!query.trim() || isLoading}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Voice Listening Indicator */}
              {isListening && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <div className="animate-pulse">
                    <Mic className="h-4 w-4" />
                  </div>
                  Listening... Speak your query
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                <div className="text-xs text-slate-500 mb-2">Try asking:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-500/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.type === 'ai' && (
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={`${result.type}_${result.id}`}
                  onClick={() => onResultClick?.(result)}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {result.title}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded ${getRelevanceColor(result.relevance)}`}>
                            {(result.relevance * 100).toFixed(0)}% relevant
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {result.snippet}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="capitalize">{result.type}</span>
                          {result.metadata.date && (
                            <span>{new Date(result.metadata.date).toLocaleDateString()}</span>
                          )}
                          {result.metadata.amount && (
                            <span>${result.metadata.amount.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Example Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Search Queries</h4>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <div>• "Show me high-risk cases from last month"</div>
                <div>• "Find transactions over $10,000"</div>
                <div>• "What evidence do we have for case #123"</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Analysis Queries</h4>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <div>• "Summarize the risk trends"</div>
                <div>• "Compare cases involving John Doe"</div>
                <div>• "What patterns do you see in the data"</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}