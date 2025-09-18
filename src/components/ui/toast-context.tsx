"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";

type ToasterToast = ToastPrimitives.ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement<{
    altText: string;
    children: React.ReactNode;
    onClick: () => void;
  }>;
  variant?: 'default' | 'destructive';
};

type ToastActionElement = React.ReactElement<{
  altText: string;
  children: React.ReactNode;
  onClick: () => void;
}>;

interface ToastContextType {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, 'id'> & { id?: string }) => () => void;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  const toastIdCounter = React.useRef(0);

  const toast: ToastContextType['toast'] = React.useCallback((props) => {
    const id = props.id || `toast-${toastIdCounter.current++}`;
    
    setToasts((prevToasts) => {
      if (prevToasts.some((t) => t.id === id)) {
        return prevToasts;
      }
      return [...prevToasts, { ...props, id }];
    });

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);

    return () => {
      clearTimeout(timer);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({
      toasts,
      toast,
      dismissToast,
    }),
    [toasts, toast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export type { ToasterToast as Toast, ToastActionElement };
