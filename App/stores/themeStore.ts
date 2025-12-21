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
  // 1. Light (Default Google Material)
  light: {
    name: 'Light',
    isDark: false,
    colors: {
      primary: '#4285F4',
      secondary: '#34A853',
      accent: '#FBBC04',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      
      textPrimary: '#202124',
      textSecondary: '#5F6368',
      textMuted: '#9AA0A6',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#4285F4',
      buttonPrimaryHover: '#357AE8',
      buttonSecondary: '#E8F0FE',
      buttonSecondaryHover: '#D2E3FC',
      buttonDestructive: '#EA4335',
      buttonDestructiveHover: '#D33B2C',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(0,0,0,0.1)',
      cardBorder: '#DADCE0',
      cardHover: '#F1F3F4',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#DADCE0',
      inputBorderFocus: '#4285F4',
      inputText: '#202124',
      inputPlaceholder: '#9AA0A6',
      
      border: '#DADCE0',
      divider: '#E8EAED',
      overlay: 'rgba(0,0,0,0.5)',
      
      success: '#34A853',
      successLight: '#E6F4EA',
      warning: '#FBBC04',
      warningLight: '#FEF7E0',
      error: '#EA4335',
      errorLight: '#FCE8E6',
      info: '#4285F4',
      infoLight: '#E8F0FE',
      
      gradientStart: '#4285F4',
      gradientEnd: '#34A853',
      
      tabBarActive: '#4285F4',
      tabBarInactive: '#9AA0A6',
      fabBackground: '#4285F4',
      fabShadow: 'rgba(66,133,244,0.3)',
    },
  } as Theme,
  
  // 2. Ocean/Sky
  ocean: {
    name: 'Ocean',
    isDark: false,
    colors: {
      primary: '#0077B6',
      secondary: '#00B4D8',
      accent: '#90E0EF',
      background: '#F0F8FF',
      surface: '#E3F2FD',
      
      textPrimary: '#01497C',
      textSecondary: '#0077B6',
      textMuted: '#64B5F6',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#0077B6',
      buttonPrimaryHover: '#005F8D',
      buttonSecondary: '#CAF0F8',
      buttonSecondaryHover: '#ADE8F4',
      buttonDestructive: '#FF6B6B',
      buttonDestructiveHover: '#E55555',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(0,119,182,0.15)',
      cardBorder: '#90E0EF',
      cardHover: '#E3F2FD',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#90E0EF',
      inputBorderFocus: '#0077B6',
      inputText: '#01497C',
      inputPlaceholder: '#64B5F6',
      
      border: '#90E0EF',
      divider: '#CAF0F8',
      overlay: 'rgba(0,119,182,0.5)',
      
      success: '#06FFA5',
      successLight: '#E0FFF4',
      warning: '#FFD23F',
      warningLight: '#FFF8E1',
      error: '#FF6B6B',
      errorLight: '#FFE5E5',
      info: '#0096C7',
      infoLight: '#D4F1F4',
      
      gradientStart: '#0077B6',
      gradientEnd: '#00B4D8',
      
      tabBarActive: '#0077B6',
      tabBarInactive: '#64B5F6',
      fabBackground: '#00B4D8',
      fabShadow: 'rgba(0,180,216,0.3)',
    },
  } as Theme,
  
  // 3. Lavender
  lavender: {
    name: 'Lavender',
    isDark: false,
    colors: {
      primary: '#9D4EDD',
      secondary: '#C77DFF',
      accent: '#E0AAFF',
      background: '#FAF5FF',
      surface: '#F3E5FF',
      
      textPrimary: '#4C1D95',
      textSecondary: '#7C3AED',
      textMuted: '#A78BFA',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#9D4EDD',
      buttonPrimaryHover: '#8B3DC7',
      buttonSecondary: '#F3E5FF',
      buttonSecondaryHover: '#E9D5FF',
      buttonDestructive: '#FF6B6B',
      buttonDestructiveHover: '#E55555',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(157,78,221,0.15)',
      cardBorder: '#E0AAFF',
      cardHover: '#F3E5FF',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#E0AAFF',
      inputBorderFocus: '#9D4EDD',
      inputText: '#4C1D95',
      inputPlaceholder: '#A78BFA',
      
      border: '#E0AAFF',
      divider: '#F3E5FF',
      overlay: 'rgba(157,78,221,0.5)',
      
      success: '#06FFA5',
      successLight: '#E0FFF4',
      warning: '#FFD23F',
      warningLight: '#FFF8E1',
      error: '#FF6B6B',
      errorLight: '#FFE5E5',
      info: '#A855F7',
      infoLight: '#F5E7FF',
      
      gradientStart: '#9D4EDD',
      gradientEnd: '#C77DFF',
      
      tabBarActive: '#9D4EDD',
      tabBarInactive: '#A78BFA',
      fabBackground: '#C77DFF',
      fabShadow: 'rgba(199,125,255,0.3)',
    },
  } as Theme,
  
  // 4. Cheerful (Warm Coral/Pink)
  cheerful: {
    name: 'Cheerful',
    isDark: false,
    colors: {
      primary: '#FF6B6B',
      secondary: '#FF9FF3',
      accent: '#FFE66D',
      background: '#FFF5F5',
      surface: '#FFE5E5',
      
      textPrimary: '#6B2737',
      textSecondary: '#C73E4A',
      textMuted: '#FFA8A8',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#FF6B6B',
      buttonPrimaryHover: '#E55555',
      buttonSecondary: '#FFD1D1',
      buttonSecondaryHover: '#FFB8B8',
      buttonDestructive: '#D32F2F',
      buttonDestructiveHover: '#B71C1C',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(255,107,107,0.15)',
      cardBorder: '#FFD1D1',
      cardHover: '#FFE5E5',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#FFD1D1',
      inputBorderFocus: '#FF6B6B',
      inputText: '#6B2737',
      inputPlaceholder: '#FFA8A8',
      
      border: '#FFD1D1',
      divider: '#FFE5E5',
      overlay: 'rgba(255,107,107,0.5)',
      
      success: '#26DE81',
      successLight: '#E0FFF4',
      warning: '#FED330',
      warningLight: '#FFF8E1',
      error: '#D32F2F',
      errorLight: '#FFCDD2',
      info: '#FF6348',
      infoLight: '#FFE5E0',
      
      gradientStart: '#FF6B6B',
      gradientEnd: '#FF9FF3',
      
      tabBarActive: '#FF6B6B',
      tabBarInactive: '#FFA8A8',
      fabBackground: '#FF9FF3',
      fabShadow: 'rgba(255,159,243,0.3)',
    },
  } as Theme,
  
  // 5. Autumn
  autumn: {
    name: 'Autumn',
    isDark: false,
    colors: {
      primary: '#FF9F71',
      secondary: '#FFB997',
      accent: '#FFD4BD',
      background: '#FFF8F5',
      surface: '#FFE8DC',
      
      textPrimary: '#5C3D2E',
      textSecondary: '#9B6B53',
      textMuted: '#CEAD94',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#FF9F71',
      buttonPrimaryHover: '#E58D5F',
      buttonSecondary: '#FFE8DC',
      buttonSecondaryHover: '#FFD4BD',
      buttonDestructive: '#D32F2F',
      buttonDestructiveHover: '#B71C1C',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(255,159,113,0.15)',
      cardBorder: '#FFD4BD',
      cardHover: '#FFE8DC',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#FFD4BD',
      inputBorderFocus: '#FF9F71',
      inputText: '#5C3D2E',
      inputPlaceholder: '#CEAD94',
      
      border: '#FFCBA4',
      divider: '#FFE8DC',
      overlay: 'rgba(255,159,113,0.5)',
      
      success: '#52B788',
      successLight: '#E0FFF4',
      warning: '#FFB020',
      warningLight: '#FFF3E0',
      error: '#D32F2F',
      errorLight: '#FFCDD2',
      info: '#FF9F71',
      infoLight: '#FFE8DC',
      
      gradientStart: '#FF9F71',
      gradientEnd: '#FFB997',
      
      tabBarActive: '#FF9F71',
      tabBarInactive: '#CEAD94',
      fabBackground: '#FFB997',
      fabShadow: 'rgba(255,185,151,0.3)',
    },
  } as Theme,
  
  // 6. Forest
  forest: {
    name: 'Forest',
    isDark: false,
    colors: {
      primary: '#52B788',
      secondary: '#74C69D',
      accent: '#95D5B2',
      background: '#F1F8F4',
      surface: '#D8F3DC',
      
      textPrimary: '#1B4332',
      textSecondary: '#2D6A4F',
      textMuted: '#74C69D',
      textInverse: '#FFFFFF',
      
      buttonPrimary: '#52B788',
      buttonPrimaryHover: '#40916C',
      buttonSecondary: '#D8F3DC',
      buttonSecondaryHover: '#B7E4C7',
      buttonDestructive: '#D32F2F',
      buttonDestructiveHover: '#B71C1C',
      
      cardBackground: '#FFFFFF',
      cardShadow: 'rgba(82,183,136,0.15)',
      cardBorder: '#95D5B2',
      cardHover: '#D8F3DC',
      
      inputBackground: '#FFFFFF',
      inputBorder: '#95D5B2',
      inputBorderFocus: '#52B788',
      inputText: '#1B4332',
      inputPlaceholder: '#74C69D',
      
      border: '#95D5B2',
      divider: '#D8F3DC',
      overlay: 'rgba(82,183,136,0.5)',
      
      success: '#40916C',
      successLight: '#D8F3DC',
      warning: '#FFD23F',
      warningLight: '#FFF8E1',
      error: '#D32F2F',
      errorLight: '#FFCDD2',
      info: '#52B788',
      infoLight: '#D8F3DC',
      
      gradientStart: '#52B788',
      gradientEnd: '#74C69D',
      
      tabBarActive: '#52B788',
      tabBarInactive: '#74C69D',
      fabBackground: '#74C69D',
      fabShadow: 'rgba(116,198,157,0.3)',
    },
  } as Theme,
  
  // 🌙 DARK THEMES
  
  // 7. Dark (Default)
  dark: {
    name: 'Dark',
    isDark: true,
    colors: {
      primary: '#8AB4F8',
      secondary: '#81C995',
      accent: '#FDD663',
      background: '#121212',
      surface: '#1E1E1E',
      
      textPrimary: '#E8EAED',
      textSecondary: '#9AA0A6',
      textMuted: '#5F6368',
      textInverse: '#202124',
      
      buttonPrimary: '#8AB4F8',
      buttonPrimaryHover: '#A8C7FA',
      buttonSecondary: '#2C2C2C',
      buttonSecondaryHover: '#3C3C3C',
      buttonDestructive: '#F28B82',
      buttonDestructiveHover: '#F5A199',
      
      cardBackground: '#1E1E1E',
      cardShadow: 'rgba(0,0,0,0.5)',
      cardBorder: '#3C4043',
      cardHover: '#2C2C2C',
      
      inputBackground: '#2C2C2C',
      inputBorder: '#3C4043',
      inputBorderFocus: '#8AB4F8',
      inputText: '#E8EAED',
      inputPlaceholder: '#5F6368',
      
      border: '#3C4043',
      divider: '#2C2C2C',
      overlay: 'rgba(0,0,0,0.7)',
      
      success: '#81C995',
      successLight: '#1E3A2C',
      warning: '#FDD663',
      warningLight: '#3A331E',
      error: '#F28B82',
      errorLight: '#3A2828',
      info: '#8AB4F8',
      infoLight: '#1E2A3A',
      
      gradientStart: '#8AB4F8',
      gradientEnd: '#81C995',
      
      tabBarActive: '#8AB4F8',
      tabBarInactive: '#5F6368',
      fabBackground: '#8AB4F8',
      fabShadow: 'rgba(138,180,248,0.3)',
    },
  } as Theme,
  
  // 8. Nord
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
  
  // 9. Cyberpunk
  cyberpunk: {
    name: 'Cyberpunk',
    isDark: true,
    colors: {
      primary: '#FF10F0',
      secondary: '#00F0FF',
      accent: '#FFF01F',
      background: '#0A0E27',
      surface: '#1A1F3A',
      
      textPrimary: '#FFFFFF',
      textSecondary: '#B8C5D6',
      textMuted: '#6A7A8A',
      textInverse: '#0A0E27',
      
      buttonPrimary: '#FF10F0',
      buttonPrimaryHover: '#FF4AF4',
      buttonSecondary: '#2A2F4A',
      buttonSecondaryHover: '#3A3F5A',
      buttonDestructive: '#FF1744',
      buttonDestructiveHover: '#FF4569',
      
      cardBackground: '#1A1F3A',
      cardShadow: 'rgba(255,16,240,0.3)',
      cardBorder: '#4A4F6A',
      cardHover: '#2A2F4A',
      
      inputBackground: '#2A2F4A',
      inputBorder: '#4A4F6A',
      inputBorderFocus: '#FF10F0',
      inputText: '#FFFFFF',
      inputPlaceholder: '#6A7A8A',
      
      border: '#4A4F6A',
      divider: '#2A2F4A',
      overlay: 'rgba(10,14,39,0.9)',
      
      success: '#00FF9F',
      successLight: '#1A3A2F',
      warning: '#FFD600',
      warningLight: '#3A361A',
      error: '#FF1744',
      errorLight: '#3A1A22',
      info: '#00E5FF',
      infoLight: '#1A2A3A',
      
      gradientStart: '#FF10F0',
      gradientEnd: '#00F0FF',
      
      tabBarActive: '#FF10F0',
      tabBarInactive: '#6A7A8A',
      fabBackground: '#FF10F0',
      fabShadow: 'rgba(255,16,240,0.5)',
    },
  } as Theme,
  
  // 10. Tokyo Night
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
  
  // 11. Dracula
  dracula: {
    name: 'Dracula',
    isDark: true,
    colors: {
      primary: '#BD93F9',
      secondary: '#FF79C6',
      accent: '#50FA7B',
      background: '#282A36',
      surface: '#44475A',
      
      textPrimary: '#F8F8F2',
      textSecondary: '#F8F8F2',
      textMuted: '#6272A4',
      textInverse: '#282A36',
      
      buttonPrimary: '#BD93F9',
      buttonPrimaryHover: '#CAAAFB',
      buttonSecondary: '#44475A',
      buttonSecondaryHover: '#5A5E73',
      buttonDestructive: '#FF5555',
      buttonDestructiveHover: '#FF7777',
      
      cardBackground: '#44475A',
      cardShadow: 'rgba(189,147,249,0.2)',
      cardBorder: '#6272A4',
      cardHover: '#5A5E73',
      
      inputBackground: '#44475A',
      inputBorder: '#6272A4',
      inputBorderFocus: '#BD93F9',
      inputText: '#F8F8F2',
      inputPlaceholder: '#6272A4',
      
      border: '#6272A4',
      divider: '#44475A',
      overlay: 'rgba(40,42,54,0.9)',
      
      success: '#50FA7B',
      successLight: '#2A4A36',
      warning: '#F1FA8C',
      warningLight: '#4A4636',
      error: '#FF5555',
      errorLight: '#4A2A2A',
      info: '#8BE9FD',
      infoLight: '#2A4A52',
      
      gradientStart: '#BD93F9',
      gradientEnd: '#FF79C6',
      
      tabBarActive: '#BD93F9',
      tabBarInactive: '#6272A4',
      fabBackground: '#BD93F9',
      fabShadow: 'rgba(189,147,249,0.3)',
    },
  } as Theme,
  
  // 12. Synthwave
  synthwave: {
    name: 'Synthwave',
    isDark: true,
    colors: {
      primary: '#FF6AD5',
      secondary: '#C774E8',
      accent: '#FFD866',
      background: '#241734',
      surface: '#2D1F3D',
      
      textPrimary: '#FDFDFD',
      textSecondary: '#E6E6E6',
      textMuted: '#848bBD',
      textInverse: '#241734',
      
      buttonPrimary: '#FF6AD5',
      buttonPrimaryHover: '#FF89DE',
      buttonSecondary: '#372549',
      buttonSecondaryHover: '#473358',
      buttonDestructive: '#FE4450',
      buttonDestructiveHover: '#FE6570',
      
      cardBackground: '#2D1F3D',
      cardShadow: 'rgba(255,106,213,0.3)',
      cardBorder: '#495495',
      cardHover: '#372549',
      
      inputBackground: '#372549',
      inputBorder: '#495495',
      inputBorderFocus: '#FF6AD5',
      inputText: '#FDFDFD',
      inputPlaceholder: '#848bBD',
      
      border: '#495495',
      divider: '#372549',
      overlay: 'rgba(36,23,52,0.9)',
      
      success: '#72F1B8',
      successLight: '#2A4A3A',
      warning: '#FFD866',
      warningLight: '#4A4230',
      error: '#FE4450',
      errorLight: '#4A2228',
      info: '#36F9F6',
      infoLight: '#2A4A50',
      
      gradientStart: '#FF6AD5',
      gradientEnd: '#C774E8',
      
      tabBarActive: '#FF6AD5',
      tabBarInactive: '#848bBD',
      fabBackground: '#FF6AD5',
      fabShadow: 'rgba(255,106,213,0.4)',
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
