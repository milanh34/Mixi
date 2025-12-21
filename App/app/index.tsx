// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Show loading while checking auth state
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}
