import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload, CreditCard, Truck, Globe, Shield, Bell, Palette } from "lucide-react";
import { shopSettingsApi, type ShopSettings } from "@/services/shopSettingsApi";
import { useToast } from "@/hooks/use-toast";

const ShopSettingsManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    angelCoinsEarnRate: 20, // Deprecated - kept for backward compatibility
    angelCoinsEarnRateByTier: {
      gold: 5,      // 5% cashback
      platinum: 7,  // 7% cashback
      diamond: 15,  // 15% cashback
    },
    angelCoinsCashbackCapEnabled: true,
    angelCoinsCashbackCapAmount: 1500, // Max ₹1500 (1500 coins) per order
    
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

    // Grid Layout Settings
    gridLayoutMobile: 1, // 1 column on mobile
    gridLayoutTablet: 2, // 2 columns on tablet
    gridLayoutDesktop: 4, // 4 columns on desktop
    gridRowsPerPage: 5, // 5 rows per page (4x5 = 20 products)
    
    // Checkout Settings
    guestCheckout: true,
    requireAccountCreation: false,
    showCouponField: true,
    showNewsletterSignup: true,
    termsAndConditionsRequired: true
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await shopSettingsApi.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load shop settings:', error);
        toast({
          title: "Error",
          description: "Failed to load shop settings. Using defaults.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

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

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await shopSettingsApi.updateSettings(settings);
      toast({
        title: "Success",
        description: "Shop settings saved successfully!",
      });
    } catch (error) {
      console.error('Failed to save shop settings:', error);
      toast({
        title: "Error",
        description: "Failed to save shop settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop Settings</h2>
          <p className="text-gray-600">Configure your e-commerce store settings</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          className="flex items-center gap-2"
          disabled={saving}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="angelcoins">Angel Coins</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
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
                <div className="space-y-6">
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

                  {/* Cashback Cap Settings */}
                  <div className="border-t pt-6">
                    <h4 className="text-md font-semibold mb-4">Cashback Cap Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="angelCoinsCashbackCapEnabled" className="font-medium">Enable Cashback Cap</Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Limit the maximum Angel Coins that can be earned per order
                          </p>
                        </div>
                        <Switch
                          id="angelCoinsCashbackCapEnabled"
                          checked={settings.angelCoinsCashbackCapEnabled}
                          onCheckedChange={(checked) => handleSettingChange('angelCoinsCashbackCapEnabled', checked)}
                        />
                      </div>

                      {settings.angelCoinsCashbackCapEnabled && (
                        <div>
                          <Label htmlFor="angelCoinsCashbackCapAmount">Maximum Cashback Amount (₹)</Label>
                          <Input
                            id="angelCoinsCashbackCapAmount"
                            type="number"
                            min="0"
                            value={settings.angelCoinsCashbackCapAmount}
                            onChange={(e) => handleSettingChange('angelCoinsCashbackCapAmount', parseInt(e.target.value) || 0)}
                            className="max-w-xs"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum ₹{settings.angelCoinsCashbackCapAmount} ({settings.angelCoinsCashbackCapAmount} coins) can be earned per order
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Loyalty Tier Earn Rates */}
                  <div className="border-t pt-6">
                    <h4 className="text-md font-semibold mb-4">🌟 Angel Coin Cashback Structure</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure cashback percentage for each membership tier. Cashback is given as Angel Coins.
                    </p>

                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-4 gap-4 font-semibold text-sm border-b pb-2">
                        <div>Membership Tier</div>
                        <div>Cashback %</div>
                        <div>Cashback Type</div>
                        <div>Max Cap</div>
                      </div>

                      {/* Gold Tier */}
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium">Gold</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.angelCoinsEarnRateByTier.gold}
                            onChange={(e) => handleSettingChange('angelCoinsEarnRateByTier', {
                              ...settings.angelCoinsEarnRateByTier,
                              gold: parseFloat(e.target.value) || 0
                            })}
                            className="w-20"
                          />
                          <span className="text-sm">%</span>
                        </div>
                        <div className="text-sm">In Angel Coins</div>
                        <div className="text-sm">
                          {settings.angelCoinsCashbackCapEnabled ? `₹${settings.angelCoinsCashbackCapAmount}` : 'No Cap'}
                        </div>
                      </div>

                      {/* Platinum Tier */}
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                          <span className="font-medium">Platinum</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.angelCoinsEarnRateByTier.platinum}
                            onChange={(e) => handleSettingChange('angelCoinsEarnRateByTier', {
                              ...settings.angelCoinsEarnRateByTier,
                              platinum: parseFloat(e.target.value) || 0
                            })}
                            className="w-20"
                          />
                          <span className="text-sm">%</span>
                        </div>
                        <div className="text-sm">In Angel Coins</div>
                        <div className="text-sm">
                          {settings.angelCoinsCashbackCapEnabled ? `₹${settings.angelCoinsCashbackCapAmount}` : 'No Cap'}
                        </div>
                      </div>

                      {/* Diamond Tier */}
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                          <span className="font-medium">Diamond</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.angelCoinsEarnRateByTier.diamond}
                            onChange={(e) => handleSettingChange('angelCoinsEarnRateByTier', {
                              ...settings.angelCoinsEarnRateByTier,
                              diamond: parseFloat(e.target.value) || 0
                            })}
                            className="w-20"
                          />
                          <span className="text-sm">%</span>
                        </div>
                        <div className="text-sm">In Angel Coins</div>
                        <div className="text-sm">
                          {settings.angelCoinsCashbackCapEnabled ? `₹${settings.angelCoinsCashbackCapAmount}` : 'No Cap'}
                        </div>
                      </div>

                      {/* Non-Member Info */}
                      <div className="grid grid-cols-4 gap-4 items-center bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                          <span className="font-medium text-gray-600">Non-Member</span>
                        </div>
                        <div className="text-sm text-gray-600">0%</div>
                        <div className="text-sm text-gray-600">No Cashback</div>
                        <div className="text-sm text-gray-600">-</div>
                      </div>
                    </div>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-medium mb-1">💡 How it works</p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Members earn Angel Coins as cashback based on their membership tier</li>
                        <li>• Cashback is calculated as a percentage of the order subtotal</li>
                        <li>• Cashback is given in Angel Coins (1 coin = ₹{settings.angelCoinsExchangeRate})</li>
                        <li>• Example: Gold member (5%) spending ₹1000 earns ₹50 cashback = {(50 / settings.angelCoinsExchangeRate).toFixed(0)} coins</li>
                        <li>• {settings.angelCoinsCashbackCapEnabled ? `Maximum ₹${settings.angelCoinsCashbackCapAmount} (${settings.angelCoinsCashbackCapAmount} coins) can be earned per order` : 'No maximum cap on cashback per order'}</li>
                        <li>• Non-members do not earn any Angel Coins</li>
                      </ul>
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

        {/* Display Settings */}
        <TabsContent value="display">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Product Grid Layout
              </h3>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-2">
                    Configure how products are displayed on the shop homepage
                  </p>
                  <p className="text-xs text-gray-600">
                    Products per page = Desktop Columns × Rows ({settings.gridLayoutDesktop} × {settings.gridRowsPerPage} = {settings.gridLayoutDesktop * settings.gridRowsPerPage})
                  </p>
                </div>

                <div>
                  <Label htmlFor="gridLayoutMobile">Mobile Layout (Columns)</Label>
                  <Select
                    value={settings.gridLayoutMobile.toString()}
                    onValueChange={(value) => {
                      const cols = parseInt(value);
                      handleSettingChange('gridLayoutMobile', cols);
                      handleSettingChange('productsPerPage', settings.gridLayoutDesktop * settings.gridRowsPerPage);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Column</SelectItem>
                      <SelectItem value="2">2 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Grid layout for mobile devices</p>
                </div>

                <div>
                  <Label htmlFor="gridLayoutTablet">Tablet Layout (Columns)</Label>
                  <Select
                    value={settings.gridLayoutTablet.toString()}
                    onValueChange={(value) => {
                      const cols = parseInt(value);
                      handleSettingChange('gridLayoutTablet', cols);
                      handleSettingChange('productsPerPage', settings.gridLayoutDesktop * settings.gridRowsPerPage);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Grid layout for tablet devices</p>
                </div>

                <div>
                  <Label htmlFor="gridLayoutDesktop">Desktop Layout (Columns)</Label>
                  <Select
                    value={settings.gridLayoutDesktop.toString()}
                    onValueChange={(value) => {
                      const cols = parseInt(value);
                      handleSettingChange('gridLayoutDesktop', cols);
                      handleSettingChange('productsPerPage', cols * settings.gridRowsPerPage);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                      <SelectItem value="5">5 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Grid layout for desktop devices</p>
                </div>

                <div>
                  <Label htmlFor="gridRowsPerPage">Rows Per Page</Label>
                  <Select
                    value={settings.gridRowsPerPage.toString()}
                    onValueChange={(value) => {
                      const rows = parseInt(value);
                      handleSettingChange('gridRowsPerPage', rows);
                      handleSettingChange('productsPerPage', settings.gridLayoutDesktop * rows);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Rows</SelectItem>
                      <SelectItem value="4">4 Rows</SelectItem>
                      <SelectItem value="5">5 Rows</SelectItem>
                      <SelectItem value="6">6 Rows</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Number of product rows per page</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Grid Layout Preview</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">Current Configuration:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{settings.gridLayoutMobile} column(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tablet:</span>
                      <span className="font-medium">{settings.gridLayoutTablet} columns</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Desktop:</span>
                      <span className="font-medium">{settings.gridLayoutDesktop} columns × {settings.gridRowsPerPage} rows</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Products per page:</span>
                      <span className="font-bold text-primary">{settings.gridLayoutDesktop * settings.gridRowsPerPage}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Desktop Preview:</p>
                  <div
                    className="grid gap-2 bg-gray-50 p-4 rounded-lg"
                    style={{
                      gridTemplateColumns: `repeat(${settings.gridLayoutDesktop}, 1fr)`
                    }}
                  >
                    {Array.from({ length: settings.gridLayoutDesktop * Math.min(settings.gridRowsPerPage, 3) }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-white border-2 border-gray-200 rounded flex items-center justify-center text-xs text-gray-400"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  {settings.gridRowsPerPage > 3 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      ... and {settings.gridRowsPerPage - 3} more row(s)
                    </p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900 font-medium mb-1">💡 Common Layouts</p>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• 4×5 = 20 products (Default)</li>
                    <li>• 3×5 = 15 products</li>
                    <li>• 3×4 = 12 products</li>
                    <li>• 4×3 = 12 products</li>
                    <li>• 5×4 = 20 products</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Additional tabs would continue here... */}
      </Tabs>
    </div>
  );
};

export default ShopSettingsManagement;
