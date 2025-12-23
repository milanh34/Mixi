// components/ExpenseSplitSelector.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { GroupMember } from '../lib/schema';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

interface ExpenseSplitSelectorProps {
  members: GroupMember[];
  totalAmount: number;
  splitType: 'equal' | 'shares' | 'percent' | 'exact';
  onSplitTypeChange: (type: 'equal' | 'shares' | 'percent' | 'exact') => void;
  splitDetails: { userId: string; value: number }[];
  onSplitDetailsChange: (details: { userId: string; value: number }[]) => void;
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

  const handleSplitTypeChange = async (type: typeof splitType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSplitTypeChange(type);
  };

  const handleValueChange = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updated = splitDetails.map((d) =>
      d.userId === userId ? { ...d, value: numValue } : d
    );
    onSplitDetailsChange(updated);
  };

  const calculatePreview = (userId: string): number => {
    const detail = splitDetails.find((d) => d.userId === userId);
    if (!detail || totalAmount <= 0) return 0;

    switch (splitType) {
      case 'equal':
        return totalAmount / members.length;
      case 'shares': {
        const totalShares = splitDetails.reduce((sum, d) => sum + d.value, 0);
        return totalShares > 0 ? (totalAmount * detail.value) / totalShares : 0;
      }
      case 'percent':
        return (totalAmount * detail.value) / 100;
      case 'exact':
        return detail.value;
      default:
        return 0;
    }
  };

  const getTotalDisplay = (): string => {
    switch (splitType) {
      case 'shares':
        return `${splitDetails.reduce((sum, d) => sum + d.value, 0)} shares`;
      case 'percent': {
        const total = splitDetails.reduce((sum, d) => sum + d.value, 0);
        return `${total.toFixed(1)}% (${total === 100 ? '✓' : '⚠️ Must = 100%'})`;
      }
      case 'exact': {
        const total = splitDetails.reduce((sum, d) => sum + d.value, 0);
        return `₹${total.toFixed(2)} (${Math.abs(total - totalAmount) < 0.01 ? '✓' : '⚠️'})`;
      }
      default:
        return '';
    }
  };

  const splitTypes = [
    { id: 'equal', label: 'Equal', icon: 'pie-chart' },
    { id: 'shares', label: 'Shares', icon: 'donut-large' },
    { id: 'percent', label: 'Percent', icon: 'show-chart' },
    { id: 'exact', label: 'Exact', icon: 'functions' },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Split Type Selector */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <MaterialIcons name="pie-chart" size={18} color={theme.colors.primary} />
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
            Split Method
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeRow}
        >
          {splitTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    splitType === type.id
                      ? theme.colors.primary + '20'
                      : theme.colors.cardBackground,
                  borderColor:
                    splitType === type.id ? theme.colors.primary : theme.colors.cardBorder,
                },
              ]}
              onPress={() => handleSplitTypeChange(type.id)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={type.icon as any}
                size={20}
                color={splitType === type.id ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.typeText,
                  {
                    color:
                      splitType === type.id ? theme.colors.primary : theme.colors.textPrimary,
                  },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Member Split Inputs */}
      {splitType !== 'equal' && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 300 }}
        >
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <MaterialIcons name="group" size={18} color={theme.colors.primary} />
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                Split Details
              </Text>
              <Text style={[styles.totalDisplay, { color: theme.colors.textSecondary }]}>
                {getTotalDisplay()}
              </Text>
            </View>

            {members.map((member) => {
              const preview = calculatePreview(member.userId);
              return (
                <View
                  key={member.userId}
                  style={[
                    styles.memberRow,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.inputBorder,
                    },
                  ]}
                >
                  <Text style={[styles.memberName, { color: theme.colors.textPrimary }]}>
                    {member.userName}
                  </Text>

                  <View style={styles.memberInputGroup}>
                    <TextInput
                      style={[
                        styles.memberInput,
                        {
                          backgroundColor: theme.colors.cardBackground,
                          color: theme.colors.inputText,
                          borderColor: theme.colors.cardBorder,
                        },
                      ]}
                      value={
                        splitDetails
                          .find((d) => d.userId === member.userId)
                          ?.value.toString() || '0'
                      }
                      onChangeText={(val) => handleValueChange(member.userId, val)}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.inputPlaceholder}
                    />
                    <Text style={[styles.memberPreview, { color: theme.colors.textSecondary }]}>
                      = ₹{preview.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </MotiView>
      )}

      {/* Equal Split Preview */}
      {splitType === 'equal' && totalAmount > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <View
            style={[
              styles.equalPreview,
              {
                backgroundColor: theme.colors.success + '15',
                borderColor: theme.colors.success + '40',
              },
            ]}
          >
            <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
            <Text style={[styles.equalPreviewText, { color: theme.colors.success }]}>
              ₹{(totalAmount / members.length).toFixed(2)} per person ({members.length} members)
            </Text>
          </View>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
    flex: 1,
  },
  totalDisplay: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeRow: {
    gap: 10,
    paddingVertical: 4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  memberInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberInput: {
    width: 70,
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
  },
  memberPreview: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
  },
  equalPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  equalPreviewText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
