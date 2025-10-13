'use client';

import { useState, useEffect } from 'react';
import { syncManager } from '@/lib/sync';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncError(null);
      await syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingChanges = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncManager.syncPendingChanges();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    syncError,
    syncPendingChanges,
  };
}