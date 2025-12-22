// app/group/[id].tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useGroupStore } from '../../stores/groupStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useExpenseLogStore } from '../../stores/expenseLogStore';
import { useToast } from '../../utils/toastManager';
import { useGroupMembers } from '../../hooks/useGroupMembers';
import { MemberAvatar } from '../../components/ui/MemberAvatar';
import { ExpenseItem } from '../../components/ui/ExpenseItem';
import { TimelineEvent } from '../../components/ui/TimelineEvent';
import { EmptyState } from '../../components/ui/EmptyState';
import { AddExpenseForm } from '../../components/forms/AddExpenseForm';
import { AddEventForm } from '../../components/forms/AddEventForm';
import { getGroupTypeEmoji, getGradientColors } from '../../utils/colors';
import { formatCurrency } from '../../utils/formatCurrency';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

type Tab = 'expense' | 'members' | 'timeline' | 'activity';

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { currentGroup, fetchGroup } = useGroupStore();
  const { expenses, fetchGroupExpenses } = useExpenseStore();
  const { events, fetchGroupTimeline } = useTimelineStore();
  const { logs, fetchGroupLogs } = useExpenseLogStore();
  const { showToast } = useToast();
  const { members } = useGroupMembers(id);

  const [activeTab, setActiveTab] = useState<Tab>('expense');
  const [expenseFilter, setExpenseFilter] = useState<'personal' | 'shared'>('shared');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroup(id);
      fetchGroupExpenses(id);
      fetchGroupTimeline(id);
      fetchGroupLogs(id);
    }
  }, [id]);

  if (!currentGroup) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loading, { color: theme.colors.textPrimary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAdmin = currentGroup.adminId === user?.uid;
  const emoji = getGroupTypeEmoji(currentGroup.type);

  const handleInvite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/group/invite/[id]',
      params: { id: currentGroup.id }
    });
  };

  const handleSettings = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast('Settings coming soon', 'info');
  };

  const handleTabChange = async (tab: Tab) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleFabPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeTab === 'expense') {
      setShowExpenseForm(true);
    } else if (activeTab === 'timeline') {
      setShowEventForm(true);
    }
  };

  const filteredExpenses = expenses.filter((e) => e.type === expenseFilter);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Header Top - Back & Actions */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            activeOpacity={0.6}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleInvite}
              style={[styles.iconButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              activeOpacity={0.6}
            >
              <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSettings}
              style={[styles.iconButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              activeOpacity={0.6}
            >
              <MaterialIcons name="settings" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Group Title Section */}
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.groupName}>{currentGroup.name}</Text>
            <View style={styles.adminBadge}>
              <MaterialIcons name="admin-panel-settings" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.adminText}>Admin</Text>
            </View>
          </View>

          {currentGroup.photo ? (
            <Image source={{ uri: currentGroup.photo }} style={styles.groupPhotoSmall} />
          ) : (
            <View style={[styles.groupPhotoSmall, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.groupEmojiSmall}>{emoji}</Text>
            </View>
          )}
        </View>

        {/* Key Info Row - Currency, Total, Unsettled */}
        <View style={styles.keyInfoRow}>
          <View style={styles.keyInfoItem}>
            <Text style={styles.keyInfoLabel}>Total</Text>
            <Text style={styles.keyInfoValue}>
              {formatCurrency(currentGroup.totalExpenses, currentGroup.currency)}
            </Text>
          </View>

          <View style={[styles.keyInfoDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />

          <View style={styles.keyInfoItem}>
            <Text style={styles.keyInfoLabel}>Unsettled</Text>
            <Text style={[
              styles.keyInfoValue,
              {
                color: Math.abs(currentGroup.totalBalance) > 0 ? '#FFD700' : 'rgba(255,255,255,0.9)'
              }
            ]}>
              {formatCurrency(Math.abs(currentGroup.totalBalance), currentGroup.currency)}
            </Text>
          </View>

          <View style={[styles.keyInfoDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />

          <View style={styles.keyInfoItem}>
            <Text style={styles.keyInfoLabel}>Currency</Text>
            <Text style={styles.keyInfoValue}>{currentGroup.currency}</Text>
          </View>
        </View>

        {/* Member Count */}
        <View style={styles.memberCountRow}>
          <MaterialIcons name="people" size={16} color="rgba(255,255,255,0.95)" />
          <Text style={styles.memberCountText}>
            {currentGroup.memberCount} {currentGroup.memberCount === 1 ? 'member' : 'members'}
          </Text>
        </View>
      </LinearGradient>

      {/* Modern Themed Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.divider }]}>
        {(['expense', 'members', 'timeline', 'activity'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => handleTabChange(tab)}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              <MaterialIcons
                name={
                  tab === 'expense' ? 'receipt' :
                    tab === 'members' ? 'group' :
                      tab === 'timeline' ? 'event' : 'history'
                }
                size={18}
                color={activeTab === tab ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab ? theme.colors.primary : theme.colors.textMuted,
                    fontWeight: activeTab === tab ? '700' : '600',
                    fontSize: activeTab === tab ? 14 : 13,
                  },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </View>
            {activeTab === tab && (
              <View style={[styles.tabUnderline, { backgroundColor: theme.colors.primary }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'expense' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            {/* Enhanced Expense Filter */}
            <View style={[styles.filterContainer, { backgroundColor: theme.colors.cardBackground }]}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  expenseFilter === 'personal' && [
                    styles.filterButtonActive,
                    { backgroundColor: theme.colors.primary }
                  ],
                ]}
                onPress={() => setExpenseFilter('personal')}
              >
                <MaterialIcons
                  name="person"
                  size={18}
                  color={expenseFilter === 'personal' ? '#FFFFFF' : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: expenseFilter === 'personal' ? '#FFFFFF' : theme.colors.textSecondary },
                  ]}
                >
                  Personal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  expenseFilter === 'shared' && [
                    styles.filterButtonActive,
                    { backgroundColor: theme.colors.primary }
                  ],
                ]}
                onPress={() => setExpenseFilter('shared')}
              >
                <MaterialIcons
                  name="group"
                  size={18}
                  color={expenseFilter === 'shared' ? '#FFFFFF' : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: expenseFilter === 'shared' ? '#FFFFFF' : theme.colors.textSecondary },
                  ]}
                >
                  Shared
                </Text>
              </TouchableOpacity>
            </View>

            {/* Expenses List */}
            {filteredExpenses.length === 0 ? (
              <EmptyState
                icon={expenseFilter === 'personal' ? 'person' : 'group'}
                title={`No ${expenseFilter === 'personal' ? 'Personal' : 'Shared'} Expenses`}
                description={`Add your first ${expenseFilter} expense to get started`}
              />
            ) : (
              filteredExpenses.map((expense, index) => (
                <MotiView
                  key={expense.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', delay: index * 50, duration: 300 }}
                >
                  <ExpenseItem
                    expense={expense}
                    onPress={() => showToast('Expense details coming soon', 'info')}
                  />
                </MotiView>
              ))
            )}
          </MotiView>
        )}

        {activeTab === 'members' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            {members.map((member, index) => (
              <MotiView
                key={member.userId}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', delay: index * 50, duration: 300 }}
              >
                <View
                  style={[
                    styles.memberCard,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                >
                  <MemberAvatar
                    name={member.userName}
                    photo={member.userProfilePicture}
                    size="medium"
                  />
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                      {member.userName}
                    </Text>
                    <Text style={[styles.memberRole, { color: theme.colors.textSecondary }]}>
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </Text>
                  </View>
                  {member.role === 'admin' && (
                    <View style={[styles.adminBadge, { backgroundColor: theme.colors.primary }]}>
                      <MaterialIcons name="verified" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              </MotiView>
            ))}
          </MotiView>
        )}

        {activeTab === 'timeline' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            {events.length === 0 ? (
              <EmptyState
                icon="event"
                title="No Events Yet"
                description="Add milestones to track your journey together"
              />
            ) : (
              events.map((event, index) => (
                <MotiView
                  key={event.id}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', delay: index * 50 }}
                >
                  <TimelineEvent event={event} />
                </MotiView>
              ))
            )}
          </MotiView>
        )}

        {activeTab === 'activity' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            {logs.length === 0 ? (
              <EmptyState
                icon="history"
                title="No Activity Yet"
                description="All group activity will appear here"
              />
            ) : (
              logs.map((log, index) => (
                <MotiView
                  key={log.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', delay: index * 50, duration: 300 }}
                >
                  <View
                    style={[
                      styles.activityCard,
                      {
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={[styles.activityIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                      <MaterialIcons
                        name={
                          log.type === 'expense_added' ? 'add-circle' :
                            log.type === 'expense_deleted' ? 'delete' :
                              log.type === 'expense_settled' ? 'check-circle' :
                                log.type === 'payment_made' ? 'payment' : 'edit'
                        }
                        size={20}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={[styles.activityDesc, { color: theme.colors.textPrimary }]}>
                        {log.description}
                      </Text>
                      {log.amount && (
                        <Text style={[styles.activityAmount, { color: theme.colors.primary }]}>
                          {formatCurrency(log.amount, log.currency || currentGroup.currency)}
                        </Text>
                      )}
                      <Text style={[styles.activityTime, { color: theme.colors.textMuted }]}>
                        {log.createdAt.toDate().toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </MotiView>
              ))
            )}
          </MotiView>
        )}
      </ScrollView>

      {/* Enhanced FAB with Gradient */}
      {(activeTab === 'expense' || activeTab === 'timeline') && (
        <MotiView
          from={{ scale: 0, rotate: '-180deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', delay: 400 }}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={handleFabPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.fabBackground, theme.colors.secondary]}
              style={styles.fabGradient}
            >
              <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Modals */}
      {currentGroup && (
        <>
          <AddExpenseForm
            visible={showExpenseForm}
            groupId={currentGroup.id}
            groupCurrency={currentGroup.currency}
            onClose={() => setShowExpenseForm(false)}
          />

          <AddEventForm
            visible={showEventForm}
            groupId={currentGroup.id}
            onClose={() => setShowEventForm(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  groupPhotoSmall: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  groupEmojiSmall: {
    fontSize: 24,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    maxWidth: '75%',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  adminText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
  keyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  keyInfoItem: {
    flex: 1,
  },
  keyInfoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  keyInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  keyInfoDivider: {
    width: 1,
    height: 28,
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
  },
  memberCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
  groupMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 13,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    marginBottom: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  filterButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 13,
    fontWeight: '500',
  },
  memberAdminBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  activityCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityDesc: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
