import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload, CreditCard, Truck, Globe, Shield, Bell, Palette } from "lucide-react";

interface ShopSettings {
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
  angelCoinsExchangeRate: number; // 1 Angel Coin = X INR
  angelCoinsMinRedemption: number;
  angelCoinsMaxRedemptionPercent: number;
  angelCoinsEarnRate: number; // Coins earned per INR spent
  
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
  
  // Checkout Settings
  guestCheckout: boolean;
  requireAccountCreation: boolean;
  showCouponField: boolean;
  showNewsletterSignup: boolean;
  termsAndConditionsRequired: boolean;
}

const ShopSettingsManagement = () => {
  const [settings, setSettings] = useState<ShopSettings>({
    // General Settings
    shopName: 'Ethereal Treasure Market',
    shopDescription: 'Discover sacred treasures for your spiritual journey',
    shopLogo: '/logo.png',
    shopFavicon: '/favicon.ico',
    contactEmail: 'gaurav262001@gmail.com',
    contactPhone: '+91 98913 24442',
    businessAddress: '123 Spiritual Way, Mystic City, India',
    
    // Currency & Pricing
    defaultCurrency: 'INR',
    currencySymbol: '₹',
    currencyPosition: 'before',
    taxRate: 18,
    taxIncluded: false,
    showPricesWithTax: true,
    
    // Angel Coins Settings
    angelCoinsEnabled: true,
    angelCoinsExchangeRate: 0.05, // 1 Angel Coin = ₹0.05
    angelCoinsMinRedemption: 10000,
    angelCoinsMaxRedemptionPercent: 5,
    angelCoinsEarnRate: 20, // 20 coins per ₹1 spent
    
    // Shipping Settings
    freeShippingThreshold: 2000,
    standardShippingRate: 200,
    expressShippingRate: 500,
    internationalShipping: false,
    shippingCalculation: 'flat',
    
    // Payment Settings
    paymentMethods: {
      creditCard: true,
      debitCard: true,
      netBanking: true,
      upi: true,
      wallet: true,
      cod: true
    },
    
    // Inventory Settings
    trackInventory: true,
    lowStockThreshold: 10,
    outOfStockBehavior: 'show',
    
    // SEO Settings
    metaTitle: 'Ethereal Treasure Market - Sacred Crystals & Spiritual Tools',
    metaDescription: 'Discover handpicked crystals, oracle cards, and spiritual tools for your divine journey. Premium quality spiritual treasures with worldwide shipping.',
    metaKeywords: 'crystals, oracle cards, spiritual tools, healing stones, meditation, chakra',
    googleAnalyticsId: '',
    facebookPixelId: '',
    
    // Email Settings
    orderConfirmationEmail: true,
    shippingNotificationEmail: true,
    deliveryConfirmationEmail: true,
    promotionalEmails: false,
    
    // Security Settings
    sslEnabled: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // Display Settings
    productsPerPage: 20,
    showProductRatings: true,
    showProductReviews: true,
    showRelatedProducts: true,
    showRecentlyViewed: true,
    enableWishlist: true,
    enableCompare: false,
    
    // Checkout Settings
    guestCheckout: true,
    requireAccountCreation: false,
    showCouponField: true,
    showNewsletterSignup: true,
    termsAndConditionsRequired: true
  });

  const handleSettingChange = (field: keyof ShopSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (method: keyof ShopSettings['paymentMethods'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: enabled
      }
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving shop settings:', settings);
    alert('Shop settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop Settings</h2>
          <p className="text-gray-600">Configure your e-commerce store settings</p>
        </div>
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="angelcoins">Angel Coins</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Store Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    value={settings.shopName}
                    onChange={(e) => handleSettingChange('shopName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="shopDescription">Shop Description</Label>
                  <Textarea
                    id="shopDescription"
                    value={settings.shopDescription}
                    onChange={(e) => handleSettingChange('shopDescription', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={settings.businessAddress}
                    onChange={(e) => handleSettingChange('businessAddress', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Branding
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Shop Logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Upload shop logo</p>
                    <p className="text-xs text-gray-500">Recommended: 200x60px, PNG/SVG</p>
                  </div>
                </div>
                <div>
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Upload favicon</p>
                    <p className="text-xs text-gray-500">Recommended: 32x32px, ICO/PNG</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Currency & Pricing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select value={settings.defaultCurrency} onValueChange={(value) => handleSettingChange('defaultCurrency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={(e) => handleSettingChange('currencySymbol', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currencyPosition">Currency Position</Label>
                  <Select value={settings.currencyPosition} onValueChange={(value) => handleSettingChange('currencyPosition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before amount (₹100)</SelectItem>
                      <SelectItem value="after">After amount (100₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.taxIncluded}
                    onCheckedChange={(checked) => handleSettingChange('taxIncluded', checked)}
                  />
                  <Label>Tax included in product prices</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showPricesWithTax}
                    onCheckedChange={(checked) => handleSettingChange('showPricesWithTax', checked)}
                  />
                  <Label>Show prices with tax</Label>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Angel Coins Settings */}
        <TabsContent value="angelcoins">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Angel Coins Configuration</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.angelCoinsEnabled}
                  onCheckedChange={(checked) => handleSettingChange('angelCoinsEnabled', checked)}
                />
                <Label>Enable Angel Coins Rewards System</Label>
              </div>

              {settings.angelCoinsEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="angelCoinsExchangeRate">Exchange Rate (1 Angel Coin = ₹)</Label>
                      <Input
                        id="angelCoinsExchangeRate"
                        type="number"
                        step="0.01"
                        value={settings.angelCoinsExchangeRate}
                        onChange={(e) => handleSettingChange('angelCoinsExchangeRate', parseFloat(e.target.value))}
                      />
                      <p className="text-xs text-gray-500">Current: 1 Angel Coin = ₹{settings.angelCoinsExchangeRate}</p>
                    </div>
                    <div>
                      <Label htmlFor="angelCoinsEarnRate">Earn Rate (Coins per ₹1 spent)</Label>
                      <Input
                        id="angelCoinsEarnRate"
                        type="number"
                        value={settings.angelCoinsEarnRate}
                        onChange={(e) => handleSettingChange('angelCoinsEarnRate', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-500">Customers earn {settings.angelCoinsEarnRate} coins for every ₹1 spent</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="angelCoinsMinRedemption">Minimum Redemption (Coins)</Label>
                      <Input
                        id="angelCoinsMinRedemption"
                        type="number"
                        value={settings.angelCoinsMinRedemption}
                        onChange={(e) => handleSettingChange('angelCoinsMinRedemption', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-500">Minimum {settings.angelCoinsMinRedemption} coins required to redeem</p>
                    </div>
                    <div>
                      <Label htmlFor="angelCoinsMaxRedemptionPercent">Max Redemption (% of order)</Label>
                      <Input
                        id="angelCoinsMaxRedemptionPercent"
                        type="number"
                        value={settings.angelCoinsMaxRedemptionPercent}
                        onChange={(e) => handleSettingChange('angelCoinsMaxRedemptionPercent', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-500">Maximum {settings.angelCoinsMaxRedemptionPercent}% of order value can be paid with coins</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleSettingChange('freeShippingThreshold', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Free shipping for orders above ₹{settings.freeShippingThreshold}</p>
                </div>
                <div>
                  <Label htmlFor="standardShippingRate">Standard Shipping Rate (₹)</Label>
                  <Input
                    id="standardShippingRate"
                    type="number"
                    value={settings.standardShippingRate}
                    onChange={(e) => handleSettingChange('standardShippingRate', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="expressShippingRate">Express Shipping Rate (₹)</Label>
                  <Input
                    id="expressShippingRate"
                    type="number"
                    value={settings.expressShippingRate}
                    onChange={(e) => handleSettingChange('expressShippingRate', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.internationalShipping}
                    onCheckedChange={(checked) => handleSettingChange('internationalShipping', checked)}
                  />
                  <Label>Enable International Shipping</Label>
                </div>
                <div>
                  <Label htmlFor="shippingCalculation">Shipping Calculation Method</Label>
                  <Select value={settings.shippingCalculation} onValueChange={(value) => handleSettingChange('shippingCalculation', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Rate</SelectItem>
                      <SelectItem value="weight">Weight Based</SelectItem>
                      <SelectItem value="zone">Zone Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Online Payment Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.paymentMethods.creditCard}
                      onCheckedChange={(checked) => handlePaymentMethodChange('creditCard', checked)}
                    />
                    <Label>Credit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.paymentMethods.debitCard}
                      onCheckedChange={(checked) => handlePaymentMethodChange('debitCard', checked)}
                    />
                    <Label>Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.paymentMethods.netBanking}
                      onCheckedChange={(checked) => handlePaymentMethodChange('netBanking', checked)}
                    />
                    <Label>Net Banking</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Alternative Payment Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.paymentMethods.upi}
                      onCheckedChange={(checked) => handlePaymentMethodChange('upi', checked)}
                    />
                    <Label>UPI</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.paymentMethods.wallet}
                      onCheckedChange={(checked) => handlePaymentMethodChange('wallet', checked)}
                    />
                    <Label>Digital Wallet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.paymentMethods.cod}
                      onCheckedChange={(checked) => handlePaymentMethodChange('cod', checked)}
                    />
                    <Label>Cash on Delivery</Label>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Additional tabs would continue here... */}
      </Tabs>
    </div>
  );
};

export default ShopSettingsManagement;
