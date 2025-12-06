import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Mail, Share, Settings } from 'lucide-react';

interface ReportGeneratorProps {
  caseData: {
    id: string;
    subject_name: string;
    status: string;
    risk_score: number;
  };
}

export function ReportGenerator({ caseData }: ReportGeneratorProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | 'html'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real implementation, this would:
    // 1. Collect all case data
    // 2. Generate the report in the selected format
    // 3. Download or send the file

    setIsGenerating(false);

    // Mock download
    const filename = `case-${caseData.id}-report.${selectedFormat}`;
    alert(`Report generated: ${filename}\n\nIn a real implementation, this would download the ${selectedFormat.toUpperCase()} file.`);
  };

  const handleEmailReport = () => {
    // Mock email functionality
    alert('Email report functionality would open a modal to compose and send the report via email.');
  };

  const handleShareReport = () => {
    // Mock share functionality
    const shareUrl = `${window.location.origin}/cases/${caseData.id}/summary`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Report link copied to clipboard:\n${shareUrl}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
          <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Report Generator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate and share comprehensive case reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Configuration */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Report Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'pdf', label: 'PDF', icon: FileText },
                { value: 'docx', label: 'Word', icon: FileText },
                { value: 'html', label: 'HTML', icon: FileText },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedFormat === format.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <format.icon className={`h-5 w-5 mx-auto mb-2 ${
                    selectedFormat === format.value
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedFormat === format.value
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {format.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Include Sections
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Financial Charts & Visualizations
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeTimeline}
                  onChange={(e) => setIncludeTimeline(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Investigation Timeline
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Generate Report
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate {selectedFormat.toUpperCase()} Report
                </>
              )}
            </motion.button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Share Report
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEmailReport}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShareReport}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Share className="h-4 w-4" />
                Share
              </motion.button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Settings className="h-4 w-4" />
              <span>Report will include:</span>
            </div>
            <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Executive summary</li>
              <li>• Key findings & recommendations</li>
              <li>• Investigation timeline</li>
              {includeCharts && <li>• Financial charts</li>}
              {includeTimeline && <li>• Detailed timeline</li>}
              <li>• Supporting evidence</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}