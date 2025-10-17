const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export interface ShopSettings {
  // General Settings
  shopName: string;
  shopDescription: string;
  shopLogo: string;
  shopFavicon: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  
  // Currency & Pricing
  defaultCurrency: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  taxRate: number;
  taxIncluded: boolean;
  showPricesWithTax: boolean;
  
  // Angel Coins Settings
  angelCoinsEnabled: boolean;
  angelCoinsExchangeRate: number;
  angelCoinsMinRedemption: number;
  angelCoinsMaxRedemptionPercent: number;
  angelCoinsEarnRate: number; // Deprecated - kept for backward compatibility
  angelCoinsEarnRateByTier: {
    gold: number;      // 5% cashback
    platinum: number;  // 7% cashback
    diamond: number;   // 15% cashback
  };
  angelCoinsCashbackCapEnabled: boolean;
  angelCoinsCashbackCapAmount: number; // Max ₹1500 (1500 coins) per order
  
  // Shipping Settings
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  internationalShipping: boolean;
  shippingCalculation: 'flat' | 'weight' | 'zone';
  
  // Payment Settings
  paymentMethods: {
    creditCard: boolean;
    debitCard: boolean;
    netBanking: boolean;
    upi: boolean;
    wallet: boolean;
    cod: boolean;
  };
  
  // Inventory Settings
  trackInventory: boolean;
  lowStockThreshold: number;
  outOfStockBehavior: 'hide' | 'show' | 'backorder';
  
  // SEO Settings
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  
  // Email Settings
  orderConfirmationEmail: boolean;
  shippingNotificationEmail: boolean;
  deliveryConfirmationEmail: boolean;
  promotionalEmails: boolean;
  
  // Security Settings
  sslEnabled: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  
  // Display Settings
  productsPerPage: number;
  showProductRatings: boolean;
  showProductReviews: boolean;
  showRelatedProducts: boolean;
  showRecentlyViewed: boolean;
  enableWishlist: boolean;
  enableCompare: boolean;
  
  // Grid Layout Settings
  gridLayoutMobile: number;
  gridLayoutTablet: number;
  gridLayoutDesktop: number;
  gridRowsPerPage: number;
  
  // Checkout Settings
  guestCheckout: boolean;
  requireAccountCreation: boolean;
  showCouponField: boolean;
  showNewsletterSignup: boolean;
  termsAndConditionsRequired: boolean;
}

export const shopSettingsApi = {
  // Get all shop settings
  async getSettings(): Promise<ShopSettings> {
    const response = await fetch(`${API_BASE_URL}/shop-settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch shop settings');
    }
    return response.json();
  },

  // Update shop settings
  async updateSettings(settings: Partial<ShopSettings>): Promise<ShopSettings> {
    const response = await fetch(`${API_BASE_URL}/shop-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Failed to update shop settings');
    }
    return response.json();
  },

  // Get specific setting by key
  async getSetting(key: keyof ShopSettings): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/shop-settings/${key}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch setting: ${key}`);
    }
    const data = await response.json();
    return data[key];
  },
};

