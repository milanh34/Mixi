// components/ui/ExpenseItem.tsx
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../stores/themeStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { GroupExpense } from '../../lib/schema';
import { formatCurrency } from '../../utils/formatCurrency';
import { getExpenseBalanceText } from '../../utils/balanceCalculator';
import { getCategoryByIdOrDefault } from '../../utils/expenseCategories';
import { format } from 'date-fns';
import { useToastPortal } from '../ui/ToastPortal'; 

interface ExpenseItemProps {
    expense: GroupExpense;
    currentUserId: string;
    groupCurrency: string;
    onEdit?: (expense: GroupExpense) => void;
}

export function ExpenseItem({ expense, currentUserId, groupCurrency, onEdit }: ExpenseItemProps) {
    const { theme } = useThemeStore();
    const { markAsPaid, markAsReceived, deleteExpense } = useExpenseStore();
    const { showToast } = useToastPortal();
    const [showDetails, setShowDetails] = useState(false);

    const category = getCategoryByIdOrDefault(expense.category);
    const balanceInfo = getExpenseBalanceText(expense, currentUserId);
    const isPayer = expense.creatorId === currentUserId;

    const currentUserSplit = expense.splitDetails.find((s) => s.userId === currentUserId);
    const hasUserPaid = currentUserSplit?.paid || false;

    const handleMarkAsPaid = async () => {
        try {
            await markAsPaid(expense.id, expense.groupId, currentUserId);
            showToast('Payment recorded!', 'success');
            setShowDetails(false);
        } catch (error: any) {
            showToast(error.message || 'Failed to mark as paid', 'error');
        }
    };

    const handleMarkAsReceived = async () => {
        try {
            await markAsReceived(expense.id, expense.groupId, currentUserId);
            showToast('Marked as received!', 'success');
            setShowDetails(false);
        } catch (error: any) {
            showToast(error.message || 'Failed to mark as received', 'error');
        }
    };

    const handleEdit = () => {
        setShowDetails(false);
        if (onEdit) {
            onEdit(expense);
        }
    };

    const handleDelete = () => {
        showToast( 
            'Delete this expense? This action cannot be undone.',
            'warning',
            {
                confirmAction: async () => {
                    await deleteExpense(expense.id, expense.groupId, currentUserId);
                    setShowDetails(false);
                    showToast('Expense deleted', 'success');
                },
                confirmText: 'Delete'
            }
        );
    };

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.cardBorder,
                    },
                ]}
                onPress={() => setShowDetails(true)}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor:
                                expense.type === 'personal'
                                    ? theme.colors.secondary + '20'
                                    : theme.colors.primary + '20',
                        },
                    ]}
                >
                    <MaterialIcons
                        name={category.icon as any}
                        size={22}
                        color={expense.type === 'personal' ? theme.colors.secondary : theme.colors.primary}
                    />
                </View>

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                            {expense.title}
                        </Text>
                        {expense.settled && (
                            <View style={[styles.settledMicroBadge, { backgroundColor: theme.colors.success + '20' }]}>
                                <MaterialIcons name="check" size={12} color={theme.colors.success} />
                            </View>
                        )}
                        {expense.type === 'shared' && hasUserPaid && !expense.settled && (
                            <View style={[styles.paidMicroBadge, { backgroundColor: theme.colors.success + '20' }]}>
                                <MaterialIcons name="check" size={12} color={theme.colors.success} />
                            </View>
                        )}
                    </View>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        {category.label} • {format(expense.date.toDate(), 'MMM dd, yyyy')}
                    </Text>
                    {expense.type === 'shared' && (
                        <Text style={[styles.balance, { color: theme.colors.textMuted }]} numberOfLines={1}>
                            {balanceInfo.text}
                        </Text>
                    )}
                </View>

                <View style={styles.amountContainer}>
                    <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>
                        {formatCurrency(expense.amount, groupCurrency)}
                    </Text>
                    {expense.type === 'shared' && (
                        <View style={styles.balanceBadge}>
                            <Text
                                style={[
                                    styles.balanceAmount,
                                    {
                                        color: balanceInfo.isPositive ? theme.colors.success : theme.colors.error,
                                    },
                                ]}
                            >
                                {balanceInfo.isPositive ? '+' : '-'}
                                {formatCurrency(balanceInfo.amount, groupCurrency)}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <Modal
                visible={showDetails}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowDetails(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <LinearGradient
                        colors={[theme.colors.gradientStart + '15', theme.colors.background]}
                        style={styles.modalHeader}
                    >
                        <View style={styles.modalHeaderContent}>
                            <TouchableOpacity
                                onPress={() => setShowDetails(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                                Expense Details
                            </Text>
                            <View style={styles.headerActions}>
                                <TouchableOpacity onPress={handleEdit} style={styles.headerActionButton}>
                                    <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} style={styles.headerActionButton}>
                                    <MaterialIcons name="delete" size={20} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </LinearGradient>

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        {expense.settled && (
                            <View
                                style={[
                                    styles.statusBanner,
                                    {
                                        backgroundColor: theme.colors.success + '15',
                                        borderColor: theme.colors.success,
                                    },
                                ]}
                            >
                                <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                                <Text style={[styles.statusBannerText, { color: theme.colors.success }]}>
                                    Fully Settled
                                </Text>
                            </View>
                        )}

                        <View
                            style={[
                                styles.detailCard,
                                {
                                    backgroundColor: theme.colors.cardBackground,
                                    borderColor: theme.colors.cardBorder,
                                },
                            ]}
                        >
                            <View style={styles.detailRow}>
                                <MaterialIcons name={category.icon as any} size={28} color={theme.colors.primary} />
                                <View style={styles.detailInfo}>
                                    <Text style={[styles.detailTitle, { color: theme.colors.textPrimary }]}>
                                        {expense.title}
                                    </Text>
                                    <Text style={[styles.detailSubtitle, { color: theme.colors.textSecondary }]}>
                                        {category.label}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailDivider} />

                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                                    Amount
                                </Text>
                                <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                                    {formatCurrency(expense.amount, groupCurrency)}
                                </Text>
                            </View>

                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                                    Date
                                </Text>
                                <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                                    {format(expense.date.toDate(), 'MMM dd, yyyy')}
                                </Text>
                            </View>

                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                                    Type
                                </Text>
                                <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                                    {expense.type === 'personal' ? 'Personal' : 'Shared'}
                                </Text>
                            </View>

                            {expense.description && (
                                <View style={styles.detailItem}>
                                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                                        Description
                                    </Text>
                                    <Text style={[styles.detailValue, { color: theme.colors.textPrimary }]}>
                                        {expense.description}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {expense.type === 'shared' && (
                            <View
                                style={[
                                    styles.detailCard,
                                    {
                                        backgroundColor: theme.colors.cardBackground,
                                        borderColor: theme.colors.cardBorder,
                                    },
                                ]}
                            >
                                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                    Split Details
                                </Text>
                                {expense.splitDetails.map((split) => (
                                    <View key={split.userId} style={styles.splitRow}>
                                        <View style={styles.splitLeft}>
                                            <Text style={[styles.splitUser, { color: theme.colors.textPrimary }]}>
                                                {split.userId === currentUserId ? 'You' : 'Member'}
                                            </Text>
                                            {split.paid && (
                                                <View style={[styles.paidBadge, { backgroundColor: theme.colors.success + '20' }]}>
                                                    <MaterialIcons name="check" size={10} color={theme.colors.success} />
                                                    <Text style={[styles.paidBadgeText, { color: theme.colors.success }]}>
                                                        Paid
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[styles.splitAmount, { color: theme.colors.textSecondary }]}>
                                            {formatCurrency(split.exactAmount, groupCurrency)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {expense.type === 'shared' && !expense.settled && (
                            <View style={styles.actionsContainer}>
                                {!isPayer && !hasUserPaid && (
                                    <TouchableOpacity onPress={handleMarkAsPaid} activeOpacity={0.8}>
                                        <LinearGradient
                                            colors={[theme.colors.success, theme.colors.success + 'DD']}
                                            style={styles.actionButton}
                                        >
                                            <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                                            <Text style={styles.actionButtonText}>Mark as Paid</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                {isPayer && (
                                    <TouchableOpacity onPress={handleMarkAsReceived} activeOpacity={0.8}>
                                        <LinearGradient
                                            colors={[theme.colors.primary, theme.colors.secondary]}
                                            style={styles.actionButton}
                                        >
                                            <MaterialIcons name="monetization-on" size={20} color="#FFFFFF" />
                                            <Text style={styles.actionButtonText}>Mark as Received</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    title: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        marginRight: 6,
    },
    settledMicroBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 3,
    },
    balance: {
        fontSize: 11,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    balanceBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    balanceAmount: {
        fontSize: 12,
        fontWeight: '700',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        paddingTop: 60,
        paddingBottom: 16,
    },
    modalHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerActionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        marginBottom: 16,
    },
    statusBannerText: {
        fontSize: 14,
        fontWeight: '700',
    },
    detailCard: {
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailInfo: {
        flex: 1,
        marginLeft: 14,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 3,
    },
    detailSubtitle: {
        fontSize: 13,
    },
    detailDivider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 12,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    splitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    splitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    splitUser: {
        fontSize: 14,
    },
    paidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    paidBadgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    splitAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionsContainer: {
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    paidMicroBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
