import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  Brain,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  Clock,
  Search,
  Star,
  StarOff
} from 'lucide-react';

interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: 'prediction' | 'analysis' | 'recommendation' | 'alert' | 'summary';
  confidence: number;
  tags: string[];
  created_by: {
    id: string;
    name: string;
    avatar?: string;
  };
  created_at: string;
  case_id?: string;
  model_used?: string;
  votes: {
    upvotes: string[]; // user IDs
    downvotes: string[];
  };
  comments: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
    created_at: string;
  }>;
  is_shared: boolean;
  visibility: 'private' | 'team' | 'public';
}

interface SharedAIInsightsProps {
  insights: AIInsight[];
  currentUserId: string;
  onInsightClick?: (insight: AIInsight) => void;
  onVote?: (insightId: string, voteType: 'up' | 'down') => void;
  onShare?: (insightId: string) => void;
  onToggleFavorite?: (insightId: string) => void;
  favorites?: string[]; // insight IDs
}

export function SharedAIInsights({
  insights,
  currentUserId,
  onInsightClick,
  onVote,
  onShare,
  onToggleFavorite,
  favorites = []
}: SharedAIInsightsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'confidence'>('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filter and sort insights
  const filteredInsights = useMemo(() => {
    const filtered = insights.filter(insight => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = insight.title.toLowerCase().includes(searchLower);
        const matchesContent = insight.content.toLowerCase().includes(searchLower);
        const matchesTags = insight.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesTitle && !matchesContent && !matchesTags) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && insight.type !== typeFilter) return false;

      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(insight.id)) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular': {
          const aScore = a.votes.upvotes.length - a.votes.downvotes.length;
          const bScore = b.votes.upvotes.length - b.votes.downvotes.length;
          return bScore - aScore;
        }
        case 'confidence':
          return b.confidence - a.confidence;
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [insights, searchTerm, typeFilter, sortBy, showFavoritesOnly, favorites]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return '🔮';
      case 'analysis': return '📊';
      case 'recommendation': return '💡';
      case 'alert': return '🚨';
      case 'summary': return '📋';
      default: return '🤖';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 dark:bg-green-500/10';
    if (confidence >= 0.6) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
    return 'text-red-600 bg-red-50 dark:bg-red-500/10';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return date.toLocaleDateString();
  };

  const hasUserVoted = (insight: AIInsight, voteType: 'up' | 'down') => {
    const votes = voteType === 'up' ? insight.votes.upvotes : insight.votes.downvotes;
    return votes.includes(currentUserId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Shared AI Insights
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Collaborative AI-generated insights and analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {filteredInsights.length} insights
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
            >
              <option value="all">All Types</option>
              <option value="prediction">Predictions</option>
              <option value="analysis">Analysis</option>
              <option value="recommendation">Recommendations</option>
              <option value="alert">Alerts</option>
              <option value="summary">Summaries</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="confidence">Highest Confidence</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded transition-colors ${
                showFavoritesOnly
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {showFavoritesOnly ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
              Favorites
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsights.map((insight) => (
          <Card
            key={insight.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onInsightClick?.(insight)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getInsightIcon(insight.type)}</span>
                  <div>
                    <CardTitle className="text-base line-clamp-2">
                      {insight.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(insight.confidence)}`}>
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {insight.type}
                      </span>
                    </div>
                  </div>
                </div>
                {onToggleFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(insight.id);
                    }}
                    className={`p-1 rounded ${
                      favorites.includes(insight.id)
                        ? 'text-yellow-500'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {favorites.includes(insight.id) ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                {insight.content}
              </p>

              {/* Tags */}
              {insight.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {insight.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {insight.tags.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{insight.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{insight.votes.upvotes.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{insight.comments.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimestamp(insight.created_at)}</span>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                {insight.created_by.avatar ? (
                  <img
                    src={insight.created_by.avatar}
                    alt={insight.created_by.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-500" />
                  </div>
                )}
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {insight.created_by.name}
                </span>
                {insight.is_shared && (
                  <Share2 className="h-3 w-3 text-blue-500 ml-auto" />
                )}
              </div>

              {/* Vote Buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote?.(insight.id, 'up');
                  }}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                    hasUserVoted(insight, 'up')
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ThumbsUp className="h-3 w-3" />
                  Upvote
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote?.(insight.id, 'down');
                  }}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                    hasUserVoted(insight, 'down')
                      ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ThumbsDown className="h-3 w-3" />
                  Downvote
                </button>
                {onShare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(insight.id);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-800 ml-auto"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No insights found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || typeFilter !== 'all' || showFavoritesOnly
                ? 'Try adjusting your filters or search terms'
                : 'AI insights will appear here as they are generated and shared'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}