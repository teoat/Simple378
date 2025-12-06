import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { AuditLogViewer } from '../components/settings/AuditLogViewer';
import { User, Shield, FileText, Moon, Sun } from 'lucide-react';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { Badge } from '../components/ui/Badge';

const tabs = [
  { id: 'general', name: 'General', icon: User },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'audit', name: 'Audit Log', icon: FileText },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: api.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: api.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Preferences updated');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: api.updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
      const form = document.getElementById('password-form') as HTMLFormElement;
      if (form) form.reset();
    },
    onError: (error) => {
      toast.error(`Password update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updatePreferencesMutation.mutate({ theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <PageErrorBoundary pageName="Settings">
      <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account and application preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="backdrop-blur-lg bg-white/10 dark:bg-slate-900/20 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-xl">
        <nav className="flex space-x-1 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all flex-1
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">General Settings</h2>
            
            {profileLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 rounded"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateProfileMutation.mutate({
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    defaultValue={profile?.name}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    defaultValue={profile?.email}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    Theme
                    <Badge variant={theme === 'dark' ? 'info' : 'warning'} size="sm">
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </Badge>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Toggle between light and dark mode
                  </p>
                </div>
                <button
                  onClick={handleThemeToggle}
                  disabled={updatePreferencesMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-white rounded-xl hover:shadow-lg transition-all font-medium border border-slate-200 dark:border-slate-600"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security Settings</h2>
            <form
              id="password-form"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const currentPassword = formData.get('current_password') as string;
                const newPassword = formData.get('new_password') as string;
                
                if (!currentPassword || !newPassword) {
                  toast.error('Please fill in all fields');
                  return;
                }
                
                updatePasswordMutation.mutate({
                  current_password: currentPassword,
                  new_password: newPassword,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  name="current_password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  name="new_password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <button 
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'audit' && <AuditLogViewer />}
      </div>
    </div>
    </PageErrorBoundary>
  );
}
