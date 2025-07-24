import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast, { ToastConfig } from '@/components/ui/Toast';

interface ToastContextType {
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  showSuccess: (title: string, message?: string, action?: ToastConfig['action']) => void;
  showError: (title: string, message?: string, action?: ToastConfig['action']) => void;
  showWarning: (title: string, message?: string, action?: ToastConfig['action']) => void;
  showInfo: (title: string, message?: string, action?: ToastConfig['action']) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = (config: Omit<ToastConfig, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastConfig = {
      ...config,
      id,
    };

    setToasts(prev => [...prev, newToast]);
  };

  const showSuccess = (title: string, message?: string, action?: ToastConfig['action']) => {
    showToast({ type: 'success', title, message, action });
  };

  const showError = (title: string, message?: string, action?: ToastConfig['action']) => {
    showToast({ type: 'error', title, message, action });
  };

  const showWarning = (title: string, message?: string, action?: ToastConfig['action']) => {
    showToast({ type: 'warning', title, message, action });
  };

  const showInfo = (title: string, message?: string, action?: ToastConfig['action']) => {
    showToast({ type: 'info', title, message, action });
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissToast,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View style={styles.toastContainer}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
});