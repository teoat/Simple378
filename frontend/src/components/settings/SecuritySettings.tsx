import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface SecuritySettingsProps {
  onSave?: (data: any) => void;
}

export function SecuritySettings({ onSave }: SecuritySettingsProps) {
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactor, setTwoFactor] = useState({
    enabled: false,
    method: '2fa' as '2fa' | 'email' | 'sms',
  });
  const [other, setOther] = useState({
    sessionTimeout: 30,
    loginAlerts: true,
  });

  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePassword = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSave?.(passwords);
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={passwords.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-slate-200 rounded text-sm"
                />
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
              />
            </div>

            <button
              onClick={handleSavePassword}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              Update Password
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable 2FA</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={twoFactor.enabled}
                  onChange={(e) => setTwoFactor({ ...twoFactor, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm">{twoFactor.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            {twoFactor.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Authentication Method</label>
                  <select
                    value={twoFactor.method}
                    onChange={(e) =>
                      setTwoFactor({ ...twoFactor, method: e.target.value as '2fa' | 'email' | 'sms' })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                  >
                    <option value="2fa">Authenticator App</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium">
                  Setup 2FA
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={other.sessionTimeout}
                onChange={(e) => setOther({ ...other, sessionTimeout: parseInt(e.target.value) })}
                min={5}
                max={480}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Auto-logout after inactivity</p>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Login Alerts</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={other.loginAlerts}
                  onChange={(e) => setOther({ ...other, loginAlerts: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm">{other.loginAlerts ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <button
              onClick={() => onSave?.(other)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              Save Settings
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
