// components/ui/GroupCard.tsx
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Group } from '../../lib/schema';
import { useThemeStore } from '../../stores/themeStore';
import { getGroupTypeEmoji, getGradientColors } from '../../utils/colors';
import { formatCurrency } from '../../utils/formatCurrency';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const { theme } = useThemeStore();
  const emoji = getGroupTypeEmoji(group.type);
  const gradientColors = getGradientColors(theme.colors.primary);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[...gradientColors]} // Spread operator to ensure type safety
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          {group.photo ? (
            <Image source={{ uri: group.photo }} style={styles.photo} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
          )}
          
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {group.name}
            </Text>
            <View style={styles.meta}>
              <MaterialIcons name="people" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.metaText}>{group.memberCount} members</Text>
            </View>
          </View>

          <MaterialIcons name="chevron-right" size={28} color="rgba(255,255,255,0.9)" />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>
              {formatCurrency(group.totalExpenses, group.currency)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statLabel}>Balance</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    group.totalBalance > 0
                      ? '#06FFA5'
                      : group.totalBalance < 0
                      ? '#FF6B6B'
                      : 'rgba(255,255,255,0.9)',
                },
              ]}
            >
              {formatCurrency(Math.abs(group.totalBalance), group.currency)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 16,
  },
  photoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
});
