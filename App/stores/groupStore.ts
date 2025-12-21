import { create } from "zustand";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Group, GroupMember } from "../lib/schema";

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;

  // Group CRUD
  createGroup: (
    userId: string,
    name: string,
    type: Group["type"],
    currency: string,
    description?: string,
    photo?: string
  ) => Promise<string>;
  fetchUserGroups: (userId: string) => Promise<void>;
  fetchGroup: (groupId: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string, userId: string) => Promise<void>;

  // Member management
  joinGroup: (
    groupId: string,
    userId: string,
    userName: string,
    userPhoto?: string
  ) => Promise<void>;
  leaveGroup: (groupId: string, userId: string) => Promise<void>;

  setCurrentGroup: (group: Group | null) => void;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,

  createGroup: async (userId, name, type, currency, description, photo) => {
    set({ loading: true, error: null });
    try {
      console.log("📝 Creating group with userId:", userId);

      const groupData = {
        name,
        type,
        currency,
        description: description || "",
        photo: photo || "",
        adminId: userId,
        memberCount: 1,
        totalExpenses: 0,
        totalBalance: 0,
        lastActivity: Timestamp.now(),
        isPrivate: false,
        allowPersonalExpenses: true,
        expenseSplitDefault: "equal",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log("📝 Group data:", groupData);

      const groupRef = await addDoc(collection(db, "groups"), groupData);
      console.log("✅ Group doc created:", groupRef.id);

      const groupId = groupRef.id;

      // Update group doc with ID
      await updateDoc(groupRef, { id: groupId });
      console.log("✅ Group doc updated with ID");

      // Add creator as admin member
      const memberData = {
        groupId,
        userId,
        role: "admin",
        joinedAt: Timestamp.now(),
        userName: "You",
        receiveNotifications: true,
        totalOwedToMe: 0,
        totalIOwe: 0,
        netBalance: 0,
      };

      console.log("📝 Creating membership:", memberData);
      await setDoc(
        doc(db, "group_members", `${groupId}_${userId}`),
        memberData
      );
      console.log("✅ Membership created");

      set({ loading: false });
      return groupId;
    } catch (error: any) {
      console.error("❌ Create group error:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchUserGroups: async (userId) => {
    set({ loading: true, error: null });
    try {
      // Get all group memberships for user
      const memberQuery = query(
        collection(db, "group_members"),
        where("userId", "==", userId)
      );
      const memberSnap = await getDocs(memberQuery);
      const groupIds = memberSnap.docs.map((doc) => doc.data().groupId);

      if (groupIds.length === 0) {
        set({ groups: [], loading: false });
        return;
      }

      // Fetch all groups (Firestore 'in' query supports up to 10 items)
      const groupsData: Group[] = [];
      for (const groupId of groupIds) {
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (groupDoc.exists()) {
          groupsData.push({ id: groupDoc.id, ...groupDoc.data() } as Group);
        }
      }

      // Sort by last activity
      groupsData.sort(
        (a, b) => b.lastActivity.toMillis() - a.lastActivity.toMillis()
      );

      set({ groups: groupsData, loading: false });
      console.log("✅ Fetched", groupsData.length, "groups");
    } catch (error: any) {
      console.error("❌ Fetch groups error:", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (groupDoc.exists()) {
        const group = { id: groupDoc.id, ...groupDoc.data() } as Group;
        set({ currentGroup: group, loading: false });
        console.log("✅ Fetched group:", group.name);
      } else {
        throw new Error("Group not found");
      }
    } catch (error: any) {
      console.error("❌ Fetch group error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateGroup: async (groupId, updates) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, "groups", groupId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      // Update local state
      const currentGroup = get().currentGroup;
      if (currentGroup && currentGroup.id === groupId) {
        set({ currentGroup: { ...currentGroup, ...updates } });
      }

      set({ loading: false });
      console.log("✅ Group updated:", groupId);
    } catch (error: any) {
      console.error("❌ Update group error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteGroup: async (groupId, userId) => {
    set({ loading: true, error: null });
    try {
      // Verify user is admin
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (!groupDoc.exists()) throw new Error("Group not found");

      const group = groupDoc.data() as Group;
      if (group.adminId !== userId) {
        throw new Error("Only admin can delete group");
      }

      // Delete group and all related data
      const batch = writeBatch(db);

      // Delete group
      batch.delete(doc(db, "groups", groupId));

      // Delete members
      const membersQuery = query(
        collection(db, "group_members"),
        where("groupId", "==", groupId)
      );
      const membersSnap = await getDocs(membersQuery);
      membersSnap.docs.forEach((memberDoc) => {
        batch.delete(memberDoc.ref);
      });

      await batch.commit();

      // Update local state
      set({
        groups: get().groups.filter((g) => g.id !== groupId),
        currentGroup: null,
        loading: false,
      });

      console.log("✅ Group deleted:", groupId);
    } catch (error: any) {
      console.error("❌ Delete group error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  joinGroup: async (groupId, userId, userName, userPhoto) => {
    set({ loading: true, error: null });
    try {
      // Check if already a member
      const memberDoc = await getDoc(
        doc(db, "group_members", `${groupId}_${userId}`)
      );
      if (memberDoc.exists()) {
        throw new Error("Already a member of this group");
      }

      // Add member
      await setDoc(doc(db, "group_members", `${groupId}_${userId}`), {
        groupId,
        userId,
        role: "member",
        joinedAt: Timestamp.now(),
        userName,
        userProfilePicture: userPhoto || "",
        receiveNotifications: true,
        totalOwedToMe: 0,
        totalIOwe: 0,
        netBalance: 0,
      });

      // Update group member count
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (groupDoc.exists()) {
        const currentCount = groupDoc.data().memberCount || 0;
        await updateDoc(doc(db, "groups", groupId), {
          memberCount: currentCount + 1,
          lastActivity: Timestamp.now(),
        });
      }

      set({ loading: false });
      console.log("✅ Joined group:", groupId);
    } catch (error: any) {
      console.error("❌ Join group error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  leaveGroup: async (groupId, userId) => {
    set({ loading: true, error: null });
    try {
      // Check if user is admin
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (!groupDoc.exists()) throw new Error("Group not found");

      const group = groupDoc.data() as Group;
      if (group.adminId === userId) {
        throw new Error("Admin cannot leave. Transfer admin or delete group.");
      }

      // Remove member
      await deleteDoc(doc(db, "group_members", `${groupId}_${userId}`));

      // Update group member count
      const currentCount = group.memberCount || 0;
      await updateDoc(doc(db, "groups", groupId), {
        memberCount: Math.max(0, currentCount - 1),
        lastActivity: Timestamp.now(),
      });

      // Update local state
      set({
        groups: get().groups.filter((g) => g.id !== groupId),
        loading: false,
      });

      console.log("✅ Left group:", groupId);
    } catch (error: any) {
      console.error("❌ Leave group error:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),
  clearError: () => set({ error: null }),
}));
