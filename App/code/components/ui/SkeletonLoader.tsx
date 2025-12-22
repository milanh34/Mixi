// components/ui/SkeletonLoader.tsx
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useThemeStore } from '../../stores/themeStore';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonLoaderProps) {
  const { theme } = useThemeStore();

  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.cardBackground,
        },
        style,
      ]}
    />
  );
}

export function GroupCardSkeleton() {
  const { theme } = useThemeStore();

  return (
    <View
      style={[
        styles.groupCardSkeleton,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
        },
      ]}
    >
      <View style={styles.skeletonHeader}>
        <SkeletonLoader width={60} height={60} borderRadius={16} />
        <View style={styles.skeletonInfo}>
          <SkeletonLoader width="70%" height={20} borderRadius={8} />
          <SkeletonLoader width="40%" height={16} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
      </View>
      
      <View style={styles.skeletonStats}>
        <SkeletonLoader width="30%" height={16} borderRadius={6} />
        <SkeletonLoader width="30%" height={16} borderRadius={6} />
      </View>
    </View>
  );
}

export function ExpenseItemSkeleton() {
  const { theme } = useThemeStore();

  return (
    <View
      style={[
        styles.expenseItemSkeleton,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
        },
      ]}
    >
      <View style={styles.skeletonLeft}>
        <SkeletonLoader width={48} height={48} borderRadius={12} />
        <View style={styles.skeletonExpenseInfo}>
          <SkeletonLoader width={120} height={16} borderRadius={6} />
          <SkeletonLoader width={80} height={12} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      </View>
      <SkeletonLoader width={60} height={20} borderRadius={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  groupCardSkeleton: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseItemSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  skeletonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonExpenseInfo: {
    gap: 6,
  },
});
