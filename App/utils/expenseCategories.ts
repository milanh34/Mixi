// utils/expenseCategories.ts

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'travel', label: 'Travel', icon: 'flight' },
  { id: 'accommodation', label: 'Hotel', icon: 'hotel' },
  { id: 'transport', label: 'Transport', icon: 'directions-car' },
  { id: 'entertainment', label: 'Fun', icon: 'movie' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { id: 'bills', label: 'Bills', icon: 'receipt' },
  { id: 'groceries', label: 'Groceries', icon: 'local-grocery-store' },
  { id: 'health', label: 'Health', icon: 'local-hospital' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'rent', label: 'Rent', icon: 'home' },
  { id: 'utilities', label: 'Utilities', icon: 'power' },
  { id: 'other', label: 'Other', icon: 'more-horiz' },
] as const;

export type ExpenseCategoryId = typeof EXPENSE_CATEGORIES[number]['id'];

export const getCategoryByIdOrDefault = (id: string) => {
  return EXPENSE_CATEGORIES.find(cat => cat.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
};
