// utils/debtSimplifier.ts
import { GroupExpense, GroupMember } from "../lib/schema";

export interface SimplifiedDebt {
  from: string; // userId who owes
  fromName: string;
  fromPhoto?: string;
  to: string; // userId who is owed
  toName: string;
  toPhoto?: string;
  amount: number;
}

/**
 * Simplifies debts using greedy algorithm to minimize transactions
 * Example: A owes B $50, B owes C $30 → A owes C $30, A owes B $20
 */
export const simplifyDebts = (
  expenses: GroupExpense[],
  members: GroupMember[]
): SimplifiedDebt[] => {
  // Step 1: Calculate net balance for each person
  const balances = new Map<string, number>();

  // Initialize all members
  members.forEach((member) => {
    balances.set(member.userId, 0);
  });

  // Calculate net balances from unpaid expenses
  for (const expense of expenses) {
    if (expense.settled || expense.type !== "shared") continue;

    expense.splitDetails.forEach((split) => {
      if (!split.paid) {
        const current = balances.get(split.userId) || 0;

        if (split.userId === expense.creatorId) {
          // This person paid - they are owed by others
          const totalOwed = expense.splitDetails
            .filter((s) => s.userId !== expense.creatorId && !s.paid)
            .reduce((sum, s) => sum + s.exactAmount, 0);
          balances.set(split.userId, current + totalOwed);
        } else {
          // This person owes the payer
          balances.set(split.userId, current - split.exactAmount);
        }
      }
    });
  }

  console.log("💰 Net balances:", Array.from(balances.entries()));

  // Step 2: Separate into debtors and creditors
  const debtors: Array<{ userId: string; amount: number }> = [];
  const creditors: Array<{ userId: string; amount: number }> = [];

  balances.forEach((balance, userId) => {
    if (balance < -0.01) {
      // Owes money
      debtors.push({ userId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      // Is owed money
      creditors.push({ userId, amount: balance });
    }
  });

  console.log("🔴 Debtors:", debtors);
  console.log("🟢 Creditors:", creditors);

  // Step 3: Greedy algorithm - match largest debtor with largest creditor
  const simplifiedDebts: SimplifiedDebt[] = [];

  // Sort by amount descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    if (settleAmount > 0.01) {
      const debtorMember = members.find((m) => m.userId === debtor.userId);
      const creditorMember = members.find((m) => m.userId === creditor.userId);

      simplifiedDebts.push({
        from: debtor.userId,
        fromName: debtorMember?.userName || "Unknown",
        fromPhoto: debtorMember?.userProfilePicture,
        to: creditor.userId,
        toName: creditorMember?.userName || "Unknown",
        toPhoto: creditorMember?.userProfilePicture,
        amount: settleAmount,
      });

      console.log(
        "➡️ Simplified:",
        debtorMember?.userName,
        "→",
        creditorMember?.userName,
        "=",
        settleAmount
      );

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;
    }

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return simplifiedDebts;
};

/**
 * Get detailed debts (who owes whom from actual expenses)
 */
export const getDetailedDebts = (
  expenses: GroupExpense[],
  members: GroupMember[]
): Array<{
  expenseId: string;
  expenseTitle: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}> => {
  const debts: Array<{
    expenseId: string;
    expenseTitle: string;
    from: string;
    fromName: string;
    to: string;
    toName: string;
    amount: number;
  }> = [];

  for (const expense of expenses) {
    if (expense.settled || expense.type !== "shared") continue;

    expense.splitDetails.forEach((split) => {
      if (!split.paid && split.userId !== expense.creatorId) {
        const debtor = members.find((m) => m.userId === split.userId);
        const creditor = members.find((m) => m.userId === expense.creatorId);

        debts.push({
          expenseId: expense.id,
          expenseTitle: expense.title,
          from: split.userId,
          fromName: debtor?.userName || "Unknown",
          to: expense.creatorId,
          toName: creditor?.userName || "Unknown",
          amount: split.exactAmount,
        });
      }
    });
  }

  return debts;
};

export const getNetDebts = (
  expenses: GroupExpense[],
  members: GroupMember[]
): SimplifiedDebt[] => {
  const netDebts: SimplifiedDebt[] = [];

  // Compare each pair of members
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const user1 = members[i];
      const user2 = members[j];

      let user1OwesUser2 = 0;
      let user2OwesUser1 = 0;

      // Calculate debts between this pair
      for (const expense of expenses) {
        if (expense.settled || expense.type !== 'shared') continue;

        // If user2 paid, check if user1 owes
        if (expense.creatorId === user2.userId) {
          const split = expense.splitDetails.find((s) => s.userId === user1.userId);
          if (split && !split.paid) {
            user1OwesUser2 += split.exactAmount;
          }
        }

        // If user1 paid, check if user2 owes
        if (expense.creatorId === user1.userId) {
          const split = expense.splitDetails.find((s) => s.userId === user2.userId);
          if (split && !split.paid) {
            user2OwesUser1 += split.exactAmount;
          }
        }
      }

      // Calculate net
      const netAmount = user1OwesUser2 - user2OwesUser1;

      if (Math.abs(netAmount) > 0.01) {
        if (netAmount > 0) {
          // user1 owes user2
          netDebts.push({
            from: user1.userId,
            fromName: user1.userName,
            fromPhoto: user1.userProfilePicture,
            to: user2.userId,
            toName: user2.userName,
            toPhoto: user2.userProfilePicture,
            amount: netAmount,
          });
        } else {
          // user2 owes user1
          netDebts.push({
            from: user2.userId,
            fromName: user2.userName,
            fromPhoto: user2.userProfilePicture,
            to: user1.userId,
            toName: user1.userName,
            toPhoto: user1.userProfilePicture,
            amount: Math.abs(netAmount),
          });
        }
      }
    }
  }

  return netDebts;
};