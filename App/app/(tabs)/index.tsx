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
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useGroupStore } from '../../stores/groupStore';
import { GroupCard } from '../../components/ui/GroupCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { GroupCardSkeleton } from '../../components/ui/SkeletonLoader';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { groups, loading, fetchUserGroups } = useGroupStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Safety check
  if (!theme || !theme.colors) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  useEffect(() => {
    if (user) {
      fetchUserGroups(user.uid);
    }
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchUserGroups(user.uid);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRefreshing(false);
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user?.name || 'User'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/profile');
          }}
        >
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profilePic}
            />
          ) : (
            <MaterialIcons name="account-circle" size={40} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

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
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Your Groups
          </Text>
          <Text style={[styles.groupCount, { color: theme.colors.textSecondary }]}>
            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
          </Text>
        </View>

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
            description="Create or join a group to get started"
          />
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/group/[id]',
                  params: { id: group.id },
                });
              }}
            />
          ))
        )}
      </ScrollView>

      {/* FAB Menu */}
      {showFabMenu && (
        <TouchableOpacity
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={() => setShowFabMenu(false)}
        >
          <View style={styles.fabMenuContainer}>
            <TouchableOpacity
              style={[styles.fabMenuItem, { backgroundColor: theme.colors.card }]}
              onPress={handleCreateGroup}
            >
              <MaterialIcons name="add" size={24} color={theme.colors.primary} />
              <Text style={[styles.fabMenuText, { color: theme.colors.text }]}>
                Create Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fabMenuItem, { backgroundColor: theme.colors.card }]}
              onPress={handleJoinGroup}
            >
              <MaterialIcons name="group-add" size={24} color={theme.colors.success} />
              <Text style={[styles.fabMenuText, { color: theme.colors.text }]}>
                Join Group
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowFabMenu(!showFabMenu);
        }}
      >
        <MaterialIcons
          name={showFabMenu ? 'close' : 'add'}
          size={28}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  groupCount: {
    fontSize: 14,
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  fabMenuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
