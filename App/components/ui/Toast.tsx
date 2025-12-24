// components/ui/Toast.tsx
import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
  onConfirm?: () => void;
  showConfirm?: boolean;
  confirmText?: string;
}

export function Toast({ message, type, onDismiss, onConfirm, showConfirm, confirmText }: ToastProps) {
  const { theme } = useThemeStore();
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    if (!showConfirm) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.colors.success + '15',
          border: theme.colors.success,
          icon: theme.colors.success,
          iconName: 'check-circle' as const,
        };
      case 'error':
        return {
          bg: theme.colors.error + '15',
          border: theme.colors.error,
          icon: theme.colors.error,
          iconName: 'error' as const,
        };
      case 'warning':
        return {
          bg: theme.colors.warning + '15',
          border: theme.colors.warning,
          icon: theme.colors.warning,
          iconName: 'warning' as const,
        };
      case 'info':
        return {
          bg: theme.colors.primary + '15',
          border: theme.colors.primary,
          icon: theme.colors.primary,
          iconName: 'info' as const,
        };
    }
  };

  const colors = getToastColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <MaterialIcons name={colors.iconName} size={22} color={colors.icon} />
      <Text style={[styles.message, { color: theme.colors.textPrimary }]}>{message}</Text>
      
      {showConfirm ? (
        <View style={styles.confirmActions}>
          <TouchableOpacity onPress={handleDismiss} style={styles.cancelButton} activeOpacity={0.7}>
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleDismiss();
              onConfirm?.();
            }}
            style={[styles.confirmButton, { backgroundColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmButtonText}>{confirmText || 'Confirm'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={handleDismiss} activeOpacity={0.7}>
          <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 99999, // ✅ High z-index
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
