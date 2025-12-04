import { Bell } from 'lucide-react';
import { GlobalSearch } from '../search/GlobalSearch';
import { UserMenu } from './UserMenu';

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center">
        {/* Maybe add a breadcrumb here in the future */}
      </div>

      <div className="flex flex-1 items-center justify-center">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="View notifications"
          className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
