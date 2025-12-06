import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Adjudication', href: '/adjudication', icon: ShieldAlert },
    { name: 'Cases', href: '/cases', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary tracking-tight">FraudGuard</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-danger">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden border-b border-border bg-surface p-4 flex items-center justify-between">
          <h1 className="font-bold text-primary">FraudGuard</h1>
          <Button variant="ghost" size="icon">
            <LayoutDashboard className="w-6 h-6" />
          </Button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppShell;
