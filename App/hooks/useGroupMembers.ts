// hooks/useGroupMembers.ts - FIXED admin role
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { GroupMember } from "../lib/schema";

export const useGroupMembers = (groupId?: string) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) {
        setMembers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch group document first to get adminId
        const groupDoc = await getDoc(doc(db, "groups", groupId));
        const groupData = groupDoc.data();
        const adminId = groupData?.adminId;

        // Fetch group members
        const membersQuery = query(
          collection(db, "group_members"),
          where("groupId", "==", groupId)
        );
        const membersSnapshot = await getDocs(membersQuery);

        const memberPromises = membersSnapshot.docs.map(async (memberDoc) => {
          const memberData = memberDoc.data() as Omit<
            GroupMember,
            "userName" | "userProfilePicture"
          >;

          // Fetch actual user data
          const userDoc = await getDoc(doc(db, "users", memberData.userId));
          const userData = userDoc.data();

          // FIXED: Admin is ONLY the group adminId, role from group_members is secondary
          const isAdmin = memberData.userId === adminId;
          const role = isAdmin ? "admin" : memberData.role || "member";

          return {
            ...memberData,
            userName: userData?.name || "Unknown User",
            userProfilePicture: userData?.profilePicture || undefined,
            role, // FIXED: Correct role assignment
          } as GroupMember;
        });

        const membersData = await Promise.all(memberPromises);
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching group members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [groupId]);

  return { members, loading };
};
