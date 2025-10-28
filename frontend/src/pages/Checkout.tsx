import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2, Gift, Coins, ArrowLeft, User, UserCircle, ShoppingCart, Star, MapPin } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useAngelCoins } from "@/hooks/useAngelCoins";
import { useNavigate, Link } from "react-router-dom";
import { useMembershipPricing } from "@/hooks/useMembershipPricing";
import LoginDialog from "@/components/LoginDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddressForm from "@/components/AddressForm";
import CompanyDetailsForm from "@/components/CompanyDetailsForm";

import { PRODUCTS } from "@/data/products";
import { supabase, type Product, productHelpers } from "@/integrations/supabase/client";
import appConfig from "@/services/appConfig";
import MembershipBadge from "@/components/MembershipBadge";
import { Checkbox } from "@/components/ui/checkbox";


const Checkout = () => {
  const { items, updateQuantity, removeItem, clearCart, addItem } = useCart();
  const { user, externalUser, getUserRole } = useAuth();
  const { angelCoins, exchangeRateINR, getMaxRedeemableCoins, getMaxRedemptionValue, calculateGSTBreakdown, calculateRedemptionValue, loading: angelCoinsLoading, getTierKey } = useAngelCoins();
  const userRole = getUserRole();
  const navigate = useNavigate();

  // Get user information (prefer external user)
  const userName = externalUser?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  let userMobile = '';
  try {
    const pfRaw = localStorage.getItem('AOE_profile_full');
    if (pfRaw) {
      const pf = JSON.parse(pfRaw);
      userMobile = (pf.countryCode || '') + (pf.phone || '');
    }
  } catch {}
  if (!userMobile) {
    userMobile = (user?.user_metadata as any)?.mobile || '';
  }


	  // Address persistence keys (prefer external user id to match Profile)
	  const userId = externalUser?.userId || localStorage.getItem('AOE_userId') || user?.id || user?.email || 'default';
	  const addressesKey = `AOE_addresses_${userId}`;


  // Delivery address state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: '', customType: '', name: '', address1: '', address2: '', nearby: '', city: '', state: '', customState: '', country: '', zipCode: '', isDefault: false,
  });

  const companyKey = `AOE_companyDetails_${userId}`;
  const [companyDetails, setCompanyDetails] = useState<any>(() => {
    try { const raw = localStorage.getItem(companyKey); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  useEffect(() => {
    try { const raw = localStorage.getItem(companyKey); setCompanyDetails(raw ? JSON.parse(raw) : null); } catch {}
  }, [companyKey]);
  const [gstInvoiceEnabled, setGstInvoiceEnabled] = useState<boolean>(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);

  // Mock user profile data (in real app, this would come from user profile API)
  const userAlternativeMobile = user?.user_metadata?.alternativeMobile || '';
  const userMembershipType = user?.user_metadata?.membershipType || 'Diamond';
  const [couponCode, setCouponCode] = useState("");
  const [angelCoinsToRedeem, setAngelCoinsToRedeem] = useState([0]);
  const [discount, setDiscount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);



  useEffect(() => {
    try {
      const raw = localStorage.getItem(addressesKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setAddresses(arr);
          const def = arr.find((a: any) => a.isDefault) || arr[0];
          setSelectedAddressId(def ? String(def.id) : '');
        }
      }
    } catch (e) {
      console.error('Failed to load addresses for checkout', e);
    }
  }, [addressesKey]);

  const persistAddresses = (next: any[]) => {
    setAddresses(next);
    try { localStorage.setItem(addressesKey, JSON.stringify(next)); } catch {}
  };

  const handleSaveNewAddress = () => {
    // minimal validation
    if (!newAddress.type || !newAddress.name || !newAddress.address1 || !newAddress.city || (!newAddress.state && !newAddress.customState) || !newAddress.country || !newAddress.zipCode) {
      alert('Please fill required address fields');
      return;
    }
    const stateName = newAddress.state === 'Others' ? newAddress.customState : newAddress.state;
    const addressToAdd = {
      id: Date.now(),
      type: newAddress.type === 'Others' ? newAddress.customType : newAddress.type,
      name: newAddress.name,
      fullAddress: `${newAddress.address1}${newAddress.address2 ? ', ' + newAddress.address2 : ''}${newAddress.nearby ? ', Near ' + newAddress.nearby : ''}`,
      address1: newAddress.address1,
      address2: newAddress.address2,
      nearby: newAddress.nearby,
      city: newAddress.city,
      state: stateName,
      country: newAddress.country,
      zipCode: newAddress.zipCode,
      isDefault: addresses.length === 0 ? true : newAddress.isDefault,
    };
    const next = newAddress.isDefault
      ? [addressToAdd, ...addresses.map(a => ({ ...a, isDefault: false }))]
      : [...addresses, addressToAdd];
    persistAddresses(next);
    setSelectedAddressId(String(addressToAdd.id));
    setIsAddingAddress(false);
    setNewAddress({ type: '', customType: '', name: '', address1: '', address2: '', nearby: '', city: '', state: '', customState: '', country: '', zipCode: '', isDefault: false });
  };

  // Related Products state (matching ProductDetail.tsx)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedProductsStartIndex, setRelatedProductsStartIndex] = useState(0);
  const [relatedProductQuantities, setRelatedProductQuantities] = useState<{[key: string]: number}>({});
  const [showAsCard, setShowAsCard] = useState(false);

  // Admin settings - in real app, these would come from API/context
  const [showAngelCoinsSection, setShowAngelCoinsSection] = useState(true);
  const [showCouponSection, setShowCouponSection] = useState(true);

  // Minimum Angel Coins required to redeem (configurable)
  const minAngelCoinsRequired = appConfig.getMinAngelCoinsRequired();

  // Helper function to get available quantity (same logic as ProductCard)
  const getAvailableQuantity = (productId: string) => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 16) + 5; // Consistent quantity between 5-20
  };

  // Helper function to create product slug
  const createProductSlug = (name: string, sku: string) => {
    const spacesRegex = new RegExp('\\s+', 'g');
    return name.toLowerCase().replace(spacesRegex, '-') + '_' + sku;
  };

  // Helper function to clean price string
  const cleanPriceString = (price: string) => {
    const commaRegex = new RegExp(',', 'g');
    return price.replace(commaRegex, '');
  };

  const { calculatePrice, hasDiscount, isAuthenticated } = useMembershipPricing();

  const originalSubtotal = items.reduce((sum, item) => {
    const cleanPrice = cleanPriceString(item.price);
    return sum + (parseFloat(cleanPrice) * item.quantity);
  }, 0);

  const discountedSubtotal = items.reduce((sum, item) => {
    const effective = (isAuthenticated() && hasDiscount())
      ? calculatePrice(item.price).discountedPrice
      : parseFloat(cleanPriceString(item.price));
    return sum + (effective * item.quantity);
  }, 0);

  const membershipDiscount = Math.max(0, originalSubtotal - discountedSubtotal);
  const subtotal = discountedSubtotal;

  // Calculate GST breakdown
  const gstBreakdown = calculateGSTBreakdown(subtotal);
  const { baseAmount, gstAmount } = gstBreakdown;

  // Calculate max redeemable coins (tier-based % of base amount)
  const maxRedeemableCoins = getMaxRedeemableCoins(subtotal);
  // Mock payment popup state
  const [showPayment, setShowPayment] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const selectedAddress = addresses.find(a => String(a.id) === selectedAddressId) || null;

  const handleCheckout = () => {
    if (!user && !externalUser) {
      setShowLoginDialog(true);
      return;
    }
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    setShowSummary(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
  };

  const maxRedemptionValue = getMaxRedemptionValue(subtotal);

  // Calculate theoretical maximum based on 5% rule only (not limited by user balance)
  const tierKey = getTierKey();
  const isMembershipEligible = tierKey !== 'none';

  const theoreticalMaxCoins = Math.floor(maxRedemptionValue / exchangeRateINR);

  // Check if user has enough coins and meets minimum requirement
  const canRedeemAngelCoins = !angelCoinsLoading && angelCoins >= minAngelCoinsRequired;

  // For slider maximum, use theoretical max but ensure user has enough coins
  const actualMaxRedeemableCoins = canRedeemAngelCoins ?
    Math.min(theoreticalMaxCoins, angelCoins) : 0;

  // Calculate Angel Coins discount (applied to base amount)
  const angelCoinsDiscount = calculateRedemptionValue(angelCoinsToRedeem[0]);

  // Calculate final amounts
  const discountedBaseAmount = Math.max(0, baseAmount - discount - angelCoinsDiscount);
  const finalGstAmount = discountedBaseAmount * 0.18;
  const total = discountedBaseAmount + finalGstAmount;

  // Load Angel Coins selection from localStorage on component mount
  useEffect(() => {
    if (true) {
      const extId = localStorage.getItem('AOE_userId');
      const userId = extId || user?.id || user?.email || 'default';
      const storageKey = `angelCoinsRedemption_${userId}`;
      const savedRedemption = localStorage.getItem(storageKey);

      if (savedRedemption) {
        const savedValue = parseInt(savedRedemption, 10);
        if (!isNaN(savedValue) && savedValue >= 0) {
          setAngelCoinsToRedeem([savedValue]);
        }
      }
    }
  }, [user]);

  // Save Angel Coins selection to localStorage whenever it changes
  useEffect(() => {
    if (angelCoinsToRedeem[0] !== undefined) {
      const extId = localStorage.getItem('AOE_userId');
      const userId = extId || user?.id || user?.email || 'default';
      const storageKey = `angelCoinsRedemption_${userId}`;
      localStorage.setItem(storageKey, angelCoinsToRedeem[0].toString());
    }
  }, [user, angelCoinsToRedeem]);

  // Auto-adjust Angel Coins when cart value changes
  useEffect(() => {
    const currentMaxRedemptionValue = getMaxRedemptionValue(subtotal);
    const currentTheoreticalMaxCoins = Math.floor(currentMaxRedemptionValue / exchangeRateINR);
    const currentMaxRedeemableCoins = Math.min(currentTheoreticalMaxCoins, angelCoins);
    const currentRedemption = angelCoinsToRedeem[0];

    // If current redemption exceeds new maximum, adjust it down
    if (currentRedemption > currentMaxRedeemableCoins) {
      setAngelCoinsToRedeem([currentMaxRedeemableCoins]);
    }
  }, [subtotal, getMaxRedemptionValue, exchangeRateINR, angelCoins, angelCoinsToRedeem]);

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "welcome10") {
      setDiscount(subtotal * 0.1);
    } else if (couponCode.toLowerCase() === "angel20") {
      setDiscount(subtotal * 0.2);
    }
  };


  // Fetch related products from Supabase (matching ProductDetail.tsx logic)
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Get all published products that are not in the current cart
        const cartProductIds = items.map(item => item.id);

        const { data: relatedData, error: relatedError } = await supabase
          .from('product_details_view')
          .select('*')
          .eq('status', 'published')
          .not('product_id', 'in', `(${cartProductIds.length > 0 ? cartProductIds.join(',') : 'null'})`)
          .limit(20); // Increased from 8 to 20 for more variety

        if (!relatedError && relatedData) {
          setRelatedProducts(relatedData);
        } else {
          // Fallback to local products data
          const { PRODUCTS } = await import('@/data/products');
          const cartProductIds = items.map(item => item.id);
          const fallbackProducts = PRODUCTS
            .filter(product => !cartProductIds.includes(product.id))
            .slice(0, 20)
            .map(product => {
              const imageUrls = Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : [product.image];
              return {
                product_id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                original_price: product.originalPrice,
                rating: product.rating,
                sku: product.sku,
                images: imageUrls.map((url, index) => ({
                  url,
                  is_primary: index === 0,
                })),
              };
            });
          setRelatedProducts(fallbackProducts as any);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        // Fallback to local products data on error
        const { PRODUCTS } = await import('@/data/products');
        const cartProductIds = items.map(item => item.id);
        const fallbackProducts = PRODUCTS
          .filter(product => !cartProductIds.includes(product.id))
          .slice(0, 20)
          .map(product => {
            const imageUrls = Array.isArray(product.images) && product.images.length > 0
              ? product.images
              : [product.image];
            return {
              product_id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              original_price: product.originalPrice,
              rating: product.rating,
              sku: product.sku,
              images: imageUrls.map((url, index) => ({
                url,
                is_primary: index === 0,
              })),
            };
          });
        setRelatedProducts(fallbackProducts as any);
      }
    };

    fetchRelatedProducts();
  }, [items]); // Re-fetch when cart items change

  // Check height comparison between Order Items and Order Summary
  useEffect(() => {
    const checkHeights = () => {
      const orderItemsElement = document.querySelector('[data-order-items]');
      const orderSummaryElement = document.querySelector('[data-order-summary]');

      if (orderItemsElement && orderSummaryElement) {
        const orderItemsHeight = orderItemsElement.clientHeight;
        const orderSummaryHeight = orderSummaryElement.clientHeight;

        // For mobile/tablet: Show as card if Order Items height is less than Order Summary height
        // For desktop: Always show as slider (full-width layout)
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        setShowAsCard(isMobile && orderItemsHeight < orderSummaryHeight);
      }
    };

    // Check heights after component mounts and when items change
    const timer = setTimeout(checkHeights, 100);
    return () => clearTimeout(timer);
  }, [items]);

  // Navigation functions for related products - Updated for more products
  const nextRelatedProducts = () => {
    // Show more products: 6 on desktop, 4 on tablet, 2 on mobile
    const visibleProducts = window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 4 : 2;
    const maxStartIndex = Math.max(0, relatedProducts.length - visibleProducts);
    setRelatedProductsStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
  };

  const prevRelatedProducts = () => {
    setRelatedProductsStartIndex((prev) => Math.max(prev - 1, 0));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-playfair text-2xl text-angelic-deep mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate("/")} variant="angelic">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
          {/* Admin-only Membership Override for testing */}
          {userRole === 'admin' && (
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(v) => {
                  if (v === 'no-override') {
                    localStorage.removeItem('AOE_admin_membership_override');
                  } else {
                    localStorage.setItem('AOE_admin_membership_override', v);
                  }
                  // Force recalculation by triggering state change
                  setAngelCoinsToRedeem((prev) => [...prev]);
                }}
                defaultValue={localStorage.getItem('AOE_admin_membership_override') || ''}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Test as Membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-override">No Override</SelectItem>
                  <SelectItem value="gold">Gold Membership</SelectItem>
                  <SelectItem value="platinum">Platinum Membership</SelectItem>
                  <SelectItem value="diamond">Diamond Membership</SelectItem>
                  <SelectItem value="none">No Membership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

            <h1 className="font-playfair text-3xl text-angelic-deep">Checkout</h1>
          </div>

          {/* User Block: Membership badge, profile pic/name, profile icon */}
          {(user || externalUser) && (
            <div className="flex items-center gap-3">
              {/* Membership Badge for external users */}
              {(externalUser || userRole === 'admin') && <MembershipBadge size="sm" />}

              {/* Profile picture from external auth if available */}
              {externalUser?.pic && (
                <img
                  src={externalUser.pic}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              {/* Name */}
              <span className="text-sm text-angelic-deep font-medium hidden sm:inline">
                {userName}
              </span>

              {/* Profile button */}
              <Button
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-angelic-deep hover:text-primary"
                title="My Profile"
              >
                <UserCircle className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Items & Customers Also Bought */}
          <div className="space-y-6" data-order-items>
            <Card className="p-6">
              <h2 className="font-playfair text-xl text-angelic-deep mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-angelic-cream/20 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                      <h4 className="font-medium text-angelic-deep">{item.name}</h4>
                      <p className="text-primary font-semibold">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const availableQuantity = getAvailableQuantity(item.id);
                          const maxSelectQuantity = 15;
                          const maxAllowed = Math.min(availableQuantity, maxSelectQuantity);

                          if (item.quantity >= maxAllowed) {
                            alert(`Maximum quantity allowed: ${maxAllowed} (Available: ${availableQuantity})`);
                            return;
                          }
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        className="w-8 h-8 p-0"
                        disabled={item.quantity >= Math.min(getAvailableQuantity(item.id), 15)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customers Also Bought - Show under Order Items when cart has 1-3 items */}
            {relatedProducts.length > 0 && items.length <= 3 && (
              <Card className="p-6">
                <h3 className="font-playfair font-bold text-xl text-angelic-deep mb-6">
                  Customers Also Bought
                </h3>
                <div className="space-y-4">
                  {relatedProducts.slice(0, 6).map((relatedProduct) => { // Show up to 6 products instead of limiting by cart size
                    const relatedProductId = relatedProduct.product_id;
                    const relatedProductSlug = createProductSlug(relatedProduct.name, relatedProduct.sku);

                    // Fix image URL with multiple fallbacks
                    let relatedImageUrl = '/placeholder.svg'; // Default fallback

                    if (relatedProduct.images && Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0) {
                      try {
                        relatedImageUrl = productHelpers.getPrimaryImageUrl(relatedProduct.images);
                      } catch (error) {
                        console.error('Error getting primary image URL:', error);
                        relatedImageUrl = '/placeholder.svg';
                      }
                    }

                    return (
                      <div key={relatedProductId} className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-300">
                        {/* Product Image */}
                        <Link to={`/product/${relatedProductSlug}`} className="flex-shrink-0">
                          <img
                            src={relatedImageUrl}
                            alt={relatedProduct.name}
                            className="w-16 h-16 object-cover rounded-md transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              console.error('Image failed to load:', e.currentTarget.src);
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-angelic-gold text-angelic-gold" />
                            ))}
                          </div>

                          {/* Product Name */}
                          <Link to={`/product/${relatedProductSlug}`}>
                            <h4 className="font-playfair font-semibold text-base text-angelic-deep hover:text-primary transition-colors line-clamp-1 mb-1">
                              {relatedProduct.name}
                            </h4>
                          </Link>

                          {/* Description */}
                          <p className="text-sm text-angelic-deep/70 line-clamp-2 mb-2">
                            {relatedProduct.description?.slice(0, 80)}...
                          </p>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-bold text-primary text-lg">₹{relatedProduct.price}</span>
                            {relatedProduct.original_price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{relatedProduct.original_price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add Button */}
                        <div className="flex-shrink-0">
                          <Button
                            variant="default"
                            size="sm"
                            className="px-4 py-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addItem({
                                id: relatedProductId,
                                name: relatedProduct.name,
                                price: relatedProduct.price,
                                image: relatedImageUrl
                              }, 1);
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    );
                  })}


                </div>
              </Card>

            )}
          </div>

          {/* Right Column - Customer Information & Order Summary */}
          <div className="space-y-6" data-order-summary>
            {/* Customer Information */}
            {user && (
              <Card className="p-6">
                <h2 className="font-playfair text-xl text-angelic-deep mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <span className="text-sm text-gray-800">{userName}</span>
                  </div>
                  {userEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm text-gray-800">{userEmail}</span>
                    </div>
                  )}
                  {userMobile && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Mobile:</span>
                      <span className="text-sm text-gray-800">{userMobile}</span>
                    </div>
                  )}
                  {userAlternativeMobile && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Alternative Mobile:</span>
                      <span className="text-sm text-gray-800">{userAlternativeMobile}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Membership Type:</span>
                    <span className="text-sm text-gray-800 font-semibold text-primary">{userMembershipType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Account Type:</span>
                    <span className="text-sm text-gray-800 capitalize">
                      {userRole === 'admin' ? 'Administrator' : userRole === 'team' ? 'Team Member' : 'Customer'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Angel Coins:</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {angelCoinsLoading ? '...' : angelCoins.toLocaleString()} coins
                    </span>
                  </div>
                </div>
              </Card>
            )}


	            {/* Delivery Address */}
	            <Card className="p-6">
	              <h2 className="font-playfair text-xl text-angelic-deep mb-4">Delivery Details</h2>
	              <div className="space-y-2">
	                <Label className="flex items-center gap-2 text-angelic-deep">
	                  <MapPin className="w-4 h-4" />
	                  <span>Select Delivery Address</span>
	                </Label>
	                <div className="flex items-center gap-2">
	                  <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
	                    <SelectTrigger className="w-full truncate whitespace-nowrap overflow-hidden text-ellipsis">
	                      <SelectValue placeholder={addresses.length ? 'Choose saved address' : 'No saved addresses'} />
	                    </SelectTrigger>
	                    <SelectContent>
	                      {addresses.map((addr) => (
	                        <SelectItem key={addr.id} value={String(addr.id)}>
	                          <div className="flex items-center gap-2">
	                            <MapPin className="w-4 h-4" />
	                            <span>{addr.type} - {addr.address1}, {addr.city}</span>
	                          </div>
	                        </SelectItem>
	                      ))}
	                    </SelectContent>
	                  </Select>
	                  <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
	                    <DialogTrigger asChild>
	                      <Button variant="outline">Add New</Button>
	                    </DialogTrigger>
	                    <DialogContent className="max-w-2xl">
	                      <DialogHeader>
	                        <DialogTitle>Add New Address</DialogTitle>
	                      </DialogHeader>
	                      <AddressForm
	                        address={newAddress}
	                        onAddressChange={setNewAddress}
	                        onSave={handleSaveNewAddress}
	                        onCancel={() => setIsAddingAddress(false)}
                      />

	                    </DialogContent>

            {/* Company Details Dialog (add/edit) */}
            <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{companyDetails ? 'Edit Company Details' : 'Add Company Details'}</DialogTitle>
                </DialogHeader>
                <CompanyDetailsForm
                  initial={companyDetails}
                  confirmText={companyDetails ? 'Save' : 'Confirm'}
                  onConfirm={(d) => { try { localStorage.setItem(companyKey, JSON.stringify(d)); } catch {}; setCompanyDetails(d); setShowCompanyDialog(false); }}
                  onCancel={() => setShowCompanyDialog(false)}
                />
              </DialogContent>
            </Dialog>

	                  </Dialog>
	                </div>
	                {selectedAddressId && (
	                  <div className="text-xs text-angelic-deep/70">
	                    {(() => {
	                      const addr = addresses.find((a) => String(a.id) === selectedAddressId);
	                      return addr ? `${addr.name}, ${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.state}, ${addr.country} - ${addr.zipCode}` : '';
	                    })()}
	                  </div>
	                )}

                        <div className="text-xs text-angelic-deep/70">Mobile: {userMobile || 'Not provided'}</div>



	              </div>
	            </Card>


            {/* GST Invoice - standalone section */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-playfair text-xl text-angelic-deep">GST Invoice</h2>
                <div className="flex items-center gap-3">
                  {companyDetails?.gstNo && (
                    <button className="text-sm underline" onClick={() => setShowCompanyDialog(true)}>Edit</button>
                  )}
                  <Checkbox checked={gstInvoiceEnabled} onCheckedChange={(v) => setGstInvoiceEnabled(!!v)} disabled={!companyDetails?.gstNo} />
                </div>
              </div>
              <div className="mt-3 text-sm">
                {companyDetails?.gstNo ? (
                  <>
                    <p>{gstInvoiceEnabled ? "GST invoice enabled for this order." : "Enable GST invoice for this order."}</p>
                    <p className="text-xs text-gray-600">GSTIN: {companyDetails.gstNo}</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <button className="underline" onClick={() => setShowCompanyDialog(true)}>Add GSTIN</button>
                      <span className="ml-2 text-gray-600">Claim GST input up to 18%</span>
                    </div>

                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-playfair text-xl text-angelic-deep mb-4">Order Summary</h2>

              {/* Coupon Code - Only show if enabled by admin */}


              {showCouponSection && (
                <>
                  <div className="space-y-2 mb-4">
                    <Label className="flex items-center gap-2 text-angelic-deep">
                      <Gift className="w-4 h-4" />
                      Coupon Code
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={applyCoupon} variant="outline">
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-angelic-deep/60">Try: WELCOME10 or ANGEL20</p>
                  </div>
                  <Separator className="my-4" />
                </>
              )}

              {/* Angel Points Redemption - Only show if enabled by admin */}
              {showAngelCoinsSection && (
                <>
                  {!canRedeemAngelCoins && (
                    <div className="space-y-2 mb-4">
                      <Label className="flex items-center gap-2 text-angelic-deep">
                        <Coins className="w-4 h-4" />
                        Angel Coins Redemption

                      </Label>
                      {!isMembershipEligible ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800 font-semibold">
                            This facility is only available for Gold, Platinum and Diamond Members.
                          </p>
                          <p className="text-xs text-red-700 mt-1">
                            Kindly upgrade membership to avail this benefit.
                          </p>
                          <p className="text-xs text-red-700 mt-2 underline cursor-pointer" onClick={() => window.open('/faq', '_self')}>
                            For more info click here
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Minimum {minAngelCoinsRequired.toLocaleString()} Angel Coins required for redemption.</strong>
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            You currently have {angelCoinsLoading ? '...' : angelCoins.toLocaleString()} Angel Coins.
                            Keep shopping to earn more Angel Coins!
                          </p>
                          <p className="text-xs text-yellow-700 mt-2">
                            <strong>Note:</strong> Angel Coins redemption limit depends on your membership tier.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {canRedeemAngelCoins && (
                <div className="space-y-4 mb-4">
                  <Label className="flex items-center gap-2 text-angelic-deep">
                    <Coins className="w-4 h-4" />
                    Redeem Angel Coins
                  </Label>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Available Angel Coins:</span>
                      <span className="font-medium">
                        {angelCoinsLoading ? '...' : angelCoins.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Redeem:</span>
                          <span className="font-medium">
                            {angelCoinsToRedeem[0].toLocaleString()} coins (₹{angelCoinsDiscount.toFixed(2)})
                          </span>
                        </div>
                        <Slider
                          value={angelCoinsToRedeem}
                          onValueChange={setAngelCoinsToRedeem}
                          max={actualMaxRedeemableCoins}
                          min={0}
                          step={100}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-angelic-deep/60">
                          <span>0</span>
                          <span>Max: {actualMaxRedeemableCoins.toLocaleString()} coins</span>
                        </div>
                      </div>
                      <div className="text-xs text-angelic-deep/60 space-y-1">
                        <p>1 Angel Coin = ₹{exchangeRateINR.toFixed(2)}</p>
                        <p>Max based on your Membership ({(getTierKey() === 'gold' ? '5%' : getTierKey() === 'platinum' ? '10%' : getTierKey() === 'diamond' ? '20%' : '0%')} of ₹{baseAmount.toFixed(2)}) = ₹{maxRedemptionValue.toFixed(2)}</p>
                        <p>Max redeemable: {theoreticalMaxCoins.toLocaleString()} coins</p>
                      </div>
                    </div>
                  </div>
                </div>
                  )}
                </>
              )}

              <Separator className="my-4" />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Amount</span>
                  <span>₹{baseAmount.toFixed(2)}</span>
                </div>
                {membershipDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Membership Discount</span>
                    <span>-₹{membershipDiscount.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {angelCoinsDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Angel Coins ({angelCoinsToRedeem[0]} redeemed, {(getTierKey() === 'gold' ? '5' : getTierKey() === 'platinum' ? '10' : getTierKey() === 'diamond' ? '20' : '0')}%)</span>
                    <span>-₹{angelCoinsDiscount.toFixed(2)}</span>
                  </div>
                )}
                {angelCoinsDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Discounted Amount</span>
                    <span>₹{discountedBaseAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{finalGstAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Actions */}
              <div className="space-y-3 pt-6">
                <Button
                  onClick={handleCheckout}
                  disabled={!selectedAddress}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order
                </Button>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Customers Also Bought - Show at bottom when cart has 4+ items */}
        {relatedProducts.length > 0 && items.length >= 4 && (
          <div className="mt-16">
            <h2 className="font-playfair font-bold text-2xl text-angelic-deep mb-8 text-center">
              Customers Also Bought
            </h2>
            <div className="w-full">
              <div className="overflow-x-auto scroll-smooth">
                <div className="flex gap-4 pb-4 px-2 sm:px-4" style={{ width: 'max-content' }}>
                  {relatedProducts.slice(0, 12).map((relatedProduct) => { // Show up to 12 products in horizontal scroll
                    const relatedProductId = relatedProduct.product_id;
                    const relatedProductSlug = createProductSlug(relatedProduct.name, relatedProduct.sku);
                    // Fix image URL with multiple fallbacks
                    let relatedImageUrl = '/placeholder.svg'; // Default fallback

                    if (relatedProduct.images && Array.isArray(relatedProduct.images) && relatedProduct.images.length > 0) {
                      try {
                        relatedImageUrl = productHelpers.getPrimaryImageUrl(relatedProduct.images);
                      } catch (error) {
                        console.error('Error getting primary image URL:', error);
                        relatedImageUrl = '/placeholder.svg';
                      }
                    }

                    return (
                      <div key={relatedProductId} className="w-64 sm:w-72 md:w-80 lg:w-72 xl:w-80 flex-shrink-0">
                        <Card className="related-product-card overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                          <Link to={`/product/${relatedProductSlug}`}>
                            <div className="relative group/image">
                              <img
                                src={relatedImageUrl}
                                alt={relatedProduct.name}
                                className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover/image:scale-105"
                                onError={(e) => {
                                  console.error('Image failed to load:', e.currentTarget.src);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          </Link>
                          <div className="related-product-content p-5">
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-angelic-gold text-angelic-gold" />
                              ))}
                            </div>
                            <h3 className="font-playfair font-semibold text-xl text-angelic-deep mb-3 group-hover:text-primary transition-colors line-clamp-2">
                              {relatedProduct.name}
                            </h3>
                            <div className="related-product-description mb-4">
                              <p className="text-sm text-angelic-deep/70 mb-2 line-clamp-3 leading-relaxed">
                                {relatedProduct.description?.slice(0, 120) || 'Experience divine guidance and spiritual enlightenment with this premium product'}...
                              </p>
                              <div className="related-product-read-more">
                                <Link to={`/product/${relatedProductSlug}`} className="inline">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-primary hover:text-white hover:bg-primary hover:px-2 hover:py-0.5 hover:rounded-full text-sm transition-all duration-300 ease-in-out transform hover:scale-105"
                                  >
                                    Read More→
                                  </Button>
                                </Link>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="font-bold text-primary text-lg">₹{relatedProduct.price}</span>
                              {relatedProduct.original_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{relatedProduct.original_price}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                              {(() => {
                                const cartItem = items.find(item => item.id === relatedProductId);
                                const currentQuantity = cartItem?.quantity || 0;
                                const selectedQuantity = relatedProductQuantities[relatedProductId] || 1;
                                const availableQuantity = relatedProduct.available_quantity || 10;

                                const handleAddToCart = (e: React.MouseEvent) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  if (selectedQuantity > availableQuantity) {
                                    alert(`Can't select quantity more than available. Available: ${availableQuantity}`);
                                    return;
                                  }

                                  addItem({
                                    id: relatedProductId,
                                    name: relatedProduct.name,
                                    price: relatedProduct.price,
                                    image: relatedImageUrl
                                  }, selectedQuantity);
                                };

                                return (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-3">
                                      <label className="text-sm font-medium text-angelic-deep">Qty:</label>
                                      <Select
                                        value={(currentQuantity || selectedQuantity).toString()}
                                        onValueChange={(value) => setRelatedProductQuantities(prev => ({
                                          ...prev,
                                          [relatedProductId]: parseInt(value)
                                        }))}
                                      >
                                        <SelectTrigger className="w-20 h-10">
                                          <SelectValue placeholder="1" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                                            <SelectItem
                                              key={num}
                                              value={num.toString()}
                                              disabled={num > availableQuantity}
                                              className={num > availableQuantity ? "text-gray-400" : ""}
                                            >
                                              {num} {num > availableQuantity ? "(Out of stock)" : ""}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <Button
                                      variant="default"
                                      size="default"
                                      className="w-full py-3 font-medium text-sm"
                                      onClick={handleAddToCart}
                                    >
                                      <ShoppingCart className="w-4 h-4 mr-2" />
                                      Add to Cart {currentQuantity > 0 && `(${currentQuantity})`}
                                    </Button>

                                    <div className="text-center">
                                      <span className="text-sm text-angelic-deep/70">
                                        Available: <span className="font-semibold text-green-600">{availableQuantity}</span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>




      {/* Ensure we keep user on checkout after login */}

      {/* Order Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Delivery Details:</strong>
              <div>{selectedAddress ? `${selectedAddress.name}, ${selectedAddress.address1}${selectedAddress.address2 ? ', ' + selectedAddress.address2 : ''}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country} - ${selectedAddress.zipCode}` : 'N/A'}</div>
              <div>Mobile: {userMobile || 'Not provided'}</div>
            </div>
            {gstInvoiceEnabled && companyDetails?.gstNo && (
              <div className="pt-2">
                <strong>GST Details:</strong>
                <div className="text-xs text-angelic-deep/80">
                  {companyDetails?.companyName && <div>{companyDetails.companyName}</div>}
                  {companyDetails?.address && <div>{companyDetails.address}</div>}
                  <div>GSTIN: {companyDetails.gstNo}</div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <strong>Items:</strong>
              {(() => {
                const gridCols = { gridTemplateColumns: '64px 1fr 120px 120px' } as React.CSSProperties;
                return (
                  <>
                    <div className="grid text-xs font-medium text-angelic-deep/70 px-1" style={gridCols}>
                      <span>Qty</span>
                      <span>Product</span>
                      <span className="text-left">Price</span>
                      <span className="text-left">Amount</span>
                    </div>
                    <div className="divide-y">
                      {items.map((it) => {
                        // Normalize price; apply membership discount if active, like the subtotal calculation
                        const raw = typeof it.price === 'string' ? cleanPriceString(it.price) : String(it.price);
                        const baseUnit = parseFloat(raw);
                        const unit = (isAuthenticated() && hasDiscount())
                          ? calculatePrice(it.price).discountedPrice
                          : baseUnit;
                        const amt = unit * it.quantity;
                        return (
                          <div key={it.id} className="grid py-2 text-sm items-center px-1" style={gridCols}>
                            <span>{it.quantity}</span>
                            <span className="pr-2 truncate">{it.name}</span>
                            <span className="text-left">₹{unit.toFixed(2)}</span>
                            <span className="text-left">₹{amt.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
            {(() => {
              const gridCols = { gridTemplateColumns: '64px 1fr 120px 120px' } as React.CSSProperties;
              const Label = ({ children }: { children: React.ReactNode }) => (
                <span className="col-span-3">{children}</span>
              );
              const Value = ({ children, bold = false }: { children: React.ReactNode; bold?: boolean }) => (
                <span className={bold ? "col-span-1 font-semibold text-right tabular-nums" : "col-span-1 text-right tabular-nums"}>{children}</span>
              );
              return (
                <div className="space-y-1 mt-2">
                  <div className="grid items-center" style={gridCols}>
                    <Label>Base Amount</Label>
                    <Value>₹{baseAmount.toFixed(2)}</Value>
                  </div>
                  <div className="grid items-center" style={gridCols}>
                    <Label>Coupon Discount</Label>
                    <Value>-₹{discount.toFixed(2)}</Value>
                  </div>
                  <div className="grid items-center" style={gridCols}>
                    <Label>Angel Coins Redeemed ({angelCoinsToRedeem[0].toLocaleString()} coins)</Label>
                    <Value>-₹{angelCoinsDiscount.toFixed(2)}</Value>
                  </div>
                  <div className="grid items-center" style={gridCols}>
                    <Label>GST (18%)</Label>
                    <Value>₹{finalGstAmount.toFixed(2)}</Value>
                  </div>
                  <div className="grid items-center" style={gridCols}>
                    <Label><span className="font-semibold">Total</span></Label>
                    <Value bold>₹{total.toFixed(2)}</Value>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowSummary(false)}>Back</Button>
            <Button className="ml-auto" onClick={() => { setShowSummary(false); setShowPayment(true); }}>Make Payment</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mock Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-angelic-deep/80">This is a demo payment popup for testing.</div>
          <div className="flex gap-2 pt-4">
            <Button variant="destructive" onClick={() => { /* failed */ setShowPayment(false); setShowSummary(true); }}>Mark Failed</Button>
            <Button className="ml-auto" onClick={() => {
              const id = 'AOE' + Date.now();
              setOrderId(id);
              setShowPayment(false);
              navigate(`/thankyou?order=${id}`);
            }}>Mark Successful</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* No navigation; just close dialog and continue */}

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Checkout;
