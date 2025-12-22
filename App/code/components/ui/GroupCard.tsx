// components/ui/GroupCard.tsx
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Group } from '../../lib/schema';
import { useThemeStore } from '../../stores/themeStore';
import { getGroupTypeEmoji, getGradientColors } from '../../utils/colors';
import { formatCurrency } from '../../utils/formatCurrency';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  memberAvatars?: string[];
}

export function GroupCard({ group, onPress, memberAvatars = [] }: GroupCardProps) {
  const { theme } = useThemeStore();
  const emoji = getGroupTypeEmoji(group.type);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Determine balance status
  const balanceStatus = group.totalBalance > 0 ? 'owed' : group.totalBalance < 0 ? 'owes' : 'settled';
  const balanceColor = balanceStatus === 'owed' ? theme.colors.success : balanceStatus === 'owes' ? theme.colors.error : theme.colors.textMuted;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.cardBackground,
          },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Flat Sleek Design */}
        <View style={styles.cardContent}>
          {/* Left Side - Group Photo/Icon */}
          <View style={styles.leftSection}>
            {group.photo ? (
              <Image 
                source={{ uri: group.photo }} 
                style={styles.groupPhoto}
              />
            ) : (
              <View style={[styles.groupPhotoPlaceholder, { backgroundColor: theme.colors.primary + 'CC' }]}>
                <Text style={styles.groupPhotoBadge}>{emoji}</Text>
              </View>
            )}
          </View>

          {/* Middle Section - Group Info */}
          <View style={styles.middleSection}>
            <Text style={[styles.groupTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {group.name}
            </Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="people" size={12} color={theme.colors.textMuted} />
              <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
                {group.memberCount} members
              </Text>
            </View>
          </View>

          {/* Right Section - Action Button */}
          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={[styles.actionIconButton, { backgroundColor: theme.colors.primary + '20' }]}
              onPress={handlePress}
              activeOpacity={0.6}
            >
              <MaterialIcons name="chevron-right" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  animatedContainer: {
    marginBottom: 12,
    marginHorizontal: 8,
  },
  container: {
    borderRadius: 16,
    borderWidth: 0,
    overflow: 'hidden',
    height: 100,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  leftSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupPhoto: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  groupPhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupPhotoBadge: {
    fontSize: 32,
    fontWeight: '700',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
