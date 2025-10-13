'use client';

import { useEffect } from 'react';
import { authService } from '@/services/auth';

export default function AuthInitializer() {
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we're on the client side
        if (typeof window === 'undefined') return;
        
        // Check if user is already authenticated
        const currentUser = authService.getStoredUser();
        if (currentUser) {
          console.log('User already authenticated:', currentUser);
          return;
        }

        // Check if we're on login or register pages
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/register') {
          return;
        }

        // Auto-login with admin credentials for testing
        console.log('Attempting auto-login...');
        const response = await authService.login({
          email: 'admin@tbscreening.com',
          password: 'password123'
        });
        
        if (response.token) {
          console.log('Auto-login successful:', response.user);
        } else {
          console.error('Auto-login failed: No token received');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}