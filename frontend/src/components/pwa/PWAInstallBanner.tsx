import React, { useEffect, useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Button } from '../ui/Button';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Banner component prompting users to install the PWA
 * Shows when the install prompt is available and not previously dismissed
 */
export function PWAInstallBanner() {
  const { canInstall, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Load dismiss state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    try {
      await installApp();
      setIsDismissed(true);
    } catch (err) {
      console.error('Failed to install PWA:', err);
    }
  };

  if (!canInstall || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Download size={20} />
          <div>
            <p className="font-semibold">Install App</p>
            <p className="text-sm text-blue-100">
              Install this app on your device for quick access
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            variant="primary"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-blue-500 rounded"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PWAInstallBanner;
