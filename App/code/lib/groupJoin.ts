// lib/groupJoin.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { GroupInvite } from './schema';

export const joinGroupByCode = async (
  code: string,
  userId: string,
  userName: string
): Promise<{ groupId: string; groupName: string }> => {
  try {
    // Find invite by code
    const invitesRef = collection(db, 'group_invites');
    const q = query(invitesRef, where('code', '==', code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Invalid group code');
    }

    const inviteDoc = snapshot.docs[0];
    const invite = inviteDoc.data() as GroupInvite;

    // Check if invite is still valid
    if (invite.expiresAt.toMillis() < Date.now()) {
      throw new Error('This invite has expired');
    }

    if (invite.uses >= invite.maxUses) {
      throw new Error('This invite has reached its usage limit');
    }

    // Get group details
    const groupDoc = await getDoc(doc(db, 'groups', invite.groupId));
    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();

    // Check if user is already a member
    const memberDoc = await getDoc(
      doc(db, 'group_members', `${invite.groupId}_${userId}`)
    );
    if (memberDoc.exists()) {
      throw new Error('You are already a member of this group');
    }

    // Add user as member
    await setDoc(doc(db, 'group_members', `${invite.groupId}_${userId}`), {
      groupId: invite.groupId,
      userId,
      role: 'member',
      joinedAt: Timestamp.now(),
      userName,
      receiveNotifications: true,
      totalOwedToMe: 0,
      totalIOwe: 0,
      netBalance: 0,
    });

    // Update group member count
    await updateDoc(doc(db, 'groups', invite.groupId), {
      memberCount: increment(1),
      lastActivity: Timestamp.now(),
    });

    // Update invite uses
    await updateDoc(doc(db, 'group_invites', inviteDoc.id), {
      uses: increment(1),
    });

    console.log('✅ User joined group:', invite.groupId);

    return {
      groupId: invite.groupId,
      groupName: groupData.name,
    };
  } catch (error: any) {
    console.error('❌ Join group error:', error);
    throw error;
  }
};

export const generateGroupInvite = async (
  groupId: string,
  createdBy: string,
  type: 'qr' | 'link' = 'link',
  maxUses: number = 10,
  expiresInHours: number = 24
): Promise<GroupInvite> => {
  try {
    // Generate unique code
    const code = `MIXI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    );

    const invite: Omit<GroupInvite, 'id'> = {
      groupId,
      code,
      type,
      maxUses,
      uses: 0,
      expiresAt,
      createdBy,
      createdAt: Timestamp.now(),
    };

    const docRef = await setDoc(doc(collection(db, 'group_invites')), invite);
    
    console.log('✅ Invite created:', code);

    return {
      id: code,
      ...invite,
    };
  } catch (error: any) {
    console.error('❌ Generate invite error:', error);
    throw error;
  }
};
