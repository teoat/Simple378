import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidPublicKey: string | null = null;

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    // Register service worker if not already registered
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.register('/service-worker.js');
    }

    // Get VAPID public key from server
    const response = await fetch('/api/v1/notifications/vapid-public-key');
    const data = await response.json();
    this.vapidPublicKey = data.publicKey;
  }

  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      await this.initialize();
    }

    try {
      this.subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey!)
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(this.subscription.getKey('auth')!)
        }
      };

      // Send subscription to server
      await apiRequest('/api/v1/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscriptionData)
      });

      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();

      // Notify server
      await apiRequest('/api/v1/notifications/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint: this.subscription.endpoint })
      });

      this.subscription = null;
    }
  }

  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    permission: NotificationPermission;
    isSupported: boolean;
  }> {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

    if (!isSupported) {
      return { isSubscribed: false, permission: 'denied', isSupported: false };
    }

    const permission = Notification.permission;
    const subscription = await this.registration?.pushManager.getSubscription();
    const isSubscribed = subscription !== null;

    return { isSubscribed, permission, isSupported };
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async showNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    await this.registration!.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      data: payload.data,
      actions: payload.actions,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
      tag: payload.data?.tag || 'default'
    });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

class BackgroundSyncManager {
  private registration: ServiceWorkerRegistration | null = null;

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('sync' in window)) {
      throw new Error('Background sync not supported');
    }

    if (!this.registration) {
      this.registration = await navigator.serviceWorker.register('/service-worker.js');
    }
  }

  async registerSync(tag: string, options: BackgroundSyncOptions = {}): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    try {
      await this.registration!.sync.register(tag, options);
    } catch (error) {
      console.error('Failed to register background sync:', error);
      throw error;
    }
  }

  async getSyncTags(): Promise<string[]> {
    if (!this.registration) {
      await this.initialize();
    }

    // This is a simplified implementation
    // In a real implementation, you'd track registered sync tags
    return ['background-sync', 'data-sync'];
  }

  async triggerSync(tag: string): Promise<void> {
    await this.registerSync(tag);
  }
}

// React hooks for push notifications and background sync
export function usePushNotifications() {
  const [status, setStatus] = useState<{
    isSubscribed: boolean;
    permission: NotificationPermission;
    isSupported: boolean;
  }>({
    isSubscribed: false,
    permission: 'default',
    isSupported: false
  });

  const [manager] = useState(() => new PushNotificationManager());

  // Check status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const currentStatus = await manager.getSubscriptionStatus();
        setStatus(currentStatus);
      } catch (error) {
        console.error('Failed to check push notification status:', error);
      }
    };

    checkStatus();
  }, [manager]);

  const requestPermission = useCallback(async () => {
    try {
      const permission = await manager.requestPermission();
      const currentStatus = await manager.getSubscriptionStatus();
      setStatus(currentStatus);
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [manager]);

  const subscribe = useCallback(async () => {
    try {
      const subscription = await manager.subscribe();
      if (subscription) {
        const currentStatus = await manager.getSubscriptionStatus();
        setStatus(currentStatus);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, [manager]);

  const unsubscribe = useCallback(async () => {
    try {
      await manager.unsubscribe();
      const currentStatus = await manager.getSubscriptionStatus();
      setStatus(currentStatus);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [manager]);

  const testNotification = useCallback(async () => {
    try {
      await manager.showNotification({
        title: 'Test Notification',
        body: 'This is a test push notification from your fraud detection system.',
        data: { type: 'test', timestamp: Date.now() }
      });
      return true;
    } catch (error) {
      console.error('Failed to show test notification:', error);
      return false;
    }
  }, [manager]);

  return {
    status,
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification
  };
}

export function useBackgroundSync() {
  const [syncTags, setSyncTags] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  const [manager] = useState(() => new BackgroundSyncManager());

  // Check support and get sync tags on mount
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'sync' in window;
      setIsSupported(supported);

      if (supported) {
        try {
          const tags = await manager.getSyncTags();
          setSyncTags(tags);
        } catch (error) {
          console.error('Failed to get sync tags:', error);
        }
      }
    };

    checkSupport();
  }, [manager]);

  const registerSync = useCallback(async (tag: string, options: BackgroundSyncOptions = {}) => {
    try {
      await manager.registerSync(tag, options);
      // Update sync tags list
      const tags = await manager.getSyncTags();
      setSyncTags(tags);
      return true;
    } catch (error) {
      console.error('Failed to register background sync:', error);
      return false;
    }
  }, [manager]);

  const triggerSync = useCallback(async (tag: string) => {
    try {
      await manager.triggerSync(tag);
      return true;
    } catch (error) {
      console.error('Failed to trigger background sync:', error);
      return false;
    }
  }, [manager]);

  return {
    isSupported,
    syncTags,
    registerSync,
    triggerSync
  };
}

// Notification settings component
export function NotificationSettings() {
  const { status, requestPermission, subscribe, unsubscribe, testNotification } = usePushNotifications();
  const { isSupported: syncSupported, registerSync, triggerSync } = useBackgroundSync();

  const handleEnableNotifications = async () => {
    if (status.permission !== 'granted') {
      const permission = await requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }
    }

    if (!status.isSubscribed) {
      const success = await subscribe();
      if (success) {
        alert('Push notifications enabled successfully!');
      } else {
        alert('Failed to enable push notifications. Please try again.');
      }
    }
  };

  const handleDisableNotifications = async () => {
    const success = await unsubscribe();
    if (success) {
      alert('Push notifications disabled.');
    } else {
      alert('Failed to disable push notifications.');
    }
  };

  const handleTestNotification = async () => {
    const success = await testNotification();
    if (!success) {
      alert('Failed to show test notification. Please check your notification settings.');
    }
  };

  const handleBackgroundSync = async () => {
    const success = await registerSync('manual-sync');
    if (success) {
      alert('Background sync registered. Data will sync when online.');
    } else {
      alert('Failed to register background sync.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Notification & Sync Settings
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Configure push notifications and background sync for offline functionality.
        </p>

        {/* Push Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Push Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Browser Support
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {status.isSupported ? 'Supported' : 'Not supported in this browser'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                status.isSupported ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Permission Status
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                  {status.permission}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                status.permission === 'granted' ? 'bg-green-500' :
                status.permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Subscription Status
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {status.isSubscribed ? 'Subscribed' : 'Not subscribed'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                status.isSubscribed ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>

            <div className="flex gap-3 pt-4">
              {!status.isSubscribed ? (
                <button
                  onClick={handleEnableNotifications}
                  disabled={!status.isSupported}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enable Notifications
                </button>
              ) : (
                <button
                  onClick={handleDisableNotifications}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Disable Notifications
                </button>
              )}

              {status.isSubscribed && (
                <button
                  onClick={handleTestNotification}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Test Notification
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Background Sync */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Background Sync
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Browser Support
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {syncSupported ? 'Supported' : 'Not supported in this browser'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                syncSupported ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>

            {syncSupported && (
              <>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Active Sync Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {syncTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleBackgroundSync}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Register Manual Sync
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}