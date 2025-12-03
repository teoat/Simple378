import { useState } from 'react';
import { cn } from '../lib/utils';
import { User, Shield, Bell, Eye, Database } from 'lucide-react';
import { AuditLogViewer } from '../components/settings/AuditLogViewer';

const tabs = [
  { name: 'General', icon: User, current: true },
  { name: 'Security', icon: Shield, current: false },
  { name: 'Notifications', icon: Bell, current: false },
  { name: 'Audit Log', icon: Eye, current: false },
  { name: 'Data Management', icon: Database, current: false },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
          Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account settings and system preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Sidebar Navigation */}
        <nav className="flex space-x-4 lg:flex-col lg:space-x-0 lg:space-y-1 lg:w-64">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                activeTab === tab.name
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              <tab.icon
                className={cn(
                  activeTab === tab.name ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
                aria-hidden="true"
              />
              <span className="truncate">{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 rounded-lg bg-white p-6 shadow dark:bg-slate-800">
          {activeTab === 'General' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Profile</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Update your personal information.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      First name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        autoComplete="given-name"
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Last name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        autoComplete="family-name"
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Appearance</h3>
                <div className="mt-4 flex items-center justify-between">
                   <span className="flex flex-grow flex-col">
                      <span className="text-sm font-medium leading-6 text-slate-900 dark:text-white">Dark Mode</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Toggle system-wide dark mode.</span>
                   </span>
                   <button
                      type="button"
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      role="switch"
                      aria-checked="true"
                   >
                      <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                   </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'Audit Log' && <AuditLogViewer />}
          
          {activeTab === 'Security' && (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <Shield className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">Security settings placeholder</p>
             </div>
          )}
           {activeTab === 'Notifications' && (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <Bell className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">Notifications settings placeholder</p>
             </div>
          )}
           {activeTab === 'Data Management' && (
             <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <Database className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">Data Management settings placeholder</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
