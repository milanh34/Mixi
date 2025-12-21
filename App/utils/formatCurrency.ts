export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
  };

  const symbol = currencySymbols[currency] || currency;
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
};

export const formatBalance = (amount: number, currency: string = 'INR'): string => {
  if (amount === 0) return formatCurrency(0, currency);
  
  const prefix = amount > 0 ? 'owed you ' : 'you owe ';
  return prefix + formatCurrency(Math.abs(amount), currency);
};
