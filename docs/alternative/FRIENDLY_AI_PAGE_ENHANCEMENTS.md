# Friendly AI Page Enhancements

## Overview

This document details specific UI/UX enhancements to integrate Friendly AI features into each major page of AntiGravity. Each enhancement focuses on transparency, explainability, and human-in-the-loop decision-making.

---

## 📊 Dashboard Page Enhancements

### 1. AI-Powered Widget System

#### Current State
- Static widget arrangement
- No AI personalization
- No predictive insights

#### Enhanced Experience

```tsx
// src/pages/Dashboard.tsx - Enhanced Widget System

interface AIWidget {
  id: string;
  type: 'metric' | 'chart' | 'insight' | 'alert' | 'recommendation';
  title: string;
  aiConfidence?: number;
  aiExplanation?: string;
  aiReasoning?: AIReasoning;
  isAIDriven?: boolean;
  refreshInterval?: number;
}

interface AIReasoning {
  factors: Array<{
    name: string;
    weight: number;
    contribution: string;
  }>;
  confidenceBreakdown: {
    factor: string;
    score: number;
  }[];
  alternatives?: Alternative[];
}

interface Alternative {
  title: string;
  confidence: number;
  reason: string;
}

export const DashboardPage: React.FC = () => {
  const [widgets, setWidgets] = useState<AIWidget[]>([]);
  const [aiInsights, setAiInsights] = useState<Insight[]>([]);
  const { user } = useAuth();

  // AI-driven widget personalization
  useEffect(() => {
    const personalizeWidgets = async () => {
      // Get AI recommendations for dashboard layout
      const recommendations = await aiService.getDashboardLayout({
        userId: user.id,
        role: user.role,
        preferences: user.preferences,
        workPattern: await analyzeUserWorkPattern(),
      });

      // Score and rank recommendations
      const scored = scoreRecommendations(recommendations);
      
      // Merge with user preferences
      const personalized = mergeWithUserPreferences(scored);
      
      setWidgets(personalized);
    };

    personalizeWidgets();
  }, [user]);

  return (
    <div className="dashboard">
      {/* AI Assistant Panel */}
      <AIAssistantPanel
        onSuggestAction={handleAISuggestion}
        onExplainMetric={handleExplainMetric}
      />

      {/* Main Widgets Grid */}
      <div className="widgets-grid">
        {widgets.map(widget => (
          <AIWidget
            key={widget.id}
            widget={widget}
            onLearnMore={handleWidgetLearnMore}
            onOverride={handleWidgetOverride}
            onFeedback={handleWidgetFeedback}
          />
        ))}
      </div>

      {/* AI Insights Stream */}
      <InsightsStream
        insights={aiInsights}
        onDismiss={handleDismissInsight}
        onAction={handleInsightAction}
      />

      {/* AI Settings */}
      <AIBehaviorSettings
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};
```

#### AI Widget Component

```tsx
interface AIWidgetProps {
  widget: AIWidget;
  onLearnMore: (widget: AIWidget) => void;
  onOverride: (widget: AIWidget) => void;
  onFeedback: (widget: AIWidget, feedback: Feedback) => void;
}

export const AIWidget: React.FC<AIWidgetProps> = ({
  widget,
  onLearnMore,
  onOverride,
  onFeedback,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  return (
    <div className="ai-widget">
      <div className="widget-header">
        <h3>{widget.title}</h3>
        
        {/* AI Confidence Badge */}
        {widget.isAIDriven && widget.aiConfidence && (
          <ConfidenceBadge
            confidence={widget.aiConfidence}
            onClick={() => setShowExplanation(!showExplanation)}
            title="Click to see AI reasoning"
          />
        )}

        {/* Widget Menu */}
        <WidgetMenu
          onLearnMore={() => onLearnMore(widget)}
          onOverride={() => onOverride(widget)}
          onRefresh={() => refreshWidget(widget)}
          onCustomize={() => customizeWidget(widget)}
        />
      </div>

      {/* Main Content */}
      <div className="widget-content">
        {renderWidgetContent(widget)}
      </div>

      {/* AI Explanation Drawer */}
      {showExplanation && widget.aiReasoning && (
        <ExplanationDrawer
          reasoning={widget.aiReasoning}
          alternatives={widget.aiReasoning.alternatives}
          onClose={() => setShowExplanation(false)}
          onProvideFeedback={(type) => setFeedback(type)}
        />
      )}

      {/* Feedback Form */}
      {feedback && (
        <FeedbackForm
          onSubmit={(fb) => {
            onFeedback(widget, fb);
            setFeedback(null);
          }}
          onCancel={() => setFeedback(null)}
        />
      )}

      {/* AI Suggestion Indicator */}
      {widget.isAIDriven && (
        <div className="ai-indicator">
          <AIIcon /> Suggested by AI
        </div>
      )}
    </div>
  );
};
```

#### Explanation Drawer Component

```tsx
interface ExplanationDrawerProps {
  reasoning: AIReasoning;
  alternatives?: Alternative[];
  onClose: () => void;
  onProvideFeedback: (type: FeedbackType) => void;
}

export const ExplanationDrawer: React.FC<ExplanationDrawerProps> = ({
  reasoning,
  alternatives,
  onClose,
  onProvideFeedback,
}) => {
  return (
    <Drawer onClose={onClose}>
      <div className="explanation-content">
        <h3>Why is AI suggesting this?</h3>

        {/* Confidence Breakdown */}
        <section className="confidence-breakdown">
          <h4>Confidence Factors ({reasoning.confidenceBreakdown.length})</h4>
          
          <div className="factors-list">
            {reasoning.confidenceBreakdown.map((factor) => (
              <div key={factor.factor} className="factor-item">
                <div className="factor-name">{factor.factor}</div>
                <div className="factor-score">
                  <ProgressBar value={factor.score} max={1} />
                  <span>{(factor.score * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Factor Details */}
        <section className="factor-details">
          <h4>How each factor contributes</h4>
          
          {reasoning.factors.map((factor) => (
            <div key={factor.name} className="factor-explanation">
              <h5>{factor.name} ({(factor.weight * 100).toFixed(0)}% weight)</h5>
              <p>{factor.contribution}</p>
            </div>
          ))}
        </section>

        {/* Alternative Suggestions */}
        {alternatives && alternatives.length > 0 && (
          <section className="alternatives">
            <h4>Alternative suggestions</h4>
            
            {alternatives.map((alt, idx) => (
              <div key={idx} className="alternative-item">
                <div className="alt-title">{alt.title}</div>
                <div className="alt-confidence">
                  {(alt.confidence * 100).toFixed(0)}% confidence
                </div>
                <div className="alt-reason">{alt.reason}</div>
              </div>
            ))}
          </section>
        )}

        {/* Feedback Section */}
        <section className="feedback-section">
          <h4>Was this helpful?</h4>
          
          <div className="feedback-buttons">
            <button
              onClick={() => onProvideFeedback('helpful')}
              className="btn-feedback"
            >
              👍 Helpful
            </button>
            <button
              onClick={() => onProvideFeedback('not_helpful')}
              className="btn-feedback"
            >
              👎 Not helpful
            </button>
            <button
              onClick={() => onProvideFeedback('incorrect')}
              className="btn-feedback"
            >
              ❌ Incorrect
            </button>
          </div>
        </section>
      </div>
    </Drawer>
  );
};
```

### 2. AI Assistant Panel

```tsx
interface AISuggestion {
  id: string;
  type: 'action' | 'insight' | 'alert' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action?: () => Promise<void>;
  dismissible: boolean;
}

export const AIAssistantPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [expanded, setExpanded] = useState(false);

  // Get next suggested action
  useEffect(() => {
    const getNextAction = async () => {
      const action = await aiService.suggestNextAction({
        currentContext: getCurrentContext(),
        userRole: getCurrentUserRole(),
        userPreferences: getCurrentUserPreferences(),
      });

      if (action) {
        setSuggestions([action, ...suggestions]);
      }
    };

    const interval = setInterval(getNextAction, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAcceptSuggestion = async (suggestion: AISuggestion) => {
    if (suggestion.action) {
      await suggestion.action();
      trackAIInteraction('accepted', suggestion);
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    }
  };

  const handleDismissSuggestion = (suggestion: AISuggestion) => {
    if (suggestion.dismissible) {
      trackAIInteraction('dismissed', suggestion);
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    }
  };

  return (
    <div className={`ai-assistant-panel ${expanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="toggle-btn"
        onClick={() => setExpanded(!expanded)}
      >
        <AIIcon />
        {!expanded && suggestions.length > 0 && (
          <Badge count={suggestions.length} />
        )}
      </button>

      {expanded && (
        <div className="suggestions-list">
          {suggestions.length === 0 ? (
            <div className="no-suggestions">
              <p>No suggestions at this moment</p>
              <small>AI is monitoring for optimization opportunities</small>
            </div>
          ) : (
            suggestions.map(suggestion => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAccept={() => handleAcceptSuggestion(suggestion)}
                onDismiss={() => handleDismissSuggestion(suggestion)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
```

### 3. Insights Stream

```tsx
export const InsightsStream: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const stream = aiService.streamInsights({
      userId: getCurrentUserId(),
      categories: ['anomaly', 'pattern', 'opportunity', 'risk'],
      refreshInterval: 60000, // 1 minute
    });

    stream.on('insight', (insight: Insight) => {
      // Prioritize and limit to top 5
      setInsights(prev => 
        sortByPriority([insight, ...prev]).slice(0, 5)
      );
    });

    return () => stream.close();
  }, []);

  return (
    <div className="insights-stream">
      <h2>AI Insights</h2>
      
      <div className="insights-container">
        {insights.map(insight => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onExplore={handleExploreInsight}
            onAction={handleInsightAction}
            onDismiss={handleDismissInsight}
          />
        ))}
      </div>
    </div>
  );
};

interface InsightCardProps {
  insight: Insight;
  onExplore: (insight: Insight) => void;
  onAction: (insight: Insight, action: Action) => void;
  onDismiss: (insight: Insight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onExplore,
  onAction,
  onDismiss,
}) => {
  return (
    <div className={`insight-card insight-${insight.type}`}>
      <div className="insight-header">
        <div className="insight-type-badge">{insight.type}</div>
        <div className="insight-severity">
          <SeverityIndicator level={insight.severity} />
        </div>
        <button
          className="close-btn"
          onClick={() => onDismiss(insight)}
        >
          ✕
        </button>
      </div>

      <h3>{insight.title}</h3>
      <p className="insight-description">{insight.description}</p>

      {/* Key Metrics */}
      <div className="insight-metrics">
        {insight.analysis.dataPoints && (
          <span>{insight.analysis.dataPoints} data points analyzed</span>
        )}
        {insight.analysis.confidence && (
          <span>
            {(insight.analysis.confidence * 100).toFixed(0)}% confidence
          </span>
        )}
      </div>

      {/* Confidence Score */}
      <div className="confidence-display">
        <small>AI Confidence</small>
        <ProgressBar 
          value={insight.analysis.confidence} 
          max={1}
          showLabel={true}
        />
      </div>

      {/* Recommendations */}
      {insight.recommendations && insight.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Recommendations</h4>
          {insight.recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation">
              <p>{rec.title}</p>
              {rec.steps && (
                <ul>
                  {rec.steps.map((step, stepIdx) => (
                    <li key={stepIdx}>{step}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="insight-actions">
        <button
          className="btn-primary"
          onClick={() => onExplore(insight)}
        >
          Learn More
        </button>
        
        {insight.actions && insight.actions.map((action, idx) => (
          <button
            key={idx}
            className="btn-secondary"
            onClick={() => onAction(insight, action)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔍 Case List Page Enhancements

### 1. AI-Enhanced Search & Filters

```tsx
interface AISearchEnhancement {
  suggestQuery?: string;
  suggestConfidence?: number;
  suggestReason?: string;
  historicallySuccessful?: boolean;
  suggestFilters?: Filter[];
}

export const CaseListSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AISearchEnhancement | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Real-time AI query enhancement
  const handleQueryChange = async (value: string) => {
    setQuery(value);

    if (value.length > 2) {
      const enhancement = await aiService.enhanceSearch({
        query: value,
        userRole: getCurrentUserRole(),
        previousSearches: getUserSearchHistory(),
      });

      setAiSuggestions(enhancement);
    }
  };

  return (
    <div className="ai-search-box">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search cases... (try 'high risk Q4' or 'aws violations')"
          className="search-input"
        />

        <button
          className="toggle-ai"
          onClick={() => setExpanded(!expanded)}
          title="AI Search Assistant"
        >
          <AIIcon />
        </button>
      </div>

      {/* AI Suggestions Dropdown */}
      {aiSuggestions && expanded && (
        <div className="ai-suggestions">
          {/* Query Suggestion */}
          {aiSuggestions.suggestQuery && (
            <div className="suggestion-item suggestion-query">
              <div className="suggestion-header">
                <span className="label">AI Suggestion</span>
                <ConfidenceBadge 
                  confidence={aiSuggestions.suggestConfidence || 0.8}
                />
              </div>
              
              <p className="suggested-query">
                {aiSuggestions.suggestQuery}
              </p>
              
              {aiSuggestions.suggestReason && (
                <small className="reason">
                  Why: {aiSuggestions.suggestReason}
                </small>
              )}

              {aiSuggestions.historicallySuccessful && (
                <small className="success-indicator">
                  ✓ Historically successful
                </small>
              )}

              <button
                className="btn-use-suggestion"
                onClick={() => setQuery(aiSuggestions.suggestQuery!)}
              >
                Use This Search
              </button>
            </div>
          )}

          {/* Filter Suggestions */}
          {aiSuggestions.suggestFilters && 
           aiSuggestions.suggestFilters.length > 0 && (
            <div className="suggestion-item suggestion-filters">
              <div className="suggestion-header">
                <span className="label">Recommended Filters</span>
              </div>

              <div className="filters-list">
                {aiSuggestions.suggestFilters.map((filter, idx) => (
                  <FilterChip
                    key={idx}
                    filter={filter}
                    onApply={() => applyFilter(filter)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 2. AI-Enhanced Case Cards

```tsx
interface AICaseEnhancement {
  riskScore: number;
  riskFactors: string[];
  suggestedAction?: string;
  nextStep?: string;
  confidence: number;
}

interface CaseCardProps {
  case: Case;
  aiEnhancement?: AICaseEnhancement;
  onViewDetails: (caseId: string) => void;
  onTakeAction: (caseId: string, action: string) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  case: caseData,
  aiEnhancement,
  onViewDetails,
  onTakeAction,
}) => {
  const [showAIDetails, setShowAIDetails] = useState(false);

  return (
    <div className="case-card">
      <div className="card-header">
        <div className="case-id">{caseData.id}</div>

        {/* AI Risk Score Badge */}
        {aiEnhancement && (
          <div 
            className="ai-risk-badge"
            onClick={() => setShowAIDetails(!showAIDetails)}
          >
            <span className="risk-score">
              {(aiEnhancement.riskScore * 100).toFixed(0)}
            </span>
            <span className="risk-label">AI Risk</span>
            <small className="confidence">
              {(aiEnhancement.confidence * 100).toFixed(0)}% confident
            </small>
          </div>
        )}
      </div>

      <div className="card-body">
        <h4>{caseData.title}</h4>
        <p className="case-summary">{caseData.summary}</p>

        {/* Traditional Metrics */}
        <div className="case-metrics">
          <span>Status: {caseData.status}</span>
          <span>Amount: ${caseData.amount.toLocaleString()}</span>
          <span>Updated: {formatDate(caseData.updatedAt)}</span>
        </div>

        {/* AI Risk Factors */}
        {aiEnhancement && showAIDetails && (
          <div className="ai-risk-details">
            <div className="risk-factors">
              <h5>What raised the risk?</h5>
              <ul>
                {aiEnhancement.riskFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>

            {aiEnhancement.suggestedAction && (
              <div className="suggested-action">
                <h5>Recommended Action</h5>
                <p>{aiEnhancement.suggestedAction}</p>
              </div>
            )}

            {aiEnhancement.nextStep && (
              <div className="next-step">
                <h5>Next Step</h5>
                <p>{aiEnhancement.nextStep}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card-footer">
        <button
          className="btn-view"
          onClick={() => onViewDetails(caseData.id)}
        >
          View Details
        </button>

        {aiEnhancement?.suggestedAction && (
          <button
            className="btn-ai-action"
            onClick={() => onTakeAction(
              caseData.id,
              aiEnhancement.suggestedAction!
            )}
          >
            Take Suggested Action
          </button>
        )}
      </div>
    </div>
  );
};
```

### 3. Bulk Operations with AI

```tsx
export const BulkActionsPanel: React.FC = () => {
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [aiBulkSuggestion, setAiBulkSuggestion] = useState<BulkActionSuggestion | null>(null);

  // Analyze selected cases for bulk action
  useEffect(() => {
    const analyzeBulkAction = async () => {
      if (selectedCases.length > 0) {
        const suggestion = await aiService.suggestBulkAction({
          caseIds: selectedCases,
          userRole: getCurrentUserRole(),
          casesData: getSelectedCasesData(),
        });

        setAiBulkSuggestion(suggestion);
      }
    };

    analyzeBulkAction();
  }, [selectedCases]);

  return (
    <div className="bulk-actions-panel">
      <div className="selected-count">
        {selectedCases.length} cases selected
      </div>

      {/* AI Bulk Action Suggestion */}
      {aiBulkSuggestion && (
        <div className="ai-bulk-suggestion">
          <div className="suggestion-header">
            <span className="ai-label">AI suggests</span>
            <ConfidenceBadge 
              confidence={aiBulkSuggestion.confidence}
            />
          </div>

          <div className="suggestion-content">
            <h4>{aiBulkSuggestion.action}</h4>
            <p>{aiBulkSuggestion.reasoning}</p>

            {aiBulkSuggestion.affectedCount && (
              <small>
                Would affect {aiBulkSuggestion.affectedCount} cases
              </small>
            )}
          </div>

          <div className="suggestion-actions">
            <button
              className="btn-execute"
              onClick={() => executeBulkAction(aiBulkSuggestion)}
            >
              Execute
            </button>
            <button
              className="btn-view-details"
              onClick={() => viewBulkDetails(aiBulkSuggestion)}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Manual Actions */}
      <div className="manual-actions">
        <ManualBulkActions
          selectedCount={selectedCases.length}
          onAction={handleBulkAction}
        />
      </div>
    </div>
  );
};
```

---

## ⚖️ Reconciliation Page Enhancements

### 1. AI Match Suggestions with Explanations

```tsx
interface AIMatchWithExplanation {
  match: Match;
  confidence: number;
  signals: MatchSignal[];
  alternatives: Alternative[];
  explanation: string;
  recommendation: 'strong' | 'moderate' | 'weak';
}

export const ReconciliationMatchSuggestion: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<AIMatchWithExplanation | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);

  return (
    <div className="match-suggestion">
      {/* Confidence Score with Visual */}
      <div className="confidence-header">
        <div className="score-display">
          <div className="score-circle">
            <div className="score-value">
              {(selectedMatch!.confidence * 100).toFixed(0)}%
            </div>
          </div>

          <div className="confidence-label">
            Confidence Score
          </div>
        </div>

        <div className="recommendation-badge">
          <span className={`badge badge-${selectedMatch!.recommendation}`}>
            {selectedMatch!.recommendation.toUpperCase()} MATCH
          </span>
        </div>

        <button
          className="toggle-explanation"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? '▼' : '▶'} Show Explanation
        </button>
      </div>

      {/* AI Explanation Section */}
      {showExplanation && (
        <div className="explanation-section">
          <h3>Why is this a match?</h3>
          <p className="main-explanation">{selectedMatch!.explanation}</p>

          {/* Signal Breakdown */}
          <div className="signals-breakdown">
            <h4>Matching Signals</h4>
            
            {selectedMatch!.signals.map((signal) => (
              <div key={signal.type} className="signal-item">
                <div className="signal-header">
                  <span className="signal-type">{signal.type}</span>
                  <span className="signal-score">
                    {(signal.score * 100).toFixed(0)}%
                  </span>
                </div>
                <ProgressBar value={signal.score} max={1} />
                <p className="signal-explanation">{signal.explanation}</p>

                {/* Data Used */}
                {signal.dataUsed && (
                  <div className="data-used">
                    <small>Based on: {signal.dataUsed.join(', ')}</small>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Alternative Matches */}
          {selectedMatch!.alternatives.length > 0 && (
            <div className="alternatives-section">
              <h4>Other Possible Matches</h4>
              
              {selectedMatch!.alternatives.map((alt, idx) => (
                <div key={idx} className="alternative-suggestion">
                  <div className="alt-confidence">
                    {(alt.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="alt-details">
                    <p className="alt-reason">{alt.reason}</p>
                    <button
                      className="btn-switch"
                      onClick={() => switchToAlternative(alt)}
                    >
                      Switch to this match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Override Option */}
          <div className="override-section">
            <button
              className="btn-override"
              onClick={() => openOverrideDialog(selectedMatch!)}
            >
              Override with Different Match
            </button>
          </div>
        </div>
      )}

      {/* Decision Section */}
      <div className="decision-section">
        <button
          className="btn-accept"
          onClick={() => acceptMatch(selectedMatch!)}
        >
          Accept Match
        </button>
        <button
          className="btn-reject"
          onClick={() => rejectMatch(selectedMatch!)}
        >
          Reject Match
        </button>
        <button
          className="btn-need-review"
          onClick={() => flagForReview(selectedMatch!)}
        >
          Flag for Review
        </button>
      </div>

      {/* User Feedback Loop */}
      <div className="feedback-prompt">
        <p>Does this explanation help?</p>
        <button onClick={() => provideFeedback('helpful')}>
          Yes, clear explanation
        </button>
        <button onClick={() => provideFeedback('needs_more')}>
          Need more details
        </button>
        <button onClick={() => provideFeedback('confusing')}>
          Confusing, improve it
        </button>
      </div>
    </div>
  );
};
```

### 2. Real-Time Bulk Matching with AI Supervision

```tsx
interface BulkMatchingProgress {
  total: number;
  completed: number;
  accepted: number;
  rejected: number;
  flagged: number;
  aiSuggestions: AIMatchWithExplanation[];
  currentSuggestion?: AIMatchWithExplanation;
  estimatedTime: number;
  acceptanceRate: number;
}

export const BulkMatchingPanel: React.FC = () => {
  const [progress, setProgress] = useState<BulkMatchingProgress | null>(null);
  const [autoAccept, setAutoAccept] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);

  // Subscribe to bulk matching stream
  useEffect(() => {
    const subscription = aiService.streamBulkMatching({
      autoAcceptThreshold: autoAccept ? confidenceThreshold : 1.0,
      onProgress: setProgress,
    });

    return () => subscription.unsubscribe();
  }, [autoAccept, confidenceThreshold]);

  if (!progress) return null;

  return (
    <div className="bulk-matching-panel">
      {/* Progress Header */}
      <div className="progress-header">
        <h3>Bulk Reconciliation in Progress</h3>
        
        <div className="progress-stats">
          <div className="stat">
            <span className="label">Total Cases</span>
            <span className="value">{progress.total}</span>
          </div>
          <div className="stat">
            <span className="label">Completed</span>
            <span className="value">{progress.completed}</span>
          </div>
          <div className="stat">
            <span className="label">Acceptance Rate</span>
            <span className="value">
              {(progress.acceptanceRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="stat">
            <span className="label">Est. Time</span>
            <span className="value">{formatTime(progress.estimatedTime)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-visualization">
        <ProgressBar 
          value={progress.completed} 
          max={progress.total}
          showLabel={true}
        />
        
        <div className="progress-breakdown">
          <div className="segment accepted">
            {progress.accepted} accepted
          </div>
          <div className="segment rejected">
            {progress.rejected} rejected
          </div>
          <div className="segment flagged">
            {progress.flagged} flagged
          </div>
        </div>
      </div>

      {/* Current Match Suggestion */}
      {progress.currentSuggestion && (
        <div className="current-match">
          <h4>Next Match</h4>
          
          <MatchCard 
            match={progress.currentSuggestion}
            onAccept={() => acceptCurrentMatch()}
            onReject={() => rejectCurrentMatch()}
            onFlag={() => flagCurrentMatch()}
          />

          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              onClick={() => acceptCurrentMatch()}
              className="btn-quick"
            >
              ✓ Accept (A)
            </button>
            <button 
              onClick={() => rejectCurrentMatch()}
              className="btn-quick"
            >
              ✕ Reject (R)
            </button>
            <button 
              onClick={() => flagCurrentMatch()}
              className="btn-quick"
            >
              🚩 Flag (F)
            </button>
          </div>
        </div>
      )}

      {/* AI Settings */}
      <div className="ai-settings">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={autoAccept}
            onChange={(e) => setAutoAccept(e.target.checked)}
          />
          <span>Auto-accept matches above</span>
          <input
            type="number"
            min="0"
            max="100"
            value={confidenceThreshold * 100}
            onChange={(e) => setConfidenceThreshold(e.target.value / 100)}
            disabled={!autoAccept}
          />
          <span>% confidence</span>
        </label>

        <small className="info">
          With auto-accept enabled, matching at {(confidenceThreshold * 100).toFixed(0)}%+ confidence will be automatically accepted
        </small>
      </div>

      {/* Statistics */}
      <div className="stats-panel">
        <h4>Session Statistics</h4>
        <div className="stat-cards">
          <StatCard 
            title="Avg Confidence"
            value={calculateAvgConfidence(progress).toFixed(1)}
            unit="%"
          />
          <StatCard 
            title="Matches/Min"
            value={calculateMatchesPerMin(progress).toFixed(1)}
          />
          <StatCard 
            title="High-Risk Flags"
            value={progress.flagged}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## 📈 Search Analytics Page Enhancements

### 1. AI-Powered Insights Dashboard

```tsx
interface AIInsightCard {
  id: string;
  type: 'critical' | 'opportunity' | 'trend';
  title: string;
  description: string;
  dataPoints: any[];
  recommendation: string;
  estimatedImpact: string;
  confidence: number;
  visualization?: string;
}

export const SearchAnalyticsPage: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<AIInsightCard[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<AIInsightCard | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      const insights = await aiService.generateSearchInsights({
        timeRange: '7d',
        topicsOfInterest: getUserTopics(),
      });

      setAiInsights(insights);
    };

    fetchInsights();
  }, []);

  return (
    <div className="search-analytics-page">
      {/* AI Insights Stream */}
      <section className="ai-insights-section">
        <h2>AI-Powered Insights</h2>

        <div className="insights-grid">
          {aiInsights.map(insight => (
            <AIInsightCard
              key={insight.id}
              insight={insight}
              onClick={() => setSelectedInsight(insight)}
              selected={selectedInsight?.id === insight.id}
            />
          ))}
        </div>
      </section>

      {/* Insight Details Panel */}
      {selectedInsight && (
        <section className="insight-details-panel">
          <InsightDetailsPanel
            insight={selectedInsight}
            onClose={() => setSelectedInsight(null)}
            onAction={handleInsightAction}
          />
        </section>
      )}

      {/* Traditional Analytics */}
      <section className="traditional-analytics">
        <AnalyticsCharts />
      </section>
    </div>
  );
};

interface AIInsightCardProps {
  insight: AIInsightCard;
  onClick: () => void;
  selected: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onClick,
  selected,
}) => {
  return (
    <div 
      className={`ai-insight-card ${selected ? 'selected' : ''} ${insight.type}`}
      onClick={onClick}
    >
      <div className="card-header">
        <TypeBadge type={insight.type} />
        <ConfidenceBadge confidence={insight.confidence} />
      </div>

      <h3>{insight.title}</h3>
      <p className="description">{insight.description}</p>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat">
          <span className="label">Data Points</span>
          <span className="value">{insight.dataPoints.length}</span>
        </div>
        <div className="stat">
          <span className="label">Impact</span>
          <span className="value">{insight.estimatedImpact}</span>
        </div>
      </div>

      {/* Mini Visualization */}
      {insight.visualization && (
        <div className="mini-viz">
          {renderMiniChart(insight.visualization)}
        </div>
      )}

      <button className="btn-explore">
        Explore Insight
      </button>
    </div>
  );
};

interface InsightDetailsPanelProps {
  insight: AIInsightCard;
  onClose: () => void;
  onAction: (insight: AIInsightCard, action: string) => void;
}

export const InsightDetailsPanel: React.FC<InsightDetailsPanelProps> = ({
  insight,
  onClose,
  onAction,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="insight-details-panel">
      <button className="close-btn" onClick={onClose}>✕</button>

      <h2>{insight.title}</h2>

      {/* Full Description */}
      <section className="description-section">
        <h3>What's happening?</h3>
        <p>{insight.description}</p>
      </section>

      {/* Data Deep Dive */}
      <section className="data-section">
        <h3>Data Analysis</h3>
        <div className="data-points">
          {insight.dataPoints.map((point, idx) => (
            <DataPoint key={idx} data={point} />
          ))}
        </div>
      </section>

      {/* Recommendation */}
      <section className="recommendation-section">
        <h3>AI Recommendation</h3>
        <div className="recommendation-box">
          <p>{insight.recommendation}</p>
          <small className="confidence">
            Based on {(insight.confidence * 100).toFixed(0)}% confidence
          </small>
        </div>
      </section>

      {/* Estimated Impact */}
      <section className="impact-section">
        <h3>Estimated Impact</h3>
        <div className="impact-box">
          <p>{insight.estimatedImpact}</p>
        </div>
      </section>

      {/* Actions */}
      <div className="action-buttons">
        <button
          className="btn-primary"
          onClick={() => onAction(insight, 'implement')}
        >
          Implement Recommendation
        </button>
        <button
          className="btn-secondary"
          onClick={() => onAction(insight, 'schedule')}
        >
          Schedule for Later
        </button>
        <button
          className="btn-secondary"
          onClick={() => onAction(insight, 'dismiss')}
        >
          Dismiss
        </button>
      </div>

      {/* Similar Insights */}
      <section className="similar-insights">
        <h3>Related Insights</h3>
        {/* List similar insights */}
      </section>
    </div>
  );
};
```

### 2. Predictive Analytics with Confidence

```tsx
export const PredictiveAnalyticsSection: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      const preds = await aiService.getPredictiveAnalytics({
        metric: 'search_volume',
        horizon: '30d',
        confidenceLevel: 0.95,
      });

      setPredictions(preds);
    };

    fetchPredictions();
  }, []);

  return (
    <div className="predictive-section">
      <h2>Forecast</h2>

      {/* Prediction Cards */}
      <div className="predictions-grid">
        {predictions.map(pred => (
          <PredictionCard
            key={pred.id}
            prediction={pred}
            onSelect={() => setSelectedPrediction(pred)}
            selected={selectedPrediction?.id === pred.id}
          />
        ))}
      </div>

      {/* Selected Prediction Details */}
      {selectedPrediction && (
        <div className="prediction-details">
          <h3>{selectedPrediction.metric}</h3>

          {/* Forecast Chart */}
          <div className="forecast-chart">
            <ForecastChart prediction={selectedPrediction} />
          </div>

          {/* Confidence Intervals */}
          <div className="confidence-bands">
            <h4>Confidence Intervals</h4>
            <div className="confidence-display">
              <div className="band high">
                <span className="label">95% CI</span>
                <span className="range">
                  {selectedPrediction.lower95} - {selectedPrediction.upper95}
                </span>
              </div>
              <div className="band medium">
                <span className="label">80% CI</span>
                <span className="range">
                  {selectedPrediction.lower80} - {selectedPrediction.upper80}
                </span>
              </div>
              <div className="band low">
                <span className="label">50% CI</span>
                <span className="range">
                  {selectedPrediction.lower50} - {selectedPrediction.upper50}
                </span>
              </div>
            </div>
          </div>

          {/* Model Information */}
          <div className="model-info">
            <h4>Model Information</h4>
            <div className="info-items">
              <InfoItem 
                label="Model" 
                value={selectedPrediction.model}
              />
              <InfoItem 
                label="Accuracy" 
                value={`${(selectedPrediction.accuracy * 100).toFixed(1)}%`}
              />
              <InfoItem 
                label="Last Updated" 
                value={formatDate(selectedPrediction.lastUpdated)}
              />
            </div>
          </div>

          {/* Key Drivers */}
          <div className="key-drivers">
            <h4>What's Driving This Forecast?</h4>
            {selectedPrediction.drivers?.map((driver, idx) => (
              <div key={idx} className="driver-item">
                <span className="factor">{driver.name}</span>
                <ProgressBar value={driver.importance} max={1} />
                <span className="importance">
                  {(driver.importance * 100).toFixed(0)}% influence
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🎛️ AI Behavior Settings

### User Control Panel

```tsx
interface AISettings {
  confidence_threshold: number;
  explanation_level: 'minimal' | 'standard' | 'detailed';
  suggestion_frequency: 'rare' | 'occasional' | 'frequent' | 'continuous';
  privacy_mode: 'strict' | 'normal' | 'permissive';
  auto_accept_matches: boolean;
  ai_assist_bulk_operations: boolean;
  learn_from_feedback: boolean;
  data_retention: number; // days
}

export const AISettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<AISettings>(loadUserAISettings());
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSaveSettings = async () => {
    await saveUserAISettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="ai-settings-panel">
      <h2>Friendly AI Settings</h2>

      {/* Confidence Threshold */}
      <section className="setting-section">
        <h3>AI Confidence Requirements</h3>
        <p className="description">
          Only show AI suggestions above this confidence level
        </p>

        <div className="setting-control">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.confidence_threshold * 100}
            onChange={(e) => 
              handleSettingChange('confidence_threshold', e.target.value / 100)
            }
          />
          <span className="current-value">
            {(settings.confidence_threshold * 100).toFixed(0)}%
          </span>
        </div>

        <div className="threshold-labels">
          <small>Conservative (90%+)</small>
          <small>Balanced (70%+)</small>
          <small>Aggressive (50%+)</small>
        </div>
      </section>

      {/* Explanation Level */}
      <section className="setting-section">
        <h3>Explanation Detail Level</h3>
        <p className="description">
          How detailed should AI explanations be?
        </p>

        <div className="radio-group">
          {['minimal', 'standard', 'detailed'].map(level => (
            <label key={level} className="radio">
              <input
                type="radio"
                checked={settings.explanation_level === level}
                onChange={() => handleSettingChange('explanation_level', level)}
              />
              <span>{level.toUpperCase()}</span>
              <small>{getExplanationLevelDescription(level)}</small>
            </label>
          ))}
        </div>
      </section>

      {/* Suggestion Frequency */}
      <section className="setting-section">
        <h3>Suggestion Frequency</h3>
        <p className="description">
          How often should AI make suggestions?
        </p>

        <div className="radio-group">
          {['rare', 'occasional', 'frequent', 'continuous'].map(freq => (
            <label key={freq} className="radio">
              <input
                type="radio"
                checked={settings.suggestion_frequency === freq}
                onChange={() => handleSettingChange('suggestion_frequency', freq)}
              />
              <span>{freq.toUpperCase()}</span>
              <small>{getSuggestionFrequencyDescription(freq)}</small>
            </label>
          ))}
        </div>
      </section>

      {/* Privacy Mode */}
      <section className="setting-section">
        <h3>Privacy & Data Usage</h3>
        <p className="description">
          Control how your data is used for AI improvement
        </p>

        <div className="radio-group">
          {['strict', 'normal', 'permissive'].map(mode => (
            <label key={mode} className="radio">
              <input
                type="radio"
                checked={settings.privacy_mode === mode}
                onChange={() => handleSettingChange('privacy_mode', mode)}
              />
              <span>{mode.toUpperCase()}</span>
              <small>{getPrivacyModeDescription(mode)}</small>
            </label>
          ))}
        </div>
      </section>

      {/* Advanced Options */}
      <section className="setting-section">
        <h3>Advanced Options</h3>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.auto_accept_matches}
            onChange={(e) => 
              handleSettingChange('auto_accept_matches', e.target.checked)
            }
          />
          <span>Auto-accept high-confidence matches</span>
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.ai_assist_bulk_operations}
            onChange={(e) => 
              handleSettingChange('ai_assist_bulk_operations', e.target.checked)
            }
          />
          <span>AI assist with bulk operations</span>
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={settings.learn_from_feedback}
            onChange={(e) => 
              handleSettingChange('learn_from_feedback', e.target.checked)
            }
          />
          <span>Learn from my feedback</span>
        </label>
      </section>

      {/* Data Retention */}
      <section className="setting-section">
        <h3>Data Retention</h3>
        <p className="description">
          How long should AI keep interaction data?
        </p>

        <select
          value={settings.data_retention}
          onChange={(e) => 
            handleSettingChange('data_retention', Number(e.target.value))
          }
        >
          <option value="7">1 Week</option>
          <option value="30">1 Month</option>
          <option value="90">3 Months</option>
          <option value="365">1 Year</option>
        </select>
      </section>

      {/* Save Button */}
      <div className="settings-footer">
        <button
          className="btn-save"
          onClick={handleSaveSettings}
          disabled={saved}
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>

        <button
          className="btn-reset"
          onClick={() => setSettings(getDefaultAISettings())}
        >
          Reset to Defaults
        </button>
      </div>

      {/* Help Section */}
      <section className="help-section">
        <h3>Need Help?</h3>
        <p>
          <a href="#" onClick={() => openAIGuide()}>
            Learn about Friendly AI settings
          </a>
        </p>
        <p>
          <a href="#" onClick={() => openFAQ()}>
            FAQ: Friendly AI
          </a>
        </p>
      </section>
    </div>
  );
};
```

---

## 🎯 Global AI Components

### Reusable Components

```tsx
// Confidence Badge - Shows AI confidence with tooltip
export const ConfidenceBadge: React.FC<{
  confidence: number;
  onClick?: () => void;
  title?: string;
}> = ({ confidence, onClick, title }) => {
  const getColor = (conf: number) => {
    if (conf >= 0.9) return 'high';
    if (conf >= 0.7) return 'medium';
    return 'low';
  };

  return (
    <div
      className={`confidence-badge badge-${getColor(confidence)}`}
      onClick={onClick}
      title={title || `${(confidence * 100).toFixed(0)}% confident`}
    >
      {(confidence * 100).toFixed(0)}%
    </div>
  );
};

// Explanation Button - Opens explanation modal
export const ExplanationButton: React.FC<{
  explanation: string;
  details?: any;
}> = ({ explanation, details }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="btn-explanation"
        onClick={() => setOpen(true)}
        title="Why did AI suggest this?"
      >
        ?
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <ExplanationContent 
            explanation={explanation}
            details={details}
          />
        </Modal>
      )}
    </>
  );
};

// Feedback Widget - Collect user feedback on AI
export const FeedbackWidget: React.FC<{
  onFeedback: (type: string) => void;
}> = ({ onFeedback }) => {
  return (
    <div className="feedback-widget">
      <small>Was this helpful?</small>
      <button onClick={() => onFeedback('yes')}>👍</button>
      <button onClick={() => onFeedback('no')}>👎</button>
      <button onClick={() => onFeedback('unclear')}>🤔</button>
    </div>
  );
};
```

---

## 📱 Mobile Enhancements

### Mobile-Specific AI UX

```tsx
// Mobile-optimized AI suggestions
export const MobileAIPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mobile-ai-panel">
      {/* Floating Action Button */}
      <button
        className="fab-ai"
        onClick={() => setExpanded(!expanded)}
      >
        <AIIcon />
        {suggestions.length > 0 && (
          <Badge count={suggestions.length} />
        )}
      </button>

      {/* Bottom Sheet */}
      {expanded && (
        <BottomSheet onClose={() => setExpanded(false)}>
          <div className="mobile-suggestions">
            {suggestions.map(suggestion => (
              <MobileSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
              />
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
```

---

## 📊 Implementation Checklist

### Phase 1: Core Components (Week 1-2)
- [ ] Create ConfidenceBadge component
- [ ] Create ExplanationButton component  
- [ ] Create FeedbackWidget component
- [ ] Set up AI service integration

### Phase 2: Dashboard (Week 2-3)
- [ ] AI-powered widget system
- [ ] AI Assistant Panel
- [ ] Insights Stream
- [ ] Widget settings

### Phase 3: Case List (Week 3-4)
- [ ] AI-enhanced search
- [ ] Case card enhancements
- [ ] Bulk operations with AI

### Phase 4: Reconciliation (Week 4-5)
- [ ] Match suggestions with explanations
- [ ] Bulk matching interface
- [ ] Override mechanisms

### Phase 5: Search Analytics (Week 5-6)
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Confidence visualization

### Phase 6: Global Features (Week 6-7)
- [ ] AI settings panel
- [ ] Mobile enhancements
- [ ] Cross-page coordination

### Phase 7: Polish & Testing (Week 7-8)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] User testing

---

## 🎓 User Education

### Onboarding

```typescript
// AI Tutorial System
const aiTutorialSteps = [
  {
    step: 1,
    page: 'dashboard',
    element: '.ai-widget',
    title: 'AI-Powered Insights',
    description: 'These widgets are personalized for you based on your role and usage patterns',
    action: 'Let\'s explore what this means',
  },
  {
    step: 2,
    page: 'dashboard',
    element: '.confidence-badge',
    title: 'Confidence Scores',
    description: 'Every AI suggestion comes with a confidence score. Higher = more reliable',
    action: 'Show me how to interpret these',
  },
  {
    step: 3,
    page: 'reconciliation',
    element: '.match-suggestion',
    title: 'Match Explanations',
    description: 'Click the explanation button to understand why AI suggested a match',
    action: 'Continue',
  },
  // More steps...
];
```

---

## ✅ Success Metrics

- **AI Adoption Rate:** >70% users interacting with AI features weekly
- **Explanation Clarity:** >85% users find explanations helpful
- **Feedback Loop:** >50% users providing feedback on suggestions
- **Time Saved:** >60% reduction in matching time
- **Accuracy:** >95% match accuracy with AI assistance
- **User Satisfaction:** 4.5+/5.0 rating for AI features

---

This comprehensive page enhancement strategy makes AI a first-class citizen in AntiGravity's UI, with transparency, explainability, and human control at every step.
