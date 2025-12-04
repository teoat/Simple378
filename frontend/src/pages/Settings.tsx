import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { AuditLogViewer } from '../components/settings/AuditLogViewer';
import { TwoFactorSetup } from '../components/settings/TwoFactorSetup';
import { User, Shield, FileText, Lock } from 'lucide-react';
import { PageErrorBoundary } from '../components/PageErrorBoundary';
import { useFormValidation, type ValidationRules } from '../hooks/useFormValidation';

const tabs = [
  { id: 'general', name: 'General', icon: User },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'audit', name: 'Audit Log', icon: FileText },
];

/**
 * Settings Page
 * 
 * Features:
 * - User profile management
 * - Password change
 * - Theme preferences
 * - Two-factor authentication setup
 * - Audit log viewing
 */
export function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [show2FASetup, setShow2FASetup] = useState(false);
  const queryClient = useQueryClient();

  // Password validation rules
  const passwordRules: ValidationRules = {
    new_password: [
      { required: true, message: 'Password is required' },
      { minLength: 8, message: 'Password must be at least 8 characters' },
      { 
        custom: (value) => /[A-Z]/.test(String(value)) && /[0-9]/.test(String(value)),
        message: 'Password must contain uppercase letters and numbers'
      },
    ],
    confirm_password: [
      { required: true, message: 'Please confirm your password' },
    ],
  };

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: api.getProfile,
  });

  const passwordForm = useFormValidation(
    { current_password: '', new_password: '', confirm_password: '' },
    passwordRules
  );

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
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error(`Password update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleThemeToggle = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    updatePreferencesMutation.mutate({ theme: newTheme });
    document.documentElement.classList.toggle('dark');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    if (passwordForm.values.new_password !== passwordForm.values.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    updatePasswordMutation.mutate({
      current_password: String(passwordForm.values.current_password),
      new_password: String(passwordForm.values.new_password),
    });
  };

  return (
    <PageErrorBoundary pageName="Settings">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
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
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Theme</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Toggle between light and dark mode
                    </p>
                  </div>
                  <button
                    onClick={handleThemeToggle}
                    disabled={updatePreferencesMutation.isPending}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    {document.documentElement.classList.contains('dark') ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security Settings</h2>
              
              {/* Password Change Section */}
              <form
                onSubmit={handlePasswordSubmit}
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
                    {...passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white ${
                      passwordForm.touched.current_password && passwordForm.errors.current_password
                        ? 'border-red-500'
                        : 'border-slate-300'
                    }`}
                  />
                  {passwordForm.touched.current_password && passwordForm.errors.current_password && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{passwordForm.errors.current_password}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    name="new_password"
                    {...passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white ${
                      passwordForm.touched.new_password && passwordForm.errors.new_password
                        ? 'border-red-500'
                        : 'border-slate-300'
                    }`}
                  />
                  {passwordForm.touched.new_password && passwordForm.errors.new_password && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{passwordForm.errors.new_password}</p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Must be at least 8 characters with uppercase letters and numbers
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    name="confirm_password"
                    {...passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white ${
                      passwordForm.touched.confirm_password && passwordForm.errors.confirm_password
                        ? 'border-red-500'
                        : 'border-slate-300'
                    }`}
                  />
                  {passwordForm.touched.confirm_password && passwordForm.errors.confirm_password && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{passwordForm.errors.confirm_password}</p>
                  )}
                </div>
                
                <button 
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              {/* 2FA Section */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                        Two-Factor Authentication
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={() => setShow2FASetup(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enable 2FA
                  </button>
                </div>

                {/* 2FA Setup Modal */}
                {show2FASetup && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Set Up Two-Factor Authentication
                      </h2>
                      <TwoFactorSetup
                        onComplete={() => {
                          setShow2FASetup(false);
                          queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit' && <AuditLogViewer />}
        </div>
      </div>
    </PageErrorBoundary>
  );
}
