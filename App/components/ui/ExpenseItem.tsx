// components/ui/ExpenseItem.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GroupExpense } from '../../lib/schema';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/formatCurrency';

interface ExpenseItemProps {
    expense: GroupExpense;
    onPress?: () => void;
}

export function ExpenseItem({ expense, onPress }: ExpenseItemProps) {
    const { theme } = useThemeStore();
    const { user } = useAuthStore();

    const date = expense.date.toDate();
    const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
            food: 'restaurant',
            transport: 'directions-car',
            accommodation: 'hotel',
            entertainment: 'movie',
            shopping: 'shopping-cart',
            groceries: 'local-grocery-store',
            utilities: 'lightbulb',
            health: 'local-hospital',
            other: 'receipt',
        };
        return icons[category.toLowerCase()] || 'receipt';
    };

    // Calculate user's share
    const myShare = expense.splitDetails.find(
        (split) => split.userId === user?.uid
    );
    const myAmount = myShare?.exactAmount || 0;
    const iPaid = expense.creatorId === user?.uid;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.left}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: theme.colors.primary + '20' },
                    ]}
                >
                    <MaterialIcons
                        name={getCategoryIcon(expense.category)}
                        size={24}
                        color={theme.colors.primary}
                    />
                </View>

                <View style={styles.info}>
                    <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                        {expense.title}
                    </Text>
                    <View style={styles.metaRow}>
                        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                            {dateStr}
                        </Text>
                        <View style={styles.typeBadge}>
                            <MaterialIcons
                                name={expense.type === 'shared' ? 'group' : 'person'}
                                size={12}
                                color={theme.colors.textSecondary}
                            />
                            <Text style={[styles.typeText, { color: theme.colors.textSecondary }]}>
                                {expense.type === 'shared' ? 'Shared' : 'Personal'}
                            </Text>
                        </View>
                    </View>

                    {expense.type === 'shared' && myShare && (
                        <Text style={[styles.splitInfo, {
                            color: iPaid ? theme.colors.success : theme.colors.error
                        }]}>
                            {iPaid
                                ? `You paid ${formatCurrency(expense.amount, expense.currency)}`
                                : `You owe ${formatCurrency(myAmount, expense.currency)}`
                            }
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.right}>
                <Text
                    style={[
                        styles.amount,
                        { color: expense.type === 'shared' ? theme.colors.primary : theme.colors.text },
                    ]}
                >
                    {formatCurrency(expense.amount, expense.currency)}
                </Text>
                {expense.settled && (
                    <View style={[styles.badge, { backgroundColor: theme.colors.success + '20' }]}>
                        <Text style={[styles.badgeText, { color: theme.colors.success }]}>
                            Settled
                        </Text>
                    </View>
                )}
                {expense.receiptPhoto && (
                    <MaterialIcons
                        name="receipt"
                        size={16}
                        color={theme.colors.textSecondary}
                        style={styles.receiptIcon}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    date: {
        fontSize: 13,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    typeText: {
        fontSize: 12,
    },
    splitInfo: {
        fontSize: 13,
        fontWeight: '600',
    },
    right: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    receiptIcon: {
        marginTop: 2,
    },
});
