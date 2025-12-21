// components/ui/EmptyState.tsx
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useThemeStore } from '../../stores/themeStore';

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const { theme } = useThemeStore();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 600 }}
      style={styles.container}
    >
      <LinearGradient
        colors={[theme.colors.gradientStart + '15', theme.colors.gradientEnd + '15']}
        style={styles.iconContainer}
      >
        <MaterialIcons
          name={icon}
          size={64}
          color={theme.colors.primary}
        />
      </LinearGradient>
      
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {description}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});
