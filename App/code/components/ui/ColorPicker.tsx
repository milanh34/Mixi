// components/ui/ColorPicker.tsx
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useThemeStore } from '../../stores/themeStore';
import * as Haptics from 'expo-haptics';

const COLORS = [
  { color: '#4285F4', name: 'Blue' },
  { color: '#34A853', name: 'Green' },
  { color: '#FBBC04', name: 'Yellow' },
  { color: '#EA4335', name: 'Red' },
  { color: '#9C27B0', name: 'Purple' },
  { color: '#FF6B6B', name: 'Coral' },
  { color: '#4ECDC4', name: 'Cyan' },
  { color: '#95E1D3', name: 'Mint' },
  { color: '#FFE66D', name: 'Gold' },
  { color: '#FF9800', name: 'Orange' },
  { color: '#E91E63', name: 'Pink' },
  { color: '#3F51B5', name: 'Indigo' },
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  const { theme } = useThemeStore();

  return (
    <View style={styles.container}>
      {COLORS.map(({ color, name }, index) => (
        <MotiView
          key={color}
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: index * 50 }}
        >
          <TouchableOpacity
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedColor === color && {
                borderWidth: 4,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectColor(color);
            }}
            activeOpacity={0.7}
          >
            {selectedColor === color && (
              <View style={styles.checkContainer}>
                <MaterialIcons name="check" size={28} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  checkContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
