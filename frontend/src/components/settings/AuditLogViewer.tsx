import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  resource: string;
  changes?: string;
  status: 'success' | 'failed';
}

interface AuditLogViewerProps {
  entries?: AuditLogEntry[];
}

export function AuditLogViewer({ entries }: AuditLogViewerProps) {
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 3600000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const defaultEntries: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      action: 'Login',
      user: 'john.doe@company.com',
      resource: 'Authentication',
      status: 'success',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      action: 'Case Updated',
      user: 'jane.smith@company.com',
      resource: 'Case #12345',
      changes: 'Status changed from Open to In Review',
      status: 'success',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      action: 'Failed Login',
      user: 'unknown@company.com',
      resource: 'Authentication',
      status: 'failed',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
      action: 'Data Export',
      user: 'bob.johnson@company.com',
      resource: 'Case Data Export',
      changes: '500 records exported',
      status: 'success',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
      action: 'Settings Changed',
      user: 'admin@company.com',
      resource: 'System Settings',
      changes: 'Session timeout changed from 30 to 60 minutes',
      status: 'success',
    },
  ];

  const data = entries || defaultEntries;
  const actions = ['all', ...new Set(data.map(e => e.action))];

  const filtered = data.filter(entry => {
    const matchAction = filterAction === 'all' || entry.action === filterAction;
    const matchStatus = filterStatus === 'all' || entry.status === filterStatus;
    const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
    const matchDate =
      entryDate >= dateRange.start && entryDate <= dateRange.end;
    return matchAction && matchStatus && matchDate;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogOut className="w-5 h-5" /> Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
            <div>
              <label className="block text-xs font-medium mb-1">Action</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
              >
                {actions.map(action => (
                  <option key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold">Timestamp</th>
                  <th className="text-left py-2 px-2 font-semibold">Action</th>
                  <th className="text-left py-2 px-2 font-semibold">User</th>
                  <th className="text-left py-2 px-2 font-semibold">Resource</th>
                  <th className="text-left py-2 px-2 font-semibold">Changes</th>
                  <th className="text-left py-2 px-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2 text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 font-medium">{entry.action}</td>
                    <td className="py-2 px-2">{entry.user}</td>
                    <td className="py-2 px-2">{entry.resource}</td>
                    <td className="py-2 px-2 text-xs text-slate-600">
                      {entry.changes || '-'}
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          entry.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-600 text-center">
            Showing {filtered.length} of {data.length} entries
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
