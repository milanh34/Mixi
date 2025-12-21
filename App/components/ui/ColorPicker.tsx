// components/ui/ColorPicker.tsx
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

const COLORS = [
  '#4285F4', // Blue
  '#34A853', // Green
  '#FBBC04', // Yellow
  '#EA4335', // Red
  '#9C27B0', // Purple
  '#FF6B6B', // Light Red
  '#4ECDC4', // Cyan
  '#95E1D3', // Mint
  '#FFE66D', // Light Yellow
  '#FF9800', // Orange
  '#E91E63', // Pink
  '#3F51B5', // Indigo
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  const { theme } = useThemeStore();

  return (
    <View style={styles.container}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            selectedColor === color && {
              borderWidth: 3,
              borderColor: theme.colors.text,
            },
          ]}
          onPress={() => onSelectColor(color)}
        />
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
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
