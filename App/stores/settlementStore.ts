// stores/settlementStore.ts
import { create } from "zustand";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { GroupExpense, ExpenseLog } from "../lib/schema";

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  currency: string;
  settledExpenses: string[];
  settledAt: Timestamp;
  performedBy: string;
}

interface SettlementState {
  settlements: Settlement[];
  loading: boolean;
  error: string | null;

  settleDebts: (
    groupId: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    currency: string,
    expenses: GroupExpense[],
    performedBy: string,
    fromUserName: string,
    toUserName: string
  ) => Promise<void>;

  settleAllDebts: (
    groupId: string,
    currency: string,
    expenses: GroupExpense[],
    performedBy: string,
    performerName: string
  ) => Promise<void>;

  fetchSettlements: (groupId: string) => Promise<void>;
  clearError: () => void;
}

// ✅ MOVED TO TOP - Define getUserName BEFORE using it
const getUserName = async (userId: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().name || "User";
    }
    return "User";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "User";
  }
};

// ✅ NOW create the store
export const useSettlementStore = create<SettlementState>((set, get) => ({
  settlements: [],
  loading: false,
  error: null,

  settleDebts: async (
    groupId,
    fromUserId,
    toUserId,
    amount,
    currency,
    expenses,
    performedBy,
    fromUserName,
    toUserName
  ) => {
    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);
      const settledExpenseIds: string[] = [];

      console.log(`🎯 Settling: ${fromUserName} → ${toUserName} = ₹${amount}`);

      // Find ALL expenses between these two users ONLY
      const expensesBetweenThem = expenses.filter(
        (exp) =>
          exp.type === "shared" &&
          !exp.settled &&
          (exp.creatorId === fromUserId || exp.creatorId === toUserId)
      );

      console.log(
        `📊 Found ${expensesBetweenThem.length} expenses between them`
      );

      // Mark ALL splits between these two users as paid
      for (const expense of expensesBetweenThem) {
        let updatedSplits = [...expense.splitDetails];
        let modified = false;

        if (expense.creatorId === toUserId) {
          // Mark fromUser's split as paid
          const split = expense.splitDetails.find(
            (s) => s.userId === fromUserId
          );
          if (split && !split.paid) {
            updatedSplits = expense.splitDetails.map((s) =>
              s.userId === fromUserId ? { ...s, paid: true } : s
            );
            modified = true;
            console.log(
              `✅ [${expense.title}] ${fromUserName} → ${toUserName}: ₹${split.exactAmount} PAID`
            );
          }
        } else if (expense.creatorId === fromUserId) {
          // Mark toUser's split as paid
          const split = expense.splitDetails.find((s) => s.userId === toUserId);
          if (split && !split.paid) {
            updatedSplits = expense.splitDetails.map((s) =>
              s.userId === toUserId ? { ...s, paid: true } : s
            );
            modified = true;
            console.log(
              `✅ [${expense.title}] ${toUserName} → ${fromUserName}: ₹${split.exactAmount} PAID (reverse)`
            );
          }
        }

        if (modified) {
          const allPaid = updatedSplits.every((s) => s.paid);
          batch.update(doc(db, "group_expenses", expense.id), {
            splitDetails: updatedSplits,
            settled: allPaid,
          });
          settledExpenseIds.push(expense.id);

          const logRef = doc(collection(db, "expense_logs"));
          batch.set(logRef, {
            id: logRef.id,
            groupId,
            expenseId: expense.id,
            type: "payment_made",
            description: `${fromUserName} settled with ${toUserName} for "${expense.title}"`,
            performedBy,
            performedByName: fromUserName,
            createdAt: Timestamp.now(),
          } as ExpenseLog);
        }
      }

      // Create settlement record
      const settlementRef = doc(collection(db, "settlements"));
      batch.set(settlementRef, {
        id: settlementRef.id,
        groupId,
        fromUserId,
        fromUserName,
        toUserId,
        toUserName,
        amount,
        currency,
        settledExpenses: settledExpenseIds,
        settledAt: Timestamp.now(),
        performedBy,
      } as Settlement);

      await batch.commit();

      set({ loading: false });
      console.log(
        `🎉 Successfully settled ALL debts between ${fromUserName} ↔ ${toUserName}`
      );
    } catch (error: any) {
      console.error("❌ Error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  settleAllDebts: async (
    groupId,
    currency,
    expenses,
    performedBy,
    performerName
  ) => {
    set({ loading: true, error: null });
    try {
      const batch = writeBatch(db);

      const unpaidExpenses = expenses.filter(
        (e) => e.type === "shared" && !e.settled
      );

      for (const expense of unpaidExpenses) {
        const allPaidSplits = expense.splitDetails.map((s) => ({
          ...s,
          paid: true,
        }));

        batch.update(doc(db, "group_expenses", expense.id), {
          splitDetails: allPaidSplits,
          settled: true,
        });

        const logRef = doc(collection(db, "expense_logs"));
        batch.set(logRef, {
          id: logRef.id,
          groupId,
          expenseId: expense.id,
          type: "payment_received",
          description: `${performerName} settled all debts for "${expense.title}"`,
          performedBy,
          performedByName: performerName,
          createdAt: Timestamp.now(),
        } as ExpenseLog);
      }

      const settlementRef = doc(collection(db, "settlements"));
      batch.set(settlementRef, {
        id: settlementRef.id,
        groupId,
        fromUserId: performedBy,
        fromUserName: performerName,
        toUserId: "all",
        toUserName: "All Members",
        amount: 0,
        currency,
        settledExpenses: unpaidExpenses.map((e) => e.id),
        settledAt: Timestamp.now(),
        performedBy,
      } as Settlement);

      await batch.commit();
      set({ loading: false });
    } catch (error: any) {
      console.error("❌ Error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchSettlements: async (groupId: string) => {
    try {
      const q = query(
        collection(db, "settlements"),
        where("groupId", "==", groupId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Settlement)
      );
      set({ settlements: data });
    } catch (error) {
      set({ settlements: [] });
    }
  },

  clearError: () => set({ error: null }),
}));
