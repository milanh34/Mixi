import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeStore } from '../../stores/themeStore';
import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  intensity?: number;
  style?: any;
}

export function GlassmorphicCard({ children, intensity = 80, style }: GlassmorphicCardProps) {
  const { themeName } = useThemeStore();

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={themeName === 'light' ? 'light' : 'dark'}
        style={styles.blur}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  blur: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
