import { useState } from 'react';
import { Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface NotificationPreference {
  id: string;
  type: string;
  email: boolean;
  inApp: boolean;
  push: boolean;
}

interface NotificationPreferencesProps {
  onSave?: (preferences: NotificationPreference[]) => void;
}

export function NotificationPreferences({ onSave }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    { id: '1', type: 'Case Updates', email: true, inApp: true, push: true },
    { id: '2', type: 'Team Mentions', email: true, inApp: true, push: false },
    { id: '3', type: 'System Alerts', email: true, inApp: true, push: true },
    { id: '4', type: 'Report Generation', email: false, inApp: true, push: false },
    { id: '5', type: 'Weekly Summary', email: true, inApp: false, push: false },
  ]);

  const handleToggle = (id: string, channel: 'email' | 'inApp' | 'push') => {
    setPreferences(prev =>
      prev.map(p => (p.id === id ? { ...p, [channel]: !p[channel] } : p))
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {preferences.map(pref => (
              <div
                key={pref.id}
                className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{pref.type}</p>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <input
                      type="checkbox"
                      checked={pref.email}
                      onChange={() => handleToggle(pref.id, 'email')}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <input
                      type="checkbox"
                      checked={pref.inApp}
                      onChange={() => handleToggle(pref.id, 'inApp')}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                    <input
                      type="checkbox"
                      checked={pref.push}
                      onChange={() => handleToggle(pref.id, 'push')}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </label>
                </div>
              </div>
            ))}

            <div className="pt-4 flex gap-2 justify-end">
              <button className="px-4 py-2 border border-slate-200 rounded hover:bg-slate-50 text-sm">
                Reset to Defaults
              </button>
              <button
                onClick={() => onSave?.(preferences)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input type="time" defaultValue="18:00" className="w-full px-3 py-2 border border-slate-200 rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input type="time" defaultValue="09:00" className="w-full px-3 py-2 border border-slate-200 rounded text-sm" />
            </div>
            <button className="w-full px-4 py-2 border border-slate-200 rounded hover:bg-slate-50 text-sm">
              Update Quiet Hours
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
