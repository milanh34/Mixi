// utils/expenseCategories.ts
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'restaurant' },
  { id: 'transport', label: 'Transport', icon: 'directions-car' },
  { id: 'accommodation', label: 'Accommodation', icon: 'hotel' },
  { id: 'entertainment', label: 'Entertainment', icon: 'movie' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-cart' },
  { id: 'groceries', label: 'Groceries', icon: 'local-grocery-store' },
  { id: 'utilities', label: 'Utilities', icon: 'lightbulb' },
  { id: 'health', label: 'Health', icon: 'local-hospital' },
  { id: 'other', label: 'Other', icon: 'receipt' },
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['id'];
