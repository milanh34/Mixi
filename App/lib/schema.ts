// lib/schema.ts
import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  name: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Timestamp;
  phoneNumber?: string;
  address?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    primaryColor: string;
    fontFamily: string;
    fontWeight: '400' | '500' | '600' | '700';
  };
  stats: {
    totalGroups: number;
    totalExpenses: number;
    totalBalance: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TravelGroup {
  id: string;
  name: string;
  description?: string;
  type: 'trip' | 'project' | 'event' | 'shopping' | 'dayout' | 'household' | 'other';
  adminId: string;
  memberCount: number;
  currency: 'INR';
  photo?: string;
  inviteCode: string;
  totalExpenses: number;
  totalBalance: number;
  lastActivity?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userProfilePicture?: string;
  groupId: string;
  role: 'admin' | 'member';
  netBalance: number;
  joinedAt: Timestamp;
}

export interface ExpenseSplit {
  userId: string;
  share: number;
  percent: number;
  exactAmount: number;
  paidBy: string;
  paid: boolean; // Changed from optional to required
}

export interface GroupExpense {
  id: string;
  groupId: string;
  creatorId: string; // Who actually paid
  loggedById?: string; // Who added it to the app (optional)
  type: 'personal' | 'shared';
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: Timestamp;
  description?: string;
  receiptPhoto?: string;
  splitType: string;
  splitDetails: Array<{
    userId: string;
    share: number;
    percent: number;
    exactAmount: number;
    paid: boolean;
  }>;
  settled: boolean;
  createdAt: Timestamp;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  code: string;
  type: 'qr' | 'link';
  maxUses: number;
  uses: number;
  expiresAt: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
}

export interface GroupTimelineEvent {
  id: string;
  groupId: string;
  creatorId: string;
  type: 'milestone' | 'payment' | 'movement';
  title: string;
  description?: string;
  date: Timestamp;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  photos?: string[];
}

export interface ExpenseLog {
  id: string;
  groupId: string;
  expenseId: string;
  type: 'expense_added' | 'expense_updated' | 'expense_deleted' | 'payment_made' | 'payment_received';
  description: string;
  performedBy: string;
  performedByName: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'expense_added' | 'payment_request' | 'payment_received' | 'group_invite';
  title: string;
  message: string;
  groupId?: string;
  expenseId?: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface NoteContentBlock {
  id: string;
  type: 'text' | 'checklist';
  content: string;
  completed?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  groupId: string;
  creatorId: string;
  lastEditorId: string;
  lastEditorName: string;
  title: string;
  content: string; 
  checklist: ChecklistItem[];
  type: 'personal' | 'shared';
  syncedVersion: number;
  lastEdited: Timestamp;
}

export type Group = TravelGroup;