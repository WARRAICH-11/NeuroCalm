'use client';

import { Toaster } from '@/components/ui/toaster';
import { ToastProvider as RadixToastProvider } from '@/components/ui/toast-context';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixToastProvider>
      {children}
      <Toaster />
    </RadixToastProvider>
  );
}
