import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
        Fraud Detection Platform
      </h1>
      <div className="flex items-center gap-4">
        <button
          aria-label="View notifications"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          aria-label="View profile"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <User className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          onClick={logout}
          aria-label="Logout"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
