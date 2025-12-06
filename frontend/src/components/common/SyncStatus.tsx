import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const SyncStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      isOnline 
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};
