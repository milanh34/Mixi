import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

export function ThemedText({ style, ...props }: TextProps) {
  const { fontFamily, fontWeight } = useThemeStore();
  
  const getFontFamilyName = () => {
    switch (fontFamily) {
      case 'Inter':
        return `Inter_${fontWeight === '400' ? '400Regular' : fontWeight === '500' ? '500Medium' : fontWeight === '600' ? '600SemiBold' : '700Bold'}`;
      case 'Roboto':
        return `Roboto_${fontWeight === '400' ? '400Regular' : fontWeight === '500' ? '500Medium' : '700Bold'}`;
      case 'Poppins':
        return `Poppins_${fontWeight === '400' ? '400Regular' : fontWeight === '500' ? '500Medium' : fontWeight === '600' ? '600SemiBold' : '700Bold'}`;
      case 'Montserrat':
        return `Montserrat_${fontWeight === '400' ? '400Regular' : fontWeight === '500' ? '500Medium' : fontWeight === '600' ? '600SemiBold' : '700Bold'}`;
      default:
        return undefined;
    }
  };

  return (
    <RNText
      {...props}
      style={[
        fontFamily !== 'System' && { fontFamily: getFontFamilyName() },
        style,
      ]}
    />
  );
}
