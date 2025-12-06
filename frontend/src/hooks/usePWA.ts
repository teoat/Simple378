import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  canInstall: boolean;
  isUpdateAvailable: boolean;
  isOnline: boolean;
  isInstalling: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface PWAActions {
  installApp: () => Promise<void>;
  triggerSync: () => Promise<void>;
  updateApp: () => void;
}

export function usePWA(): PWAState & PWAActions {
  const [state, setState] = useState<PWAState>({
    canInstall: false,
    isUpdateAvailable: false,
    isOnline: navigator.onLine,
    isInstalling: false,
    registration: null,
  });

  // Handle install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ ...prev, canInstall: true }));
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState(prev => ({ ...prev, canInstall: false, isInstalling: false }));
    };

    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          setState(prev => ({ ...prev, registration }));

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, isUpdateAvailable: true }));
                }
              });
            }
          });

          // Periodic update checks (every 6 hours)
          const checkForUpdates = () => {
            registration.update();
          };
          const interval = setInterval(checkForUpdates, 6 * 60 * 60 * 1000);

          return () => clearInterval(interval);
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;

    setState(prev => ({ ...prev, isInstalling: true }));

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, canInstall: false }));
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
    } finally {
      setDeferredPrompt(null);
      setState(prev => ({ ...prev, isInstalling: false }));
    }
  }, [deferredPrompt]);

  const triggerSync = useCallback(async () => {
    if (!state.registration) return;

    try {
      await (state.registration as any).sync.register('background-sync');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }, [state.registration]);

  const updateApp = useCallback(() => {
    if (state.registration) {
      const newWorker = state.registration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            window.location.reload();
          }
        });
      }
    }
  }, [state.registration]);

  return {
    ...state,
    installApp,
    triggerSync,
    updateApp,
  };
}