// components/ui/Toast.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
}

export function Toast({ message, type, duration = 3000, onDismiss }: ToastProps) {
  const { theme } = useThemeStore();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    
    // Haptic feedback
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    return () => clearTimeout(timer);
  }, [duration, onDismiss, type]);
  
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.colors.success,
          icon: 'check-circle' as const,
          light: theme.colors.successLight,
        };
      case 'error':
        return {
          bg: theme.colors.error,
          icon: 'error' as const,
          light: theme.colors.errorLight,
        };
      case 'warning':
        return {
          bg: theme.colors.warning,
          icon: 'warning' as const,
          light: theme.colors.warningLight,
        };
      case 'info':
        return {
          bg: theme.colors.info,
          icon: 'info' as const,
          light: theme.colors.infoLight,
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
        { backgroundColor: config.bg, shadowColor: config.bg },
      ]}
    >
      <MaterialIcons name={config.icon} size={24} color="#FFFFFF" />
      <Text style={[styles.message, { color: '#FFFFFF' }]} numberOfLines={2}>
        {message}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});
