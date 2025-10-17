import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import appConfig from '@/services/appConfig';

export interface AngelCoinsData {
  balance: number;
  exchangeRateINR: number; // 1 Angel Coin = Rs. 0.05
  loading: boolean;
}

export const useAngelCoins = () => {
  const { user, externalUser, isAuthenticated, getUserRole } = useAuth();
  const [angelCoinsData, setAngelCoinsData] = useState<AngelCoinsData>({
    balance: 0,
    exchangeRateINR: 0.05, // 1 Angel Coin = Rs. 0.05
    loading: true
  });

  useEffect(() => {
    const fetchAngelCoins = async () => {
      // Wait for auth context to be ready to avoid flicker
      if (!isAuthenticated || (!user && !externalUser)) {
        setAngelCoinsData(prev => ({ ...prev, loading: true }));
        return;
      }

      try {
        // Prefer external auth userId if available
        const extId = localStorage.getItem('AOE_userId');
        const userId = extId || user?.id || user?.email || 'default';
        const storageKey = `angelCoins_${userId}`;

        // Check if we have saved balance in localStorage
        const savedBalance = localStorage.getItem(storageKey);
        let balance = 1250; // Default balance for demo

        if (savedBalance !== null) {
          balance = parseInt(savedBalance, 10);
          console.log(`Loaded saved Angel Coins balance: ${balance} for user ${userId}`);
        } else {
          // Try to get balance from API profile cache first
          try {
            const profileFullStr = localStorage.getItem('AOE_profile_full');
            if (profileFullStr) {
              const profileFull = JSON.parse(profileFullStr);
              if (typeof profileFull.score === 'number') {
                balance = profileFull.score;
                console.log(`Loaded Angel Coins from AOE_profile_full.score: ${balance} for user ${userId}`);
              }
            }
          } catch (error) {
            console.error('Error reading Angel Coins from API data:', error);
          }

          // Save the balance to localStorage
          localStorage.setItem(storageKey, balance.toString());
          console.log(`Set Angel Coins balance: ${balance} for user ${userId}`);
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
  }, [user, externalUser, isAuthenticated]);

  const calculateRedemptionValue = (coins: number): number => {
    return coins * angelCoinsData.exchangeRateINR;
  };

  const calculateGSTBreakdown = (cartTotal: number) => {
    const baseAmount = cartTotal / 1.18;
    const gstAmount = cartTotal - baseAmount;

    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      gstPercentage: 18
    };
  };

  const getTierKey = (): 'gold' | 'platinum' | 'diamond' | 'none' => {
    try {
      const role = getUserRole?.() || 'user';
      // Allow admin override via localStorage key AOE_admin_membership_override
      // Accepts: 'gold' | 'platinum' | 'diamond' | 'none'
      const adminOverride = String(localStorage.getItem('AOE_admin_membership_override') || '').toLowerCase();
      if (role === 'admin' && ['gold','platinum','diamond','none'].includes(adminOverride)) {
        return adminOverride as any;
      }
      const tier = String(localStorage.getItem('AOE_membership_tier') || 'none').toLowerCase();
      if (tier === 'gold' || tier === 'platinum' || tier === 'diamond') return tier;
      return 'none';
    } catch {
      return 'none';
    }
  };

  const getMaxRedeemableCoins = (cartTotal: number): number => {
    const { baseAmount } = calculateGSTBreakdown(cartTotal);
    const tier = getTierKey();
    const percent = appConfig.getAngelCoinsRedemptionPercent(tier);
    const maxRedemptionValue = baseAmount * percent;
    const maxCoins = Math.floor(maxRedemptionValue / angelCoinsData.exchangeRateINR);
    return Math.min(maxCoins, angelCoinsData.balance);
  };

  const getMaxRedemptionValue = (cartTotal: number): number => {
    const { baseAmount } = calculateGSTBreakdown(cartTotal);
    const tier = getTierKey();
    const percent = appConfig.getAngelCoinsRedemptionPercent(tier);
    return baseAmount * percent;
  };

  const canRedeem = (coins: number): boolean => {
    return coins > 0 && coins <= angelCoinsData.balance;
  };

  const redeemCoins = async (coins: number): Promise<boolean> => {
    if (!canRedeem(coins) || (!user && !externalUser)) {
      return false;
    }

    try {
      const newBalance = angelCoinsData.balance - coins;

      const extId = localStorage.getItem('AOE_userId');
      const userId = extId || user?.id || user?.email || 'default';
      const storageKey = `angelCoins_${userId}`;

      localStorage.setItem(storageKey, newBalance.toString());
      console.log(`Redeemed ${coins} Angel Coins. New balance: ${newBalance} for user ${userId}`);

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
      const extId = localStorage.getItem('AOE_userId');
      const userId = extId || user?.id || user?.email || 'default';
      const storageKey = `angelCoins_${userId}`;

      localStorage.setItem(storageKey, newBalance.toString());
      console.log(`Saved Angel Coins balance: ${newBalance} for user ${userId}`);

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
    const extId = localStorage.getItem('AOE_userId');
    const userId = extId || user?.id || user?.email || 'default';
    const storageKey = `angelCoins_${userId}`;
    localStorage.removeItem(storageKey);
    console.log(`Cleared Angel Coins data for user ${userId}`);

    setAngelCoinsData(prev => ({
      ...prev,
      balance: 1250
    }));
  };

  return {
    angelCoins: angelCoinsData.balance,
    exchangeRateINR: angelCoinsData.exchangeRateINR,
    loading: angelCoinsData.loading,
    calculateRedemptionValue,
    getMaxRedeemableCoins,
    getMaxRedemptionValue,
    calculateGSTBreakdown,
    canRedeem,
    redeemCoins,
    updateBalance,
    clearAngelCoinsData,
    getTierKey,
  };
};

export default useAngelCoins;
