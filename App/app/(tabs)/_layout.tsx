// app/(tabs)/_layout.tsx
import { Tabs, Redirect, useSegments, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

export default function TabLayout() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { theme } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated but still on auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitialized, segments]);

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: 'Themes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="palette" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
