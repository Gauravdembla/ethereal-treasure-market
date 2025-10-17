// Centralized app configuration with localStorage persistence
// Allows toggling membership discounts and configuring Angel Coins redemption by tier

export type TierKey = 'gold' | 'platinum' | 'diamond' | 'none';

export interface AppConfig {
  // Feature flags
  membershipDiscountEnabled: boolean;
  angelCoinsRedemptionEnabled: boolean;

  // Membership discount percentages (not currently used while disabled)
  membershipDiscounts: Record<TierKey, number>; // as percentage 0..100

  // Angel coins redemption percentages by tier (fraction, e.g. 0.05)
  angelCoinsRedemptionPercent: Record<TierKey, number>; // 0..1

  // Minimum balance required to allow redemption
  minAngelCoinsRequired: number;
}

const DEFAULT_CONFIG: AppConfig = {
  membershipDiscountEnabled: false, // Disabled per request; can enable from admin later
  angelCoinsRedemptionEnabled: true,
  membershipDiscounts: {
    gold: 10,
    platinum: 15,
    diamond: 20,
    none: 0,
  },
  angelCoinsRedemptionPercent: {
    gold: 0.05,
    platinum: 0.10,
    diamond: 0.20,
    none: 0,
  },
  minAngelCoinsRequired: 10000,
};

const STORAGE_KEY = 'AOE_app_config_v1';

function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed,
      membershipDiscounts: { ...DEFAULT_CONFIG.membershipDiscounts, ...(parsed?.membershipDiscounts || {}) },
      angelCoinsRedemptionPercent: { ...DEFAULT_CONFIG.angelCoinsRedemptionPercent, ...(parsed?.angelCoinsRedemptionPercent || {}) },
    } as AppConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(cfg: AppConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

export const appConfig = {
  get(): AppConfig {
    return loadConfig();
  },
  set(partial: Partial<AppConfig>) {
    const next = { ...loadConfig(), ...partial } as AppConfig;
    saveConfig(next);
    return next;
  },
  // Convenience getters
  isMembershipDiscountEnabled(): boolean {
    return loadConfig().membershipDiscountEnabled;
  },
  getMembershipDiscountPercent(tier: TierKey): number {
    return loadConfig().membershipDiscounts[tier] ?? 0;
  },
  isAngelCoinsRedemptionEnabled(): boolean {
    return loadConfig().angelCoinsRedemptionEnabled;
  },
  getAngelCoinsRedemptionPercent(tier: TierKey): number {
    return loadConfig().angelCoinsRedemptionPercent[tier] ?? 0;
  },
  getMinAngelCoinsRequired(): number {
    return loadConfig().minAngelCoinsRequired;
  }
};

export default appConfig;

