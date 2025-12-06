import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Command } from 'cmdk';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calculator, FileText, LayoutDashboard, Search, Settings, FileSpreadsheet, Scale, Home, Users } from 'lucide-react';
import { api } from '../../lib/api';
import './GlobalSearch.css'; // We'll need some basic styles for cmdk

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Toggle with Cmd+K
  useHotkeys('meta+k', (e) => {
    e.preventDefault();
    setOpen((open) => !open);
  });

  // Search API
  const { data: results, isLoading } = useQuery({
    queryKey: ['global-search', search],
    queryFn: () => api.searchCases(search),
    enabled: search.length > 2,
    staleTime: 1000 * 60, // 1 minute
  });

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-[20vh] bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-3 pl-4">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 dark:bg-slate-800 dark:text-slate-400">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-sm text-slate-500">
            {isLoading ? 'Searching...' : 'No results found.'}
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs text-slate-400 font-medium">
            <Command.Item
              onSelect={() => runCommand(() => navigate('/dashboard'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate('/cases'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <FileText className="w-4 h-4" />
              Cases
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate('/reconciliation'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <Calculator className="w-4 h-4" />
              Reconciliation
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate('/ingestion'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Ingestion
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate('/adjudication'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <Scale className="w-4 h-4" />
              Adjudication
            </Command.Item>
          </Command.Group>

          {results?.items && results.items.length > 0 && (
            <Command.Group heading="Cases" className="px-2 py-1.5 text-xs text-slate-400 font-medium mt-2 border-t border-slate-100 dark:border-slate-800">
              {results.items.map((item: any) => (
                <Command.Item
                  key={item.id}
                  value={item.subject_name}
                  onSelect={() => runCommand(() => navigate(`/cases/${item.id}`))}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <Users className="w-4 h-4" />
                  <span>{item.subject_name}</span>
                  <span className="ml-auto text-xs text-slate-400">{item.status}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Settings" className="px-2 py-1.5 text-xs text-slate-400 font-medium mt-2 border-t border-slate-100 dark:border-slate-800">
             <Command.Item
              onSelect={() => runCommand(() => navigate('/settings'))}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Command.Item>
             <Command.Item
              onSelect={() => runCommand(() => { /* TODO: Toggle Theme */ })}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
