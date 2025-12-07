import { Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface AIInsightPanelProps {
  data?: unknown;  // Reserved for future dynamic insight generation
  chartType: 'sankey' | 'timeline' | 'graph' | 'heatmap' | 'waterfall' | 'benchmark';
}

export function AIInsightPanel({ data: _data, chartType }: AIInsightPanelProps) {
  // Generate insights based on chart type and data
  const getInsights = () => {
    switch (chartType) {
      case 'sankey':
        return {
          title: 'Cash Flow Pattern Analysis',
          insights: [
            {
              type: 'pattern',
              icon: TrendingUp,
              text: 'Circular flow detected between 3 entities (Shell Company A → Vendor B → Shell Company A)',
              confidence: 92,
              color: 'text-red-500 bg-red-500/10'
            },
            {
              type: 'anomaly',
              icon: AlertTriangle,
              text: 'Unusually high transaction velocity: 15 transfers in 48 hours',
              confidence: 87,
              color: 'text-orange-500 bg-orange-500/10'
            },
            {
              type: 'recommendation',
              icon: Sparkles,
              text: 'Investigate entity relationships for potential kickback scheme',
              confidence: 85,
              color: 'text-purple-500 bg-purple-500/10'
            }
          ]
        };
      
      case 'timeline':
        return {
          title: 'Temporal Pattern Insights',
          insights: [
            {
              type: 'pattern',
              icon: TrendingUp,
              text: 'Transaction clustering on weekends and holidays (red flag)',
              confidence: 90,
              color: 'text-red-500 bg-red-500/10'
            },
            {
              type: 'insight',
              icon: Info,
              text: 'Average transaction gap: 2.3 days (normal range: 5-7 days)',
              confidence: 75,
              color: 'text-blue-500 bg-blue-500/10'
            }
          ]
        };
      
      case 'graph':
        return {
          title: 'Network Analysis & Entity Relationships',
          insights: [
            {
              type: 'anomaly',
              icon: AlertTriangle,
              text: '4 entities share the same registered address (shell company indicator)',
              confidence: 94,
              color: 'text-red-500 bg-red-500/10'
            },
            {
              type: 'pattern',
              icon: TrendingUp,
              text: 'Hub-and-spoke pattern with central entity processing 87% of funds',
              confidence: 88,
              color: 'text-orange-500 bg-orange-500/10'
            }
          ]
        };
      
      case 'heatmap':
        return {
          title: 'Activity Pattern Analysis',
          insights: [
            {
              type: 'pattern',
              icon: TrendingUp,
              text: 'Unusual activity spike on Tuesday evenings (18:00-22:00)',
              confidence: 82,
              color: 'text-orange-500 bg-orange-500/10'
            },
            {
              type: 'recommendation',
              icon: Sparkles,
              text: 'Cross-reference with employee work schedules for after-hours access',
              confidence: 78,
              color: 'text-purple-500 bg-purple-500/10'
            }
          ]
        };
      
      case 'waterfall':
        return {
          title: 'Financial Flow Breakdown',
          insights: [
            {
              type: 'anomaly',
              icon: AlertTriangle,
              text: 'Unexplained $127K discrepancy in cash reconciliation',
              confidence: 96,
              color: 'text-red-500 bg-red-500/10'
            },
            {
              type: 'insight',
              icon: Info,
              text: 'Total exposure: $847K across 23 transactions',
              confidence: 100,
              color: 'text-blue-500 bg-blue-500/10'
            }
          ]
        };
      
      case 'benchmark':
        return {
          title: 'Peer Benchmark Comparison',
          insights: [
            {
              type: 'anomaly',
              icon: AlertTriangle,
              text: 'Transaction ratio 340% above industry peer average (major outlier)',
              confidence: 91,
              color: 'text-red-500 bg-red-500/10'
            },
            {
              type: 'recommendation',
              icon: Sparkles,
              text: 'Request detailed justification for volume variance',
              confidence: 85,
              color: 'text-purple-500 bg-purple-500/10'
            }
          ]
        };
      
      default:
        return {
          title: 'AI Insights',
          insights: [
            {
              type: 'insight',
              icon: Info,
              text: 'No specific anomalies detected in current view',
              confidence: 70,
              color: 'text-blue-500 bg-blue-500/10'
            }
          ]
        };
    }
  };

  const { title, insights } = getInsights();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${insight.color.split(' ')[1]} ${insight.color.split(' ')[0].replace('text-', 'border-')}/20`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${insight.color.split(' ')[0]} shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    {insight.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${insight.color.split(' ')[0].replace('text-', 'bg-')}`}
                        style={{ width: `${insight.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
          View Detailed Analysis →
        </button>
      </div>
    </div>
  );
}
