// utils/colors.ts
import { ColorValue } from 'react-native';

export const getGroupTypeEmoji = (type: string): string => {
  const emojis: Record<string, string> = {
    trip: '✈️',
    project: '💼',
    household: '🏠',
    event: '🎉',
  };
  return emojis[type] || '📁';
};

export const getGradientColors = (primaryColor: string): readonly [string, string, string] => {
  // Generate gradient from primary color
  const hex = primaryColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const color1 = `rgba(${r}, ${g}, ${b}, 1)`;
  const color2 = `rgba(${Math.min(r + 30, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 30, 255)}, 0.85)`;
  const color3 = `rgba(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, ${Math.min(b + 50, 255)}, 0.7)`;

  return [color1, color2, color3] as const;
};

export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
