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
import { useThemeStore } from '../../stores/themeStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../utils/toastManager';
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
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface AddExpenseFormProps {
  visible: boolean;
  groupId: string;
  groupCurrency: string;
  onClose: () => void;
}

export function AddExpenseForm({ visible, groupId, groupCurrency, onClose }: AddExpenseFormProps) {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const { createExpense, loading } = useExpenseStore();
  const { members } = useGroupMembers(groupId);
  const { pickImage, uploading } = useImagePicker();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [type, setType] = useState<'personal' | 'shared'>('shared');
  const [description, setDescription] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<'equal' | 'shares' | 'percent' | 'exact'>('equal');
  const [splitDetails, setSplitDetails] = useState<{ userId: string; value: number }[]>([]);

  // Initialize split details when members change
  useEffect(() => {
    if (members.length > 0 && splitDetails.length === 0) {
      setSplitDetails(
        members.map((member) => ({
          userId: member.userId,
          value: splitType === 'equal' ? 1 : splitType === 'percent' ? 100 / members.length : 1,
        }))
      );
    }
  }, [members]);

  // Reset split details when split type changes
  useEffect(() => {
    if (members.length > 0) {
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

    if (!user) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const amountNum = parseFloat(amount);

      let calculatedSplits;

      if (type === 'personal') {
        calculatedSplits = [{
          userId: user.uid,
          share: 1,
          percent: 100,
          exactAmount: amountNum,
          paidBy: user.uid,
        }];
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

      // Build expense data
      const expenseData: any = {
        groupId,
        creatorId: user.uid,
        type,
        title: title.trim(),
        amount: amountNum,
        currency: groupCurrency,
        category,
        date: Timestamp.now(),
        splitType: type === 'personal' ? 'equal' : splitType,
        splitDetails: calculatedSplits,
        settled: false,
      };

      // Only add optional fields if they have truthy values
      if (description && description.trim()) {
        expenseData.description = description.trim();
      }

      if (receiptPhoto) {
        expenseData.receiptPhoto = receiptPhoto;
      }

      await createExpense(expenseData);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Expense added successfully!', 'success');
      handleClose();
    } catch (error: any) {
      console.error('Submit error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || 'Failed to add expense', 'error');
    }
  };

  const handleAddPhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const uri = await pickImage();
    if (uri) {
      setReceiptPhoto(uri);
      showToast('Receipt photo added', 'success');
    }
  };

  const handleClose = () => {
    setTitle('');
    setAmount('');
    setCategory('food');
    setType('shared');
    setDescription('');
    setReceiptPhoto(null);
    setSplitType('equal');
    setSplitDetails([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[theme.colors.gradientStart + '15', theme.colors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              Add Expense
            </Text>
            
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Expense Type Toggle */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 400 }}
          >
            <View style={styles.section}>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'shared' && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setType('shared');
                  }}
                  activeOpacity={0.7}
                >
                  {type === 'shared' ? (
                    <LinearGradient
                      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                      style={styles.typeButtonGradient}
                    >
                      <MaterialIcons name="group" size={20} color="#FFFFFF" />
                      <Text style={styles.typeTextActive}>Shared</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.typeButtonInactive, { backgroundColor: theme.colors.cardBackground }]}>
                      <MaterialIcons name="group" size={20} color={theme.colors.textMuted} />
                      <Text style={[styles.typeTextInactive, { color: theme.colors.textSecondary }]}>
                        Shared
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'personal' && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setType('personal');
                  }}
                  activeOpacity={0.7}
                >
                  {type === 'personal' ? (
                    <LinearGradient
                      colors={[theme.colors.secondary, theme.colors.accent]}
                      style={styles.typeButtonGradient}
                    >
                      <MaterialIcons name="person" size={20} color="#FFFFFF" />
                      <Text style={styles.typeTextActive}>Personal</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.typeButtonInactive, { backgroundColor: theme.colors.cardBackground }]}>
                      <MaterialIcons name="person" size={20} color={theme.colors.textMuted} />
                      <Text style={[styles.typeTextInactive, { color: theme.colors.textSecondary }]}>
                        Personal
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 100 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="title" size={18} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Title *
                </Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.colors.inputText }]}
                  placeholder="e.g., Dinner at XYZ"
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>
          </MotiView>

          {/* Amount */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 200 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="currency-rupee" size={18} color={theme.colors.success} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Amount ({groupCurrency}) *
                </Text>
              </View>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
              >
                <MaterialIcons name="currency-rupee" size={20} color={theme.colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: theme.colors.inputText }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </MotiView>

          {/* Category */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 300 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="category" size={18} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Category
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          category === cat.id
                            ? theme.colors.primary + '20'
                            : theme.colors.cardBackground,
                        borderColor:
                          category === cat.id
                            ? theme.colors.primary
                            : theme.colors.cardBorder,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategory(cat.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={cat.icon as any}
                      size={20}
                      color={category === cat.id ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color:
                            category === cat.id
                              ? theme.colors.primary
                              : theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </MotiView>

          {/* Split Selector (Only for Shared Expenses) */}
          {type === 'shared' && members.length > 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 400, delay: 100 }}
            >
              <ExpenseSplitSelector
                members={members}
                totalAmount={parseFloat(amount) || 0}
                splitType={splitType}
                onSplitTypeChange={setSplitType}
                splitDetails={splitDetails}
                onSplitDetailsChange={setSplitDetails}
              />
            </MotiView>
          )}

          {/* Description */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 400 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="description" size={18} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Description (Optional)
                </Text>
              </View>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputText,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
                placeholder="Add notes..."
                placeholderTextColor={theme.colors.inputPlaceholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </MotiView>

          {/* Receipt Photo */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 500 }}
          >
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <MaterialIcons name="receipt" size={18} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                  Receipt (Optional)
                </Text>
              </View>
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
                <LinearGradient
                  colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
                  style={styles.photoIconContainer}
                >
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={32}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
                <Text style={[styles.photoText, { color: theme.colors.textSecondary }]}>
                  {uploading ? 'Uploading...' : receiptPhoto ? 'Change Photo' : 'Add Receipt Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </ScrollView>

        {/* Submit Button with Gradient */}
        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || uploading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={[styles.submitButton, (loading || uploading) && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>Add Expense</Text>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
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
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
  },
  typeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  typeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  typeButtonInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  typeTextActive: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  typeTextInactive: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryRow: {
    gap: 10,
    paddingRight: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  photoButton: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  photoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
