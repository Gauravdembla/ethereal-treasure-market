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
    exchangeRateINR: 0.10, // 1 Angel Coin = Rs. 0.10
    loading: true
  });

  useEffect(() => {
    const fetchAngelCoins = async () => {
      if (!isAuthenticated || !user) {
        setAngelCoinsData({
          balance: 0,
          exchangeRateINR: 0.10,
          loading: false
        });
        return;
      }

      try {
        // In a real app, this would fetch from the database
        // For now, using demo data based on user
        let balance = 1250; // Default balance

        // Different balances for different users (demo)
        if (user.email === 'admin@angelsonearth.com') {
          balance = 5000; // Admin has more coins
        } else if (user.user_metadata?.mobile === '919891324442') {
          balance = 1250; // Demo mobile user
        }

        setAngelCoinsData({
          balance,
          exchangeRateINR: 0.10,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching Angel Coins:', error);
        setAngelCoinsData({
          balance: 0,
          exchangeRateINR: 0.10,
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
    if (!canRedeem(coins)) {
      return false;
    }

    try {
      // In a real app, this would update the database
      setAngelCoinsData(prev => ({
        ...prev,
        balance: prev.balance - coins
      }));
      return true;
    } catch (error) {
      console.error('Error redeeming Angel Coins:', error);
      return false;
    }
  };

  return {
    angelCoins: angelCoinsData.balance,
    exchangeRateINR: angelCoinsData.exchangeRateINR,
    loading: angelCoinsData.loading,
    calculateRedemptionValue,
    getMaxRedeemableCoins,
    canRedeem,
    redeemCoins
  };
};
