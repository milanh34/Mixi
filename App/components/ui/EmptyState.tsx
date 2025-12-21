// components/ui/EmptyState.tsx
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
      transition={{ type: 'timing', duration: 500 }}
      style={styles.container}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={64}
          color={theme.colors.textSecondary}
        />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
