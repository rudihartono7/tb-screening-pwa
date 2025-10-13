'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/services/auth';

export function AuthInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      // Check if already authenticated
      if (authService.isAuthenticated()) {
        return;
      }

      // Check if we're on login or register pages
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/register') {
        return;
      }

      setIsInitializing(true);

      try {
        // Auto-login with admin credentials for testing
        await authService.login({
          email: 'admin@tbscreening.com',
          password: 'password123'
        });
        
        console.log('Auto-login successful');
      } catch (error) {
        console.error('Auto-login failed:', error);
        // Don't redirect automatically to avoid infinite loops
        // Just log the error for now
      } finally {
        setIsInitializing(false);
      }
    };

    // Add a small delay to ensure the component is mounted
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}