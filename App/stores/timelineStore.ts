import { create } from 'zustand';
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
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GroupTimelineEvent } from '../lib/schema';

interface TimelineState {
  events: GroupTimelineEvent[];
  loading: boolean;
  error: string | null;
  
  fetchGroupTimeline: (groupId: string) => Promise<void>;
  createEvent: (event: Omit<GroupTimelineEvent, 'id'>) => Promise<string>;
  updateEvent: (eventId: string, updates: Partial<GroupTimelineEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  clearError: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  events: [],
  loading: false,
  error: null,

  fetchGroupTimeline: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'group_timeline_events'),
        where('groupId', '==', groupId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupTimelineEvent[];

      set({ events, loading: false });
      console.log('✅ Fetched', events.length, 'timeline events');
    } catch (error: any) {
      console.error('❌ Fetch timeline error:', error);
      set({ error: error.message, loading: false });
    }
  },

  createEvent: async (event) => {
    set({ loading: true, error: null });
    try {
      const docRef = await addDoc(collection(db, 'group_timeline_events'), event);
      
      // Update local state
      set({
        events: [{ id: docRef.id, ...event } as GroupTimelineEvent, ...get().events],
        loading: false,
      });

      console.log('✅ Timeline event created:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('❌ Create event error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateEvent: async (eventId, updates) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, 'group_timeline_events', eventId), updates);
      
      // Update local state
      set({
        events: get().events.map(evt =>
          evt.id === eventId ? { ...evt, ...updates } : evt
        ),
        loading: false,
      });

      console.log('✅ Timeline event updated:', eventId);
    } catch (error: any) {
      console.error('❌ Update event error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'group_timeline_events', eventId));
      
      // Update local state
      set({
        events: get().events.filter(evt => evt.id !== eventId),
        loading: false,
      });

      console.log('✅ Timeline event deleted:', eventId);
    } catch (error: any) {
      console.error('❌ Delete event error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
