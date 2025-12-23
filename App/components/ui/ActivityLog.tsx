// components/ui/ActivityLog.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { ExpenseLog, GroupExpense } from '../../lib/schema';
import { formatCurrency } from '../../utils/formatCurrency';
import { format } from 'date-fns';
import { MotiView } from 'moti';
import { EmptyState } from './EmptyState';

interface ActivityLogProps {
  logs: ExpenseLog[];
  expenses: GroupExpense[];
  currentUserId: string;
  groupCurrency: string;
}

export function ActivityLog({
  logs,
  expenses,
  currentUserId,
  groupCurrency,
}: ActivityLogProps) {
  const { theme } = useThemeStore();
  const [hidePersonal, setHidePersonal] = useState(false);

  // FIXED: Filter out ALL personal expenses when hidePersonal is true
  const filteredLogs = logs.filter((log) => {
    const expense = expenses.find((e) => e.id === log.expenseId);

    // Always hide personal expenses when hidePersonal is true
    if (hidePersonal && expense?.type === 'personal') {
      return false;
    }

    // Otherwise show shared expenses + user's own personal expenses
    return !expense || expense.type === 'shared' || expense.creatorId === currentUserId;
  });

  const handleTogglePersonal = () => {
    setHidePersonal(!hidePersonal);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'expense_added':
        return 'add-circle';
      case 'payment_made':
        return 'payment';
      case 'payment_received':
        return 'monetization-on';
      case 'expense_updated':
        return 'edit';
      case 'expense_deleted':
        return 'delete';
      default:
        return 'info';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'expense_added':
        return theme.colors.primary;
      case 'payment_made':
        return theme.colors.warning;
      case 'payment_received':
        return theme.colors.success;
      case 'expense_updated':
        return theme.colors.secondary;
      case 'expense_deleted':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
          onPress={handleTogglePersonal}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={hidePersonal ? 'visibility-off' : 'visibility'}
            size={18}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.toggleText, { color: theme.colors.textSecondary }]}>
            {hidePersonal ? 'Show Personal' : 'Hide Personal'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon="history"
            title="No activity yet"
            description="All expense changes and payments will appear here"
          />
        ) : (
          filteredLogs.map((log, index) => {
            const icon = getActivityIcon(log.type);
            const color = getActivityColor(log.type);
            const expense = expenses.find((e) => e.id === log.expenseId);
            const isPersonal = expense?.type === 'personal' && expense?.creatorId === currentUserId;

            return (
              <MotiView
                key={log.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 250, delay: index * 40 }}
                style={styles.logItemWrapper}
              >
                <View
                  style={[
                    styles.logItem,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                >
                  {index < filteredLogs.length - 1 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        { backgroundColor: theme.colors.border },
                      ]}
                    />
                  )}

                  <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                    <MaterialIcons name={icon as any} size={20} color={color} />
                  </View>

                  <View style={styles.logContent}>
                    <View style={styles.logHeader}>
                      <Text style={[styles.logDescription, { color: theme.colors.textPrimary }]}>
                        {log.description.includes('on behalf of')
                          ? log.description
                          : `${log.performedByName} ${log.description.toLowerCase()}`}
                      </Text>
                      {isPersonal && !hidePersonal && (
                        <View
                          style={[
                            styles.personalBadge,
                            { backgroundColor: theme.colors.secondary + '20' },
                          ]}
                        >
                          <MaterialIcons
                            name="person"
                            size={10}
                            color={theme.colors.secondary}
                          />
                        </View>
                      )}
                    </View>

                    <View style={styles.logMeta}>
                      <Text style={[styles.logMetaText, { color: theme.colors.textSecondary }]}>
                        {log.performedByName}
                      </Text>
                      <View style={styles.logMetaDot} />
                      <Text style={[styles.logMetaText, { color: theme.colors.textMuted }]}>
                        {format(log.createdAt.toDate(), 'MMM dd, hh:mm a')}
                      </Text>
                    </View>

                    {expense && (
                      <View
                        style={[
                          styles.expenseCard,
                          { backgroundColor: theme.colors.background },
                        ]}
                      >
                        <View style={styles.expenseCardRow}>
                          <Text
                            style={[
                              styles.expenseCardTitle,
                              { color: theme.colors.textPrimary },
                            ]}
                          >
                            {expense.title}
                          </Text>
                          <Text
                            style={[
                              styles.expenseCardAmount,
                              {
                                color:
                                  log.type === 'payment_received'
                                    ? theme.colors.success
                                    : log.type === 'payment_made'
                                      ? theme.colors.warning
                                      : theme.colors.textPrimary,
                              },
                            ]}
                          >
                            {formatCurrency(expense.amount, groupCurrency)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </MotiView>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  logItemWrapper: {
    marginBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 33,
    top: 54,
    width: 2,
    height: 32,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  logDescription: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginRight: 8,
  },
  personalBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  logMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 6,
  },
  expenseCard: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
  },
  expenseCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  expenseCardAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
