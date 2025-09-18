"use client";

import { useState, useRef, useEffect } from 'react';
import { AuthProvider as FirebaseAuthProvider } from '@/lib/firebase/auth-provider';
import { ToastProvider, useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

type ErrorHandler = (error: Error) => void;

function Providers({ children }: { children: React.ReactNode }) {
  const [toastQueue, setToastQueue] = useState<Array<{message: string}>>([]);
  const errorHandlerRef = useRef<ErrorHandler | null>(null);

  // Initialize error handler
  useEffect(() => {
    const handleError = (error: unknown) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'An unknown error occurred';

      // Add to toast queue
      setToastQueue(prev => [...prev, { message: errorMessage }]);
    };

    errorHandlerRef.current = handleError;

    // Cleanup
    return () => {
      errorHandlerRef.current = null;
    };
  }, []);

  // Process toast queue
  useEffect(() => {
    if (toastQueue.length > 0) {
      const { toast } = require('@/components/ui/use-toast');
      const { message } = toastQueue[0];
      
      // Only show toast if we have a message
      if (message) {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
      
      // Remove the processed toast after a delay
      const timer = setTimeout(() => {
        setToastQueue(prev => prev.slice(1));
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [toastQueue]);

  return (
    <ToastProvider>
      <ErrorBoundary onError={(error: unknown) => {
        if (errorHandlerRef.current) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          errorHandlerRef.current(errorObj);
        }
      }}>
        <FirebaseAuthProvider 
          onError={(error: unknown) => {
            if (errorHandlerRef.current) {
              const errorObj = error instanceof Error ? error : new Error(String(error));
              errorHandlerRef.current(errorObj);
            }
          }}
        >
          {children}
          <Toaster />
        </FirebaseAuthProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}

// Error boundary to catch errors in the render tree
class ErrorBoundary extends React.Component<{ 
  children: React.ReactNode; 
  onError: (error: unknown) => void 
}, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; onError: (error: unknown) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError(error);
  }

  render() {
    // Always render children, let the error propagate to the toast
    return this.props.children;
  }
}

export default Providers;
