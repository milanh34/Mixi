// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { ToastProvider } from '../utils/toastManager';
import { ToastPortalProvider } from '../components/ui/ToastPortal';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initializeAuth, isInitialized } = useAuthStore();
  const { initializeTheme, theme } = useThemeStore();
  const [themeReady, setThemeReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    const initialize = async () => {
      await initializeTheme();
      setThemeReady(true);
      await initializeAuth();

      if (fontsLoaded && isInitialized) {
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, [fontsLoaded, isInitialized]);

  if (!fontsLoaded || !isInitialized || !themeReady || !theme) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme?.colors.background || '#FFFFFF'
      }}>
        <ActivityIndicator size="large" color={theme?.colors.primary || '#4285F4'} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <ToastPortalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="group" />
            <Stack.Screen name="join-group" />
            <Stack.Screen name="profile" />
          </Stack>
        </ToastPortalProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}
