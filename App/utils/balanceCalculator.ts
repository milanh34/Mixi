// utils/balanceCalculator.ts
import { GroupExpense, GroupMember } from '../lib/schema';

export const calculateSharedTotal = (
  allExpenses: GroupExpense[]
): number => {
  // FIXED: Only shared expenses total
  const sharedExpenses = allExpenses.filter((e) => e.type === 'shared');
  return sharedExpenses.reduce((sum, e) => sum + e.amount, 0);
};

export const calculateUserTotalSpending = (
  allExpenses: GroupExpense[],
  userId: string
): number => {
  let totalSpending = 0;

  // Personal expenses (full amount)
  const personalExpenses = allExpenses.filter((e) => e.type === 'personal' && e.creatorId === userId);
  totalSpending += personalExpenses.reduce((sum, e) => sum + e.amount, 0);

  // User's share of shared expenses
  const sharedExpenses = allExpenses.filter((e) => e.type === 'shared');
  for (const expense of sharedExpenses) {
    const userSplit = expense.splitDetails.find((s) => s.userId === userId);
    if (userSplit) {
      totalSpending += userSplit.exactAmount;
    }
  }

  return totalSpending;
};

export const calculateRemainingBalance = (
  sharedExpenses: GroupExpense[],
  userId: string
): number => {
  let balance = 0;

  for (const expense of sharedExpenses) {
    const userSplit = expense.splitDetails.find((s) => s.userId === userId);
    if (!userSplit || userSplit.paid) continue; // Skip paid splits

    if (expense.creatorId === userId) {
      // User paid - calculate what others owe them (unpaid only)
      const unpaidFromOthers = expense.splitDetails
        .filter((s) => s.userId !== userId && !s.paid)
        .reduce((sum, s) => sum + s.exactAmount, 0);
      balance += unpaidFromOthers;
    } else {
      // User owes (unpaid)
      balance -= userSplit.exactAmount;
    }
  }

  return balance;
};

export const calculateMemberBalances = (
  sharedExpenses: GroupExpense[],
  members: GroupMember[]
): Array<GroupMember & { balance: number }> => {
  return members.map((member) => {
    const balance = calculateRemainingBalance(sharedExpenses, member.userId);
    return {
      ...member,
      balance,
    };
  });
};

export const calculateUserBalance = (
  sharedExpenses: GroupExpense[],
  userId: string
): number => {
  let balance = 0;

  for (const expense of sharedExpenses) {
    const userSplit = expense.splitDetails.find((s) => s.userId === userId);
    if (!userSplit) continue;

    if (expense.creatorId === userId) {
      balance += expense.amount;
      balance -= userSplit.exactAmount;
    } else {
      balance -= userSplit.exactAmount;
    }
  }

  return balance;
};

export const calculateExpenseBreakdown = (
  expense: GroupExpense,
  currentUserId: string
): {
  userPaid: number;
  userOwes: number;
  userIsOwed: number;
  paidBy: string;
} => {
  const userSplit = expense.splitDetails.find((s) => s.userId === currentUserId);
  const userOwes = userSplit?.exactAmount || 0;

  if (expense.creatorId === currentUserId) {
    return {
      userPaid: expense.amount,
      userOwes: userOwes,
      userIsOwed: expense.amount - userOwes,
      paidBy: currentUserId,
    };
  } else {
    return {
      userPaid: 0,
      userOwes: userOwes,
      userIsOwed: 0,
      paidBy: expense.creatorId,
    };
  }
};

export const getExpenseBalanceText = (
  expense: GroupExpense,
  currentUserId: string
): { text: string; amount: number; isPositive: boolean } => {
  const breakdown = calculateExpenseBreakdown(expense, currentUserId);

  if (expense.creatorId === currentUserId) {
    return {
      text: `You paid ${breakdown.userPaid}, you're owed`,
      amount: breakdown.userIsOwed,
      isPositive: true,
    };
  } else {
    return {
      text: 'You owe',
      amount: breakdown.userOwes,
      isPositive: false,
    };
  }
};

export const calculateBalanceDetails = (
  sharedExpenses: GroupExpense[],
  members: GroupMember[],
  currentUserId: string
): Array<{
  userId: string;
  userName: string;
  userProfilePicture?: string;
  amount: number; // Positive = they owe you, Negative = you owe them
}> => {
  const balanceMap = new Map<string, number>();

  // Initialize all members (except current user)
  members.forEach(member => {
    if (member.userId !== currentUserId) {
      balanceMap.set(member.userId, 0);
    }
  });

  // Calculate balances from shared expenses
  for (const expense of sharedExpenses) {
    if (expense.settled) continue; // Skip settled expenses

    const currentUserSplit = expense.splitDetails.find(s => s.userId === currentUserId);
    if (!currentUserSplit) continue;

    if (expense.creatorId === currentUserId) {
      // Current user paid - calculate what others owe
      expense.splitDetails.forEach(split => {
        if (split.userId !== currentUserId && !split.paid) {
          const current = balanceMap.get(split.userId) || 0;
          balanceMap.set(split.userId, current + split.exactAmount);
        }
      });
    } else {
      // Current user owes the payer
      if (!currentUserSplit.paid) {
        const current = balanceMap.get(expense.creatorId) || 0;
        balanceMap.set(expense.creatorId, current - currentUserSplit.exactAmount);
      }
    }
  }

  // Convert to array with user details
  return Array.from(balanceMap.entries())
    .filter(([_, amount]) => Math.abs(amount) > 0.01) // Filter negligible amounts
    .map(([userId, amount]) => {
      const member = members.find(m => m.userId === userId);
      return {
        userId,
        userName: member?.userName || 'Unknown',
        userProfilePicture: member?.userProfilePicture,
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount); // Sort: highest owed to you first
};