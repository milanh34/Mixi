// utils/expenseCategories.ts

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'travel', label: 'Travel', icon: 'flight' },
  { id: 'hotel', label: 'Hotel', icon: 'hotel' },
  { id: 'fun', label: 'Fun/Activity', icon: 'attractions' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { id: 'bills', label: 'Bills', icon: 'receipt-long' },
  { id: 'health', label: 'Health', icon: 'local-hospital' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'groceries', label: 'Groceries', icon: 'local-grocery-store' },
  { id: 'rent', label: 'Rent', icon: 'home' },
  { id: 'utilities', label: 'Utilities', icon: 'power' },
  { id: 'transport', label: 'Transport', icon: 'directions-car' },
  { id: 'entertainment', label: 'Entertainment', icon: 'movie' },
  { id: 'gym', label: 'Gym/Fitness', icon: 'fitness-center' },
  { id: 'fuel', label: 'Fuel', icon: 'local-gas-station' },
  { id: 'maintenance', label: 'Maintenance', icon: 'build' },
  { id: 'insurance', label: 'Insurance', icon: 'security' },
  { id: 'gifts', label: 'Gifts', icon: 'card-giftcard' },
  { id: 'personal', label: 'Personal Care', icon: 'face' },
  { id: 'internet', label: 'Internet/Phone', icon: 'wifi' },
  { id: 'subscription', label: 'Subscriptions', icon: 'subscriptions' },
  { id: 'other', label: 'Other', icon: 'more-horiz' },
] as const;

export type ExpenseCategoryId = typeof EXPENSE_CATEGORIES[number]['id'];

export const getCategoryByIdOrDefault = (id: string) => {
  return EXPENSE_CATEGORIES.find(cat => cat.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
};
