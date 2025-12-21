import { ExpenseSplit } from '../lib/schema';

export const calculateEqualSplit = (
  amount: number,
  memberIds: string[],
  paidBy: string
): ExpenseSplit[] => {
  const perPerson = amount / memberIds.length;
  
  return memberIds.map(userId => ({
    userId,
    share: 1,
    percent: 100 / memberIds.length,
    exactAmount: perPerson,
    paidBy,
    owes: userId !== paidBy, // Everyone except payer owes money
  }));
};

export const calculateShareSplit = (
  amount: number,
  shares: { userId: string; share: number }[],
  paidBy: string
): ExpenseSplit[] => {
  const totalShares = shares.reduce((sum, s) => sum + s.share, 0);
  
  return shares.map(({ userId, share }) => ({
    userId,
    share,
    percent: (share / totalShares) * 100,
    exactAmount: (amount * share) / totalShares,
    paidBy,
    owes: userId !== paidBy,
  }));
};

export const calculatePercentSplit = (
  amount: number,
  percents: { userId: string; percent: number }[],
  paidBy: string
): ExpenseSplit[] => {
  return percents.map(({ userId, percent }) => ({
    userId,
    share: percent / 100,
    percent,
    exactAmount: (amount * percent) / 100,
    paidBy,
    owes: userId !== paidBy,
  }));
};

export const calculateExactSplit = (
  amounts: { userId: string; amount: number }[],
  paidBy: string
): ExpenseSplit[] => {
  const totalAmount = amounts.reduce((sum, a) => sum + a.amount, 0);
  
  return amounts.map(({ userId, amount }) => ({
    userId,
    share: amount / totalAmount,
    percent: (amount / totalAmount) * 100,
    exactAmount: amount,
    paidBy,
    owes: userId !== paidBy,
  }));
};
