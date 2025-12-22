// stores/themeStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const THEME_STORAGE_KEY = '@mixi_theme_preferences';

export interface ThemeColors {
  // Base colors
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Button colors
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  buttonDestructive: string;
  buttonDestructiveHover: string;
  
  // Card colors
  cardBackground: string;
  cardShadow: string;
  cardBorder: string;
  cardHover: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputText: string;
  inputPlaceholder: string;
  
  // Structural colors
  border: string;
  divider: string;
  overlay: string;
  
  // Status colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  
  // Gradients
  gradientStart: string;
  gradientEnd: string;
  
  // Special
  tabBarActive: string;
  tabBarInactive: string;
  fabBackground: string;
  fabShadow: string;
}

export interface Theme {
  name: string;
  isDark: boolean;
  colors: ThemeColors;
}

// 🌞 LIGHT THEMES
export const THEMES = {
  // 1. Light (Clean Blue & Green)
  light: {
    name: 'Light',
    isDark: false,
    colors: {
      primary: '#2563EB',
      secondary: '#059669',
      accent: '#DC2626',
      background: '#FFFFFF',
      surface: '#F3F4F6',
      
      textPrimary: '#1F2937',
      textSecondary: '#4B5563',
      textMuted: '#9CA3AF',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#2563EB',
      buttonPrimaryHover: '#1D4ED8',
      buttonSecondary: '#DBEAFE',
      buttonSecondaryHover: '#BFDBFE',
      buttonDestructive: '#DC2626',
      buttonDestructiveHover: '#B91C1C',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(0,0,0,0.08)',
      cardBorder: '#E5E7EB',
      cardHover: '#F9FAFB',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#D1D5DB',
      inputBorderFocus: '#2563EB',
      inputText: '#1F2937',
      inputPlaceholder: '#9CA3AF',
      
      border: '#E5E7EB',
      divider: '#F3F4F6',
      overlay: 'rgba(0,0,0,0.5)',
      
      success: '#059669',
      successLight: '#DCFCE7',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      error: '#DC2626',
      errorLight: '#FEE2E2',
      info: '#2563EB',
      infoLight: '#DBEAFE',
      
      gradientStart: '#2563EB',
      gradientEnd: '#059669',
      
      tabBarActive: '#2563EB',
      tabBarInactive: '#9CA3AF',
      fabBackground: '#2563EB',
      fabShadow: 'rgba(37,99,235,0.3)',
    },
  } as Theme,
  
  // 2. Sunny (Warm Gold & Orange)
  sunny: {
    name: 'Sunny',
    isDark: false,
    colors: {
      primary: '#F59E0B',
      secondary: '#FB923C',
      accent: '#FBBF24',
      background: '#FFFBEB',
      surface: '#FEF3C7',
      
      textPrimary: '#92400E',
      textSecondary: '#D97706',
      textMuted: '#F59E0B',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#F59E0B',
      buttonPrimaryHover: '#D97706',
      buttonSecondary: '#FED7AA',
      buttonSecondaryHover: '#FDBA74',
      buttonDestructive: '#EF4444',
      buttonDestructiveHover: '#DC2626',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(245,158,11,0.1)',
      cardBorder: '#FCD34D',
      cardHover: '#FEF3C7',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#FCD34D',
      inputBorderFocus: '#F59E0B',
      inputText: '#92400E',
      inputPlaceholder: '#D97706',
      
      border: '#FCD34D',
      divider: '#FEF3C7',
      overlay: 'rgba(245,158,11,0.5)',
      
      success: '#10B981',
      successLight: '#D1FAE5',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      error: '#EF4444',
      errorLight: '#FEE2E2',
      info: '#F59E0B',
      infoLight: '#FEF3C7',
      
      gradientStart: '#F59E0B',
      gradientEnd: '#FB923C',
      
      tabBarActive: '#F59E0B',
      tabBarInactive: '#D97706',
      fabBackground: '#F59E0B',
      fabShadow: 'rgba(245,158,11,0.3)',
    },
  } as Theme,
  
  // 3. Minty Fresh (Mint Green & Teal)
  minty: {
    name: 'Minty Fresh',
    isDark: false,
    colors: {
      primary: '#14B8A6',
      secondary: '#06D6A0',
      accent: '#1ABDB3',
      background: '#F0FDFA',
      surface: '#CCFBF1',
      
      textPrimary: '#0D4F48',
      textSecondary: '#0F766E',
      textMuted: '#5EEAD4',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#14B8A6',
      buttonPrimaryHover: '#0F8178',
      buttonSecondary: '#99F2E9',
      buttonSecondaryHover: '#7EE0DC',
      buttonDestructive: '#EF4444',
      buttonDestructiveHover: '#DC2626',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(20,184,166,0.1)',
      cardBorder: '#5EEAD4',
      cardHover: '#CCFBF1',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#5EEAD4',
      inputBorderFocus: '#14B8A6',
      inputText: '#0D4F48',
      inputPlaceholder: '#0F766E',
      
      border: '#5EEAD4',
      divider: '#CCFBF1',
      overlay: 'rgba(20,184,166,0.5)',
      
      success: '#10B981',
      successLight: '#D1FAE5',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      error: '#EF4444',
      errorLight: '#FEE2E2',
      info: '#14B8A6',
      infoLight: '#CCFBF1',
      
      gradientStart: '#14B8A6',
      gradientEnd: '#06D6A0',
      
      tabBarActive: '#14B8A6',
      tabBarInactive: '#0F766E',
      fabBackground: '#14B8A6',
      fabShadow: 'rgba(20,184,166,0.3)',
    },
  } as Theme,
  
  // 4. Rose Garden (Rose & Pink)
  rose: {
    name: 'Rose Garden',
    isDark: false,
    colors: {
      primary: '#E11D48',
      secondary: '#EC4899',
      accent: '#F472B6',
      background: '#FFF1F5',
      surface: '#FCE7F3',
      
      textPrimary: '#831843',
      textSecondary: '#BE185D',
      textMuted: '#F472B6',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#E11D48',
      buttonPrimaryHover: '#BE123C',
      buttonSecondary: '#FBCFE8',
      buttonSecondaryHover: '#F8A3D5',
      buttonDestructive: '#DC2626',
      buttonDestructiveHover: '#B91C1C',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(225,29,72,0.1)',
      cardBorder: '#FBCFE8',
      cardHover: '#FCE7F3',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#FBCFE8',
      inputBorderFocus: '#E11D48',
      inputText: '#831843',
      inputPlaceholder: '#BE185D',
      
      border: '#FBCFE8',
      divider: '#FCE7F3',
      overlay: 'rgba(225,29,72,0.5)',
      
      success: '#059669',
      successLight: '#DCFCE7',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      error: '#DC2626',
      errorLight: '#FEE2E2',
      info: '#E11D48',
      infoLight: '#FCE7F3',
      
      gradientStart: '#E11D48',
      gradientEnd: '#EC4899',
      
      tabBarActive: '#E11D48',
      tabBarInactive: '#BE185D',
      fabBackground: '#EC4899',
      fabShadow: 'rgba(236,72,153,0.3)',
    },
  } as Theme,
  
  // 5. Indigo Dreams (Deep Blue & Indigo)
  indigo: {
    name: 'Indigo Dreams',
    isDark: false,
    colors: {
      primary: '#4F46E5',
      secondary: '#6366F1',
      accent: '#818CF8',
      background: '#F5F3FF',
      surface: '#EDE9FE',
      
      textPrimary: '#312E81',
      textSecondary: '#4F46E5',
      textMuted: '#A5B4FC',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#4F46E5',
      buttonPrimaryHover: '#4338CA',
      buttonSecondary: '#E0E7FF',
      buttonSecondaryHover: '#C7D2FE',
      buttonDestructive: '#EF4444',
      buttonDestructiveHover: '#DC2626',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(79,70,229,0.1)',
      cardBorder: '#C7D2FE',
      cardHover: '#EDE9FE',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#C7D2FE',
      inputBorderFocus: '#4F46E5',
      inputText: '#312E81',
      inputPlaceholder: '#6366F1',
      
      border: '#C7D2FE',
      divider: '#EDE9FE',
      overlay: 'rgba(79,70,229,0.5)',
      
      success: '#059669',
      successLight: '#DCFCE7',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      error: '#EF4444',
      errorLight: '#FEE2E2',
      info: '#4F46E5',
      infoLight: '#EDE9FE',
      
      gradientStart: '#4F46E5',
      gradientEnd: '#6366F1',
      
      tabBarActive: '#4F46E5',
      tabBarInactive: '#A5B4FC',
      fabBackground: '#4F46E5',
      fabShadow: 'rgba(79,70,229,0.3)',
    },
  } as Theme,
  
  // 6. Emerald Grace (Emerald & Green)
  emerald: {
    name: 'Emerald Grace',
    isDark: false,
    colors: {
      primary: '#047857',
      secondary: '#059669',
      accent: '#10B981',
      background: '#F0FDF4',
      surface: '#DCFCE7',
      
      textPrimary: '#064E3B',
      textSecondary: '#047857',
      textMuted: '#6EE7B7',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#047857',
      buttonPrimaryHover: '#065F46',
      buttonSecondary: '#BBFBEE',
      buttonSecondaryHover: '#99F6E4',
      buttonDestructive: '#EF4444',
      buttonDestructiveHover: '#DC2626',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(4,120,87,0.1)',
      cardBorder: '#6EE7B7',
      cardHover: '#DCFCE7',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#6EE7B7',
      inputBorderFocus: '#047857',
      inputText: '#064E3B',
      inputPlaceholder: '#059669',
      
      border: '#6EE7B7',
      divider: '#DCFCE7',
      overlay: 'rgba(4,120,87,0.5)',
      
      success: '#047857',
      successLight: '#DCFCE7',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      error: '#EF4444',
      errorLight: '#FEE2E2',
      info: '#059669',
      infoLight: '#DCFCE7',
      
      gradientStart: '#047857',
      gradientEnd: '#059669',
      
      tabBarActive: '#047857',
      tabBarInactive: '#6EE7B7',
      fabBackground: '#059669',
      fabShadow: 'rgba(5,150,105,0.3)',
    },
  } as Theme,

  // 🌙 DARK THEMES (6 Unique Dark Themes)
  
  // 7. Dark Slate (Cool Gray & Blue)
  dark: {
    name: 'Dark Slate',
    isDark: true,
    colors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#FBBF24',
      background: '#0F172A',
      surface: '#1E293B',
      
      textPrimary: '#F1F5F9',
      textSecondary: '#CBD5E1',
      textMuted: '#64748B',
      textInverse: '#0F172A',
      
      buttonPrimary: '#3B82F6',
      buttonPrimaryHover: '#60A5FA',
      buttonSecondary: '#334155',
      buttonSecondaryHover: '#475569',
      buttonDestructive: '#EF4444',
      buttonDestructiveHover: '#F87171',
      
      cardBackground: '#1E293B',
      cardShadow: 'rgba(0,0,0,0.5)',
      cardBorder: '#334155',
      cardHover: '#334155',
      
      inputBackground: '#334155',
      inputBorder: '#475569',
      inputBorderFocus: '#3B82F6',
      inputText: '#F1F5F9',
      inputPlaceholder: '#64748B',
      
      border: '#334155',
      divider: '#1E293B',
      overlay: 'rgba(0,0,0,0.7)',
      
      success: '#10B981',
      successLight: '#1F3A3F',
      warning: '#F59E0B',
      warningLight: '#3A3524',
      error: '#EF4444',
      errorLight: '#3A2C2C',
      info: '#3B82F6',
      infoLight: '#2A3A4A',
      
      gradientStart: '#3B82F6',
      gradientEnd: '#60A5FA',
      
      tabBarActive: '#3B82F6',
      tabBarInactive: '#64748B',
      fabBackground: '#3B82F6',
      fabShadow: 'rgba(59,130,246,0.3)',
    },
  } as Theme,
  
  // 8. Midnight Purple (Deep Purple & Violet)
  midnight: {
    name: 'Midnight Purple',
    isDark: true,
    colors: {
      primary: '#A78BFA',
      secondary: '#C4B5FD',
      accent: '#E879F9',
      background: '#1F1A3B',
      surface: '#2D2852',
      
      textPrimary: '#F3E8FF',
      textSecondary: '#E9D5FF',
      textMuted: '#C4B5FD',
      textInverse: '#1F1A3B',
      
      buttonPrimary: '#A78BFA',
      buttonPrimaryHover: '#C4B5FD',
      buttonSecondary: '#3D3666',
      buttonSecondaryHover: '#4A4080',
      buttonDestructive: '#FB7185',
      buttonDestructiveHover: '#FD82A0',
      
      cardBackground: '#2D2852',
      cardShadow: 'rgba(167,139,250,0.2)',
      cardBorder: '#6D28D9',
      cardHover: '#3D3666',
      
      inputBackground: '#3D3666',
      inputBorder: '#6D28D9',
      inputBorderFocus: '#A78BFA',
      inputText: '#F3E8FF',
      inputPlaceholder: '#C4B5FD',
      
      border: '#6D28D9',
      divider: '#3D3666',
      overlay: 'rgba(31,26,59,0.85)',
      
      success: '#6EE7B7',
      successLight: '#2A4A3A',
      warning: '#FCD34D',
      warningLight: '#4A4230',
      error: '#FB7185',
      errorLight: '#3A2A2A',
      info: '#A78BFA',
      infoLight: '#3A2A4A',
      
      gradientStart: '#A78BFA',
      gradientEnd: '#E879F9',
      
      tabBarActive: '#A78BFA',
      tabBarInactive: '#6D28D9',
      fabBackground: '#A78BFA',
      fabShadow: 'rgba(167,139,250,0.3)',
    },
  } as Theme,
  
  // 9. Ocean Depths (Teal & Cyan)
  ocean: {
    name: 'Ocean Depths',
    isDark: true,
    colors: {
      primary: '#06B6D4',
      secondary: '#22D3EE',
      accent: '#06D6A0',
      background: '#0F2F3F',
      surface: '#164E63',
      
      textPrimary: '#E0F2FE',
      textSecondary: '#A5F3FC',
      textMuted: '#38B0D4',
      textInverse: '#0F2F3F',
      
      buttonPrimary: '#06B6D4',
      buttonPrimaryHover: '#22D3EE',
      buttonSecondary: '#1F4F63',
      buttonSecondaryHover: '#2A6373',
      buttonDestructive: '#F87171',
      buttonDestructiveHover: '#FB9A9A',
      
      cardBackground: '#164E63',
      cardShadow: 'rgba(6,182,212,0.2)',
      cardBorder: '#0E7490',
      cardHover: '#1F4F63',
      
      inputBackground: '#1F4F63',
      inputBorder: '#0E7490',
      inputBorderFocus: '#06B6D4',
      inputText: '#E0F2FE',
      inputPlaceholder: '#38B0D4',
      
      border: '#0E7490',
      divider: '#1F4F63',
      overlay: 'rgba(15,47,63,0.85)',
      
      success: '#06D6A0',
      successLight: '#2A4A3A',
      warning: '#FCD34D',
      warningLight: '#4A4230',
      error: '#F87171',
      errorLight: '#3A2A2A',
      info: '#06B6D4',
      infoLight: '#2A4A5A',
      
      gradientStart: '#06B6D4',
      gradientEnd: '#22D3EE',
      
      tabBarActive: '#06B6D4',
      tabBarInactive: '#0E7490',
      fabBackground: '#06B6D4',
      fabShadow: 'rgba(6,182,212,0.3)',
    },
  } as Theme,
  
  // 10. Sunset Glow (Orange & Red)
  sunset: {
    name: 'Sunset Glow',
    isDark: true,
    colors: {
      primary: '#FF6B35',
      secondary: '#FF8C42',
      accent: '#FFA500',
      background: '#1A0D05',
      surface: '#3D1A0A',
      
      textPrimary: '#FFE8D6',
      textSecondary: '#FFB38A',
      textMuted: '#FF8C42',
      textInverse: '#1A0D05',
      
      buttonPrimary: '#FF6B35',
      buttonPrimaryHover: '#FF8C42',
      buttonSecondary: '#5A2D1A',
      buttonSecondaryHover: '#6A3D2A',
      buttonDestructive: '#F26B4E',
      buttonDestructiveHover: '#F58A6D',
      
      cardBackground: '#3D1A0A',
      cardShadow: 'rgba(255,107,53,0.2)',
      cardBorder: '#FF6B35',
      cardHover: '#5A2D1A',
      
      inputBackground: '#5A2D1A',
      inputBorder: '#FF6B35',
      inputBorderFocus: '#FF6B35',
      inputText: '#FFE8D6',
      inputPlaceholder: '#FF8C42',
      
      border: '#FF6B35',
      divider: '#5A2D1A',
      overlay: 'rgba(26,13,5,0.85)',
      
      success: '#6EE7B7',
      successLight: '#2A4A3A',
      warning: '#FCD34D',
      warningLight: '#4A4230',
      error: '#FB7185',
      errorLight: '#3A2A2A',
      info: '#FF6B35',
      infoLight: '#4A2A1A',
      
      gradientStart: '#FF6B35',
      gradientEnd: '#FF8C42',
      
      tabBarActive: '#FF6B35',
      tabBarInactive: '#FF8C42',
      fabBackground: '#FF6B35',
      fabShadow: 'rgba(255,107,53,0.3)',
    },
  } as Theme,
  
  // 11. Nord (Arctic, North-bluish Design)
  nord: {
    name: 'Nord',
    isDark: true,
    colors: {
      primary: '#88C0D0',
      secondary: '#81A1C1',
      accent: '#A3BE8C',
      background: '#2E3440',
      surface: '#3B4252',
      
      textPrimary: '#ECEFF4',
      textSecondary: '#D8DEE9',
      textMuted: '#4C566A',
      textInverse: '#2E3440',
      
      buttonPrimary: '#88C0D0',
      buttonPrimaryHover: '#A3D4E5',
      buttonSecondary: '#434C5E',
      buttonSecondaryHover: '#4C566A',
      buttonDestructive: '#BF616A',
      buttonDestructiveHover: '#D08770',
      
      cardBackground: '#3B4252',
      cardShadow: 'rgba(0,0,0,0.5)',
      cardBorder: '#4C566A',
      cardHover: '#434C5E',
      
      inputBackground: '#434C5E',
      inputBorder: '#4C566A',
      inputBorderFocus: '#88C0D0',
      inputText: '#ECEFF4',
      inputPlaceholder: '#4C566A',
      
      border: '#4C566A',
      divider: '#434C5E',
      overlay: 'rgba(46,52,64,0.85)',
      
      success: '#A3BE8C',
      successLight: '#3A4C3A',
      warning: '#EBCB8B',
      warningLight: '#4C4638',
      error: '#BF616A',
      errorLight: '#4C3A3A',
      info: '#81A1C1',
      infoLight: '#3A4252',
      
      gradientStart: '#88C0D0',
      gradientEnd: '#81A1C1',
      
      tabBarActive: '#88C0D0',
      tabBarInactive: '#4C566A',
      fabBackground: '#88C0D0',
      fabShadow: 'rgba(136,192,208,0.3)',
    },
  } as Theme,
  
  // 12. Tokyo Night (Anime-Inspired Dark)
  tokyoNight: {
    name: 'Tokyo Night',
    isDark: true,
    colors: {
      primary: '#7AA2F7',
      secondary: '#BB9AF7',
      accent: '#9ECE6A',
      background: '#1A1B26',
      surface: '#24283B',
      
      textPrimary: '#C0CAF5',
      textSecondary: '#A9B1D6',
      textMuted: '#565F89',
      textInverse: '#1A1B26',
      
      buttonPrimary: '#7AA2F7',
      buttonPrimaryHover: '#8FB2F9',
      buttonSecondary: '#2F334D',
      buttonSecondaryHover: '#3A3F5D',
      buttonDestructive: '#F7768E',
      buttonDestructiveHover: '#F98FA5',
      
      cardBackground: '#24283B',
      cardShadow: 'rgba(122,162,247,0.2)',
      cardBorder: '#414868',
      cardHover: '#2F334D',
      
      inputBackground: '#2F334D',
      inputBorder: '#414868',
      inputBorderFocus: '#7AA2F7',
      inputText: '#C0CAF5',
      inputPlaceholder: '#565F89',
      
      border: '#414868',
      divider: '#2F334D',
      overlay: 'rgba(26,27,38,0.85)',
      
      success: '#9ECE6A',
      successLight: '#2A3A26',
      warning: '#E0AF68',
      warningLight: '#3A342A',
      error: '#F7768E',
      errorLight: '#3A2832',
      info: '#7AA2F7',
      infoLight: '#2A344F',
      
      gradientStart: '#7AA2F7',
      gradientEnd: '#BB9AF7',
      
      tabBarActive: '#7AA2F7',
      tabBarInactive: '#565F89',
      fabBackground: '#7AA2F7',
      fabShadow: 'rgba(122,162,247,0.3)',
    },
  } as Theme,
} as const;

interface ThemeState {
  themeName: keyof typeof THEMES;
  theme: Theme;
  setTheme: (name: keyof typeof THEMES) => void;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeName: 'light',
  theme: THEMES.light,
  
  initializeTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored && THEMES[stored as keyof typeof THEMES]) {
        const themeName = stored as keyof typeof THEMES;
        set({
          themeName,
          theme: THEMES[themeName],
        });
        console.log('✅ Theme loaded:', themeName);
      } else {
        const colorScheme = Appearance.getColorScheme();
        const defaultTheme = colorScheme === 'dark' ? 'dark' : 'light';
        set({
          themeName: defaultTheme,
          theme: THEMES[defaultTheme],
        });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },
  
  setTheme: (name) => {
    if (THEMES[name]) {
      set({ themeName: name, theme: THEMES[name] });
      AsyncStorage.setItem(THEME_STORAGE_KEY, name);
      console.log('✅ Theme changed to:', name);
    }
  },
}));
