// components/forms/AddExpenseForm.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../../stores/themeStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastPortal } from '../ui/ToastPortal'; 
import { useGroupMembers } from '../../hooks/useGroupMembers';
import { useImagePicker } from '../../hooks/useImagePicker';
import { EXPENSE_CATEGORIES } from '../../utils/expenseCategories';
import { ExpenseSplitSelector } from '../ExpenseSplitSelector';
import {
  calculateEqualSplit,
  calculateShareSplit,
  calculatePercentSplit,
  calculateExactSplit,
} from '../../utils/splitCalculator';
import { format } from 'date-fns';
import { MemberAvatar } from '../ui/MemberAvatar';

interface AddExpenseFormProps {
  visible: boolean;
  groupId: string;
  groupCurrency: string;
  preselectedType: 'personal' | 'shared';
  editingExpense?: any;
  onClose: () => void;
}

export function AddExpenseForm({
  visible,
  groupId,
  groupCurrency,
  preselectedType,
  editingExpense,
  onClose,
}: AddExpenseFormProps) {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { showToast } = useToastPortal();
  const { createExpense, updateExpense, loading } = useExpenseStore();
  const { members } = useGroupMembers(groupId);
  const { pickImage, uploading } = useImagePicker();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<'equal' | 'shares' | 'percent' | 'exact'>('equal');
  const [splitDetails, setSplitDetails] = useState<{ userId: string; value: number }[]>([]);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<string>('');

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDescription(editingExpense.description || '');
      setReceiptPhoto(editingExpense.receiptPhoto || null);
      setSplitType(editingExpense.splitType);
      setExpenseDate(editingExpense.date.toDate());
      setSelectedCreator(editingExpense.creatorId);

      if (editingExpense.type === 'shared') {
        const initialSplits = editingExpense.splitDetails.map((split: any) => ({
          userId: split.userId,
          value: split.exactAmount,
        }));
        setSplitDetails(initialSplits);
      }
    } else {
      // Reset for new expense
      setTitle('');
      setAmount('');
      setCategory('food');
      setDescription('');
      setReceiptPhoto(null);
      setSplitType('equal');
      setSplitDetails([]);
      setExpenseDate(new Date());
      setSelectedCreator(user?.uid || '');
    }
  }, [editingExpense, visible, user?.uid]);

  useEffect(() => {
    if (members.length > 0 && splitDetails.length === 0 && !editingExpense) {
      setSplitDetails(
        members.map((member) => ({
          userId: member.userId,
          value: splitType === 'equal' ? 1 : splitType === 'percent' ? 100 / members.length : 1,
        }))
      );
    }
  }, [members]);

  useEffect(() => {
    if (members.length > 0 && !editingExpense) {
      const defaultValue =
        splitType === 'equal'
          ? 1
          : splitType === 'percent'
            ? 100 / members.length
            : splitType === 'shares'
              ? 1
              : parseFloat(amount) / members.length || 0;

      setSplitDetails(
        members.map((member) => ({
          userId: member.userId,
          value: defaultValue,
        }))
      );
    }
  }, [splitType]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!user) {
      showToast('User not authenticated', 'error');
      return;
    }

    try {
      const amountNum = parseFloat(amount);
      let calculatedSplits;

      if (preselectedType === 'personal') {
        calculatedSplits = [
          {
            userId: user.uid,
            share: 1,
            percent: 100,
            exactAmount: amountNum,
            paidBy: user.uid,
            paid: false,
          },
        ];
      } else {
        const memberIds = members.map((m) => m.userId);

        switch (splitType) {
          case 'equal':
            calculatedSplits = calculateEqualSplit(amountNum, memberIds, user.uid);
            break;
          case 'shares':
            calculatedSplits = calculateShareSplit(
              amountNum,
              splitDetails.map((d) => ({ userId: d.userId, share: d.value })),
              user.uid
            );
            break;
          case 'percent':
            calculatedSplits = calculatePercentSplit(
              amountNum,
              splitDetails.map((d) => ({ userId: d.userId, percent: d.value })),
              user.uid
            );
            break;
          case 'exact':
            calculatedSplits = calculateExactSplit(
              splitDetails.map((d) => ({ userId: d.userId, amount: d.value })),
              user.uid
            );
            break;
          default:
            calculatedSplits = calculateEqualSplit(amountNum, memberIds, user.uid);
        }
      }

      const expenseData: any = {
        groupId,
        creatorId: editingExpense ? editingExpense.creatorId : selectedCreator || user!.uid,
        loggedById: selectedCreator !== user?.uid ? user?.uid : undefined,
        type: preselectedType,
        title: title.trim(),
        amount: amountNum,
        currency: groupCurrency,
        category,
        date: Timestamp.fromDate(expenseDate),
        splitType: preselectedType === 'personal' ? 'equal' : splitType,
        splitDetails: calculatedSplits,
        settled: false,
      };

      if (description && description.trim()) {
        expenseData.description = description.trim();
      }

      if (receiptPhoto) {
        expenseData.receiptPhoto = receiptPhoto;
      }

      if (editingExpense) {
        await updateExpense(editingExpense.id, groupId, expenseData, user.uid);
        showToast('Expense updated successfully!', 'success');
      } else {
        await createExpense(groupId, user.uid, expenseData);
        showToast('Expense added successfully!', 'success');
      }

      handleClose();
    } catch (error: any) {
      console.error('Submit error:', error);
      showToast(error.message || 'Failed to save expense', 'error');
    }
  };

  const handleAddPhoto = async () => {
    const uri = await pickImage();
    if (uri) {
      setReceiptPhoto(uri);
      showToast('Receipt photo added', 'success');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpenseDate(selectedDate);
    }
  };

  const handleClose = () => {
    setTitle('');
    setAmount('');
    setCategory('food');
    setDescription('');
    setReceiptPhoto(null);
    setSplitType('equal');
    setSplitDetails([]);
    setExpenseDate(new Date());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart + '20', theme.colors.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      preselectedType === 'personal'
                        ? theme.colors.secondary + '20'
                        : theme.colors.primary + '20',
                  },
                ]}
              >
                <MaterialIcons
                  name={preselectedType === 'personal' ? 'person' : 'group'}
                  size={12}
                  color={
                    preselectedType === 'personal' ? theme.colors.secondary : theme.colors.primary
                  }
                />
                <Text
                  style={[
                    styles.typeBadgeText,
                    {
                      color:
                        preselectedType === 'personal'
                          ? theme.colors.secondary
                          : theme.colors.primary,
                    },
                  ]}
                >
                  {preselectedType === 'personal' ? 'Personal' : 'Shared'}
                </Text>
              </View>
            </View>

            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
              Title *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
            >
              <MaterialIcons name="edit" size={18} color={theme.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.colors.inputText }]}
                placeholder="e.g., Lunch at restaurant"
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
              Amount *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
            >
              <View style={[styles.currencyBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                <Text style={[styles.currencyText, { color: theme.colors.primary }]}>
                  {groupCurrency}
                </Text>
              </View>
              <TextInput
                style={[styles.input, styles.amountInput, { color: theme.colors.inputText }]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
              Date *
            </Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="calendar-today" size={18} color={theme.colors.textMuted} />
              <Text style={[styles.dateText, { color: theme.colors.inputText }]}>
                {format(expenseDate, 'MMM dd, yyyy')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={expenseDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {preselectedType === 'shared' && members.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
                Paid by *
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.creatorSelector}>
                {members.map((member) => (
                  <TouchableOpacity
                    key={member.userId}
                    style={[
                      styles.creatorOption,
                      selectedCreator === member.userId && {
                        backgroundColor: theme.colors.primary + '15',
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedCreator(member.userId)}
                    activeOpacity={0.7}
                  >
                    <MemberAvatar
                      name={member.userName}
                      photo={member.userProfilePicture}
                      size='small'
                    />
                    <Text style={[styles.creatorName, { color: theme.colors.textPrimary }]}>
                      {member.userName}
                    </Text>
                    {selectedCreator === member.userId && (
                      <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}


          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary + '15'
                          : theme.colors.cardBackground,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                      },
                    ]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={cat.icon as any}
                      size={16}
                      color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Split Selector (Shared only) */}
          {preselectedType === 'shared' && members.length > 0 && (
            <ExpenseSplitSelector
              members={members}
              totalAmount={parseFloat(amount) || 0}
              splitType={splitType}
              onSplitTypeChange={setSplitType}
              splitDetails={splitDetails}
              onSplitDetailsChange={setSplitDetails}
            />
          )}

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.inputText,
                  borderColor: theme.colors.inputBorder,
                },
              ]}
              placeholder="Add details..."
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Receipt */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
              Receipt (Optional)
            </Text>
            <TouchableOpacity
              style={[
                styles.photoButton,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
              onPress={handleAddPhoto}
              disabled={uploading}
              activeOpacity={0.7}
            >
              {receiptPhoto ? (
                <>
                  <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                  <Text style={[styles.photoButtonText, { color: theme.colors.success }]}>
                    Receipt Added
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="camera-alt" size={20} color={theme.colors.textMuted} />
                  <Text style={[styles.photoButtonText, { color: theme.colors.textSecondary }]}>
                    {uploading ? 'Uploading...' : 'Add Receipt'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || uploading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={[styles.submitButton, (loading || uploading) && { opacity: 0.6 }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '700',
  },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 13,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  creatorSelector: {
    maxHeight: 60,
  },
  creatorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 8,
    minWidth: 100,
  },
  creatorName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});
