"use client";

import * as React from 'react';
import { useState, useEffect, createContext, useContext, useCallback, useRef, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from './client-app';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

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

export const AuthProvider = React.forwardRef<{ onError?: (error: Error) => void }, AuthProviderProps>(({ children, onError }, ref) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthStateChange = useCallback(async (user: User | null) => {
    setLoading(true);
    try {
      if (user) {
        // Verify the token is still valid
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          
          // Check if token is expired
          if (new Date() > new Date(idTokenResult.expirationTime)) {
            console.log('Token expired, signing out...');
            await firebaseSignOut(auth);
            setUser(null);
            router.push('/login');
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
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      handleError(new Error('Failed to sign out. Please try again.'));
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await handleAuthStateChange(auth.currentUser);
    }
  };

  // Expose the onError handler via ref
  React.useImperativeHandle(ref, () => ({
    onError: (error: Error) => {
      if (onError) onError(error);
    }
  }), [onError]);

  const handleError = useCallback((error: Error) => {
    console.error('Auth Error:', error);
    
    // Show toast notification
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
    
    // Call the onError callback if provided
    if (onError) onError(error);
  }, [onError, toast]);

  // Only render children when not loading or when we have a user
  const shouldRenderChildren = !loading || user;

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      <AuthStateHandler 
        onUserChange={handleAuthStateChange} 
        onError={(error) => {
          console.error('Auth state handler error:', error);
          if (onError) onError(error);
        }} 
      />
      {shouldRenderChildren ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
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
