import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Shield,
  Lock,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Database,
  Key,
  Settings
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  compliance_flags?: string[];
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'gdpr' | 'sox' | 'hipaa' | 'pci' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  last_checked?: string;
  violations_count?: number;
}

interface DataRetentionPolicy {
  id: string;
  name: string;
  data_type: string;
  retention_period_days: number;
  auto_delete: boolean;
  last_cleanup?: string;
  records_affected?: number;
}

interface AuditTrailProps {
  events: AuditEvent[];
  complianceRules: ComplianceRule[];
  retentionPolicies: DataRetentionPolicy[];
  onExportAudit?: (format: 'csv' | 'json' | 'pdf') => void;
  onRunComplianceCheck?: () => void;
  onCleanupData?: (policyId: string) => void;
}

export function AuditTrail({
  events,
  complianceRules,
  retentionPolicies,
  onExportAudit,
  onRunComplianceCheck,
  onCleanupData
}: AuditTrailProps) {
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedTab, setSelectedTab] = useState<'audit' | 'compliance' | 'retention'>('audit');

  // Filter audit events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesUser = !filterUser || event.user_name.toLowerCase().includes(filterUser.toLowerCase());
      const matchesAction = !filterAction || event.action.toLowerCase().includes(filterAction.toLowerCase());

      const eventDate = new Date(event.timestamp);
      const startDate = filterDateRange.start ? new Date(filterDateRange.start) : null;
      const endDate = filterDateRange.end ? new Date(filterDateRange.end) : null;

      const matchesDateRange = (!startDate || eventDate >= startDate) && (!endDate || eventDate <= endDate);

      return matchesUser && matchesAction && matchesDateRange;
    });
  }, [events, filterUser, filterAction, filterDateRange]);

  // Get unique users and actions for filter options
  const filterOptions = useMemo(() => {
    const users = [...new Set(events.map(e => e.user_name))];
    const actions = [...new Set(events.map(e => e.action))];
    return { users, actions };
  }, [events]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-500/10';
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-500/10';
      case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-500/10';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gdpr': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
      case 'sox': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
      case 'hipaa': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300';
      case 'pci': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return date.toLocaleString();
  };

  const tabs = [
    { id: 'audit', label: 'Audit Trail', icon: FileText },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'retention', label: 'Data Retention', icon: Database }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Compliance & Audit
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor system activity, ensure compliance, and manage data retention
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            SOC 2 Compliant
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Audit Trail Tab */}
      {selectedTab === 'audit' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User</label>
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                  >
                    <option value="">All Users</option>
                    {filterOptions.users.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Action</label>
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                  >
                    <option value="">All Actions</option>
                    {filterOptions.actions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={filterDateRange.start}
                    onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Input
                    type="date"
                    value={filterDateRange.end}
                    onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => onExportAudit?.('csv')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => onExportAudit?.('json')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Audit Events ({filteredEvents.length})</span>
                <span className="text-sm text-slate-500">
                  Last 30 days
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {event.user_name}
                        </span>
                        <span className="text-sm text-slate-500">
                          {event.action}
                        </span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {event.resource_type}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {event.details?.description || `${event.action} on ${event.resource_type}`}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(event.timestamp)}
                        </span>
                        {event.ip_address && (
                          <span>IP: {event.ip_address}</span>
                        )}
                        {event.compliance_flags && event.compliance_flags.length > 0 && (
                          <div className="flex gap-1">
                            {event.compliance_flags.map((flag, idx) => (
                              <span key={idx} className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No audit events found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Tab */}
      {selectedTab === 'compliance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Compliance Rules</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automated compliance monitoring and violation detection
              </p>
            </div>
            <Button onClick={onRunComplianceCheck}>
              <Shield className="h-4 w-4 mr-1" />
              Run Compliance Check
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceRules.map((rule) => (
              <Card key={rule.id} className={rule.is_active ? '' : 'opacity-50'}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        rule.is_active ? 'bg-green-500' : 'bg-slate-400'
                      }`} />
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(rule.category)}`}>
                        {rule.category.toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </span>
                  </div>

                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {rule.name}
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {rule.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Last checked: {rule.last_checked ? formatTimestamp(rule.last_checked) : 'Never'}</span>
                    {rule.violations_count !== undefined && (
                      <span className={rule.violations_count > 0 ? 'text-red-600' : 'text-green-600'}>
                        {rule.violations_count} violations
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Data Retention Tab */}
      {selectedTab === 'retention' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Data Retention Policies</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automated data lifecycle management and cleanup
              </p>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              Configure Policies
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {retentionPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {policy.name}
                    </h4>
                    <div className={`w-2 h-2 rounded-full ${
                      policy.auto_delete ? 'bg-green-500' : 'bg-amber-500'
                    }`} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Data Type:</span>
                      <span className="font-medium">{policy.data_type}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Retention:</span>
                      <span className="font-medium">{policy.retention_period_days} days</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Auto Delete:</span>
                      <span className={`font-medium ${policy.auto_delete ? 'text-green-600' : 'text-amber-600'}`}>
                        {policy.auto_delete ? 'Enabled' : 'Manual'}
                      </span>
                    </div>

                    {policy.records_affected !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Records:</span>
                        <span className="font-medium">{policy.records_affected.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Last cleanup: {policy.last_cleanup ? formatTimestamp(policy.last_cleanup) : 'Never'}</span>
                      {policy.auto_delete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCleanupData?.(policy.id)}
                          className="text-xs h-6"
                        >
                          Run Cleanup
                        </Button>
                      )}
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