'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService, User } from '../services';
import { useCart } from '@/contexts/CartContext';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for authentication management with cart sync
 * Automatically syncs local cart with backend when user logs in
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  // Get cart context for syncing
  const { mergeWithBackend } = useCart();

  // Load auth data from localStorage on mount
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const token = localStorage.getItem('auth-token');
        const userData = localStorage.getItem('auth-user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        setState(prev => ({ ...prev, loading: false, error: 'Failed to load authentication data' }));
      }
    };

    loadAuthData();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify(user));
        
        setState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        // Sync local cart with backend after successful login
        try {
          console.log('Syncing cart after login...');
          await mergeWithBackend(user.id, token);
          console.log('Cart sync completed');
        } catch (syncError) {
          // Log but don't fail login if cart sync fails
          console.error('Cart sync failed after login:', syncError);
        }
        
        return true;
      } else {
        const errorMessage = response.message || 'Login failed';
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage 
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return false;
    }
  }, [mergeWithBackend]);

  // Register function
  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify(user));
        
        setState({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        // Sync local cart with backend after successful registration
        try {
          console.log('Syncing cart after registration...');
          await mergeWithBackend(user.id, token);
          console.log('Cart sync completed');
        } catch (syncError) {
          // Log but don't fail registration if cart sync fails
          console.error('Cart sync failed after registration:', syncError);
        }
        
        return true;
      } else {
        const errorMessage = response.message || 'Registration failed';
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage 
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return false;
    }
  }, [mergeWithBackend]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      if (state.token) {
        await authService.logout(state.token);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear localStorage and state regardless of API success
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  }, [state.token]);

  // Verify token function
  const verifyToken = useCallback(async (): Promise<boolean> => {
    if (!state.token) return false;

    try {
      const response = await authService.verifyToken(state.token);
      
      if (response.success && response.data?.valid) {
        return true;
      } else {
        // Token is invalid, logout
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      await logout();
      return false;
    }
  }, [state.token, logout]);

  // Clear error function
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    verifyToken,
    clearError,
  };
}

export default useAuth;
