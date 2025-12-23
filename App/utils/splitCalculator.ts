// utils/splitCalculator.ts
import { ExpenseSplit } from '../lib/schema';

/**
 * Calculate equal split among all members
 */
export const calculateEqualSplit = (
  totalAmount: number,
  memberIds: string[],
  paidBy: string
): ExpenseSplit[] => {
  if (memberIds.length === 0) {
    throw new Error('At least one member is required');
  }

  const perPerson = totalAmount / memberIds.length;

  return memberIds.map((userId) => ({
    userId,
    share: 1,
    percent: 100 / memberIds.length,
    exactAmount: perPerson,
    paidBy,
    paid: false,
  }));
};

/**
 * Calculate split based on shares (e.g., person A = 2 shares, person B = 1 share)
 */
export const calculateShareSplit = (
  totalAmount: number,
  shares: { userId: string; share: number }[],
  paidBy: string
): ExpenseSplit[] => {
  if (shares.length === 0) {
    throw new Error('At least one share is required');
  }

  const totalShares = shares.reduce((sum, s) => sum + s.share, 0);

  if (totalShares <= 0) {
    throw new Error('Total shares must be greater than 0');
  }

  return shares.map((s) => {
    const percent = (s.share / totalShares) * 100;
    const exactAmount = totalAmount * (s.share / totalShares);

    return {
      userId: s.userId,
      share: s.share,
      percent,
      exactAmount,
      paidBy,
      paid: false,
    };
  });
};

/**
 * Calculate split based on percentages (must sum to 100%)
 */
export const calculatePercentSplit = (
  totalAmount: number,
  percents: { userId: string; percent: number }[],
  paidBy: string
): ExpenseSplit[] => {
  if (percents.length === 0) {
    throw new Error('At least one percent is required');
  }

  const totalPercent = percents.reduce((sum, p) => sum + p.percent, 0);

  // Allow slight rounding tolerance (0.01%)
  if (Math.abs(totalPercent - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100% (current: ${totalPercent.toFixed(2)}%)`);
  }

  return percents.map((p) => {
    const exactAmount = totalAmount * (p.percent / 100);

    return {
      userId: p.userId,
      share: p.percent,
      percent: p.percent,
      exactAmount,
      paidBy,
      paid: false,
    };
  });
};

/**
 * Calculate split with exact amounts per person
 */
export const calculateExactSplit = (
  exactAmounts: { userId: string; amount: number }[],
  paidBy: string
): ExpenseSplit[] => {
  if (exactAmounts.length === 0) {
    throw new Error('At least one exact amount is required');
  }

  const totalAmount = exactAmounts.reduce((sum, e) => sum + e.amount, 0);

  return exactAmounts.map((e) => {
    const percent = totalAmount > 0 ? (e.amount / totalAmount) * 100 : 0;

    return {
      userId: e.userId,
      share: 1,
      percent,
      exactAmount: e.amount,
      paidBy,
      paid: false,
    };
  });
};

/**
 * Validate split totals match the expense amount (within tolerance)
 */
export const validateSplitTotal = (
  splits: ExpenseSplit[],
  expectedTotal: number,
  tolerance: number = 0.01
): boolean => {
  const actualTotal = splits.reduce((sum, s) => sum + s.exactAmount, 0);
  return Math.abs(actualTotal - expectedTotal) <= tolerance;
};

/**
 * Round split amounts to 2 decimal places and adjust for rounding errors
 */
export const adjustSplitsForRounding = (
  splits: ExpenseSplit[],
  totalAmount: number
): ExpenseSplit[] => {
  // Round all amounts
  const roundedSplits = splits.map((s) => ({
    ...s,
    exactAmount: Math.round(s.exactAmount * 100) / 100,
  }));

  // Calculate rounding difference
  const roundedTotal = roundedSplits.reduce((sum, s) => sum + s.exactAmount, 0);
  const difference = totalAmount - roundedTotal;

  // Adjust the first split (typically the payer) for any rounding difference
  if (Math.abs(difference) > 0.001 && roundedSplits.length > 0) {
    roundedSplits[0].exactAmount = Math.round((roundedSplits[0].exactAmount + difference) * 100) / 100;
  }

  return roundedSplits;
};
