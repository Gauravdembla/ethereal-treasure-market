// External Authentication Service
// Integrates with the external authentication system via Worker API

import { customerService } from './customerService';

export interface ExternalUserData {
  name: string;
  pic: string;
  membership_tier: 'diamond' | 'platinum' | 'gold' | 'none';
  profile_full: any;
  userId?: string;
}

export interface MembershipTier {
  name: string;
  level: number;
  color: string;
  benefits: string[];
  discount: number; // Percentage discount
}

export const MEMBERSHIP_TIERS: Record<string, MembershipTier> = {
  diamond: {
    name: 'Diamond',
    level: 3,
    color: 'bg-gradient-to-r from-blue-400 to-purple-500',
    benefits: ['Free shipping', '20% discount', 'Priority support', 'Exclusive products'],
    discount: 20
  },
  platinum: {
    name: 'Platinum',
    level: 2,
    color: 'bg-gradient-to-r from-gray-400 to-gray-600',
    benefits: ['Free shipping', '15% discount', 'Priority support'],
    discount: 15
  },
  gold: {
    name: 'Gold',
    level: 1,
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    benefits: ['10% discount', 'Member support'],
    discount: 10
  },
  none: {
    name: 'No Membership',
    level: 0,
    color: 'bg-gradient-to-r from-rose-500 to-red-600',
    benefits: ['Standard support'],
    discount: 0
  }
};

class ExternalAuthService {
  private readonly WORKER_API_URL = 'https://twilight-silence-539c.connect-17d.workers.dev/api/aoe-profile';
  private readonly STORAGE_KEYS = {
    NAME: 'AOE_name',
    PIC: 'AOE_pic',
    MEMBERSHIP_TIER: 'AOE_membership_tier',
    PROFILE_FULL: 'AOE_profile_full',
    USER_ID: 'AOE_userId'
  };

  // Admin user ID for strict access control
  private readonly ADMIN_USER_ID = '66f1851e9b5fc4e6c571a7ab';

  // Extract userId from URL parameters or JWT tokens
  private extractUserId(): string | null {
    try {
      // Check URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const userIdFromUrl = urlParams.get('userId') || urlParams.get('user');
      
      if (userIdFromUrl) {
        return userIdFromUrl;
      }

      // Check for JWT token in localStorage or sessionStorage
      const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
      if (token) {
        // Simple JWT decode (for userId extraction)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || payload.id;
      }

      // Check for stored userId
      return localStorage.getItem(this.STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Error extracting userId:', error);
      return null;
    }
  }

  // Fetch user data from Worker API with proper data extraction
  async fetchUserData(userId?: string): Promise<ExternalUserData | null> {
    try {
      const targetUserId = userId || this.extractUserId();

      if (!targetUserId) {
        console.log('No userId found, user not authenticated externally');
        return null;
      }

      console.log(`Fetching user data for userId: ${targetUserId}`);

      const response = await fetch(`${this.WORKER_API_URL}?userId=${targetUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);

      // Extract data according to the specified structure
      if (!apiResponse.result || !apiResponse.result.userProfile) {
        throw new Error('Invalid API response structure');
      }

      const userProfile = apiResponse.result.userProfile;
      const subs = Array.isArray(apiResponse.result.subs) ? apiResponse.result.subs : [];

      // Extract data using the exact mapping specified
      const extractedData = {
        name: userProfile.name || 'User',
        email: userProfile.email || '',
        phone: (userProfile.countryCode || '') + (userProfile.phone || ''),
        profilePic: userProfile.profilePicUrl || '',
        angelCoins: typeof userProfile.score === 'number' ? userProfile.score : 0,
        badges: userProfile.badges || [],
        subs,
        userProfile: userProfile // Store full profile
      };

      // Determine membership tier with priority: Active Subs > Badges > none
      const membershipTier = this.extractMembershipTier(extractedData.badges, extractedData.subs);

      // Store data in localStorage
      this.storeUserData(extractedData, targetUserId, membershipTier);

      // Sync data to MongoDB backend
      try {
        await customerService.syncCustomer(targetUserId, {
          name: extractedData.name,
          email: extractedData.email,
          phone: extractedData.phone,
          countryCode: userProfile.countryCode || '+91',
          profilePicUrl: extractedData.profilePic,
          angelCoins: extractedData.angelCoins,
          leaderboardRank: userProfile.leaderboardRank,
          membershipTier: membershipTier,
          badges: extractedData.badges,
          subscriptions: extractedData.subs,
          onboarding: userProfile.onboarding,
          isBlockedFromCommunityEngagement: userProfile.isBlockedFromCommunityEngagement || false,
        });
        console.log(`[ExternalAuth] Customer data synced to MongoDB for userId: ${targetUserId}`);
      } catch (syncError) {
        console.error('[ExternalAuth] Failed to sync customer to MongoDB:', syncError);
        // Don't fail the auth flow if MongoDB sync fails
      }

      return {
        name: extractedData.name,
        pic: extractedData.profilePic,
        membership_tier: membershipTier,
        profile_full: extractedData.userProfile,
        userId: targetUserId
      };
    } catch (error) {
      console.error('Error fetching user data from Worker API:', error);

      // Fallback to localStorage data
      return this.getUserDataFromStorage();
    }
  }

  // Determine membership tier using strict chain rules with DESCRIPTION-ONLY matching:
  // - Detect only if mango.description contains "{tier} membership" (case-insensitive)
  // - Status mapping: active -> active, halted -> inactive, others -> inactive
  // - Gold must be ACTIVE to consider Platinum; Platinum must be ACTIVE to consider Diamond
  private extractMembershipTier(badges: any[], subs: any[]): 'diamond' | 'platinum' | 'gold' | 'none' {
    const normalize = (v: any) => String(v || '').toLowerCase();

    if (Array.isArray(subs) && subs.length > 0) {
      // Order-independent scan: prefer any ACTIVE entry for each tier; use description-only rule
      const scanTier = (tier: 'gold' | 'platinum' | 'diamond') => {
        const needle = `${tier} membership`;
        let present = false;
        let active = false;
        for (const s of subs) {
          const status = normalize(s?.status);
          const desc = normalize(s?.mango?.description);
          if (!desc || !desc.includes(needle)) continue;
          present = true;
          if (status === 'active') active = true;
        }
        return { present, active } as const;
      };

      const gold = scanTier('gold');
      if (!gold.present || !gold.active) {
        return 'none';
      }

      const platinum = scanTier('platinum');
      if (!platinum.present || !platinum.active) {
        return 'gold';
      }

      const diamond = scanTier('diamond');
      if (diamond.present && diamond.active) return 'diamond';
      return 'platinum';
    }

    // If subs unavailable, fallback to badges (legacy heuristic)
    if (Array.isArray(badges)) {
      const tierPriority = ['diamond', 'platinum', 'gold'];
      for (const tier of tierPriority) {
        const found = badges.find(
          (badge) => badge && badge.name && String(badge.name).toLowerCase().includes(tier)
        );
        if (found) return tier as 'diamond' | 'platinum' | 'gold';
      }
    }

    return 'none';
  }

  // Store user data in localStorage with exact key naming
  private storeUserData(data: any, userId: string, membershipTier: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.NAME, data.name || '');
      localStorage.setItem(this.STORAGE_KEYS.PIC, data.profilePic || '');
      // Respect manual override by admin (AOE_membership_manual) and do not overwrite
      const manual = localStorage.getItem('AOE_membership_manual') === 'true';
      if (!manual) {
        localStorage.setItem(this.STORAGE_KEYS.MEMBERSHIP_TIER, membershipTier);
      }
      localStorage.setItem(this.STORAGE_KEYS.PROFILE_FULL, JSON.stringify(data.userProfile));
      localStorage.setItem(this.STORAGE_KEYS.USER_ID, userId);

      console.log('Stored user data in localStorage:', {
        name: data.name,
        pic: data.profilePic,
        membershipTier: manual ? '(manual override active)' : membershipTier,
        userId
      });
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  // Get user data from localStorage
  getUserDataFromStorage(): ExternalUserData | null {
    try {
      const name = localStorage.getItem(this.STORAGE_KEYS.NAME);
      const pic = localStorage.getItem(this.STORAGE_KEYS.PIC);
      const membershipTier = localStorage.getItem(this.STORAGE_KEYS.MEMBERSHIP_TIER);
      const profileFull = localStorage.getItem(this.STORAGE_KEYS.PROFILE_FULL);
      const userId = localStorage.getItem(this.STORAGE_KEYS.USER_ID);

      if (!name) {
        return null; // No user data available
      }

      return {
        name,
        pic: pic || '',
        membership_tier: this.normalizeMembershipTier(membershipTier),
        profile_full: profileFull ? JSON.parse(profileFull) : {},
        userId: userId || undefined
      };
    } catch (error) {
      console.error('Error reading user data from storage:', error);
      return null;
    }
  }

  // Normalize membership tier to ensure valid values
  private normalizeMembershipTier(tier: string | null): 'diamond' | 'platinum' | 'gold' | 'none' {
    if (!tier) return 'none';

    // Respect admin manual override flag; read current stored tier directly without normalization change
    const manual = localStorage.getItem('AOE_membership_manual') === 'true';
    if (manual) {
      const current = (localStorage.getItem(this.STORAGE_KEYS.MEMBERSHIP_TIER) || 'none').toLowerCase().trim();
      if (['diamond', 'platinum', 'gold', 'none'].includes(current)) {
        return current as 'diamond' | 'platinum' | 'gold' | 'none';
      }
    }

    const normalizedTier = tier.toLowerCase().trim();
    if (['diamond', 'platinum', 'gold'].includes(normalizedTier)) {
      return normalizedTier as 'diamond' | 'platinum' | 'gold';
    }

    return 'none';
  }

  // Get membership tier information
  getMembershipTierInfo(tier: string): MembershipTier {
    return MEMBERSHIP_TIERS[tier] || MEMBERSHIP_TIERS.none;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getUserDataFromStorage();
  }

  // Clear user data (logout)
  clearUserData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Check if current user is admin
  isAdmin(): boolean {
    const currentUserId = localStorage.getItem(this.STORAGE_KEYS.USER_ID);
    return currentUserId === this.ADMIN_USER_ID;
  }

  // Set admin user (for admin login)
  setAdminUser(): void {
    localStorage.setItem(this.STORAGE_KEYS.USER_ID, this.ADMIN_USER_ID);
    console.log('Admin user set in localStorage');
  }

  // Initialize - fetch fresh data if userId is available
  async initialize(): Promise<ExternalUserData | null> {
    const userId = this.extractUserId();

    if (userId) {
      // Try to fetch fresh data
      return await this.fetchUserData(userId);
    } else {
      // Use cached data
      return this.getUserDataFromStorage();
    }
  }
}

export const externalAuthService = new ExternalAuthService();
export default externalAuthService;
