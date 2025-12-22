export const generateCode = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const calculateSplitAmount = (totalAmount, shares) => {
  const totalShares = shares.reduce((sum, share) => sum + share, 0);
  return shares.map(share => (totalAmount * share) / totalShares);
};

export const validateCurrency = (currency) => {
  return /^[A-Z]{3}$/.test(currency);
};
