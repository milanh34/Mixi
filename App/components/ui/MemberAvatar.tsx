// components/ui/MemberAvatar.tsx
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';

interface MemberAvatarProps {
  name: string;
  photo?: string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

export function MemberAvatar({ name, photo, size = 'medium', showName = false }: MemberAvatarProps) {
  const { theme } = useThemeStore();
  
  const sizes = {
    small: 32,
    medium: 48,
    large: 64,
  };
  
  const avatarSize = sizes[size];
  const fontSize = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.error,
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarColor = getAvatarColor(name);

  return (
    <View style={styles.container}>
      {photo ? (
        <View
          style={[
            styles.imageWrapper,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <Image
            source={{ uri: photo }}
            style={[
              styles.avatar,
              { width: avatarSize - 4, height: avatarSize - 4, borderRadius: (avatarSize - 4) / 2 },
            ]}
          />
        </View>
      ) : (
        <LinearGradient
          colors={[avatarColor + 'DD', avatarColor + '88']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize, color: '#FFFFFF' }]}>
            {initials}
          </Text>
        </LinearGradient>
      )}
      {showName && (
        <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  initials: {
    fontWeight: '700',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    maxWidth: 80,
  },
});
