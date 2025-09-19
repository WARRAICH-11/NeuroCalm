'use client';

import * as React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { 
  ToastProvider as RadixToastProvider, 
  useToast,
  type ToastFunction 
} from '@/components/ui/toast-context';

interface ToastProviderProps {
  children: React.ReactNode;
  setToast?: (toastFn: ToastFunction) => void;
}

export function ToastProvider({ children, setToast }: ToastProviderProps) {
  return (
    <RadixToastProvider>
      {setToast && <ToastCallback setToast={setToast} />}
      {children}
      <Toaster />
    </RadixToastProvider>
  );
}

// Internal component to handle the toast callback
function ToastCallback({ setToast }: { setToast: (toastFn: ToastFunction) => void }) {
  const { toast } = useToast();

  React.useEffect(() => {
    const toastFn: ToastFunction = (message: string, variant: 'default' | 'destructive' = 'default') => {
      toast({
        description: message,
        variant,
      });
    };
    
    setToast(toastFn);
    
    return () => {
      setToast(() => {}); // Cleanup
    };
  }, [setToast, toast]);

  return null;
}
