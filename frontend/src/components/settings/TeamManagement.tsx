import { useState } from 'react';
import { Users, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
}

interface TeamManagementProps {
  onAddMember?: (email: string, role: string) => void;
  onRemoveMember?: (memberId: string) => void;
}

export function TeamManagement({ onAddMember, onRemoveMember }: TeamManagementProps) {
  const [members] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'admin',
      status: 'active',
      joinedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'analyst',
      status: 'active',
      joinedDate: '2024-03-20',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      role: 'viewer',
      status: 'pending',
      joinedDate: '2024-12-01',
    },
  ]);

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('analyst');

  const handleAddMember = () => {
    if (newMemberEmail) {
      onAddMember?.(newMemberEmail, newMemberRole);
      setNewMemberEmail('');
    }
  };

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-700' },
    inactive: { color: 'bg-slate-100 text-slate-700' },
    pending: { color: 'bg-amber-100 text-amber-700' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" /> Team Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-3 text-sm">Add Team Member</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Team Members ({members.length})</h4>
            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-slate-600">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-200 rounded capitalize">
                      {member.role}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${statusConfig[member.status].color}`}>
                      {member.status}
                    </span>
                    <button
                      onClick={() => onRemoveMember?.(member.id)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
