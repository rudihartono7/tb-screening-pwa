'use client';

import { useState, useEffect } from 'react';

// PWA Installation and Service Worker utilities

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init() {
    // Check if app is already installed
    this.checkInstallationStatus();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.dispatchEvent('installable', { canInstall: true });
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.dispatchEvent('installed', { installed: true });
    });

    // Register service worker
    await this.registerServiceWorker();
  }

  private checkInstallationStatus() {
    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check if running as PWA on iOS
    if ((window.navigator as any).standalone === true) {
      this.isInstalled = true;
    }
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.serviceWorkerRegistration = registration;

      console.log('Service Worker registered successfully:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.dispatchEvent('updateavailable', { registration });
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent) {
    const { type, data } = event.data;

    switch (type) {
      case 'BACKGROUND_SYNC':
        this.dispatchEvent('backgroundsync', data);
        break;
      case 'CACHE_UPDATED':
        this.dispatchEvent('cacheupdated', data);
        break;
      default:
        console.log('Unknown service worker message:', event.data);
    }
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    try {
      await this.serviceWorkerRegistration.update();
      console.log('Service Worker updated');
    } catch (error) {
      console.error('Failed to update Service Worker:', error);
    }
  }

  async skipWaiting(): Promise<void> {
    if (!this.serviceWorkerRegistration?.waiting) {
      return;
    }

    this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Request persistent storage
  async requestPersistentStorage(): Promise<boolean> {
    if (!('storage' in navigator) || !('persist' in navigator.storage)) {
      return false;
    }

    try {
      const persistent = await navigator.storage.persist();
      console.log('Persistent storage:', persistent);
      return persistent;
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
      return false;
    }
  }

  // Get storage usage
  async getStorageUsage(): Promise<{ usage: number; quota: number } | null> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return null;
    }
  }

  // Share API
  async share(data: ShareData): Promise<boolean> {
    if (!('share' in navigator)) {
      // Fallback to clipboard or other sharing methods
      return this.fallbackShare(data);
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Failed to share:', error);
      return false;
    }
  }

  private async fallbackShare(data: ShareData): Promise<boolean> {
    if ('clipboard' in navigator && data.text) {
      try {
        await navigator.clipboard.writeText(data.text);
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
    return false;
  }

  // Custom event dispatcher
  private dispatchEvent(type: string, detail: any) {
    const event = new CustomEvent(`pwa:${type}`, { detail });
    window.dispatchEvent(event);
  }

  // Add event listeners for PWA events
  on(event: string, callback: (detail: any) => void) {
    const handler = (e: CustomEvent) => callback(e.detail);
    window.addEventListener(`pwa:${event}`, handler as EventListener);
    
    return () => {
      window.removeEventListener(`pwa:${event}`, handler as EventListener);
    };
  }
}

// Singleton instance
export const pwaManager = new PWAManager();

// React hook for PWA functionality
export function usePWA() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setIsInstalled(pwaManager.isAppInstalled());
    setCanInstall(pwaManager.canInstall());

    const unsubscribeInstallable = pwaManager.on('installable', () => {
      setCanInstall(true);
    });

    const unsubscribeInstalled = pwaManager.on('installed', () => {
      setIsInstalled(true);
      setCanInstall(false);
    });

    const unsubscribeUpdate = pwaManager.on('updateavailable', () => {
      setUpdateAvailable(true);
    });

    return () => {
      unsubscribeInstallable();
      unsubscribeInstalled();
      unsubscribeUpdate();
    };
  }, []);

  const install = async () => {
    const success = await pwaManager.showInstallPrompt();
    if (success) {
      setCanInstall(false);
    }
    return success;
  };

  const update = async () => {
    await pwaManager.skipWaiting();
    setUpdateAvailable(false);
    window.location.reload();
  };

  return {
    canInstall,
    isInstalled,
    updateAvailable,
    install,
    update,
    share: pwaManager.share.bind(pwaManager),
    requestPersistentStorage: pwaManager.requestPersistentStorage.bind(pwaManager),
    getStorageUsage: pwaManager.getStorageUsage.bind(pwaManager),
  };
}