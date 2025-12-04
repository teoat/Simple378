import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  Scale, 
  Upload, 
  Settings, 
  Activity 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', href: '/cases', icon: Files },
  { name: 'Adjudication Queue', href: '/adjudication', icon: Scale },
  { name: 'Reconciliation', href: '/reconciliation', icon: Activity },
  { name: 'Forensics', href: '/forensics', icon: Upload },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          AntiGravity
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4" role="navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Investigator</p>
            <p className="text-xs text-slate-400">View Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
