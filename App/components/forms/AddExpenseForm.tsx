// components/forms/AddExpenseForm.tsx
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useThemeStore } from '../../stores/themeStore';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';
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

interface AddExpenseFormProps {
    visible: boolean;
    groupId: string;
    groupCurrency: string;
    onClose: () => void;
}

export function AddExpenseForm({ visible, groupId, groupCurrency, onClose }: AddExpenseFormProps) {
    const { theme } = useThemeStore();
    const { user } = useAuthStore();
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
        if (!title.trim() || !amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please fill in title and amount');
            return;
        }

        if (!user) return;

        try {
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

            // Build expense data - only include fields with actual values
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

            Alert.alert('Success', 'Expense added successfully!');
            handleClose();
        } catch (error: any) {
            console.error('Submit error:', error);
            Alert.alert('Error', error.message);
        }
    };

    const handleAddPhoto = async () => {
        const uri = await pickImage();
        if (uri) setReceiptPhoto(uri);
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <MaterialIcons name="close" size={28} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        Add Expense
                    </Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Expense Type */}
                    <View style={styles.section}>
                        <View style={styles.typeToggle}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    {
                                        backgroundColor:
                                            type === 'shared' ? theme.colors.primary : theme.colors.surface,
                                    },
                                ]}
                                onPress={() => setType('shared')}
                            >
                                <MaterialIcons
                                    name="group"
                                    size={20}
                                    color={type === 'shared' ? '#FFFFFF' : theme.colors.text}
                                />
                                <Text
                                    style={[
                                        styles.typeText,
                                        { color: type === 'shared' ? '#FFFFFF' : theme.colors.text },
                                    ]}
                                >
                                    Shared
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    {
                                        backgroundColor:
                                            type === 'personal' ? theme.colors.primary : theme.colors.surface,
                                    },
                                ]}
                                onPress={() => setType('personal')}
                            >
                                <MaterialIcons
                                    name="person"
                                    size={20}
                                    color={type === 'personal' ? '#FFFFFF' : theme.colors.text}
                                />
                                <Text
                                    style={[
                                        styles.typeText,
                                        { color: type === 'personal' ? '#FFFFFF' : theme.colors.text },
                                    ]}
                                >
                                    Personal
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Title */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Title *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.colors.surface,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border,
                                },
                            ]}
                            placeholder="e.g., Dinner at XYZ"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Amount */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Amount ({groupCurrency}) *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.colors.surface,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border,
                                },
                            ]}
                            placeholder="0.00"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    {/* Category */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Category
                        </Text>
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
                                                    : theme.colors.surface,
                                            borderColor:
                                                category === cat.id
                                                    ? theme.colors.primary
                                                    : theme.colors.border,
                                        },
                                    ]}
                                    onPress={() => setCategory(cat.id)}
                                >
                                    <MaterialIcons
                                        name={cat.icon as any}
                                        size={20}
                                        color={
                                            category === cat.id ? theme.colors.primary : theme.colors.text
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            {
                                                color:
                                                    category === cat.id
                                                        ? theme.colors.primary
                                                        : theme.colors.text,
                                            },
                                        ]}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Split Selector (Only for Shared Expenses) */}
                    {type === 'shared' && members.length > 0 && (
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
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Description (Optional)
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                {
                                    backgroundColor: theme.colors.surface,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border,
                                },
                            ]}
                            placeholder="Add notes..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Receipt Photo */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.colors.text }]}>
                            Receipt (Optional)
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.photoButton,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                },
                            ]}
                            onPress={handleAddPhoto}
                            disabled={uploading}
                        >
                            <MaterialIcons
                                name="add-photo-alternate"
                                size={32}
                                color={theme.colors.textSecondary}
                            />
                            <Text style={[styles.photoText, { color: theme.colors.textSecondary }]}>
                                {uploading ? 'Uploading...' : receiptPhoto ? 'Change Photo' : 'Add Photo'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={handleSubmit}
                        disabled={loading || uploading}
                    >
                        <Text style={styles.submitText}>
                            {loading ? 'Adding...' : 'Add Expense'}
                        </Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        height: 100,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    typeToggle: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    categoryRow: {
        gap: 12,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
    },
    photoButton: {
        height: 120,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoText: {
        fontSize: 14,
        marginTop: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
