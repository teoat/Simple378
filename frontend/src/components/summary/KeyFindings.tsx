import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Finding {
  id: string;
  type: 'positive' | 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  impact?: string;
  recommendation?: string;
}

interface KeyFindingsProps {
  findings: Finding[];
}

export function KeyFindings({ findings }: KeyFindingsProps) {
  // Mock findings if none provided
  const mockFindings: Finding[] = [
    {
      id: '1',
      type: 'critical',
      title: 'High-Risk Transaction Pattern Detected',
      description: 'Identified 15 mirroring transactions totaling Rp 4.8 billion between related entities.',
      impact: 'Potential money laundering scheme involving shell companies.',
      recommendation: 'Escalate to financial crimes unit for immediate investigation.'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Unusual Cash Flow Patterns',
      description: 'Cash deposits exceed normal business operations by 340% in Q4.',
      impact: 'May indicate cash-based business expansion or unreported income.',
      recommendation: 'Request additional documentation for cash source verification.'
    },
    {
      id: '3',
      type: 'positive',
      title: 'Clean Financial Records',
      description: 'All major transactions properly documented with supporting evidence.',
      impact: 'Strong compliance posture demonstrated.',
      recommendation: 'Continue monitoring for any deviations from established patterns.'
    },
    {
      id: '4',
      type: 'info',
      title: 'Vendor Concentration Risk',
      description: '85% of expenditures directed to single vendor network.',
      impact: 'Supply chain vulnerability if primary vendors encounter issues.',
      recommendation: 'Diversify vendor relationships to reduce dependency risk.'
    }
  ];

  const displayFindings = findings.length > 0 ? findings : mockFindings;

  const getFindingIcon = (type: Finding['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'positive':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-slate-500" />;
    }
  };

  const getFindingStyles = (type: Finding['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'positive':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
          <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Key Findings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Critical insights and recommendations from the investigation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {displayFindings.map((finding, index) => (
          <motion.div
            key={finding.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getFindingStyles(finding.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getFindingIcon(finding.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {finding.title}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  {finding.description}
                </p>

                {finding.impact && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Impact:
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {finding.impact}
                    </p>
                  </div>
                )}

                {finding.recommendation && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Recommendation:
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {finding.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {findings.length === 0 && (
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No specific findings recorded. Using sample findings for demonstration.
          </p>
        </div>
      )}
    </motion.div>
  );
}