import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface AngelCoinsData {
  balance: number;
  exchangeRateINR: number; // 1 Angel Coin = Rs. 0.10
  loading: boolean;
}

export const useAngelCoins = () => {
  const { user, isAuthenticated } = useAuth();
  const [angelCoinsData, setAngelCoinsData] = useState<AngelCoinsData>({
    balance: 0,
    exchangeRateINR: 0.05, // 1 Angel Coin = Rs. 0.05
    loading: true
  });

  useEffect(() => {
    const fetchAngelCoins = async () => {
      if (!isAuthenticated || !user) {
        setAngelCoinsData({
          balance: 0,
          exchangeRateINR: 0.05,
          loading: false
        });
        return;
      }

      try {
        // Get user identifier for localStorage key
        const userId = user.id || user.email || 'default';
        const storageKey = `angelCoins_${userId}`;

        // Check if we have saved balance in localStorage
        const savedBalance = localStorage.getItem(storageKey);
        let balance = 1250; // Default balance

        if (savedBalance !== null) {
          // Use saved balance if available
          balance = parseInt(savedBalance, 10);
          console.log(`Loaded saved Angel Coins balance: ${balance} for user ${userId}`);
        } else {
          // Set default balances for different users (demo)
          if (user.email === 'admin@angelsonearth.com') {
            balance = 5000; // Admin has more coins
          } else if (user.user_metadata?.mobile === '919891324442') {
            balance = 1250; // Demo mobile user
          }

          // Save the default balance to localStorage
          localStorage.setItem(storageKey, balance.toString());
          console.log(`Set default Angel Coins balance: ${balance} for user ${userId}`);
        }

        setAngelCoinsData({
          balance,
          exchangeRateINR: 0.05,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching Angel Coins:', error);
        setAngelCoinsData({
          balance: 0,
          exchangeRateINR: 0.05,
          loading: false
        });
      }
    };

    fetchAngelCoins();
  }, [user, isAuthenticated]);

  const calculateRedemptionValue = (coins: number): number => {
    // 1 Angel Coin = Rs. 0.10
    return coins * angelCoinsData.exchangeRateINR;
  };

  const getMaxRedeemableCoins = (cartTotal: number): number => {
    // Maximum 50% of cart total can be paid with Angel Coins
    const maxRedemptionValue = cartTotal * 0.5;
    const maxCoins = Math.floor(maxRedemptionValue / angelCoinsData.exchangeRateINR);
    return Math.min(maxCoins, angelCoinsData.balance);
  };

  const canRedeem = (coins: number): boolean => {
    return coins > 0 && coins <= angelCoinsData.balance;
  };

  const redeemCoins = async (coins: number): Promise<boolean> => {
    if (!canRedeem(coins) || !user) {
      return false;
    }

    try {
      const newBalance = angelCoinsData.balance - coins;

      // Get user identifier for localStorage key
      const userId = user.id || user.email || 'default';
      const storageKey = `angelCoins_${userId}`;

      // Save to localStorage
      localStorage.setItem(storageKey, newBalance.toString());
      console.log(`Redeemed ${coins} Angel Coins. New balance: ${newBalance} for user ${userId}`);

      // Update state
      setAngelCoinsData(prev => ({
        ...prev,
        balance: newBalance
      }));

      return true;
    } catch (error) {
      console.error('Error redeeming Angel Coins:', error);
      return false;
    }
  };

  const updateBalance = async (newBalance: number): Promise<boolean> => {
    try {
      if (!user) {
        console.error('No user found for updating Angel Coins balance');
        return false;
      }

      // Get user identifier for localStorage key
      const userId = user.id || user.email || 'default';
      const storageKey = `angelCoins_${userId}`;

      // Save to localStorage
      localStorage.setItem(storageKey, newBalance.toString());
      console.log(`Saved Angel Coins balance: ${newBalance} for user ${userId}`);

      // Update state
      setAngelCoinsData(prev => ({
        ...prev,
        balance: newBalance
      }));

      return true;
    } catch (error) {
      console.error('Error updating Angel Coins balance:', error);
      return false;
    }
  };

  const clearAngelCoinsData = () => {
    if (!user) return;

    const userId = user.id || user.email || 'default';
    const storageKey = `angelCoins_${userId}`;
    localStorage.removeItem(storageKey);
    console.log(`Cleared Angel Coins data for user ${userId}`);

    // Reset to default balance
    const defaultBalance = user.email === 'admin@angelsonearth.com' ? 5000 : 1250;
    setAngelCoinsData(prev => ({
      ...prev,
      balance: defaultBalance
    }));
  };

  return {
    angelCoins: angelCoinsData.balance,
    exchangeRateINR: angelCoinsData.exchangeRateINR,
    loading: angelCoinsData.loading,
    calculateRedemptionValue,
    getMaxRedeemableCoins,
    canRedeem,
    redeemCoins,
    updateBalance,
    clearAngelCoinsData
  };
};
