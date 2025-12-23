// stores/timelineStore.ts
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
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GroupTimelineEvent } from '../lib/schema';

interface TimelineState {
  events: GroupTimelineEvent[];
  loading: boolean;
  error: string | null;

  fetchGroupTimeline: (groupId: string) => Promise<void>;
  createEvent: (event: Omit<GroupTimelineEvent, 'id'>) => Promise<void>;
  clearError: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  events: [],
  loading: false,
  error: null,

  fetchGroupTimeline: async (groupId: string) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'group_timeline_events'),
        where('groupId', '==', groupId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GroupTimelineEvent[];

      set({ events: eventsData, loading: false });
      console.log('✅ Fetched', eventsData.length, 'timeline events');
    } catch (error: any) {
      console.error('❌ Fetch timeline error:', error);
      set({ error: error.message, loading: false });
    }
  },

  createEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      const eventRef = doc(collection(db, 'group_timeline_events'));

      const newEvent: GroupTimelineEvent = {
        ...eventData,
        id: eventRef.id,
      };

      await setDoc(eventRef, newEvent);

      set({
        events: [newEvent, ...get().events],
        loading: false,
      });

      console.log('✅ Timeline event created:', eventRef.id);
    } catch (error: any) {
      console.error('❌ Create timeline event error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
