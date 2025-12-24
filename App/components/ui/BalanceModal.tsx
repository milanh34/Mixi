// components/ui/BalanceModal.tsx
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface BalanceDetail {
  userId: string;
  userName: string;
  userProfilePicture?: string;
  amount: number; // Positive = they owe you, Negative = you owe them
}

interface BalanceModalProps {
  visible: boolean;
  onClose: () => void;
  balances: BalanceDetail[];
  currency: string;
  totalBalance: number;
}

export function BalanceModal({
  visible,
  onClose,
  balances,
  currency,
  totalBalance,
}: BalanceModalProps) {
  const { theme } = useThemeStore();

  const owedToMe = balances.filter(b => b.amount > 0);
  const iOwe = balances.filter(b => b.amount < 0);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.gradientStart + '20', theme.colors.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Balance Breakdown
            </Text>
            
            <View style={{ width: 40 }} />
          </View>

          {/* Total Balance Card */}
          <View
            style={[
              styles.totalCard,
              {
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
              Net Balance
            </Text>
            <Text
              style={[
                styles.totalAmount,
                {
                  color:
                    totalBalance > 0
                      ? theme.colors.success
                      : totalBalance < 0
                      ? theme.colors.error
                      : theme.colors.textPrimary,
                },
              ]}
            >
              {totalBalance >= 0 ? '+' : ''}
              {formatCurrency(Math.abs(totalBalance), currency)}
            </Text>
            <Text style={[styles.totalStatus, { color: theme.colors.textMuted }]}>
              {totalBalance > 0
                ? 'You are owed'
                : totalBalance < 0
                ? 'You owe'
                : 'All settled'}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Owed to Me Section */}
          {owedToMe.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300 }}
            >
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="arrow-downward" size={20} color={theme.colors.success} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    Owed to You
                  </Text>
                </View>

                {owedToMe.map((balance) => (
                  <View
                    key={balance.userId}
                    style={[
                      styles.balanceItem,
                      {
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.balanceLeft}>
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: theme.colors.success + '20' },
                        ]}
                      >
                        <Text style={[styles.avatarText, { color: theme.colors.success }]}>
                          {balance.userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                        {balance.userName}
                      </Text>
                    </View>

                    <Text style={[styles.amount, { color: theme.colors.success }]}>
                      +{formatCurrency(balance.amount, currency)}
                    </Text>
                  </View>
                ))}
              </View>
            </MotiView>
          )}

          {/* I Owe Section */}
          {iOwe.length > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: 150 }}
            >
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="arrow-upward" size={20} color={theme.colors.error} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                    You Owe
                  </Text>
                </View>

                {iOwe.map((balance) => (
                  <View
                    key={balance.userId}
                    style={[
                      styles.balanceItem,
                      {
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.balanceLeft}>
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: theme.colors.error + '20' },
                        ]}
                      >
                        <Text style={[styles.avatarText, { color: theme.colors.error }]}>
                          {balance.userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                        {balance.userName}
                      </Text>
                    </View>

                    <Text style={[styles.amount, { color: theme.colors.error }]}>
                      {formatCurrency(Math.abs(balance.amount), currency)}
                    </Text>
                  </View>
                ))}
              </View>
            </MotiView>
          )}

          {balances.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons 
                name="account-balance-wallet" 
                size={64} 
                color={theme.colors.textMuted} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No outstanding balances
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                All expenses are settled!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  totalCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  totalStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
