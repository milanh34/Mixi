// app/group/[id].tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useCallback } from 'react';
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
import { ActivityLog } from '../../components/ui/ActivityLog';
import { BalanceModal } from '../../components/ui/BalanceModal'; 
import { getGroupTypeEmoji } from '../../utils/colors';
import { formatCurrency } from '../../utils/formatCurrency';
import { 
  calculateRemainingBalance, 
  calculateMemberBalances, 
  calculateUserTotalSpending, 
  calculateSharedTotal,
  calculateBalanceDetails, 
} from '../../utils/balanceCalculator';
import { MotiView } from 'moti';
import { useNoteStore } from '../../stores/noteStore';
import { NotesTab } from '../../components/ui/NotesTab';
import * as Haptics from 'expo-haptics'; 

const { height } = Dimensions.get('window');
const EXPANDED_HEADER_HEIGHT = height * 0.28;
const COLLAPSED_HEADER_HEIGHT = 100;

type Tab = 'expense' | 'members' | 'timeline' | 'logs' | 'notes';
type ExpenseFilter = 'personal' | 'shared';

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
  const { members } = useGroupMembers(id as string);

  const [activeTab, setActiveTab] = useState<Tab>('expense');
  const [expenseFilter, setExpenseFilter] = useState<ExpenseFilter>('shared');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [preselectedExpenseType, setPreselectedExpenseType] = useState<'personal' | 'shared'>('shared');
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false); 

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [EXPANDED_HEADER_HEIGHT, COLLAPSED_HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const expandedOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const collapsedOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Calculate totals
  const allExpenses = expenses;
  const sharedExpenses = expenses.filter((e) => e.type === 'shared');
  const personalExpenses = expenses.filter((e) => e.type === 'personal' && e.creatorId === user?.uid);
  const groupTotal = calculateSharedTotal(expenses);
  const memberBalances = calculateMemberBalances(sharedExpenses, members);
  const remainingBalance = calculateRemainingBalance(sharedExpenses, user?.uid || '');
  const userTotalSpending = calculateUserTotalSpending(allExpenses, user?.uid || '');

  const balanceDetails = calculateBalanceDetails(sharedExpenses, members, user?.uid || '');

  // Refresh function
  const onRefresh = useCallback(async () => {
    if (!id || !user?.uid) return;

    setRefreshing(true);
    try {
      await Promise.all([
        fetchGroup(id as string),
        fetchGroupExpenses(id as string),
        fetchGroupTimeline(id as string),
        fetchGroupLogs(id as string, user.uid, expenses),
        useNoteStore.getState().fetchGroupNotes(id as string),
      ]);
      showToast('Refreshed successfully!', 'success');
    } catch (error) {
      showToast('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [id, user?.uid, expenses]);

  useEffect(() => {
    if (id && user?.uid) {
      Promise.all([
        fetchGroup(id as string),
        fetchGroupExpenses(id as string),
        fetchGroupTimeline(id as string),
        fetchGroupLogs(id as string, user.uid, []),
      ]);
    }
  }, [id, user?.uid]);

  if (!currentGroup || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loading, { color: theme.colors.textPrimary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const emoji = getGroupTypeEmoji(currentGroup.type);
  const personalTotal = personalExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleInvite = () => {
    router.push({
      pathname: '/group/invite/[id]',
      params: { id: currentGroup.id },
    });
  };

  const handleSettings = () => {
    router.push({
      pathname: '/group/settings/[id]',
      params: { id: currentGroup.id },
    });
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleExpenseFilterChange = (filter: ExpenseFilter) => {
    setExpenseFilter(filter);
  };

  const handleFabPress = () => {
    if (activeTab === 'expense') {
      setPreselectedExpenseType(expenseFilter);
      setEditingExpense(null);
      setShowExpenseForm(true);
    } else if (activeTab === 'timeline') {
      setShowEventForm(true);
    }
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleBalanceCardPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBalanceModal(true);
  };

  const filteredExpenses = expenseFilter === 'personal' ? personalExpenses : sharedExpenses;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'expense', label: 'Expense', icon: 'receipt' },
    { id: 'members', label: 'Members', icon: 'group' },
    { id: 'timeline', label: 'Timeline', icon: 'timeline' },
    { id: 'logs', label: 'Logs', icon: 'history' },
    { id: 'notes', label: 'Notes', icon: 'edit-note' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <Animated.View style={{ height: headerHeight }}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Animated.View style={[styles.expandedHeader, { opacity: expandedOpacity }]}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleInvite} style={styles.iconButton} activeOpacity={0.7}>
                  <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSettings} style={styles.iconButton} activeOpacity={0.7}>
                  <MaterialIcons name="more-vert" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerContent}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName} numberOfLines={1}>
                  {currentGroup.name}
                </Text>
                <View style={styles.groupMeta}>
                  <MaterialIcons name="people" size={14} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.groupMetaText}>{currentGroup.memberCount} members</Text>
                  <View style={styles.dot} />
                  <Text style={styles.groupMetaText}>{currentGroup.currency}</Text>
                </View>
              </View>

              {currentGroup.photo ? (
                <Image source={{ uri: currentGroup.photo }} style={styles.groupPhoto} />
              ) : (
                <View style={[styles.groupPhoto, styles.groupPhotoPlaceholder]}>
                  <Text style={styles.groupEmoji}>{emoji}</Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Spending</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(groupTotal, currentGroup.currency)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Your Spendings</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(userTotalSpending, currentGroup.currency)}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.collapsedHeader, { opacity: collapsedOpacity }]}>
            <View style={styles.collapsedRow1}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.collapsedIconButton}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.collapsedActions}>
                <TouchableOpacity onPress={handleInvite} style={styles.collapsedIconButton} activeOpacity={0.7}>
                  <MaterialIcons name="person-add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSettings} style={styles.collapsedIconButton} activeOpacity={0.7}>
                  <MaterialIcons name="more-vert" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.collapsedRow2}>
              <View style={styles.collapsedLeft}>
                <Text style={styles.collapsedGroupName} numberOfLines={1}>
                  {currentGroup.name}
                </Text>
                <View style={styles.collapsedMetaRow}>
                  <MaterialIcons name="people" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.collapsedMetaText}>{currentGroup.memberCount} members</Text>
                </View>
              </View>

              <View style={styles.collapsedRight}>
                <View style={styles.collapsedStatItem}>
                  <Text style={styles.collapsedStatLabel}>Total</Text>
                  <Text style={styles.collapsedStatValue}>
                    {formatCurrency(groupTotal, currentGroup.currency)}
                  </Text>
                </View>
                <View style={styles.collapsedStatItem}>
                  <Text style={styles.collapsedStatLabel}>Your Spending</Text>
                  <Text style={styles.collapsedStatValue}>
                    {formatCurrency(userTotalSpending, currentGroup.currency)}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <View style={[styles.tabsContainer, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  isActive ? styles.tabActive : styles.tabInactive,
                  isActive && { backgroundColor: theme.colors.primary + '15' },
                ]}
                onPress={() => handleTabChange(tab.id)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={20}
                  color={isActive ? theme.colors.primary : theme.colors.textMuted}
                />
                {isActive && (
                  <Text style={[styles.tabText, { color: theme.colors.primary }]}>
                    {tab.label}
                  </Text>
                )}
                {isActive && (
                  <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Animated.ScrollView
        nestedScrollEnabled={true}
        scrollIndicatorInsets={{ right: 1 }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'expense' && (
          <>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  expenseFilter === 'personal' && styles.filterButtonActive,
                  {
                    backgroundColor:
                      expenseFilter === 'personal'
                        ? theme.colors.secondary + '20'
                        : theme.colors.cardBackground,
                    borderColor:
                      expenseFilter === 'personal' ? theme.colors.secondary : theme.colors.cardBorder,
                  },
                ]}
                onPress={() => handleExpenseFilterChange('personal')}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="person"
                  size={16}
                  color={
                    expenseFilter === 'personal' ? theme.colors.secondary : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        expenseFilter === 'personal' ? theme.colors.secondary : theme.colors.textSecondary,
                    },
                  ]}
                >
                  Personal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  expenseFilter === 'shared' && styles.filterButtonActive,
                  {
                    backgroundColor:
                      expenseFilter === 'shared' ? theme.colors.primary + '20' : theme.colors.cardBackground,
                    borderColor:
                      expenseFilter === 'shared' ? theme.colors.primary : theme.colors.cardBorder,
                  },
                ]}
                onPress={() => handleExpenseFilterChange('shared')}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="group"
                  size={16}
                  color={expenseFilter === 'shared' ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: expenseFilter === 'shared' ? theme.colors.primary : theme.colors.textSecondary,
                    },
                  ]}
                >
                  Shared
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.totalCard,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
              onPress={expenseFilter === 'shared' ? handleBalanceCardPress : undefined}
              activeOpacity={expenseFilter === 'shared' ? 0.7 : 1}
              disabled={expenseFilter === 'personal'}
            >
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
                {expenseFilter === 'personal' ? 'Total Personal Expenses' : 'Your Balance (Remaining)'}
              </Text>
              <View style={styles.totalValueRow}>
                <Text
                  style={[
                    styles.totalValue,
                    {
                      color:
                        expenseFilter === 'personal'
                          ? theme.colors.textPrimary
                          : remainingBalance >= 0
                            ? theme.colors.success
                            : theme.colors.error,
                    },
                  ]}
                >
                  {expenseFilter === 'personal'
                    ? formatCurrency(personalTotal, currentGroup.currency)
                    : `${remainingBalance >= 0 ? '+' : ''}${formatCurrency(
                      Math.abs(remainingBalance),
                      currentGroup.currency
                    )}`}
                </Text>
                {expenseFilter === 'shared' && (
                  <MaterialIcons 
                    name="chevron-right" 
                    size={24} 
                    color={theme.colors.textMuted} 
                  />
                )}
              </View>
              {expenseFilter === 'shared' && (
                <View style={styles.totalSubtextRow}>
                  <Text style={[styles.totalSubtext, { color: theme.colors.textMuted }]}>
                    {remainingBalance >= 0 ? 'You are owed (unpaid)' : 'You owe (unpaid)'}
                  </Text>
                  <Text style={[styles.tapHint, { color: theme.colors.primary }]}>
                    Tap for details
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {filteredExpenses.length === 0 ? (
              <EmptyState
                icon={expenseFilter === 'shared' ? 'group-work' : 'person-outline'}
                title={`No ${expenseFilter} expenses yet`}
                description={`Add your first ${expenseFilter} expense to get started`}
              />
            ) : (
              filteredExpenses.map((expense, index) => (
                <MotiView
                  key={expense.id}
                  from={{ opacity: 0, translateY: 12 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 220, delay: index * 50 }}
                  style={styles.expenseItemWrapper}
                >
                  <ExpenseItem
                    expense={expense}
                    currentUserId={user.uid}
                    groupCurrency={currentGroup.currency}
                    onEdit={handleEditExpense}
                  />
                </MotiView>
              ))
            )}
          </>
        )}

        {activeTab === 'members' && (
          <View style={styles.listPadding}>
            {memberBalances.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No members yet"
                description="Invite friends to join this group"
              />
            ) : (
              <View style={styles.membersList}>
                {memberBalances.map((member) => (
                  <View
                    key={member.userId}
                    style={[
                      styles.memberRow,
                      {
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.cardBorder,
                      },
                    ]}
                  >
                    <MemberAvatar
                      name={member.userName}
                      photo={member.userProfilePicture}
                      size='medium'
                    />
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                        {member.userId === user?.uid ? 'You' : member.userName}
                      </Text>
                      <Text
                        style={[
                          styles.memberRole,
                          {
                            color:
                              member.role === 'admin' ? theme.colors.primary : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </Text>
                    </View>
                    <View style={styles.memberBalance}>
                      <Text
                        style={[
                          styles.memberBalanceValue,
                          {
                            color:
                              member.balance >= 0 ? theme.colors.success : theme.colors.error,
                          },
                        ]}
                      >
                        {member.balance >= 0 ? '+' : ''}
                        {formatCurrency(Math.abs(member.balance), currentGroup.currency)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'timeline' && (
          <View style={styles.listPadding}>
            {events.length === 0 ? (
              <EmptyState
                icon="timeline"
                title="No timeline events yet"
                description="Timeline events are auto-generated from expenses"
              />
            ) : (
              <View style={styles.timelineContainer}>
                {events.map((event, index) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    isFirst={index === 0}
                    isLast={index === events.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'logs' && (
          <ActivityLog
            logs={logs}
            expenses={expenses}
            currentUserId={user.uid}
            groupCurrency={currentGroup.currency}
          />
        )}

        {activeTab === 'notes' && <NotesTab groupId={currentGroup.id} />}
      </Animated.ScrollView>

      {(activeTab === 'expense' || activeTab === 'timeline') && (
        <MotiView
          from={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 150 }}
          style={styles.fabContainer}
        >
          <TouchableOpacity onPress={handleFabPress} activeOpacity={0.85} style={styles.fab}>
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.fabGradient}
            >
              <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      )}

      <AddExpenseForm
        visible={showExpenseForm}
        groupId={currentGroup.id}
        groupCurrency={currentGroup.currency}
        preselectedType={preselectedExpenseType}
        editingExpense={editingExpense}
        onClose={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
        }}
      />
      <AddEventForm
        visible={showEventForm}
        groupId={currentGroup.id}
        onClose={() => setShowEventForm(false)}
      />

      <BalanceModal
        visible={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        balances={balanceDetails}
        currency={currentGroup.currency}
        totalBalance={remainingBalance}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  expandedHeader: {
    paddingTop: 8,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupMetaText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  groupPhoto: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  groupPhotoPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupEmoji: {
    fontSize: 28,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  collapsedRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collapsedIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  collapsedRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsedLeft: {
    flex: 1,
    marginRight: 12,
  },
  collapsedGroupName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  collapsedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collapsedMetaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '500',
  },
  collapsedRight: {
    flexDirection: 'row',
    gap: 16,
  },
  collapsedStatItem: {
    alignItems: 'flex-end',
  },
  collapsedStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 2,
  },
  collapsedStatValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    position: 'relative',
  },
  tabActive: {
    flex: 2,
  },
  tabInactive: {
    flex: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -15 }],
    width: 30,
    height: 3,
    borderRadius: 999,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  filterButtonActive: {},
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  totalValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  totalSubtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  totalSubtext: {
    fontSize: 11,
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '600',
  },
  expenseItemWrapper: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  listPadding: {
    paddingTop: 12,
  },
  membersList: {
    paddingHorizontal: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 12,
    marginTop: 3,
  },
  memberBalance: {
    alignItems: 'flex-end',
  },
  memberBalanceValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  timelineContainer: {
    paddingHorizontal: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
