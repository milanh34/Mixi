// stores/expenseStore.ts
import { create } from "zustand";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { GroupExpense } from "../lib/schema";
import { useExpenseLogStore } from "./expenseLogStore";

interface ExpenseState {
  expenses: GroupExpense[];
  loading: boolean;
  error: string | null;

  fetchGroupExpenses: (groupId: string) => Promise<void>;
  createExpense: (
    expense: Omit<GroupExpense, "id" | "createdAt">
  ) => Promise<string>;
  updateExpense: (
    expenseId: string,
    updates: Partial<GroupExpense>
  ) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  fetchPersonalExpenses: (groupId: string, userId: string) => Promise<void>;
  fetchSharedExpenses: (groupId: string) => Promise<void>;
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchGroupExpenses: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, "group_expenses"),
        where("groupId", "==", groupId),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupExpense[];

      set({ expenses, loading: false });
      console.log("✅ Fetched", expenses.length, "expenses");
    } catch (error: any) {
      console.error("❌ Fetch expenses error:", error);
      set({ error: error.message, loading: false });
    }
  },

  createExpense: async (expense) => {
    set({ loading: true, error: null });
    try {
      // Build clean expense data without undefined fields
      const expenseData: Record<string, any> = {
        groupId: expense.groupId,
        creatorId: expense.creatorId,
        type: expense.type,
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        date: expense.date,
        splitType: expense.splitType,
        splitDetails: expense.splitDetails,
        settled: expense.settled,
        createdAt: Timestamp.now(),
      };

      // Add optional fields only if they exist and are not null/undefined
      if (expense.description && expense.description.trim()) {
        expenseData.description = expense.description;
      }

      if (expense.receiptPhoto) {
        expenseData.receiptPhoto = expense.receiptPhoto;
      }

      const docRef = await addDoc(
        collection(db, "group_expenses"),
        expenseData
      );

      useExpenseLogStore.getState().addLog({
        groupId: expense.groupId,
        expenseId: docRef.id,
        type: "expense_added",
        performedBy: expense.creatorId,
        performedByName: "You",
        description: `Added expense: ${expense.title}`,
        amount: expense.amount,
        currency: expense.currency,
      });

      // Update local state
      set({
        expenses: [
          { id: docRef.id, ...expenseData } as GroupExpense,
          ...get().expenses,
        ],
        loading: false,
      });

      console.log("✅ Expense created:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("❌ Create expense error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateExpense: async (expenseId, updates) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, "group_expenses", expenseId), updates);

      // Update local state
      set({
        expenses: get().expenses.map((exp) =>
          exp.id === expenseId ? { ...exp, ...updates } : exp
        ),
        loading: false,
      });

      console.log("✅ Expense updated:", expenseId);
    } catch (error: any) {
      console.error("❌ Update expense error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteExpense: async (expenseId) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, "group_expenses", expenseId));

      // Update local state
      set({
        expenses: get().expenses.filter((exp) => exp.id !== expenseId),
        loading: false,
      });

      console.log("✅ Expense deleted:", expenseId);
    } catch (error: any) {
      console.error("❌ Delete expense error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchPersonalExpenses: async (groupId, userId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, "group_expenses"),
        where("groupId", "==", groupId),
        where("type", "==", "personal"),
        where("creatorId", "==", userId),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupExpense[];

      set({ expenses, loading: false });
      console.log("✅ Fetched", expenses.length, "personal expenses");
    } catch (error: any) {
      console.error("❌ Fetch personal expenses error:", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchSharedExpenses: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, "group_expenses"),
        where("groupId", "==", groupId),
        where("type", "==", "shared"),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(q);
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupExpense[];

      set({ expenses, loading: false });
      console.log("✅ Fetched", expenses.length, "shared expenses");
    } catch (error: any) {
      console.error("❌ Fetch shared expenses error:", error);
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
