"use client";

import { ReactNode, useRef, useCallback } from 'react';
import { AuthProvider } from '@/lib/firebase/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast-provider';
import type { AuthProviderRef } from '@/lib/firebase/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { ToastFunction } from '@/components/ui/toast-context';

export function AuthWrapper({ children }: { children: ReactNode }) {
  const authRef = useRef<AuthProviderRef>(null);

  const handleSetToast = useCallback((toastFn: ToastFunction) => {
    if (authRef.current?.setToast) {
      authRef.current.setToast(toastFn);
    }
  }, []);

  return (
    <AuthProvider ref={authRef}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ToastProvider setToast={handleSetToast}>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
