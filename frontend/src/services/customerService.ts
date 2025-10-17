const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const toApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export interface Badge {
  _id: string;
  creator: string;
  name: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  _id: string;
  creator: string;
  status: string;
  mango: {
    _id: string;
    title: string;
    price: number;
    currency: string;
    description: string;
    isHidden: boolean;
    recurringType: string;
  };
}

export interface CustomerDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  profilePicUrl: string;
  angelCoins: number;
  leaderboardRank?: number;
  membershipTier: 'diamond' | 'platinum' | 'gold' | 'none';
  badges: Badge[];
  subscriptions: Subscription[];
  onboarding?: string;
  isBlockedFromCommunityEngagement?: boolean;
  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const customerService = {
  async getCustomer(userId: string): Promise<CustomerDto | null> {
    try {
      const res = await fetch(toApiUrl(`customers/${encodeURIComponent(userId)}`), {
        credentials: "include"
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Failed to get customer: ${res.status}`);
      return res.json();
    } catch (err) {
      console.error('Error fetching customer:', err);
      return null;
    }
  },

  async syncCustomer(
    userId: string,
    data: {
      name: string;
      email: string;
      phone: string;
      countryCode?: string;
      profilePicUrl?: string;
      angelCoins?: number;
      leaderboardRank?: number;
      membershipTier?: 'diamond' | 'platinum' | 'gold' | 'none';
      badges?: Badge[];
      subscriptions?: Subscription[];
      onboarding?: string;
      isBlockedFromCommunityEngagement?: boolean;
    }
  ): Promise<CustomerDto> {
    const res = await fetch(toApiUrl(`customers/${encodeURIComponent(userId)}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to sync customer: ${res.status}`);
    return res.json();
  },

  async deleteCustomer(userId: string): Promise<{ message: string; userId: string }> {
    const res = await fetch(toApiUrl(`customers/${encodeURIComponent(userId)}`), {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) throw new Error(`Failed to delete customer: ${res.status}`);
    return res.json();
  },

  async listCustomers(filters?: {
    membershipTier?: string;
    limit?: number;
    skip?: number;
  }): Promise<CustomerDto[]> {
    const params = new URLSearchParams();
    if (filters?.membershipTier) params.set('membershipTier', filters.membershipTier);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.skip) params.set('skip', String(filters.skip));

    const res = await fetch(toApiUrl(`customers?${params.toString()}`), {
      credentials: "include"
    });
    if (!res.ok) throw new Error(`Failed to list customers: ${res.status}`);
    return res.json();
  }
};

