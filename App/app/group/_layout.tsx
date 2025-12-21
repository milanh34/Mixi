import { Stack } from 'expo-router';
import { useThemeStore } from '../../stores/themeStore';

export default function GroupLayout() {
  const { theme } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="create" />
    </Stack>
  );
}
