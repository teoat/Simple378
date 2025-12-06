import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useTenant } from '../hooks/useTenant';
import {
  User,
  Shield,
  Bell,
  Key,
  Users,
  Palette,
  History,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'security' | 'team' | 'notifications' | 'apikeys' | 'theme' | 'enterprise';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department: string;
  phone: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'auditor' | 'viewer';
  status: 'active' | 'invited' | 'inactive';
  lastActive: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  permissions: string[];
}

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip: string;
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Multi-tenant context
  const { tenant, isTenantFeatureEnabled } = useTenant();

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [primaryColor, setPrimaryColor] = useState('blue');

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: { newCase: true, caseUpdate: true, assignedToMe: true, weeklyReport: false },
    push: { newCase: false, caseUpdate: true, assignedToMe: true, urgent: true },
    slack: { newCase: false, highRisk: true, critical: true }
  });

  // Fetch profile
  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: () => api.get<any>('/users/profile'),
  });

  // Derived profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    role: 'Analyst', // Default
    department: '',
    phone: ''
  });

  // Update local state when data fetches
  useEffect(() => {
    if (profileData) {
      setProfile({
        id: profileData.id || '',
        name: profileData.full_name || profileData.email?.split('@')[0] || 'User',
        email: profileData.email || '',
        role: profileData.role || 'Analyst',
        department: profileData.department || 'Forensic Accounting', 
        phone: profileData.phone_number || ''
      });
    }
  }, [profileData]);

  // Fetch team members (Mock for now - no backend endpoint)
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ['settings', 'team'],
    queryFn: async () => {
      // TODO: Implement GET /users/ endpoint in backend
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: '1', name: 'John Doe', email: 'john.doe@company.com', role: 'admin', status: 'active', lastActive: '2024-03-15 10:30' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com', role: 'analyst', status: 'active', lastActive: '2024-03-15 09:45' },
        { id: '3', name: 'Bob Wilson', email: 'bob.wilson@company.com', role: 'auditor', status: 'active', lastActive: '2024-03-14 16:20' },
        { id: '4', name: 'Alice Brown', email: 'alice.brown@company.com', role: 'viewer', status: 'invited', lastActive: 'Never' }
      ];
    }
  });

  // Fetch API keys (Mock for now - no backend endpoint)
  const { data: apiKeys = [] } = useQuery<APIKey[]>({
    queryKey: ['settings', 'apikeys'],
    queryFn: async () => {
      // TODO: Implement /api-keys/ endpoints in backend
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: '1', name: 'Production API', key: 'sk_live_xxxxx...xxxxx', createdAt: '2024-01-15', lastUsed: '2024-03-15', permissions: ['read', 'write'] },
        { id: '2', name: 'Development API', key: 'sk_test_xxxxx...xxxxx', createdAt: '2024-02-10', lastUsed: '2024-03-14', permissions: ['read'] }
      ];
    }
  });

  // Fetch audit log
  const { data: auditLog = [] } = useQuery<AuditLogEntry[]>({
    queryKey: ['settings', 'audit'],
    queryFn: async () => {
      try {
        const response = await api.get<{ items: any[] }>('/audit-logs/?limit=5');
        return response.items.map((log: any) => ({
          id: log.id,
          action: log.action,
          user: log.actor_id || 'System', // Backend returns ID, front needs name ideally
          timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : '',
          details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
          ip: '—' // IP not currently stored in audit log model shown
        }));
      } catch (e) {
        console.error("Failed to fetch audit logs", e);
        return [];
      }
    }
  });

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      return api.patch('/users/profile', {
        full_name: data.name,
        email: data.email,
        // Backend doesn't support Department/Phone yet in User model directly in snippet, 
        // assuming mapping or extending model would be needed.
        // For now, sending what we can.
      });
    },
    onSuccess: () => {
      toast.success('Profile saved successfully');
      refetchProfile();
    },
    onError: () => toast.error('Failed to save profile')
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return api.post('/users/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password');
    }
  });

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'team' as SettingsTab, label: 'Team', icon: Users },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'apikeys' as SettingsTab, label: 'API Keys', icon: Key },
    { id: 'theme' as SettingsTab, label: 'Appearance', icon: Palette },
    { id: 'enterprise' as SettingsTab, label: 'Enterprise', icon: Globe },
  ];

  const getRoleBadge = (role: TeamMember['role']) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      analyst: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      auditor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      viewer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role]}`}>{role}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage your account, security, and application preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{profile.name}</h3>
                        <p className="text-slate-500">{profile.role}</p>
                        <Button variant="outline" size="sm" className="mt-2">Change Avatar</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input 
                          value={profile.name} 
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <Input 
                          type="email"
                          value={profile.email} 
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Department</label>
                        <Input 
                          value={profile.department} 
                          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <Input 
                          value={profile.phone} 
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => saveProfileMutation.mutate(profile)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <div className="relative">
                          <Input 
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <Input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <Input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button 
                        onClick={() => changePasswordMutation.mutate()}
                        disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                      >
                        Update Password
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">2FA Status</p>
                          <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                        </div>
                        <button
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            twoFactorEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          aria-label={twoFactorEnabled ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
                        >
                          <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                            twoFactorEnabled ? 'translate-x-7' : ''
                          }`} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditLog.slice(0, 5).map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div>
                              <p className="font-medium">{entry.action}</p>
                              <p className="text-sm text-slate-500">{entry.details}</p>
                            </div>
                            <div className="text-right text-sm text-slate-500">
                              <p>{entry.timestamp}</p>
                              <p>{entry.ip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Team Tab */}
              {activeTab === 'team' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Team Members</CardTitle>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-slate-500">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getRoleBadge(member.role)}
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              member.status === 'active' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : member.status === 'invited'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {member.status}
                            </span>
                            <button className="text-slate-400 hover:text-red-500" aria-label={`Remove ${member.name}`}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(notifications.email).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          </div>
                          <button
                            onClick={() => setNotifications({
                              ...notifications,
                              email: { ...notifications.email, [key]: !value }
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              value ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            aria-label={`Toggle email notification for ${key}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : ''
                            }`} />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Push Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(notifications.push).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          </div>
                          <button
                            onClick={() => setNotifications({
                              ...notifications,
                              push: { ...notifications.push, [key]: !value }
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              value ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            aria-label={`Toggle push notification for ${key}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : ''
                            }`} />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'apikeys' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>API Keys</CardTitle>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Key
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {apiKeys.map((key) => (
                          <div key={key.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium">{key.name}</p>
                                <p className="text-sm text-slate-500">Created: {key.createdAt} | Last used: {key.lastUsed}</p>
                              </div>
                              <div className="flex gap-2">
                                {key.permissions.map(p => (
                                  <span key={p} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded font-mono text-sm">
                                {key.key}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyKey(key.key, key.id)}
                                aria-label={`Copy API key for ${key.name}`}
                              >
                                {copiedKey === key.id ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                aria-label={`Delete API key ${key.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Theme Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme Mode</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {(['light', 'dark', 'system'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setTheme(mode)}
                            className={`p-6 rounded-lg border-2 transition-all ${
                              theme === mode
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className={`h-12 w-12 mx-auto mb-3 rounded-lg ${
                              mode === 'light' ? 'bg-white border border-slate-200' :
                              mode === 'dark' ? 'bg-slate-900 border border-slate-700' :
                              'bg-gradient-to-br from-white to-slate-900'
                            }`} />
                            <p className="font-medium capitalize">{mode}</p>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Accent Color</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        {['blue', 'purple', 'green', 'red', 'orange', 'pink'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setPrimaryColor(color)}
                            className={`h-12 w-12 rounded-full transition-all ${
                              primaryColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                            }`}
                            style={{ backgroundColor: color === 'blue' ? '#3b82f6' : color === 'purple' ? '#8b5cf6' : color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : color === 'orange' ? '#f97316' : '#ec4899' }}
                            aria-label={`Set accent color to ${color}`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Display Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Compact Mode</p>
                          <p className="text-sm text-slate-500">Reduce spacing for denser information display</p>
                        </div>
                        <button
                          className="relative w-12 h-6 rounded-full bg-slate-300 dark:bg-slate-700"
                          aria-label="Toggle compact mode"
                        >
                          <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Animations</p>
                          <p className="text-sm text-slate-500">Enable smooth transitions and animations</p>
                        </div>
                        <button
                          className="relative w-12 h-6 rounded-full bg-blue-500"
                          aria-label="Toggle animations"
                        >
                          <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white translate-x-6" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enterprise Tab */}
              {activeTab === 'enterprise' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tenant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {tenant ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tenant ID</p>
                              <p className="text-lg font-semibold">{tenant.id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tenant Name</p>
                              <p className="text-lg font-semibold">{tenant.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Region</p>
                              <p className="text-lg font-semibold">{tenant.region || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Plan</p>
                              <p className="text-lg font-semibold capitalize">{tenant.plan || 'standard'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-500">Loading tenant information...</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Feature Flags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['advanced_analytics', 'ai_orchestration', 'real_time_collaboration', 'custom_integrations', 'api_access', 'sso'].map((feature) => (
                          <div key={feature} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded">
                            <div>
                              <p className="font-medium capitalize">{feature.replace(/_/g, ' ')}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isTenantFeatureEnabled(feature)
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {isTenantFeatureEnabled(feature) ? '✓ Enabled' : '✕ Disabled'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Residency & Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Primary Data Center</p>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded">
                          <p className="font-semibold">{tenant?.region === 'us-east' ? 'US East (Northern Virginia)' : tenant?.region === 'eu-west' ? 'EU West (Ireland)' : 'Default Region'}</p>
                          <p className="text-sm text-slate-500">Your data is stored and processed in this region only.</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Compliance Standards</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['SOC2', 'HIPAA', 'GDPR', 'CCPA', 'FedRAMP', 'ISO 27001'].map((standard) => (
                            <div key={standard} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm font-medium text-blue-700 dark:text-blue-400">
                              {standard}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Usage & Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">API Calls</p>
                          <p className="text-sm text-slate-500">450,000 / 500,000</p>
                        </div>
                        <progress
                          value={90}
                          max={100}
                          aria-label="API calls usage"
                          className="w-full h-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Storage</p>
                          <p className="text-sm text-slate-500">750 GB / 1 TB</p>
                        </div>
                        <progress
                          value={75}
                          max={100}
                          aria-label="Storage usage"
                          className="w-full h-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">Team Members</p>
                          <p className="text-sm text-slate-500">8 / 25</p>
                        </div>
                        <progress
                          value={32}
                          max={100}
                          aria-label="Team members usage"
                          className="w-full h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
