import { useState } from 'react';
import { Key, Copy, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface APIKey {
  id: string;
  name: string;
  key: string;
  masked: string;
  createdDate: string;
  lastUsed?: string;
  permissions: string[];
}

interface APIKeysManagementProps {
  onCreateKey?: (name: string, permissions: string[]) => void;
  onDeleteKey?: (keyId: string) => void;
}

export function APIKeysManagement({ onCreateKey, onDeleteKey }: APIKeysManagementProps) {
  const [keys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_1234567890abcdef',
      masked: 'sk_live_...cdef',
      createdDate: '2024-09-15',
      lastUsed: '2024-12-07',
      permissions: ['read', 'write'],
    },
    {
      id: '2',
      name: 'Testing Key',
      key: 'sk_test_0987654321fedcba',
      masked: 'sk_test_...dcba',
      createdDate: '2024-11-01',
      permissions: ['read'],
    },
  ]);

  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);

  const permissions = ['read', 'write', 'delete', 'admin'];

  const handleCreateKey = () => {
    if (newKeyName) {
      onCreateKey?.(newKeyName, selectedPermissions);
      setNewKeyName('');
      setSelectedPermissions(['read']);
      setShowNewKeyForm(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('API Key copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" /> API Keys
          </CardTitle>
          <button
            onClick={() => setShowNewKeyForm(!showNewKeyForm)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Key
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showNewKeyForm && (
            <div className="p-4 bg-blue-50 rounded border border-blue-200 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map(perm => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions([...selectedPermissions, perm]);
                          } else {
                            setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNewKeyForm(false)}
                  className="px-3 py-1 border border-slate-200 rounded text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Create Key
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {keys.map(apiKey => (
              <div key={apiKey.id} className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{apiKey.name}</h4>
                    <p className="text-xs text-slate-600">Created: {apiKey.createdDate}</p>
                    {apiKey.lastUsed && (
                      <p className="text-xs text-slate-600">Last used: {apiKey.lastUsed}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteKey?.(apiKey.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 px-2 py-1 bg-slate-200 rounded font-mono text-xs">
                    {apiKey.masked}
                  </code>
                  <button
                    onClick={() => handleCopyKey(apiKey.key)}
                    className="p-2 hover:bg-blue-100 text-blue-600 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {apiKey.permissions.map(perm => (
                    <span
                      key={perm}
                      className="text-xs bg-slate-200 px-2 py-0.5 rounded capitalize"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
