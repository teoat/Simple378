import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  Scale,
  Upload,
  Settings,
  Activity,
  Search,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Logo } from './Logo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', href: '/cases', icon: Files },
  { name: 'Adjudication Queue', href: '/adjudication', icon: Scale },
  { name: 'Reconciliation', href: '/reconciliation', icon: Activity },
  { name: 'Forensics', href: '/forensics', icon: Upload },
  { name: 'Semantic Search', href: '/search', icon: Search },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-background text-foreground">
      <div className="border-b border-border">
        <Logo />
      </div>
      <nav className="flex-1 space-y-2 px-4 py-4" role="navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
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
      <div className="border-t border-border p-4">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-accent to-primary" />
          <div className="ml-3">
            <p className="text-sm font-semibold text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">john.doe@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
