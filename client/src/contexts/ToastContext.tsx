import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/ToastContainer';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, customDuration?: number) => {
    // Avoid duplicate message if same message is already visible
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) return prev;

      const defaultDuration =
        type === 'success' || type === 'info' ? 2500 : type === 'warning' ? 3500 : 4000;
      const duration = customDuration || defaultDuration;
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const newItem: ToastItem = { id, type, message, duration };

      setTimeout(() => {
        removeToast(id);
      }, duration);

      // Keep max 4 toasts at a time
      return [...prev.slice(-3), newItem];
    });
  }, [removeToast]);

  const toast = {
    success: (msg: string, dur?: number) => addToast('success', msg, dur),
    error: (msg: string, dur?: number) => addToast('error', msg, dur),
    warning: (msg: string, dur?: number) => addToast('warning', msg, dur),
    info: (msg: string, dur?: number) => addToast('info', msg, dur)
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
