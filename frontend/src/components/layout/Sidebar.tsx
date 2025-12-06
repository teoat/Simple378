import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, AlertCircle, Settings, Upload, GitMerge, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar: FC = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cases', label: 'Cases', icon: Users },
    { to: '/adjudication', label: 'Adjudication', icon: AlertCircle },
    { to: '/ingestion', label: 'Ingestion', icon: Upload },
    { to: '/reconciliation', label: 'Reconciliation', icon: GitMerge },
    { to: '/forensics', label: 'Forensics', icon: Search },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Simple378
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                )
              }
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
