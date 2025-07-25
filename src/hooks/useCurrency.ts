import { useState, useEffect } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate from USD
}

export const SUPPORTED_CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.12 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 }
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // India
  'IN': 'INR',
  // United States
  'US': 'USD',
  // United Kingdom
  'GB': 'GBP',
  'UK': 'GBP',
  // European Union countries
  'DE': 'EUR', // Germany
  'FR': 'EUR', // France
  'IT': 'EUR', // Italy
  'ES': 'EUR', // Spain
  'NL': 'EUR', // Netherlands
  'BE': 'EUR', // Belgium
  'AT': 'EUR', // Austria
  'PT': 'EUR', // Portugal
  'IE': 'EUR', // Ireland
  'FI': 'EUR', // Finland
  'GR': 'EUR', // Greece
  'LU': 'EUR', // Luxembourg
  'MT': 'EUR', // Malta
  'CY': 'EUR', // Cyprus
  'SK': 'EUR', // Slovakia
  'SI': 'EUR', // Slovenia
  'EE': 'EUR', // Estonia
  'LV': 'EUR', // Latvia
  'LT': 'EUR', // Lithuania
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES.USD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get user's country from IP
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data = await response.json();
        const countryCode = data.country_code;

        console.log('Detected country:', countryCode);

        // Get currency based on country
        const currencyCode = COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
        const detectedCurrency = SUPPORTED_CURRENCIES[currencyCode];

        if (detectedCurrency) {
          setCurrency(detectedCurrency);
          console.log('Currency set to:', detectedCurrency);
        } else {
          // Fallback to USD
          setCurrency(SUPPORTED_CURRENCIES.USD);
          console.log('Fallback to USD');
        }
      } catch (err) {
        console.error('Error detecting currency:', err);
        setError('Failed to detect currency');
        // Fallback to USD on error
        setCurrency(SUPPORTED_CURRENCIES.USD);
      } finally {
        setLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const convertPrice = (usdPrice: number): number => {
    return usdPrice * currency.rate;
  };

  const formatPrice = (usdPrice: number): string => {
    const convertedPrice = convertPrice(usdPrice);
    
    // Format based on currency
    switch (currency.code) {
      case 'INR':
        return `${currency.symbol}${convertedPrice.toFixed(0)}`;
      case 'USD':
        return `${currency.symbol}${convertedPrice.toFixed(2)}`;
      case 'GBP':
        return `${currency.symbol}${convertedPrice.toFixed(2)}`;
      case 'EUR':
        return `${currency.symbol}${convertedPrice.toFixed(2)}`;
      default:
        return `${currency.symbol}${convertedPrice.toFixed(2)}`;
    }
  };

  const changeCurrency = (currencyCode: string) => {
    const newCurrency = SUPPORTED_CURRENCIES[currencyCode];
    if (newCurrency) {
      setCurrency(newCurrency);
      console.log('Currency manually changed to:', newCurrency);
    }
  };

  return {
    currency,
    loading,
    error,
    convertPrice,
    formatPrice,
    changeCurrency,
    supportedCurrencies: SUPPORTED_CURRENCIES
  };
};
