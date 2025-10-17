import mongoose from "mongoose";

const shopSettingsSchema = new mongoose.Schema(
  {
    // General Settings
    shopName: { type: String, default: "Ethereal Treasure Market" },
    shopDescription: { type: String, default: "Discover sacred treasures for your spiritual journey" },
    shopLogo: { type: String, default: "/logo.png" },
    shopFavicon: { type: String, default: "/favicon.ico" },
    contactEmail: { type: String, default: "gaurav262001@gmail.com" },
    contactPhone: { type: String, default: "+91 98913 24442" },
    businessAddress: { type: String, default: "123 Spiritual Way, Mystic City, India" },

    // Currency & Pricing
    defaultCurrency: { type: String, default: "INR" },
    currencySymbol: { type: String, default: "₹" },
    currencyPosition: { type: String, enum: ["before", "after"], default: "before" },
    taxRate: { type: Number, default: 18 },
    taxIncluded: { type: Boolean, default: false },
    showPricesWithTax: { type: Boolean, default: true },

    // Angel Coins Settings
    angelCoinsEnabled: { type: Boolean, default: true },
    angelCoinsExchangeRate: { type: Number, default: 0.05 },
    angelCoinsMinRedemption: { type: Number, default: 10000 },
    angelCoinsMaxRedemptionPercent: { type: Number, default: 5 },
    angelCoinsEarnRate: { type: Number, default: 20 }, // Deprecated - kept for backward compatibility

    // Angel Coins Earn Rates by Tier (as percentage cashback)
    angelCoinsEarnRateByTier: {
      gold: { type: Number, default: 5 },      // 5% cashback
      platinum: { type: Number, default: 7 },  // 7% cashback
      diamond: { type: Number, default: 15 },  // 15% cashback
    },

    // Angel Coins Cashback Cap Settings
    angelCoinsCashbackCapEnabled: { type: Boolean, default: true },
    angelCoinsCashbackCapAmount: { type: Number, default: 1500 }, // Max ₹1500 (1500 coins) per order

    // Shipping Settings
    freeShippingThreshold: { type: Number, default: 2000 },
    standardShippingRate: { type: Number, default: 200 },
    expressShippingRate: { type: Number, default: 500 },
    internationalShipping: { type: Boolean, default: false },
    shippingCalculation: { type: String, enum: ["flat", "weight", "zone"], default: "flat" },

    // Payment Settings
    paymentMethods: {
      creditCard: { type: Boolean, default: true },
      debitCard: { type: Boolean, default: true },
      netBanking: { type: Boolean, default: true },
      upi: { type: Boolean, default: true },
      wallet: { type: Boolean, default: true },
      cod: { type: Boolean, default: true },
    },

    // Inventory Settings
    trackInventory: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 },
    outOfStockBehavior: { type: String, enum: ["hide", "show", "backorder"], default: "show" },

    // SEO Settings
    metaTitle: { type: String, default: "Ethereal Treasure Market - Sacred Crystals & Spiritual Tools" },
    metaDescription: { type: String, default: "Discover handpicked crystals, oracle cards, and spiritual tools for your divine journey." },
    metaKeywords: { type: String, default: "crystals, oracle cards, spiritual tools, healing stones, meditation, chakra" },
    googleAnalyticsId: { type: String, default: "" },
    facebookPixelId: { type: String, default: "" },

    // Email Settings
    orderConfirmationEmail: { type: Boolean, default: true },
    shippingNotificationEmail: { type: Boolean, default: true },
    deliveryConfirmationEmail: { type: Boolean, default: true },
    promotionalEmails: { type: Boolean, default: false },

    // Security Settings
    sslEnabled: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },

    // Display Settings
    productsPerPage: { type: Number, default: 20 },
    showProductRatings: { type: Boolean, default: true },
    showProductReviews: { type: Boolean, default: true },
    showRelatedProducts: { type: Boolean, default: true },
    showRecentlyViewed: { type: Boolean, default: true },
    enableWishlist: { type: Boolean, default: true },
    enableCompare: { type: Boolean, default: false },

    // Grid Layout Settings
    gridLayoutMobile: { type: Number, default: 1 },
    gridLayoutTablet: { type: Number, default: 2 },
    gridLayoutDesktop: { type: Number, default: 4 },
    gridRowsPerPage: { type: Number, default: 5 },

    // Checkout Settings
    guestCheckout: { type: Boolean, default: true },
    requireAccountCreation: { type: Boolean, default: false },
    showCouponField: { type: Boolean, default: true },
    showNewsletterSignup: { type: Boolean, default: true },
    termsAndConditionsRequired: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const ShopSettingsModel = mongoose.model("ShopSettings", shopSettingsSchema);

