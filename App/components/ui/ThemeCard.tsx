// components/ui/ThemeCard.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEMES } from '../../stores/themeStore';
import { MotiView } from 'moti';

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
        isSelected && { borderColor: theme.colors.primary, borderWidth: 3 },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.preview}>
        {/* Gradient Preview */}
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.previewGradient}
        />
        
        {/* Card Preview */}
        <View
          style={[styles.previewCard, { backgroundColor: theme.colors.cardBackground }]}
        />
      </View>
      
      <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
        {theme.name}
      </Text>
      
      {isSelected && (
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}
        >
          <MaterialIcons name="check" size={16} color="#FFFFFF" />
        </MotiView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  preview: {
    flex: 1,
    gap: 8,
  },
  previewGradient: {
    flex: 1,
    borderRadius: 12,
  },
  previewCard: {
    height: 40,
    borderRadius: 10,
  },
  name: {
    fontSize: 15,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
