import { create } from 'zustand';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ExpenseLog } from '../lib/schema';

interface ExpenseLogState {
  logs: ExpenseLog[];
  loading: boolean;
  
  fetchGroupLogs: (groupId: string) => Promise<void>;
  addLog: (log: Omit<ExpenseLog, 'id' | 'createdAt'>) => Promise<void>;
}

export const useExpenseLogStore = create<ExpenseLogState>((set, get) => ({
  logs: [],
  loading: false,

  fetchGroupLogs: async (groupId) => {
    set({ loading: true });
    try {
      const q = query(
        collection(db, 'expense_logs'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ExpenseLog[];

      set({ logs, loading: false });
      console.log('✅ Fetched', logs.length, 'expense logs');
    } catch (error: any) {
      console.error('❌ Fetch logs error:', error);
      set({ loading: false });
    }
  },

  addLog: async (log) => {
    try {
      const logData = {
        ...log,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'expense_logs'), logData);
      
      // Add to local state
      set({
        logs: [{ id: Date.now().toString(), ...logData } as ExpenseLog, ...get().logs],
      });

      console.log('✅ Log added:', log.type);
    } catch (error: any) {
      console.error('❌ Add log error:', error);
    }
  },
}));
