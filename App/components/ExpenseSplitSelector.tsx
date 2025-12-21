// components/ExpenseSplitSelector.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { GroupMember } from '../lib/schema';
import { MemberAvatar } from './ui/MemberAvatar';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface SplitDetails {
  userId: string;
  value: number; // Can be share, percent, or exact amount depending on type
}

interface ExpenseSplitSelectorProps {
  members: GroupMember[];
  totalAmount: number;
  splitType: 'equal' | 'shares' | 'percent' | 'exact';
  onSplitTypeChange: (type: 'equal' | 'shares' | 'percent' | 'exact') => void;
  splitDetails: SplitDetails[];
  onSplitDetailsChange: (details: SplitDetails[]) => void;
}

export function ExpenseSplitSelector({
  members,
  totalAmount,
  splitType,
  onSplitTypeChange,
  splitDetails,
  onSplitDetailsChange,
}: ExpenseSplitSelectorProps) {
  const { theme } = useThemeStore();

  const updateSplitValue = (userId: string, value: number) => {
    const updated = splitDetails.map((detail) =>
      detail.userId === userId ? { ...detail, value } : detail
    );
    onSplitDetailsChange(updated);
  };

  const calculateIndividualAmount = (userId: string): number => {
    if (!totalAmount || totalAmount <= 0) return 0;

    const detail = splitDetails.find((d) => d.userId === userId);
    if (!detail) return 0;

    switch (splitType) {
      case 'equal':
        return totalAmount / members.length;
      
      case 'shares': {
        const totalShares = splitDetails.reduce((sum, d) => sum + d.value, 0);
        if (totalShares === 0) return 0;
        return (totalAmount * detail.value) / totalShares;
      }
      
      case 'percent': {
        return (totalAmount * detail.value) / 100;
      }
      
      case 'exact':
        return detail.value;
      
      default:
        return 0;
    }
  };

  const getTotalCalculated = (): number => {
    switch (splitType) {
      case 'equal':
        return totalAmount;
      
      case 'shares':
      case 'percent':
        return members.reduce((sum, member) => 
          sum + calculateIndividualAmount(member.userId), 0
        );
      
      case 'exact':
        return splitDetails.reduce((sum, detail) => sum + detail.value, 0);
      
      default:
        return 0;
    }
  };

  const isValidSplit = (): boolean => {
    const total = getTotalCalculated();
    return Math.abs(total - totalAmount) < 0.01; // Allow 1 paisa difference for rounding
  };

  const splitTypes = [
    { id: 'equal', label: 'Equal', icon: 'group' },
    { id: 'shares', label: 'Shares', icon: 'pie-chart' },
    { id: 'percent', label: 'Percent', icon: 'percent' },
    { id: 'exact', label: 'Exact', icon: 'calculate' },
  ];

  return (
    <View style={styles.container}>
      {/* Split Type Selector */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <MaterialIcons name="pie-chart" size={18} color={theme.colors.primary} />
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Split Type
          </Text>
        </View>
        
        <View style={styles.typeRow}>
          {splitTypes.map((type, index) => (
            <MotiView
              key={type.id}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 400, delay: index * 50 }}
              style={{ flex: 1 }}
            >
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      splitType === type.id
                        ? theme.colors.primary + '20'
                        : theme.colors.cardBackground,
                    borderColor:
                      splitType === type.id
                        ? theme.colors.primary
                        : theme.colors.cardBorder,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSplitTypeChange(type.id as any);
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={type.icon as any}
                  size={20}
                  color={
                    splitType === type.id ? theme.colors.primary : theme.colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.typeText,
                    {
                      color:
                        splitType === type.id
                          ? theme.colors.primary
                          : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      </View>

      {/* Member Split Details */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <MaterialIcons name="people" size={18} color={theme.colors.primary} />
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Split Details
          </Text>
        </View>
        
        <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
          {members.map((member, index) => {
            const detail = splitDetails.find((d) => d.userId === member.userId);
            const amount = calculateIndividualAmount(member.userId);

            return (
              <MotiView
                key={member.userId}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                style={[
                  styles.memberRow,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.memberInfo}>
                  <MemberAvatar
                    name={member.userName}
                    photo={member.userProfilePicture}
                    size="small"
                  />
                  <View style={styles.memberText}>
                    <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                      {member.userName}
                    </Text>
                    <View style={styles.amountRow}>
                      <MaterialIcons name="currency-rupee" size={12} color={theme.colors.success} />
                      <Text style={[styles.memberAmount, { color: theme.colors.success }]}>
                        {amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {splitType !== 'equal' && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.inputBackground,
                          color: theme.colors.inputText,
                          borderColor: theme.colors.inputBorder,
                        },
                      ]}
                      value={detail?.value.toString() || '0'}
                      onChangeText={(text) => {
                        const value = parseFloat(text) || 0;
                        updateSplitValue(member.userId, value);
                      }}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.inputPlaceholder}
                    />
                    <View style={[styles.unitBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.unit, { color: theme.colors.primary }]}>
                        {splitType === 'percent' ? '%' : splitType === 'shares' ? '×' : '₹'}
                      </Text>
                    </View>
                  </View>
                )}
              </MotiView>
            );
          })}
        </ScrollView>
      </View>

      {/* Summary */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
      >
        <LinearGradient
          colors={
            isValidSplit()
              ? [theme.colors.successLight, theme.colors.successLight]
              : [theme.colors.errorLight, theme.colors.errorLight]
          }
          style={styles.summary}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <MaterialIcons name="receipt-long" size={16} color={theme.colors.textPrimary} />
              <Text style={[styles.summaryLabel, { color: theme.colors.textPrimary }]}>
                Total Amount:
              </Text>
            </View>
            <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>
              ₹{totalAmount.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <MaterialIcons name="calculate" size={16} color={theme.colors.textPrimary} />
              <Text style={[styles.summaryLabel, { color: theme.colors.textPrimary }]}>
                Split Total:
              </Text>
            </View>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: isValidSplit() ? theme.colors.success : theme.colors.error,
                },
              ]}
            >
              ₹{getTotalCalculated().toFixed(2)}
            </Text>
          </View>

          {!isValidSplit() && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
              style={[styles.warningRow, { backgroundColor: theme.colors.error + '20' }]}
            >
              <MaterialIcons name="warning" size={18} color={theme.colors.error} />
              <Text style={[styles.warningText, { color: theme.colors.error }]}>
                Split total doesn't match amount
              </Text>
            </MotiView>
          )}
          
          {isValidSplit() && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
              style={[styles.successRow, { backgroundColor: theme.colors.success + '20' }]}
            >
              <MaterialIcons name="check-circle" size={18} color={theme.colors.success} />
              <Text style={[styles.successText, { color: theme.colors.success }]}>
                Split is valid!
              </Text>
            </MotiView>
          )}
        </LinearGradient>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 2,
    gap: 6,
    minHeight: 70,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  membersList: {
    maxHeight: 300,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  memberText: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  memberAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    width: 80,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 1,
    textAlign: 'right',
  },
  unitBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unit: {
    fontSize: 14,
    fontWeight: '700',
  },
  summary: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '700',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  successText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
