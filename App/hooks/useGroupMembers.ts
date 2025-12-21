import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GroupMember } from '../lib/schema';

export const useGroupMembers = (groupId: string | undefined) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    console.log('🔥 Setting up members listener for group:', groupId);

    const q = query(
      collection(db, 'group_members'),
      where('groupId', '==', groupId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          ...doc.data(),
        })) as GroupMember[];

        setMembers(membersData);
        setLoading(false);
        console.log('✅ Members updated:', membersData.length);
      },
      (error) => {
        console.error('❌ Members listener error:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔥 Cleaning up members listener');
      unsubscribe();
    };
  }, [groupId]);

  return { members, loading };
};
