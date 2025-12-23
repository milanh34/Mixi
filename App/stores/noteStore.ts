// stores/noteStore.ts
import { create } from 'zustand';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Note, ChecklistItem } from '../lib/schema';

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  fetchGroupNotes: (groupId: string) => Promise<void>;
  createNote: (note: Omit<Note, 'id' | 'lastEdited'>) => Promise<void>;
  updateNote: (noteId: string, updates: Partial<Omit<Note, 'id' | 'lastEdited'>>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  fetchGroupNotes: async (groupId: string) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'group_notes'),
        where('groupId', '==', groupId),
        orderBy('lastEdited', 'desc')
      );
      const snap = await getDocs(q);
      const notes = snap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
      console.log('Fetching notes for groupId=', groupId);
      set({ notes, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  createNote: async (noteData) => {
    set({ loading: true, error: null });
    try {
      const ref = doc(collection(db, 'group_notes'));
      const newNote: Note = {
        ...noteData,
        id: ref.id,
        lastEdited: Timestamp.now(),
      };
      await setDoc(ref, newNote);
      set({ notes: [newNote, ...get().notes], loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  updateNote: async (noteId, updates) => {
    set({ loading: true, error: null });
    try {
      const existing = get().notes.find(n => n.id === noteId);
      if (!existing) throw new Error('Note not found');

      const next: Note = {
        ...existing,
        ...updates,
        lastEdited: Timestamp.now(),
        syncedVersion: (existing.syncedVersion || 0) + 1,
      };

      await updateDoc(doc(db, 'group_notes', noteId), {
        ...updates,
        lastEdited: next.lastEdited,
        syncedVersion: next.syncedVersion,
      });

      set({
        notes: get().notes.map(n => (n.id === noteId ? next : n)),
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  deleteNote: async (noteId) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'group_notes', noteId));
      set({
        notes: get().notes.filter(n => n.id !== noteId),
        loading: false,
      });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
}));
