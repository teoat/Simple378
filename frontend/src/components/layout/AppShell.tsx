import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KeyboardShortcutsModal } from '../KeyboardShortcutsModal';

export function AppShell() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Global shortcut to show keyboard shortcuts modal
  useHotkeys('?', () => {
    setShowShortcuts(true);
  }, { preventDefault: true });

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}
