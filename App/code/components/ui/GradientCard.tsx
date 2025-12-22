// components/ui/GradientCard.tsx
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { ReactNode } from 'react';

interface GradientCardProps {
  children: ReactNode;
  style?: any;
  gradient?: [string, string, ...string[]]; 
}

export function GradientCard({ children, style, gradient }: GradientCardProps) {
  const { theme } = useThemeStore();

  const defaultGradient: [string, string] = [
    theme.colors.gradientStart,
    theme.colors.gradientEnd,
  ];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradient || defaultGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 20,
  },
});
