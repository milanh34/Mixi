import { Text as RNText, TextProps } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

export const getFontFamily = (family: string, weight: string): string | undefined => {
  if (family === 'System') return undefined;
  
  const weightMap: Record<string, string> = {
    '400': '400Regular',
    '500': '500Medium',
    '600': '600SemiBold',
    '700': '700Bold',
  };
  
  const fontWeight = weightMap[weight] || '400Regular';
  
  // Roboto only has 400, 500, 700
  if (family === 'Roboto' && weight === '600') {
    return `Roboto_700Bold`;
  }
  
  return `${family}_${fontWeight}`;
};

export function ThemedText(props: TextProps) {
  const { fontFamily, fontWeight } = useThemeStore();
  const dynamicFont = getFontFamily(fontFamily, fontWeight);
  
  return (
    <RNText
      {...props}
      style={[
        dynamicFont && { fontFamily: dynamicFont },
        props.style,
      ]}
    />
  );
}
