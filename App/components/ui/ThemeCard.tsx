import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { THEMES } from '../../stores/themeStore';

interface ThemeCardProps {
  themeName: keyof typeof THEMES;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemeCard({ themeName, isSelected, onSelect }: ThemeCardProps) {
  const theme = THEMES[themeName];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        isSelected && styles.selected,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.preview}>
        <View
          style={[styles.previewCard, { backgroundColor: theme.colors.card }]}
        />
        <View
          style={[styles.previewSurface, { backgroundColor: theme.colors.surface }]}
        />
      </View>
      
      <Text style={[styles.name, { color: theme.colors.text }]}>
        {theme.name}
      </Text>
      
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
          <MaterialIcons name="check" size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#4285F4',
  },
  preview: {
    flex: 1,
    gap: 8,
  },
  previewCard: {
    flex: 1,
    borderRadius: 12,
  },
  previewSurface: {
    height: 40,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
