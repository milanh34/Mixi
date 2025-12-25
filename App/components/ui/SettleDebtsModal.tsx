// components/ui/SettleDebtsModal.tsx
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { useSettlementStore } from '../../stores/settlementStore';
import { GroupExpense, GroupMember } from '../../lib/schema';
import { simplifyDebts, SimplifiedDebt, getNetDebts } from '../../utils/debtSimplifier';
import { formatCurrency } from '../../utils/formatCurrency';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface SettleDebtsModalProps {
    visible: boolean;
    onClose: () => void;
    expenses: GroupExpense[];
    members: GroupMember[];
    currentUserId: string;
    currency: string;
    groupId: string;
    onSettled: () => void; // Callback to refresh data
}

export function SettleDebtsModal({
    visible,
    onClose,
    expenses,
    members,
    currentUserId,
    currency,
    groupId,
    onSettled,
}: SettleDebtsModalProps) {
    const { theme } = useThemeStore();
    const { settleDebts, settleAllDebts, loading } = useSettlementStore();
    const [selectedDebt, setSelectedDebt] = useState<SimplifiedDebt | null>(null);

    // Calculate simplified debts
    const sharedExpenses = expenses.filter((e) => e.type === 'shared');
    const simplifiedDebts = getNetDebts(sharedExpenses, members);

    // Filter debts involving current user
    const userDebts = simplifiedDebts.filter(
        (debt) => debt.from === currentUserId || debt.to === currentUserId
    );

    const handleSettleOne = async (debt: SimplifiedDebt) => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const currentUserName =
                members.find((m) => m.userId === currentUserId)?.userName || 'You';

            await settleDebts(
                groupId,
                debt.from,
                debt.to,
                debt.amount,
                currency,
                expenses,
                currentUserId,
                debt.fromName,
                debt.toName
            );

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSettled();
            onClose();
        } catch (error: any) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error('Settle error:', error);
        }
    };

    const handleSettleAll = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            const currentUserName =
                members.find((m) => m.userId === currentUserId)?.userName || 'You';

            await settleAllDebts(
                groupId,
                currency,
                expenses,
                currentUserId,
                currentUserName
            );

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSettled();
            onClose();
        } catch (error: any) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error('Settle all error:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Header */}
                <LinearGradient
                    colors={[theme.colors.gradientStart + '20', theme.colors.background]}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                            Settle Debts
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                        Simplified {simplifiedDebts.length} transaction{simplifiedDebts.length !== 1 ? 's' : ''}
                    </Text>
                </LinearGradient>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {simplifiedDebts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons
                                name="check-circle-outline"
                                size={64}
                                color={theme.colors.success}
                            />
                            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                                All Settled!
                            </Text>
                            <Text style={[styles.emptyDescription, { color: theme.colors.textMuted }]}>
                                No pending debts in this group
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Info Card */}
                            <View
                                style={[
                                    styles.infoCard,
                                    {
                                        backgroundColor: theme.colors.primary + '15',
                                        borderColor: theme.colors.primary + '40',
                                    },
                                ]}
                            >
                                <MaterialIcons name="lightbulb" size={20} color={theme.colors.primary} />
                                <Text style={[styles.infoText, { color: theme.colors.primary }]}>
                                    We've simplified {expenses.filter((e) => !e.settled && e.type === 'shared').length} expenses into{' '}
                                    {simplifiedDebts.length} payment{simplifiedDebts.length !== 1 ? 's' : ''}
                                </Text>
                            </View>

                            {/* Simplified Debts List */}
                            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                                Suggested Payments
                            </Text>

                            {simplifiedDebts.map((debt, index) => {
                                const isUserInvolved =
                                    debt.from === currentUserId || debt.to === currentUserId;
                                const isUserDebtor = debt.from === currentUserId;

                                return (
                                    <MotiView
                                        key={`${debt.from}-${debt.to}`}
                                        from={{ opacity: 0, translateX: -20 }}
                                        animate={{ opacity: 1, translateX: 0 }}
                                        transition={{ type: 'timing', duration: 300, delay: index * 80 }}
                                    >
                                        <View
                                            style={[
                                                styles.debtCard,
                                                {
                                                    backgroundColor: theme.colors.cardBackground,
                                                    borderColor: isUserInvolved
                                                        ? theme.colors.primary + '60'
                                                        : theme.colors.cardBorder,
                                                    borderWidth: isUserInvolved ? 2 : 1,
                                                },
                                            ]}
                                        >
                                            {/* Debtor → Creditor */}
                                            <View style={styles.debtFlow}>
                                                {/* From */}
                                                <View style={styles.personContainer}>
                                                    <View
                                                        style={[
                                                            styles.avatar,
                                                            {
                                                                backgroundColor:
                                                                    debt.from === currentUserId
                                                                        ? theme.colors.error + '20'
                                                                        : theme.colors.textMuted + '20',
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.avatarText,
                                                                {
                                                                    color:
                                                                        debt.from === currentUserId
                                                                            ? theme.colors.error
                                                                            : theme.colors.textMuted,
                                                                },
                                                            ]}
                                                        >
                                                            {debt.fromName.charAt(0).toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.personName,
                                                            {
                                                                color: theme.colors.textPrimary,
                                                                fontWeight: debt.from === currentUserId ? '700' : '600',
                                                            },
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {debt.from === currentUserId ? 'You' : debt.fromName}
                                                    </Text>
                                                </View>

                                                {/* Arrow */}
                                                <View style={styles.arrowContainer}>
                                                    <View
                                                        style={[
                                                            styles.arrowLine,
                                                            { backgroundColor: theme.colors.primary + '40' },
                                                        ]}
                                                    />
                                                    <View
                                                        style={[
                                                            styles.amountBadge,
                                                            {
                                                                backgroundColor: theme.colors.primary + '15',
                                                                borderColor: theme.colors.primary,
                                                            },
                                                        ]}
                                                    >
                                                        <Text style={[styles.amountText, { color: theme.colors.primary }]}>
                                                            {formatCurrency(debt.amount, currency)}
                                                        </Text>
                                                    </View>
                                                    <MaterialIcons
                                                        name="arrow-forward"
                                                        size={18}
                                                        color={theme.colors.primary}
                                                        style={styles.arrowIcon}
                                                    />
                                                </View>

                                                {/* To */}
                                                <View style={styles.personContainer}>
                                                    <View
                                                        style={[
                                                            styles.avatar,
                                                            {
                                                                backgroundColor:
                                                                    debt.to === currentUserId
                                                                        ? theme.colors.success + '20'
                                                                        : theme.colors.textMuted + '20',
                                                            },
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.avatarText,
                                                                {
                                                                    color:
                                                                        debt.to === currentUserId
                                                                            ? theme.colors.success
                                                                            : theme.colors.textMuted,
                                                                },
                                                            ]}
                                                        >
                                                            {debt.toName.charAt(0).toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.personName,
                                                            {
                                                                color: theme.colors.textPrimary,
                                                                fontWeight: debt.to === currentUserId ? '700' : '600',
                                                            },
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {debt.to === currentUserId ? 'You' : debt.toName}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Settle Button (only if user is debtor) */}
                                            {isUserDebtor && (
                                                <TouchableOpacity
                                                    onPress={() => handleSettleOne(debt)}
                                                    disabled={loading}
                                                    activeOpacity={0.8}
                                                    style={styles.settleOneButton}
                                                >
                                                    <LinearGradient
                                                        colors={[theme.colors.success, theme.colors.success + 'DD']}
                                                        style={styles.settleOneGradient}
                                                    >
                                                        {loading ? (
                                                            <ActivityIndicator color="#FFFFFF" size="small" />
                                                        ) : (
                                                            <>
                                                                <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
                                                                <Text style={styles.settleOneText}>Settle This</Text>
                                                            </>
                                                        )}
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </MotiView>
                                );
                            })}
                        </>
                    )}
                </ScrollView>

                {/* Footer - Settle All Button */}
                {simplifiedDebts.length > 0 && (
                    <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
                        <TouchableOpacity
                            onPress={handleSettleAll}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                                style={[styles.settleAllButton, loading && { opacity: 0.6 }]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <MaterialIcons name="done-all" size={22} color="#FFFFFF" />
                                        <Text style={styles.settleAllText}>Settle All Debts</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        <Text style={[styles.footerNote, { color: theme.colors.textMuted }]}>
                            This will mark all expenses as settled
                        </Text>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
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
    headerSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    debtCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    debtFlow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    personContainer: {
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    personName: {
        fontSize: 13,
        textAlign: 'center',
    },
    arrowContainer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 60,
    },
    arrowLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        top: 24,
    },
    amountBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1.5,
        zIndex: 1,
    },
    amountText: {
        fontSize: 13,
        fontWeight: '800',
    },
    arrowIcon: {
        position: 'absolute',
        right: -4,
        top: 21,
        zIndex: 2,
    },
    settleOneButton: {
        marginTop: 4,
    },
    settleOneGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    settleOneText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    settleAllButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    settleAllText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    footerNote: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
});
