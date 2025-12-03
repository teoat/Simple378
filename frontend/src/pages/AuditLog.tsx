import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  resource_id: string;
  timestamp: string;
  details: any;
}

export const AuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Assuming API is proxied or at localhost:8000
        const response = await axios.get('http://localhost:8000/api/v1/audit/');
        setLogs(response.data);
      } catch (err) {
        setError('Failed to fetch audit logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor ID</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource ID</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b text-sm text-gray-900">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-900">{log.action}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-500">{log.actor_id || 'System'}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-500">{log.resource_id}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-500">
                  <pre className="text-xs">{JSON.stringify(log.details, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
