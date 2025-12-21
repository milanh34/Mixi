import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { ReactNode } from 'react';

interface GradientCardProps {
  children: ReactNode;
  style?: any;
  gradient?: string[];
}

export function GradientCard({ children, style, gradient }: GradientCardProps) {
  const { theme } = useThemeStore();

  const defaultGradient = [
    theme.colors.primary + 'DD',
    theme.colors.primary + '88',
    theme.colors.primary + '44',
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
  },
  gradient: {
    padding: 20,
  },
});
