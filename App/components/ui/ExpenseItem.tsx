// components/ui/ExpenseItem.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "../../stores/themeStore";
import { useExpenseStore } from "../../stores/expenseStore";
import { GroupExpense } from "../../lib/schema";
import { formatCurrency } from "../../utils/formatCurrency";
import { getExpenseBalanceText } from "../../utils/balanceCalculator";
import { getCategoryByIdOrDefault } from "../../utils/expenseCategories";
import { format } from "date-fns";
import { useToastPortal } from "../ui/ToastPortal";
import { useGroupMembers } from "../../hooks/useGroupMembers";

interface ExpenseItemProps {
  expense: GroupExpense;
  currentUserId: string;
  groupCurrency: string;
  onEdit?: (expense: GroupExpense) => void;
}

export function ExpenseItem({
  expense,
  currentUserId,
  groupCurrency,
  onEdit,
}: ExpenseItemProps) {
  const { theme } = useThemeStore();
  const { markAsPaid, markAsReceived, deleteExpense } = useExpenseStore();
  const { showToast } = useToastPortal();
  const [showDetails, setShowDetails] = useState(false);
  const { members } = useGroupMembers(expense.groupId);
  const category = getCategoryByIdOrDefault(expense.category);
  const balanceInfo = getExpenseBalanceText(expense, currentUserId);
  const isPayer = expense.creatorId === currentUserId;

  const currentUserSplit = expense.splitDetails.find(
    (s) => s.userId === currentUserId
  );
  const hasUserPaid = currentUserSplit?.paid || false;

  const handleMarkAsPaid = async () => {
    try {
      await markAsPaid(expense.id, expense.groupId, currentUserId);
      showToast("Payment recorded!", "success");
      setShowDetails(false);
    } catch (error: any) {
      showToast(error.message || "Failed to mark as paid", "error");
    }
  };

  const handleMarkAsReceived = async () => {
    try {
      await markAsReceived(expense.id, expense.groupId, currentUserId);
      showToast("Marked as received!", "success");
      setShowDetails(false);
    } catch (error: any) {
      showToast(error.message || "Failed to mark as received", "error");
    }
  };

  const handleEdit = () => {
    setShowDetails(false);
    if (onEdit) {
      onEdit(expense);
    }
  };

  const handleDelete = () => {
    showToast("Delete this expense? This action cannot be undone.", "warning", {
      confirmAction: async () => {
        await deleteExpense(expense.id, expense.groupId, currentUserId);
        setShowDetails(false);
        showToast("Expense deleted", "success");
      },
      confirmText: "Delete",
    });
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
                expense.type === "personal"
                  ? theme.colors.secondary + "20"
                  : theme.colors.primary + "20",
            },
          ]}
        >
          <MaterialIcons
            name={category.icon as any}
            size={22}
            color={
              expense.type === "personal"
                ? theme.colors.secondary
                : theme.colors.primary
            }
          />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: theme.colors.textPrimary }]}
              numberOfLines={1}
            >
              {expense.title}
            </Text>
            {expense.settled && (
              <View
                style={[
                  styles.settledMicroBadge,
                  { backgroundColor: theme.colors.success + "20" },
                ]}
              >
                <MaterialIcons
                  name="check"
                  size={12}
                  color={theme.colors.success}
                />
              </View>
            )}
            {expense.type === "shared" && hasUserPaid && !expense.settled && (
              <View
                style={[
                  styles.paidMicroBadge,
                  { backgroundColor: theme.colors.success + "20" },
                ]}
              >
                <MaterialIcons
                  name="check"
                  size={12}
                  color={theme.colors.success}
                />
              </View>
            )}
          </View>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            {category.label} • {format(expense.date.toDate(), "MMM dd, yyyy")}
          </Text>
          {expense.type === "shared" && (
            <Text
              style={[styles.balance, { color: theme.colors.textMuted }]}
              numberOfLines={1}
            >
              {balanceInfo.text}
            </Text>
          )}
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>
            {formatCurrency(expense.amount, groupCurrency)}
          </Text>
          {expense.type === "shared" && (
            <View style={styles.balanceBadge}>
              <Text
                style={[
                  styles.balanceAmount,
                  {
                    color: balanceInfo.isPositive
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {balanceInfo.isPositive ? "+" : "-"}
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
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <LinearGradient
            colors={[
              theme.colors.gradientStart + "15",
              theme.colors.background,
            ]}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                onPress={() => setShowDetails(false)}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.textPrimary}
                />
              </TouchableOpacity>
              <Text
                style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
              >
                Expense Details
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleEdit}
                  style={styles.headerActionButton}
                >
                  <MaterialIcons
                    name="edit"
                    size={20}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.headerActionButton}
                >
                  <MaterialIcons
                    name="delete"
                    size={20}
                    color={theme.colors.error}
                  />
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
                    backgroundColor: theme.colors.success + "15",
                    borderColor: theme.colors.success,
                  },
                ]}
              >
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={theme.colors.success}
                />
                <Text
                  style={[
                    styles.statusBannerText,
                    { color: theme.colors.success },
                  ]}
                >
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
                <MaterialIcons
                  name={category.icon as any}
                  size={28}
                  color={theme.colors.primary}
                />
                <View style={styles.detailInfo}>
                  <Text
                    style={[
                      styles.detailTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {expense.title}
                  </Text>
                  <Text
                    style={[
                      styles.detailSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {category.label}
                  </Text>
                </View>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailItem}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Amount
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {formatCurrency(expense.amount, groupCurrency)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Date
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {format(expense.date.toDate(), "MMM dd, yyyy")}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Type
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {expense.type === "personal" ? "Personal" : "Shared"}
                </Text>
              </View>

              {expense.description && (
                <View style={styles.detailItem}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Description
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {expense.description}
                  </Text>
                </View>
              )}
            </View>

            {/* ✅ FIXED: Payment Status & Flow Section */}
            {expense.type === "shared" && (
              <>
                {/* Who Has Paid / Not Paid */}
                <View
                  style={[
                    styles.detailCard,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Payment Status
                  </Text>

                  {/* Paid Members - ✅ FIXED: Always include creator as paid */}
                  <View style={styles.paymentGroup}>
                    <View style={styles.paymentGroupHeader}>
                      <MaterialIcons
                        name="check-circle"
                        size={16}
                        color={theme.colors.success}
                      />
                      <Text
                        style={[
                          styles.paymentGroupTitle,
                          { color: theme.colors.success },
                        ]}
                      >
                        Paid (
                        {
                          expense.splitDetails.filter(
                            (s) => s.paid || s.userId === expense.creatorId
                          ).length
                        }
                        )
                      </Text>
                    </View>

                    {/* Show Creator First (they paid everything) */}
                    {(() => {
                      const creatorSplit = expense.splitDetails.find(
                        (s) => s.userId === expense.creatorId
                      );
                      const creator = members?.find(
                        (m) => m.userId === expense.creatorId
                      );
                      if (creatorSplit) {
                        return (
                          <View style={styles.paymentRow}>
                            <View style={styles.paymentLeft}>
                              <View
                                style={[
                                  styles.paymentAvatar,
                                  {
                                    backgroundColor:
                                      theme.colors.success + "20",
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.paymentAvatarText,
                                    { color: theme.colors.success },
                                  ]}
                                >
                                  {(creator?.userName || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={[
                                    styles.paymentName,
                                    { color: theme.colors.textPrimary },
                                  ]}
                                >
                                  {expense.creatorId === currentUserId
                                    ? "You"
                                    : creator?.userName || "Member"}
                                </Text>
                                <Text
                                  style={[
                                    styles.paymentSubtext,
                                    { color: theme.colors.textMuted },
                                  ]}
                                >
                                  Paid full amount
                                </Text>
                              </View>
                            </View>
                            <Text
                              style={[
                                styles.paymentAmount,
                                { color: theme.colors.success },
                              ]}
                            >
                              {formatCurrency(expense.amount, groupCurrency)} ✓
                            </Text>
                          </View>
                        );
                      }
                      return null;
                    })()}

                    {/* Other members who have paid their share */}
                    {expense.splitDetails
                      .filter((s) => s.paid && s.userId !== expense.creatorId)
                      .map((split) => {
                        const member = members?.find(
                          (m) => m.userId === split.userId
                        );
                        return (
                          <View key={split.userId} style={styles.paymentRow}>
                            <View style={styles.paymentLeft}>
                              <View
                                style={[
                                  styles.paymentAvatar,
                                  {
                                    backgroundColor:
                                      theme.colors.success + "20",
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.paymentAvatarText,
                                    { color: theme.colors.success },
                                  ]}
                                >
                                  {(member?.userName || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.paymentName,
                                  { color: theme.colors.textPrimary },
                                ]}
                              >
                                {split.userId === currentUserId
                                  ? "You"
                                  : member?.userName || "Member"}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.paymentAmount,
                                { color: theme.colors.success },
                              ]}
                            >
                              {formatCurrency(split.exactAmount, groupCurrency)}{" "}
                              ✓
                            </Text>
                          </View>
                        );
                      })}
                  </View>

                  {/* ✅ FIXED: Unpaid Members - EXCLUDE creator */}
                  {expense.splitDetails.filter(
                    (s) => !s.paid && s.userId !== expense.creatorId
                  ).length > 0 && (
                    <View style={[styles.paymentGroup, { marginTop: 12 }]}>
                      <View style={styles.paymentGroupHeader}>
                        <MaterialIcons
                          name="schedule"
                          size={16}
                          color={theme.colors.warning}
                        />
                        <Text
                          style={[
                            styles.paymentGroupTitle,
                            { color: theme.colors.warning },
                          ]}
                        >
                          Pending (
                          {
                            expense.splitDetails.filter(
                              (s) => !s.paid && s.userId !== expense.creatorId
                            ).length
                          }
                          )
                        </Text>
                      </View>
                      {expense.splitDetails
                        .filter(
                          (s) => !s.paid && s.userId !== expense.creatorId
                        )
                        .map((split) => {
                          const member = members?.find(
                            (m) => m.userId === split.userId
                          );
                          return (
                            <View key={split.userId} style={styles.paymentRow}>
                              <View style={styles.paymentLeft}>
                                <View
                                  style={[
                                    styles.paymentAvatar,
                                    {
                                      backgroundColor:
                                        theme.colors.warning + "20",
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.paymentAvatarText,
                                      { color: theme.colors.warning },
                                    ]}
                                  >
                                    {(member?.userName || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    styles.paymentName,
                                    { color: theme.colors.textPrimary },
                                  ]}
                                >
                                  {split.userId === currentUserId
                                    ? "You"
                                    : member?.userName || "Member"}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.paymentAmount,
                                  { color: theme.colors.warning },
                                ]}
                              >
                                {formatCurrency(
                                  split.exactAmount,
                                  groupCurrency
                                )}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  )}
                </View>

                {/* Payment Flow remains the same - already excludes creator */}
                {!expense.settled &&
                  expense.splitDetails.filter(
                    (s) => !s.paid && s.userId !== expense.creatorId
                  ).length > 0 && (
                    <View
                      style={[
                        styles.detailCard,
                        {
                          backgroundColor: theme.colors.cardBackground,
                          borderColor: theme.colors.cardBorder,
                        },
                      ]}
                    >
                      <View style={styles.flowHeader}>
                        <MaterialIcons
                          name="sync-alt"
                          size={18}
                          color={theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.sectionTitle,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          Payment Flow
                        </Text>
                      </View>

                      {expense.splitDetails
                        .filter(
                          (split) =>
                            !split.paid && split.userId !== expense.creatorId
                        )
                        .map((split) => {
                          const debtor = members?.find(
                            (m) => m.userId === split.userId
                          );
                          const payer = members?.find(
                            (m) => m.userId === expense.creatorId
                          );
                          const isCurrentUserDebtor =
                            split.userId === currentUserId;
                          const isCurrentUserPayer =
                            expense.creatorId === currentUserId;

                          return (
                            <View key={split.userId} style={styles.flowRow}>
                              {/* Debtor */}
                              <View style={styles.flowPerson}>
                                <View
                                  style={[
                                    styles.flowAvatar,
                                    {
                                      backgroundColor: isCurrentUserDebtor
                                        ? theme.colors.error + "20"
                                        : theme.colors.textMuted + "20",
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.flowAvatarText,
                                      {
                                        color: isCurrentUserDebtor
                                          ? theme.colors.error
                                          : theme.colors.textMuted,
                                      },
                                    ]}
                                  >
                                    {(debtor?.userName || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    styles.flowName,
                                    {
                                      color: isCurrentUserDebtor
                                        ? theme.colors.error
                                        : theme.colors.textPrimary,
                                      fontWeight: isCurrentUserDebtor
                                        ? "700"
                                        : "600",
                                    },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {isCurrentUserDebtor
                                    ? "You"
                                    : debtor?.userName || "Member"}
                                </Text>
                              </View>

                              {/* Arrow with Amount */}
                              <View style={styles.flowArrow}>
                                <View
                                  style={[
                                    styles.flowArrowLine,
                                    {
                                      backgroundColor:
                                        theme.colors.primary + "40",
                                    },
                                  ]}
                                />
                                <View
                                  style={[
                                    styles.flowAmountBadge,
                                    {
                                      backgroundColor:
                                        theme.colors.primary + "15",
                                      borderColor: theme.colors.primary,
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.flowArrowAmount,
                                      { color: theme.colors.primary },
                                    ]}
                                  >
                                    {formatCurrency(
                                      split.exactAmount,
                                      groupCurrency
                                    )}
                                  </Text>
                                </View>
                                <MaterialIcons
                                  name="arrow-forward"
                                  size={16}
                                  color={theme.colors.primary}
                                  style={styles.flowArrowIcon}
                                />
                              </View>

                              {/* Payer */}
                              <View style={styles.flowPerson}>
                                <View
                                  style={[
                                    styles.flowAvatar,
                                    {
                                      backgroundColor: isCurrentUserPayer
                                        ? theme.colors.success + "20"
                                        : theme.colors.textMuted + "20",
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.flowAvatarText,
                                      {
                                        color: isCurrentUserPayer
                                          ? theme.colors.success
                                          : theme.colors.textMuted,
                                      },
                                    ]}
                                  >
                                    {(payer?.userName || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    styles.flowName,
                                    {
                                      color: isCurrentUserPayer
                                        ? theme.colors.success
                                        : theme.colors.textPrimary,
                                      fontWeight: isCurrentUserPayer
                                        ? "700"
                                        : "600",
                                    },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {isCurrentUserPayer
                                    ? "You"
                                    : payer?.userName || "Payer"}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                    </View>
                  )}
              </>
            )}

            {expense.type === "shared" && !expense.settled && (
              <View style={styles.actionsContainer}>
                {!isPayer && !hasUserPaid && (
                  <TouchableOpacity
                    onPress={handleMarkAsPaid}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[
                        theme.colors.success,
                        theme.colors.success + "DD",
                      ]}
                      style={styles.actionButton}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>Mark as Paid</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {isPayer && (
                  <TouchableOpacity
                    onPress={handleMarkAsReceived}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.secondary]}
                      style={styles.actionButton}
                    >
                      <MaterialIcons
                        name="monetization-on"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>
                        Mark as Received
                      </Text>
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
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    marginRight: 6,
  },
  settledMicroBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 3,
  },
  balance: {
    fontSize: 11,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  balanceAmount: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: "700",
  },
  detailCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 14,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 3,
  },
  detailSubtitle: {
    fontSize: 13,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  splitLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  splitUser: {
    fontSize: 14,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  paidMicroBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  paymentGroup: {
    marginTop: 8,
  },

  paymentGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },

  paymentGroupTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },

  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  paymentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  paymentAvatarText: {
    fontSize: 14,
    fontWeight: "700",
  },

  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },

  paymentAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  flowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  flowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 10,
  },

  flowPerson: {
    alignItems: "center",
    flex: 1,
  },

  flowAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  flowAvatarText: {
    fontSize: 16,
    fontWeight: "700",
  },

  flowName: {
    fontSize: 13,
    textAlign: "center",
  },

  flowArrow: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 50,
  },

  flowArrowLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    top: 22,
  },

  flowAmountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: "#fff",
    zIndex: 1,
  },

  flowArrowAmount: {
    fontSize: 12,
    fontWeight: "800",
  },

  flowArrowIcon: {
    position: "absolute",
    right: -4,
    top: 17,
    zIndex: 2,
  },

  flowEmpty: {
    alignItems: "center",
    paddingVertical: 30,
  },

  flowEmptyText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },

  paymentSubtext: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
