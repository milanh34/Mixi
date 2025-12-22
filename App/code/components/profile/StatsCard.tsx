// components/profile/StatsCards.tsx
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';

interface StatsCardsProps {
  totalGroups: number;
  totalExpenses: number;
  totalOwe: number;
  totalOwed: number;
}

export function StatsCards({ totalGroups, totalExpenses, totalOwe, totalOwed }: StatsCardsProps) {
  const { theme } = useThemeStore();

  return (
    <View style={styles.container}>
      {/* Row 1: Groups & Expenses */}
      <View style={styles.row}>
        <StatCard
          icon="group"
          value={totalGroups.toString()}
          label="Groups"
          color={theme.colors.primary}
        />
        <StatCard
          icon="receipt"
          value={totalExpenses.toString()}
          label="Expenses"
          color={theme.colors.secondary}
        />
      </View>

      {/* Row 2: Owe & Owed */}
      <View style={styles.row}>
        <StatCard
          icon="trending-down"
          value={`₹${totalOwe.toLocaleString()}`}
          label="You Owe"
          color={theme.colors.error}
        />
        <StatCard
          icon="trending-up"
          value={`₹${totalOwed.toLocaleString()}`}
          label="Owed to You"
          color={theme.colors.success}
        />
      </View>
    </View>
  );
}

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  color: string;
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  const { theme } = useThemeStore();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
        },
      ]}
    >
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.statIcon}
      >
        <MaterialIcons name={icon as any} size={24} color={color} />
      </LinearGradient>
      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
