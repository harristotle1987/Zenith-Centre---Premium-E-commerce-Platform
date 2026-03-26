export type Currency = 'NGN' | 'USD';

export const EXCHANGE_RATE = 1500; // 1 USD = 1500 NGN

export const formatPrice = (priceInNaira: number, currency: Currency, exchangeRate: number = EXCHANGE_RATE): string => {
  if (currency === 'USD') {
    const priceInUSD = priceInNaira / exchangeRate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(priceInUSD);
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInNaira);
};
