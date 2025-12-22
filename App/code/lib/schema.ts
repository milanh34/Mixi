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

export interface Group {
  id: string;
  name: string;
  photo?: string;
  description?: string;
  adminId: string;
  type: 'trip' | 'project' | 'household' | 'event';
  currency: string;
  memberCount: number;
  totalExpenses: number;
  totalBalance: number;
  lastActivity: Timestamp;
  isPrivate: boolean;
  allowPersonalExpenses: boolean;
  expenseSplitDefault: 'equal' | 'shares' | 'percent' | 'exact';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Timestamp;
  userName: string;
  userProfilePicture?: string;
  receiveNotifications: boolean;
  totalOwedToMe: number;
  totalIOwe: number;
  netBalance: number;
}

export interface GroupExpense {
  id: string;
  groupId: string;
  creatorId: string;
  type: 'personal' | 'shared';
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: Timestamp;
  description?: string;
  receiptPhoto?: string | null;  // FIXED: Made optional with null
  splitType: 'equal' | 'shares' | 'percent' | 'exact';
  splitDetails: ExpenseSplit[];
  settled: boolean;
  createdAt: Timestamp;
}

export interface ExpenseSplit {
  userId: string;
  share: number;
  percent: number;
  exactAmount: number;
  paidBy: string;
  owes: boolean;
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
  photos: string[];
  linkedExpenseId?: string;
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

export interface ExpenseLog {
  id: string;
  groupId: string;
  expenseId?: string;
  type: 'expense_added' | 'expense_updated' | 'expense_deleted' | 'expense_settled' | 'payment_made';
  performedBy: string;
  performedByName: string;
  description: string;
  amount?: number;
  currency?: string;
  createdAt: Timestamp;
}