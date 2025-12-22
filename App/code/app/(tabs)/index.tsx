// app/(tabs)/index.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useGroupStore } from '../../stores/groupStore';
import { useToast } from '../../utils/toastManager';
import { GroupCard } from '../../components/ui/GroupCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { GroupCardSkeleton } from '../../components/ui/SkeletonLoader';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { groups, loading, fetchUserGroups } = useGroupStore();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);


  useEffect(() => {
    if (user) {
      fetchUserGroups(user.uid);
    }
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await fetchUserGroups(user.uid);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Groups refreshed', 'success');
    } catch (error) {
      showToast('Failed to refresh groups', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateGroup = async () => {
    setShowFabMenu(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/group/create');
  };

  const handleJoinGroup = async () => {
    setShowFabMenu(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/join-group');
  };

  if (!theme || !theme.colors) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.gradientStart + '20', theme.colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
              {user?.name || 'User'}
            </Text>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 300 }}
          >
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/profile');
              }}
              style={[styles.profileButton, { borderColor: theme.colors.primary + '40' }]}
              activeOpacity={0.7}
            >
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.profilePic}
                />
              ) : (
                <View style={[styles.profilePicPlaceholder, { backgroundColor: theme.colors.primary + '30' }]}>
                  <MaterialIcons name="account-circle" size={36} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </MotiView>
        </View>
      </LinearGradient>

      {/* Groups List */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <View style={[styles.titleRow, { paddingHorizontal: 16 }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Your Groups
            </Text>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.groupCount, { color: theme.colors.primary }]}>
                {groups.length}
              </Text>
            </View>
          </View>
        </MotiView>

        {loading && groups.length === 0 ? (
          <>
            {[1, 2, 3].map((i) => (
              <GroupCardSkeleton key={i} />
            ))}
          </>
        ) : groups.length === 0 ? (
          <EmptyState
            icon="group-work"
            title="No Groups Yet"
            description="Create or join a group to start tracking expenses together"
          />
        ) : (
          groups.map((group, index) => (
            <MotiView
              key={group.id}
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: index * 100 }}
            >
              <GroupCard
                group={group}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: '/group/[id]',
                    params: { id: group.id },
                  });
                }}
              />
            </MotiView>
          ))
        )}
      </ScrollView>

      {/* FAB Menu Overlay */}
      {showFabMenu && (
        <TouchableOpacity
          style={[styles.fabOverlay, { backgroundColor: theme.colors.overlay }]}
          activeOpacity={1}
          onPress={() => setShowFabMenu(false)}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring' }}
            style={styles.fabMenuContainer}
          >
            <TouchableOpacity
              style={[
                styles.fabMenuItem, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                }
              ]}
              onPress={handleCreateGroup}
            >
              <View style={[styles.fabMenuIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <MaterialIcons name="add" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.fabMenuText, { color: theme.colors.textPrimary }]}>
                Create Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.fabMenuItem, 
                { 
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                }
              ]}
              onPress={handleJoinGroup}
            >
              <View style={[styles.fabMenuIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <MaterialIcons name="group-add" size={24} color={theme.colors.success} />
              </View>
              <Text style={[styles.fabMenuText, { color: theme.colors.textPrimary }]}>
                Join Group
              </Text>
            </TouchableOpacity>
          </MotiView>
        </TouchableOpacity>
      )}

      {/* Main FAB */}
      <MotiView
        from={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 600 }}
      >
        <TouchableOpacity
          style={[styles.fab, { 
            backgroundColor: theme.colors.fabBackground,
            shadowColor: theme.colors.fabShadow,
          }]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowFabMenu(!showFabMenu);
          }}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={styles.fabGradient}
          >
            <MaterialIcons
              name={showFabMenu ? 'close' : 'add'}
              size={28}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  profilePicPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 0,
    paddingBottom: 120,
    paddingTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  groupCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 100,
    paddingRight: 24,
  },
  fabMenuContainer: {
    gap: 12,
    marginBottom: 12,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fabMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabMenuText: {
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
