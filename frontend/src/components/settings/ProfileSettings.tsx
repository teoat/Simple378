import { useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  department: string;
}

interface ProfileSettingsProps {
  onSave?: (data: ProfileData) => void;
}

export function ProfileSettings({ onSave }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    title: 'Senior Analyst',
    department: 'Investigations',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave?.(profile);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Profile Settings</CardTitle>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm text-slate-600">{profile.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-200 rounded disabled:bg-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-200 rounded disabled:bg-slate-50 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-200 rounded disabled:bg-slate-50 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-200 rounded disabled:bg-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-200 rounded disabled:bg-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Job Title</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-200 rounded disabled:bg-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => handleChange('department', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-200 rounded disabled:bg-slate-50 text-sm"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-end pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-200 rounded hover:bg-slate-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
