// stores/expenseStore.ts
import { create } from 'zustand';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GroupExpense, ExpenseLog } from '../lib/schema';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatCurrency';

interface ExpenseState {
  expenses: GroupExpense[];
  loading: boolean;
  error: string | null;

  fetchGroupExpenses: (groupId: string) => Promise<void>;
  createExpense: (expense: Omit<GroupExpense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (expenseId: string, groupId: string, updates: Partial<GroupExpense>, userId: string) => Promise<void>;
  deleteExpense: (expenseId: string, groupId: string, userId: string) => Promise<void>;
  markAsPaid: (expenseId: string, groupId: string, userId: string) => Promise<void>;
  markAsReceived: (expenseId: string, groupId: string, userId: string) => Promise<void>;
  clearError: () => void;
}

const getUserName = async (userId: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().name || 'User';
    }
    return 'User';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'User';
  }
};

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchGroupExpenses: async (groupId: string) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'group_expenses'),
        where('groupId', '==', groupId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const expensesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupExpense[];

      set({ expenses: expensesData, loading: false });
      console.log('✅ Fetched', expensesData.length, 'expenses');
    } catch (error: any) {
      console.error('❌ Fetch expenses error:', error);
      set({ error: error.message, loading: false });
    }
  },

  createExpense: async (expenseData: any) => { // FIXED: Allow loggedById
  set({ loading: true, error: null });
  try {
    const expenseRef = doc(collection(db, 'group_expenses')); // FIXED: Define logRef properly

    const newExpense: GroupExpense = {
      ...expenseData,
      id: expenseRef.id,
      createdAt: Timestamp.now(),
    };

    await setDoc(expenseRef, newExpense);

    const userName = await getUserName(expenseData.creatorId);
    const loggedByName = expenseData.loggedById 
      ? await getUserName(expenseData.loggedById) 
      : userName;

    // FIXED: Proper log description with "on behalf of"
    const logDescription = expenseData.loggedById && expenseData.loggedById !== expenseData.creatorId
      ? `${loggedByName} added expense on behalf of ${userName}: "${expenseData.title}" (${formatCurrency(expenseData.amount, expenseData.currency)})`
      : `${userName} added expense: "${expenseData.title}" (${formatCurrency(expenseData.amount, expenseData.currency)})`; // FIXED: Added logRef

    const logRef = doc(collection(db, 'expense_logs'));
    const log: ExpenseLog = {
      id: logRef.id,
      groupId: expenseData.groupId,
      expenseId: expenseRef.id,
      type: 'expense_added',
      description: logDescription,
      performedBy: expenseData.loggedById || expenseData.creatorId,
      performedByName: loggedByName,
      createdAt: Timestamp.now(),
    };
    await setDoc(logRef, log);

      if (expenseData.type === 'shared') {
        const timelineRef = doc(collection(db, 'group_timeline_events'));
        await setDoc(timelineRef, {
          id: timelineRef.id,
          groupId: expenseData.groupId,
          creatorId: expenseData.creatorId,
          type: 'payment',
          title: expenseData.title,
          description: `Expense of ${expenseData.amount} ${expenseData.currency}`,
          date: Timestamp.now(),
          photos: expenseData.receiptPhoto ? [expenseData.receiptPhoto] : [],
        });
      }

      set({
        expenses: [newExpense, ...get().expenses],
        loading: false,
      });

      console.log('✅ Expense created:', expenseRef.id);
    } catch (error: any) {
      console.error('❌ Create expense error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateExpense: async (expenseId, groupId, updates, userId) => {
    set({ loading: true, error: null });
    try {
      const oldExpense = get().expenses.find((e) => e.id === expenseId);
      if (!oldExpense) throw new Error('Expense not found');

      await updateDoc(doc(db, 'group_expenses', expenseId), updates);

      const userName = await getUserName(userId);
      
      // Build detailed change description
      let changes: string[] = [];
      if (updates.title && updates.title !== oldExpense.title) {
        changes.push(`title from "${oldExpense.title}" to "${updates.title}"`);
      }
      if (updates.amount && updates.amount !== oldExpense.amount) {
        changes.push(`amount from ${formatCurrency(oldExpense.amount, oldExpense.currency)} to ${formatCurrency(updates.amount, oldExpense.currency)}`);
      }
      if (updates.date && updates.date.toMillis() !== oldExpense.date.toMillis()) {
        changes.push(`date from ${format(oldExpense.date.toDate(), 'MMM dd, yyyy')} to ${format((updates.date as Timestamp).toDate(), 'MMM dd, yyyy')}`);
      }
      if (updates.category && updates.category !== oldExpense.category) {
        changes.push(`category`);
      }
      if (updates.splitDetails) {
        changes.push(`split details`);
      }

      const changeDescription = changes.length > 0 ? changes.join(', ') : 'details';

      const logRef = doc(collection(db, 'expense_logs'));
      const log: ExpenseLog = {
        id: logRef.id,
        groupId: groupId,
        expenseId: expenseId,
        type: 'expense_updated',
        description: `${userName} updated expense "${oldExpense.title}": changed ${changeDescription}`,
        performedBy: userId,
        performedByName: userName,
        createdAt: Timestamp.now(),
      };
      await setDoc(logRef, log);

      set({
        expenses: get().expenses.map((e) =>
          e.id === expenseId ? { ...e, ...updates } : e
        ),
        loading: false,
      });

      console.log('✅ Expense updated:', expenseId);
    } catch (error: any) {
      console.error('❌ Update expense error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteExpense: async (expenseId, groupId, userId) => {
    set({ loading: true, error: null });
    try {
      const expense = get().expenses.find((e) => e.id === expenseId);
      if (!expense) throw new Error('Expense not found');

      await deleteDoc(doc(db, 'group_expenses', expenseId));

      const userName = await getUserName(userId);

      const logRef = doc(collection(db, 'expense_logs'));
      const log: ExpenseLog = {
        id: logRef.id,
        groupId: groupId,
        expenseId: expenseId,
        type: 'expense_deleted',
        description: `${userName} deleted expense: "${expense.title}" (${expense.amount} ${expense.currency})`,
        performedBy: userId,
        performedByName: userName,
        createdAt: Timestamp.now(),
      };
      await setDoc(logRef, log);

      set({
        expenses: get().expenses.filter((e) => e.id !== expenseId),
        loading: false,
      });

      console.log('✅ Expense deleted:', expenseId);
    } catch (error: any) {
      console.error('❌ Delete expense error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  markAsPaid: async (expenseId: string, groupId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const expense = get().expenses.find((e) => e.id === expenseId);
      if (!expense) throw new Error('Expense not found');

      const userSplit = expense.splitDetails.find((s) => s.userId === userId);
      if (!userSplit) throw new Error('User not part of this expense');

      const updatedSplitDetails = expense.splitDetails.map((split) =>
        split.userId === userId ? { ...split, paid: true } : split
      );

      const allPaid = updatedSplitDetails.every((s) => s.paid === true);

      await updateDoc(doc(db, 'group_expenses', expenseId), {
        splitDetails: updatedSplitDetails,
        settled: allPaid,
      });

      const userName = await getUserName(userId);
      const payerName = await getUserName(expense.creatorId);
      const timestamp = new Date();

      const logRef = doc(collection(db, 'expense_logs'));
      const log: ExpenseLog = {
        id: logRef.id,
        groupId: groupId,
        expenseId: expenseId,
        type: 'payment_made',
        description: `${userName} paid ${payerName} ${formatCurrency(userSplit.exactAmount, expense.currency)} for "${expense.title}" on ${format(timestamp, 'MMM dd, yyyy')} at ${format(timestamp, 'hh:mm:ss a')}`,
        performedBy: userId,
        performedByName: userName,
        createdAt: Timestamp.now(),
      };
      await setDoc(logRef, log);

      set({
        expenses: get().expenses.map((e) =>
          e.id === expenseId
            ? { ...e, splitDetails: updatedSplitDetails, settled: allPaid }
            : e
        ),
        loading: false,
      });

      console.log('✅ Marked as paid:', expenseId);
    } catch (error: any) {
      console.error('❌ Mark as paid error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  markAsReceived: async (expenseId: string, groupId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const expense = get().expenses.find((e) => e.id === expenseId);
      if (!expense) throw new Error('Expense not found');

      if (expense.creatorId !== userId) {
        throw new Error('Only the payer can mark as received');
      }

      const updatedSplitDetails = expense.splitDetails.map((split) => ({
        ...split,
        paid: true,
      }));

      await updateDoc(doc(db, 'group_expenses', expenseId), {
        splitDetails: updatedSplitDetails,
        settled: true,
      });

      const userName = await getUserName(userId);

      const logRef = doc(collection(db, 'expense_logs'));
      const log: ExpenseLog = {
        id: logRef.id,
        groupId: groupId,
        expenseId: expenseId,
        type: 'payment_received',
        description: `${userName} confirmed payment received for "${expense.title}"`,
        performedBy: userId,
        performedByName: userName,
        createdAt: Timestamp.now(),
      };
      await setDoc(logRef, log);

      set({
        expenses: get().expenses.map((e) =>
          e.id === expenseId
            ? { ...e, splitDetails: updatedSplitDetails, settled: true }
            : e
        ),
        loading: false,
      });

      console.log('✅ Marked as received:', expenseId);
    } catch (error: any) {
      console.error('❌ Mark as received error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
