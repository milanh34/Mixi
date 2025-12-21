// components/ui/ExpenseItem.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GroupExpense } from '../../lib/schema';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

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
        year: 'numeric',
    });

    const getCategoryIcon = (category: string): keyof typeof MaterialIcons.glyphMap => {
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

    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            food: '#FF6B6B',
            transport: '#4ECDC4',
            accommodation: '#95E1D3',
            entertainment: '#9C27B0',
            shopping: '#FFE66D',
            groceries: '#34A853',
            utilities: '#FF9800',
            health: '#E91E63',
            other: theme.colors.textMuted,
        };
        return colors[category.toLowerCase()] || theme.colors.textMuted;
    };

    // Calculate user's share
    const myShare = expense.splitDetails.find(
        (split) => split.userId === user?.uid
    );
    const myAmount = myShare?.exactAmount || 0;
    const iPaid = expense.creatorId === user?.uid;

    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    const categoryColor = getCategoryColor(expense.category);

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.cardBorder,
                },
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.left}>
                {/* Category Icon with Gradient */}
                <LinearGradient
                    colors={[categoryColor + '30', categoryColor + '15']}
                    style={styles.iconContainer}
                >
                    <MaterialIcons
                        name={getCategoryIcon(expense.category)}
                        size={24}
                        color={categoryColor}
                    />
                </LinearGradient>

                <View style={styles.info}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {expense.title}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.dateContainer}>
                            <MaterialIcons name="calendar-today" size={12} color={theme.colors.textMuted} />
                            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                                {dateStr}
                            </Text>
                        </View>

                        <View style={[
                            styles.typeBadge,
                            { backgroundColor: expense.type === 'shared' ? theme.colors.primary + '15' : theme.colors.secondary + '15' }
                        ]}>
                            <MaterialIcons
                                name={expense.type === 'shared' ? 'group' : 'person'}
                                size={12}
                                color={expense.type === 'shared' ? theme.colors.primary : theme.colors.secondary}
                            />
                            <Text style={[
                                styles.typeText,
                                { color: expense.type === 'shared' ? theme.colors.primary : theme.colors.secondary }
                            ]}>
                                {expense.type === 'shared' ? 'Shared' : 'Personal'}
                            </Text>
                        </View>
                    </View>

                    {expense.type === 'shared' && myShare && (
                        <View style={styles.splitRow}>
                            <MaterialIcons
                                name={iPaid ? 'trending-up' : 'trending-down'}
                                size={14}
                                color={iPaid ? theme.colors.success : theme.colors.error}
                            />
                            <Text
                                style={[
                                    styles.splitInfo,
                                    { color: iPaid ? theme.colors.success : theme.colors.error },
                                ]}
                            >
                                {iPaid
                                    ? `You paid ${formatCurrency(expense.amount, expense.currency)}`
                                    : `You owe ${formatCurrency(myAmount, expense.currency)}`}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.right}>
                <Text
                    style={[
                        styles.amount,
                        { color: expense.type === 'shared' ? theme.colors.primary : theme.colors.textPrimary },
                    ]}
                >
                    {formatCurrency(expense.amount, expense.currency)}
                </Text>

                {expense.settled && (
                    <View style={[styles.settledBadge, { backgroundColor: theme.colors.successLight }]}>
                        <MaterialIcons name="check-circle" size={12} color={theme.colors.success} />
                        <Text style={[styles.settledText, { color: theme.colors.success }]}>
                            Settled
                        </Text>
                    </View>
                )}

                <View style={styles.indicators}>
                    {expense.receiptPhoto && (
                        <View style={[styles.indicator, { backgroundColor: theme.colors.primary + '15' }]}>
                            <MaterialIcons name="receipt" size={14} color={theme.colors.primary} />
                        </View>
                    )}
                </View>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    splitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    splitInfo: {
        fontSize: 13,
        fontWeight: '600',
    },
    right: {
        alignItems: 'flex-end',
        gap: 6,
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
    },
    settledBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    settledText: {
        fontSize: 11,
        fontWeight: '700',
    },
    indicators: {
        flexDirection: 'row',
        gap: 6,
    },
    indicator: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
