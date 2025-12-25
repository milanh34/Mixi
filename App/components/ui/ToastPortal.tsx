// components/ui/ToastPortal.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, StyleSheet, Platform } from 'react-native';
import { Toast, ToastType } from './Toast';

interface ToastContextType {
  showToast: (
    message: string,
    type: ToastType,
    options?: {
      confirmAction?: () => Promise<void>;
      confirmText?: string;
    }
  ) => void;
}

const ToastPortalContext = createContext<ToastContextType | null>(null);

export const useToastPortal = () => {
  const context = useContext(ToastPortalContext);
  if (!context) {
    throw new Error('useToastPortal must be used within ToastPortalProvider');
  }
  return context;
};

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  confirmAction?: () => Promise<void>;
  confirmText?: string;
}

export function ToastPortalProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (
    message: string,
    type: ToastType,
    options?: { confirmAction?: () => Promise<void>; confirmText?: string }
  ) => {
    setToast({
      id: Date.now(),
      message,
      type,
      confirmAction: options?.confirmAction,
      confirmText: options?.confirmText,
    });
  };

  const handleConfirm = async () => {
    if (toast?.confirmAction) {
      try {
        await toast.confirmAction();
      } catch (error) {
        console.error('Confirm action failed:', error);
      }
    }
    setToast(null);
  };

  const dismissToast = () => {
    setToast(null);
  };

  return (
    <ToastPortalContext.Provider value={{ showToast }}>
      {children}
      <Modal
        visible={!!toast}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={dismissToast}
      >
        <View style={styles.portalContainer} pointerEvents="box-none">
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onDismiss={dismissToast}
              onConfirm={handleConfirm}
              showConfirm={!!toast.confirmAction}
              confirmText={toast.confirmText || 'Confirm'}
            />
          )}
        </View>
      </Modal>
    </ToastPortalContext.Provider>
  );
}

const styles = StyleSheet.create({
  portalContainer: {
    flex: 1,
    pointerEvents: 'box-none',
  },
});