import { FC } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { GlobalSearch } from '../search/GlobalSearch';
import { SyncStatus } from '../sync/SyncStatus';

export const Header: FC = () => {
    const { logout } = useAuth();

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6">
            <div className="text-sm text-slate-500">
                Authorized Access Only
            </div>
            <div className="flex items-center gap-4">
                <SyncStatus />
                <GlobalSearch className="w-96" />
                <Button variant="ghost" onClick={logout}>
                    Logout
                </Button>
            </div>
        </header>
    );
};
