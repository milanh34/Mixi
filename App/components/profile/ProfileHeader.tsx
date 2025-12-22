// components/profile/ProfileHeader.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../stores/themeStore';
import * as Haptics from 'expo-haptics';

interface ProfileHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
}

export function ProfileHeader({ isEditing, onEditToggle }: ProfileHeaderProps) {
  const router = useRouter();
  const { theme } = useThemeStore();

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart + '15', theme.colors.background]}
      style={styles.headerGradient}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Profile
        </Text>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onEditToggle();
          }}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isEditing ? 'close' : 'edit'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
