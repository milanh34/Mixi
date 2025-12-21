import { useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useGroupStore } from '../stores/groupStore';
import { Group } from '../lib/schema';

export const useRealTimeGroups = (userId: string | undefined) => {
  const { groups } = useGroupStore();

  useEffect(() => {
    if (!userId) return;

    console.log('🔥 Setting up real-time groups listener for:', userId);

    // Listen to user's group memberships
    const memberQuery = query(
      collection(db, 'group_members'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      memberQuery,
      async (snapshot) => {
        console.log('🔥 Group memberships changed');
        
        const groupIds = snapshot.docs.map(doc => doc.data().groupId);

        if (groupIds.length === 0) {
          useGroupStore.setState({ groups: [] });
          return;
        }

        // Fetch all groups
        const groupsData: Group[] = [];
        for (const groupId of groupIds) {
          const groupDoc = await getDoc(doc(db, 'groups', groupId));
          if (groupDoc.exists()) {
            groupsData.push({ id: groupDoc.id, ...groupDoc.data() } as Group);
          }
        }

        // Sort by last activity
        groupsData.sort((a, b) =>
          b.lastActivity.toMillis() - a.lastActivity.toMillis()
        );

        useGroupStore.setState({ groups: groupsData });
        console.log('✅ Real-time groups updated:', groupsData.length);
      },
      (error) => {
        console.error('❌ Real-time groups error:', error);
      }
    );

    return () => {
      console.log('🔥 Cleaning up groups listener');
      unsubscribe();
    };
  }, [userId]);

  return groups;
};
