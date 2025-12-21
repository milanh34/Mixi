import { View, Text, StyleSheet, Image } from 'react-native';
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

  return (
    <View style={styles.container}>
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={[
            styles.avatar,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: theme.colors.primary + '20',
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize, color: theme.colors.primary }]}>
            {initials}
          </Text>
        </View>
      )}
      {showName && (
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
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
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  name: {
    fontSize: 12,
    marginTop: 4,
    maxWidth: 80,
  },
});
