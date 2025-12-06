import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Calendar,
  Clock,
  Mail,
  Download,
  Play,
  Pause,
  Trash2,
  Edit,
  Plus,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  template_id: string;
  template_name: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    day_of_week?: number; // 0-6 for weekly
    day_of_month?: number; // 1-31 for monthly
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'both';
  filters?: Record<string, any>;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  created_by: string;
  created_at: string;
}

interface ScheduledReportsProps {
  reports: ScheduledReport[];
  templates: Array<{ id: string; name: string; type: string }>;
  onCreateReport?: (report: Omit<ScheduledReport, 'id' | 'created_at' | 'last_run' | 'next_run'>) => void;
  onUpdateReport?: (id: string, updates: Partial<ScheduledReport>) => void;
  onDeleteReport?: (id: string) => void;
  onRunNow?: (id: string) => void;
}

export function ScheduledReports({
  reports,
  templates,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  onRunNow
}: ScheduledReportsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_id: '',
    frequency: 'weekly' as const,
    time: '09:00',
    day_of_week: 1, // Monday
    day_of_month: 1,
    recipients: [] as string[],
    format: 'pdf' as const,
    filters: {}
  });

  const activeReports = useMemo(() => reports.filter(r => r.is_active), [reports]);
  const inactiveReports = useMemo(() => reports.filter(r => !r.is_active), [reports]);

  const handleCreateReport = () => {
    if (!formData.name || !formData.template_id || formData.recipients.length === 0) return;

    const schedule = {
      frequency: formData.frequency,
      time: formData.time,
      ...(formData.frequency === 'weekly' && { day_of_week: formData.day_of_week }),
      ...(formData.frequency === 'monthly' && { day_of_month: formData.day_of_month })
    };

    onCreateReport?.({
      name: formData.name,
      template_id: formData.template_id,
      schedule,
      recipients: formData.recipients,
      format: formData.format,
      filters: formData.filters,
      is_active: true,
      created_by: 'current_user' // This would come from auth context
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      template_id: '',
      frequency: 'weekly',
      time: '09:00',
      day_of_week: 1,
      day_of_month: 1,
      recipients: [],
      format: 'pdf',
      filters: {}
    });
    setShowCreateForm(false);
    setEditingReport(null);
  };

  const startEditing = (report: ScheduledReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      template_id: report.template_id,
      frequency: report.schedule.frequency,
      time: report.schedule.time,
      day_of_week: report.schedule.day_of_week || 1,
      day_of_month: report.schedule.day_of_month || 1,
      recipients: report.recipients,
      format: report.format,
      filters: report.filters || {}
    });
    setShowCreateForm(true);
  };

  const handleUpdateReport = () => {
    if (!editingReport) return;

    const schedule = {
      frequency: formData.frequency,
      time: formData.time,
      ...(formData.frequency === 'weekly' && { day_of_week: formData.day_of_week }),
      ...(formData.frequency === 'monthly' && { day_of_month: formData.day_of_month })
    };

    onUpdateReport?.(editingReport.id, {
      name: formData.name,
      template_id: formData.template_id,
      schedule,
      recipients: formData.recipients,
      format: formData.format,
      filters: formData.filters
    });

    resetForm();
  };

  const addRecipient = (email: string) => {
    if (email && !formData.recipients.includes(email)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, email]
      }));
    }
  };

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const getFrequencyLabel = (schedule: ScheduledReport['schedule']) => {
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${schedule.time}`;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${days[schedule.day_of_week || 0]} at ${schedule.time}`;
      case 'monthly':
        return `Monthly on day ${schedule.day_of_month} at ${schedule.time}`;
      default:
        return 'Unknown schedule';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'text-green-600 bg-green-50 dark:bg-green-500/10'
      : 'text-slate-600 bg-slate-50 dark:bg-slate-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Scheduled Reports
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Automate report generation and delivery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReport ? 'Edit Scheduled Report' : 'Create Scheduled Report'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Report Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Template</label>
                <select
                  value={formData.template_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                >
                  <option value="">Select template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Day of Week</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Day of Month</label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.day_of_month}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_of_month: parseInt(e.target.value) }))}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium mb-2">Recipients</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter email address"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addRecipient((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter email address"]') as HTMLInputElement;
                    if (input?.value) {
                      addRecipient(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.recipients.map(email => (
                  <span
                    key={email}
                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm"
                  >
                    <Mail className="h-3 w-3" />
                    {email}
                    <button
                      onClick={() => removeRecipient(email)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={editingReport ? handleUpdateReport : handleCreateReport}>
                {editingReport ? 'Update Report' : 'Create Report'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Reports */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Play className="h-5 w-5 text-green-500" />
          Active Reports ({activeReports.length})
        </h3>

        {activeReports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400">No active scheduled reports</p>
              <p className="text-sm mt-1">Create your first scheduled report above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {report.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(report.is_active)}`}>
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Template:</span>
                          <div className="font-medium">{report.template_name}</div>
                        </div>

                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Schedule:</span>
                          <div className="font-medium">{getFrequencyLabel(report.schedule)}</div>
                        </div>

                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Recipients:</span>
                          <div className="font-medium">{report.recipients.length}</div>
                        </div>

                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Format:</span>
                          <div className="font-medium capitalize">{report.format}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        {report.last_run && (
                          <span>Last run: {new Date(report.last_run).toLocaleString()}</span>
                        )}
                        {report.next_run && (
                          <span>Next run: {new Date(report.next_run).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRunNow?.(report.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(report)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateReport?.(report.id, { is_active: false })}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteReport?.(report.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Reports */}
      {inactiveReports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pause className="h-5 w-5 text-slate-500" />
            Inactive Reports ({inactiveReports.length})
          </h3>

          <div className="grid gap-4">
            {inactiveReports.map((report) => (
              <Card key={report.id} className="opacity-75">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {report.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {report.template_name} • {getFrequencyLabel(report.schedule)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateReport?.(report.id, { is_active: true })}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteReport?.(report.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}