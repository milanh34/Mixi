import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const THEME_STORAGE_KEY = '@mixi_theme_preferences';

interface Theme {
  name: string;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
}

export const THEMES = {
  // LIGHT THEMES
  light: {
    name: 'Light',
    isDark: false,
    colors: {
      primary: '#4285F4',
      secondary: '#34A853',
      accent: '#FBBC04',
      background: '#FFFFFF',
      card: '#F8F9FA',
      surface: '#F1F3F4',
      text: '#202124',
      textSecondary: '#5F6368',
      border: '#DADCE0',
      error: '#EA4335',
      success: '#34A853',
      warning: '#FBBC04',
      info: '#4285F4',
    },
  },
  ocean: {
    name: 'Ocean',
    isDark: false,
    colors: {
      primary: '#0077B6',
      secondary: '#00B4D8',
      accent: '#90E0EF',
      background: '#F0F8FF',
      card: '#E3F2FD',
      surface: '#BBDEFB',
      text: '#01497C',
      textSecondary: '#0077B6',
      border: '#64B5F6',
      error: '#FF6B6B',
      success: '#06FFA5',
      warning: '#FFD23F',
      info: '#0096C7',
    },
  },
  sunset: {
    name: 'Sunset',
    isDark: false,
    colors: {
      primary: '#FF6B6B',
      secondary: '#FF9FF3',
      accent: '#FFE66D',
      background: '#FFF5F5',
      card: '#FFE5E5',
      surface: '#FFD1D1',
      text: '#6B2737',
      textSecondary: '#C73E4A',
      border: '#FFA8A8',
      error: '#D32F2F',
      success: '#26DE81',
      warning: '#FED330',
      info: '#FF6348',
    },
  },
  lavender: {
    name: 'Lavender',
    isDark: false,
    colors: {
      primary: '#9D4EDD',
      secondary: '#C77DFF',
      accent: '#E0AAFF',
      background: '#FAF5FF',
      card: '#F3E5FF',
      surface: '#E9D5FF',
      text: '#4C1D95',
      textSecondary: '#7C3AED',
      border: '#C4B5FD',
      error: '#FF6B6B',
      success: '#06FFA5',
      warning: '#FFD23F',
      info: '#A855F7',
    },
  },
  forest: {
    name: 'Forest',
    isDark: false,
    colors: {
      primary: '#52B788',
      secondary: '#74C69D',
      accent: '#95D5B2',
      background: '#F1F8F4',
      card: '#D8F3DC',
      surface: '#B7E4C7',
      text: '#1B4332',
      textSecondary: '#2D6A4F',
      border: '#95D5B2',
      error: '#FF6B6B',
      success: '#40916C',
      warning: '#FFD23F',
      info: '#52B788',
    },
  },
  peach: {
    name: 'Peach',
    isDark: false,
    colors: {
      primary: '#FF9F71',
      secondary: '#FFB997',
      accent: '#FFD4BD',
      background: '#FFF8F5',
      card: '#FFE8DC',
      surface: '#FFD4BD',
      text: '#5C3D2E',
      textSecondary: '#9B6B53',
      border: '#FFCBA4',
      error: '#FF6B6B',
      success: '#52B788',
      warning: '#FFB020',
      info: '#FF9F71',
    },
  },
  
  // DARK THEMES
  dark: {
    name: 'Dark',
    isDark: true,
    colors: {
      primary: '#8AB4F8',
      secondary: '#81C995',
      accent: '#FDD663',
      background: '#121212',
      card: '#1E1E1E',
      surface: '#2C2C2C',
      text: '#E8EAED',
      textSecondary: '#9AA0A6',
      border: '#3C4043',
      error: '#F28B82',
      success: '#81C995',
      warning: '#FDD663',
      info: '#8AB4F8',
    },
  },
  midnight: {
    name: 'Midnight',
    isDark: true,
    colors: {
      primary: '#3A86FF',
      secondary: '#8338EC',
      accent: '#FF006E',
      background: '#0D1B2A',
      card: '#1B263B',
      surface: '#415A77',
      text: '#E0E1DD',
      textSecondary: '#778DA9',
      border: '#415A77',
      error: '#FF006E',
      success: '#06FFA5',
      warning: '#FFBE0B',
      info: '#3A86FF',
    },
  },
  cyberpunk: {
    name: 'Cyberpunk',
    isDark: true,
    colors: {
      primary: '#FF10F0',
      secondary: '#00F0FF',
      accent: '#FFF01F',
      background: '#0A0E27',
      card: '#1A1F3A',
      surface: '#2A2F4A',
      text: '#FFFFFF',
      textSecondary: '#B8C5D6',
      border: '#4A4F6A',
      error: '#FF1744',
      success: '#00FF9F',
      warning: '#FFD600',
      info: '#00E5FF',
    },
  },
  vampire: {
    name: 'Vampire',
    isDark: true,
    colors: {
      primary: '#DC143C',
      secondary: '#8B0000',
      accent: '#FFD700',
      background: '#0F0F0F',
      card: '#1A1A1A',
      surface: '#2D2D2D',
      text: '#F5F5F5',
      textSecondary: '#B8B8B8',
      border: '#4D0000',
      error: '#FF4444',
      success: '#00FF88',
      warning: '#FFB700',
      info: '#DC143C',
    },
  },
  emerald: {
    name: 'Emerald',
    isDark: true,
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7',
      background: '#064E3B',
      card: '#065F46',
      surface: '#047857',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      border: '#059669',
      error: '#FF6B6B',
      success: '#34D399',
      warning: '#FBBF24',
      info: '#10B981',
    },
  },
  royal: {
    name: 'Royal',
    isDark: true,
    colors: {
      primary: '#6366F1',
      secondary: '#818CF8',
      accent: '#C4B5FD',
      background: '#1E1B4B',
      card: '#312E81',
      surface: '#3730A3',
      text: '#EEF2FF',
      textSecondary: '#C7D2FE',
      border: '#4F46E5',
      error: '#F87171',
      success: '#34D399',
      warning: '#FBBF24',
      info: '#818CF8',
    },
  },
} as const;

interface ThemeState {
  themeName: keyof typeof THEMES;
  theme: Theme;
  
  setTheme: (name: keyof typeof THEMES) => void;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  // Set default theme immediately
  themeName: 'light',
  theme: THEMES.light,

  initializeTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const themeName = stored as keyof typeof THEMES;
        if (THEMES[themeName]) {
          set({
            themeName,
            theme: THEMES[themeName],
          });
          console.log('✅ Theme loaded:', themeName);
        }
      } else {
        // Auto-detect system theme
        const colorScheme = Appearance.getColorScheme();
        const defaultTheme = colorScheme === 'dark' ? 'dark' : 'light';
        set({
          themeName: defaultTheme,
          theme: THEMES[defaultTheme],
        });
        console.log('✅ Default theme set:', defaultTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to light theme
      set({
        themeName: 'light',
        theme: THEMES.light,
      });
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
