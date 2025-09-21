"use client";

import * as React from 'react';
import { useState, useEffect, createContext, useContext, useCallback, useRef, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from './client-app';
import { Skeleton } from '@/components/ui/skeleton';

export type ToastFunction = (message: string, variant?: 'default' | 'destructive') => void;

// Default toast function that does nothing
const defaultToast: ToastFunction = () => {};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshUser: async () => {},
  checkAuth: async () => false,
});

export type AuthProviderRef = {
  onError?: (error: Error) => void;
  setToast?: (toastFn: ToastFunction) => void;
};

type AuthProviderProps = {
  children: ReactNode;
  onError?: (error: Error) => void;
};

// Simple wrapper to handle auth state changes
const AuthStateHandler = ({
  onUserChange,
  onError
}: {
  onUserChange: (user: User | null) => void;
  onError: (error: Error) => void;
}) => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        onUserChange(user);
      },
      (error) => {
        console.error('Auth state error:', error);
        onError(error);
      }
    );

    return () => unsubscribe();
  }, [onUserChange, onError]);

  return null;
};

export const AuthProvider = React.forwardRef<AuthProviderRef, AuthProviderProps>(({ children, onError }, ref) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toastRef = useRef<ToastFunction>(defaultToast);
  const router = useRouter();
  
  // Set the toast function from the provider
  const setToast = useCallback((toastFn: ToastFunction) => {
    toastRef.current = toastFn;
  }, []);
  
  // Check if user is authenticated by validating the token
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      await auth.authStateReady();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return false;
      }
      // Get the token without forcing a refresh first
      const token = await currentUser.getIdToken();
      return !!token;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }, []);

  // Force refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    if (user) {
      try {
        await user.reload();
        // Force a re-render by updating the user state
        setUser({ ...user });
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  }, [user]);

  const handleAuthStateChange = useCallback(async (user: User | null) => {
    setLoading(true);
    try {
      if (user) {
        // Get the ID token
        const idToken = await user.getIdToken();
        
        try {
          // Set the session cookie
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ idToken }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to set session:', errorData);
            throw new Error('Failed to set session');
          }
          
          // Verify the token is still valid
          const idTokenResult = await user.getIdTokenResult(true);
          
          // Check if token is expired
          if (new Date() > new Date(idTokenResult.expirationTime)) {
            console.log('Token expired, signing out...');
            await firebaseSignOut(auth);
            setUser(null);
            window.location.href = '/login';
            return;
          }
        } catch (error) {
          console.error('Error validating token:', error);
          if (onError) {
            onError(error instanceof Error ? error : new Error('Failed to validate authentication token'));
          }
          await firebaseSignOut(auth);
          setUser(null);
          router.push('/login');
          return;
        }
      }
      
      setUser(user);
    } catch (error) {
      console.error('Error in auth state change:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('An unknown authentication error occurred'));
      }
      try {
        await firebaseSignOut(auth);
      } catch (signOutError) {
        console.error('Error during sign out:', signOutError);
      }
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router, onError]);

  const signOut = async () => {
    try {
      // Clear any stored data first
      localStorage.removeItem('user');
      
      // Clear the session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Reset all auth state
      setUser(null);
      setIsAuthenticated(false);
      
      // Force clear any cached data
      if (typeof window !== 'undefined') {
        // Clear all items from localStorage that might be related to auth
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('firebase:') || key.startsWith('firebaseui:')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Show success message before redirect
      toastRef.current('You have been signed out.');
      
      // Force a hard redirect to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toastRef.current('Failed to sign out. Please try again.', 'destructive');
    }
  };


  // Expose the onError handler and setToast via ref
  React.useImperativeHandle(ref, () => ({
    onError: (error: Error) => {
      handleError(error);
    },
    setToast: (toastFn: ToastFunction) => {
      toastRef.current = toastFn;
    }
  }), [onError]);

  const handleError = useCallback((error: Error) => {
    console.error('Auth Error:', error);
    
    // Use the toast callback if available
    if (toastRef.current) {
      toastRef.current(error.message, 'destructive');
    }
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Only render children when not loading or when we have a user
  const shouldRenderChildren = !loading || user;

  // Set up the auth state listener - single source of truth for auth state
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      try {
        if (user) {
          // Get fresh token
          const token = await user.getIdToken();
          if (token) {
            // Update session
            const response = await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'same-origin',
              body: JSON.stringify({ idToken: token })
            });
            
            if (!response.ok) {
              throw new Error('Failed to update session');
            }
            
            // Only update state if still mounted
            if (isMounted) {
              setUser(user);
              setIsAuthenticated(true);
            }
          } else {
            throw new Error('No token available');
          }
        } else {
          // Clear session when signed out
          await fetch('/api/auth/session', {
            method: 'DELETE',
            credentials: 'same-origin'
          });
          
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
        
        // Only sign out if we have a user but encountered an error
        if (user) {
          await firebaseSignOut(auth);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Initial auth check
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Initial auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [checkAuth]);

  const contextValue = {
    user,
    loading,
    isAuthenticated,
    signOut,
    refreshUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading ? (
        React.Children.map(children, child => 
          React.cloneElement(child as React.ReactElement, { setToast })
        )
      ) : (
        <Skeleton className="h-screen w-full" />
      )}
    </AuthContext.Provider>
  );
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
