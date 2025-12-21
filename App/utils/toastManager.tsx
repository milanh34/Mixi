// utils/toastManager.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  
  const showToast = (message: string, type: ToastType) => {
    setToast({ id: Date.now(), message, type });
  };
  
  const dismissToast = () => {
    setToast(null);
  };
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      )}
    </ToastContext.Provider>
  );
}
