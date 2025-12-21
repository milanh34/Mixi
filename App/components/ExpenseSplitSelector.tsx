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
import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { GroupMember } from '../lib/schema';
import { MemberAvatar } from './ui/MemberAvatar';

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

  return (
    <View style={styles.container}>
      {/* Split Type Selector */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Split Type
        </Text>
        <View style={styles.typeRow}>
          {[
            { id: 'equal', label: 'Equal', icon: 'group' },
            { id: 'shares', label: 'Shares', icon: 'pie-chart' },
            { id: 'percent', label: 'Percent', icon: 'percent' },
            { id: 'exact', label: 'Exact', icon: 'calculate' },
          ].map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    splitType === type.id
                      ? theme.colors.primary + '20'
                      : theme.colors.surface,
                  borderColor:
                    splitType === type.id
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={() => onSplitTypeChange(type.id as any)}
            >
              <MaterialIcons
                name={type.icon as any}
                size={20}
                color={
                  splitType === type.id ? theme.colors.primary : theme.colors.text
                }
              />
              <Text
                style={[
                  styles.typeText,
                  {
                    color:
                      splitType === type.id
                        ? theme.colors.primary
                        : theme.colors.text,
                  },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Member Split Details */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Split Details
        </Text>
        
        <ScrollView style={styles.membersList}>
          {members.map((member) => {
            const detail = splitDetails.find((d) => d.userId === member.userId);
            const amount = calculateIndividualAmount(member.userId);

            return (
              <View
                key={member.userId}
                style={[
                  styles.memberRow,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.memberInfo}>
                  <MemberAvatar
                    name={member.userName}
                    photo={member.userProfilePicture}
                    size="small"
                  />
                  <View style={styles.memberText}>
                    <Text style={[styles.memberName, { color: theme.colors.text }]}>
                      {member.userName}
                    </Text>
                    <Text style={[styles.memberAmount, { color: theme.colors.textSecondary }]}>
                      ₹{amount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {splitType !== 'equal' && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={detail?.value.toString() || '0'}
                      onChangeText={(text) => {
                        const value = parseFloat(text) || 0;
                        updateSplitValue(member.userId, value);
                      }}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>
                      {splitType === 'percent' ? '%' : splitType === 'shares' ? '×' : '₹'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Summary */}
      <View
        style={[
          styles.summary,
          {
            backgroundColor: isValidSplit()
              ? theme.colors.success + '10'
              : theme.colors.error + '10',
          },
        ]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            Total Amount:
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            ₹{totalAmount.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>
            Split Total:
          </Text>
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
          <View style={styles.warningRow}>
            <MaterialIcons name="warning" size={16} color={theme.colors.error} />
            <Text style={[styles.warningText, { color: theme.colors.error }]}>
              Split total doesn't match amount
            </Text>
          </View>
        )}
      </View>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  membersList: {
    maxHeight: 300,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  memberAmount: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    width: 80,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    borderWidth: 1,
    textAlign: 'right',
  },
  unit: {
    fontSize: 15,
    fontWeight: '600',
  },
  summary: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
