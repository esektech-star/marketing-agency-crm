import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          setSwRegistration(registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You are offline - changes will sync when back online');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      toast.error('App installation not available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        toast.success('App installed successfully!');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error('Installation failed');
    }
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const sendNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!swRegistration) {
        toast.error('Service Worker not available');
        return;
      }

      try {
        await swRegistration.showNotification(title, {
          icon: '/manus-storage/esek-tech-logo_88d01e05.jpg',
          badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%23000" width="96" height="96"/><text x="48" y="64" font-size="40" font-weight="bold" fill="%23fff" text-anchor="middle">ET</text></svg>',
          ...options,
        });
      } catch (error) {
        console.error('Notification failed:', error);
        toast.error('Failed to send notification');
      }
    },
    [swRegistration]
  );

  const syncData = useCallback(async () => {
    if (!swRegistration) {
      toast.error('Service Worker not available');
      return;
    }

    try {
      const syncManager = (swRegistration as any).sync;
      if (syncManager) {
        await syncManager.register('sync-tasks');
        await syncManager.register('sync-comments');
        toast.success('Sync registered - changes will be synced');
      } else {
        toast.error('Background Sync not supported');
      }
    } catch (error) {
      console.error('Sync registration failed:', error);
      toast.error('Failed to register sync');
    }
  }, [swRegistration]);

  return {
    deferredPrompt,
    isInstalled,
    isOnline,
    swRegistration,
    installApp,
    requestNotificationPermission,
    sendNotification,
    syncData,
  };
}
