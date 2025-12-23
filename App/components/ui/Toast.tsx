// components/ui/Toast.tsx - FULL CONFIRMATION TOAST
import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useThemeStore } from '../../stores/themeStore';
import * as Haptics from 'expo-haptics';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onDismiss: () => void;
  onConfirm?: () => void;
  showConfirm?: boolean;
  confirmText?: string;
}

export function Toast({ 
  message, 
  type, 
  duration = 4000, 
  onDismiss, 
  onConfirm,
  showConfirm = false, 
  confirmText = 'Confirm' 
}: ToastProps) {
  const { theme } = useThemeStore();
  
  useEffect(() => {
    // Haptic feedback
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [type]);
  
  // Auto-dismiss only if NO confirmation needed
  useEffect(() => {
    if (showConfirm) return;
    
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onDismiss, showConfirm]);
  
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.colors.success,
          icon: 'check-circle' as const,
        };
      case 'error':
        return {
          bg: theme.colors.error,
          icon: 'error' as const,
        };
      case 'warning':
        return {
          bg: theme.colors.warning,
          icon: 'warning' as const,
        };
      case 'info':
        return {
          bg: theme.colors.info,
          icon: 'info' as const,
        };
      default:
        return {
          bg: theme.colors.info,
          icon: 'info' as const,
        };
    }
  };
  
  const config = getToastConfig();
  
  return (
    <MotiView
      from={{ opacity: 0, translateY: -50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -50 }}
      transition={{ type: 'timing', duration: 300 }}
      style={[
        styles.container,
        { 
          backgroundColor: config.bg, 
          shadowColor: config.bg,
          minHeight: showConfirm ? 140 : 70,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons name={config.icon} size={24} color="#FFFFFF" />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      
      {showConfirm && (
        <View style={styles.confirmButtons}>
          <TouchableOpacity 
            style={[
              styles.confirmBtn, 
              styles.cancelBtn,
              { backgroundColor: 'rgba(255,255,255,0.15)' }
            ]} 
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.confirmBtn,
              { backgroundColor: 'rgba(255,255,255,0.25)' }
            ]} 
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {},
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
