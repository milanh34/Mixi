// stores/expenseLogStore.ts
import { create } from 'zustand';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ExpenseLog, GroupExpense } from '../lib/schema';

interface ExpenseLogState {
  logs: ExpenseLog[];
  loading: boolean;
  error: string | null;

  fetchGroupLogs: (groupId: string, currentUserId: string, expenses: GroupExpense[]) => Promise<void>;
  clearError: () => void;
}

export const useExpenseLogStore = create<ExpenseLogState>((set) => ({
  logs: [],
  loading: false,
  error: null,

  fetchGroupLogs: async (groupId: string, currentUserId: string, expenses: GroupExpense[]) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'expense_logs'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      let logsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ExpenseLog[];

      // Filter out personal expenses that don't belong to current user
      logsData = logsData.filter((log) => {
        const expense = expenses.find((e) => e.id === log.expenseId);
        // Show all shared expenses and user's own personal expenses
        return !expense || expense.type === 'shared' || expense.creatorId === currentUserId;
      });

      set({ logs: logsData, loading: false });
      console.log('✅ Fetched', logsData.length, 'activity logs');
    } catch (error: any) {
      console.error('❌ Fetch logs error:', error);
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
