import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2, Gift, Coins, ArrowLeft, User, UserCircle, ShoppingCart, Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useAngelCoins } from "@/hooks/useAngelCoins";
import { useNavigate, Link } from "react-router-dom";
import LoginDialog from "@/components/LoginDialog";
import { PRODUCTS } from "@/data/products";
import { supabase, type Product, productHelpers } from "@/integrations/supabase/client";

const Checkout = () => {
  const { items, updateQuantity, removeItem, clearCart, addItem } = useCart();
  const { user, getUserRole } = useAuth();
  const { angelCoins, exchangeRateINR, getMaxRedeemableCoins, getMaxRedemptionValue, calculateGSTBreakdown, calculateRedemptionValue, loading: angelCoinsLoading } = useAngelCoins();
  const navigate = useNavigate();

  // Get user information
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userMobile = user?.user_metadata?.mobile || '';
  const userRole = getUserRole();

  // Mock user profile data (in real app, this would come from user profile API)
  const userAlternativeMobile = user?.user_metadata?.alternativeMobile || '';
  const userMembershipType = user?.user_metadata?.membershipType || 'Diamond';
  const [couponCode, setCouponCode] = useState("");
  const [angelCoinsToRedeem, setAngelCoinsToRedeem] = useState([0]);
  const [discount, setDiscount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Related Products state (matching ProductDetail.tsx)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedProductsStartIndex, setRelatedProductsStartIndex] = useState(0);
  const [relatedProductQuantities, setRelatedProductQuantities] = useState<{[key: string]: number}>({});
  const [showAsCard, setShowAsCard] = useState(false);

  // Admin settings - in real app, these would come from API/context
  const [showAngelCoinsSection, setShowAngelCoinsSection] = useState(true);
  const [showCouponSection, setShowCouponSection] = useState(true);

  // Minimum Angel Coins required to redeem
  const minAngelCoinsRequired = 10000;

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

  const subtotal = items.reduce((sum, item) => {
    const cleanPrice = cleanPriceString(item.price);
    return sum + (parseFloat(cleanPrice) * item.quantity);
  }, 0);

  // Calculate GST breakdown
  const gstBreakdown = calculateGSTBreakdown(subtotal);
  const { baseAmount, gstAmount } = gstBreakdown;

  // Calculate max redeemable coins (5% of base amount)
  const maxRedeemableCoins = getMaxRedeemableCoins(subtotal);
  const maxRedemptionValue = getMaxRedemptionValue(subtotal);

  // Calculate theoretical maximum based on 5% rule only (not limited by user balance)
  const theoreticalMaxCoins = Math.floor(maxRedemptionValue / exchangeRateINR);

  // Check if user has enough coins and meets minimum requirement
  const canRedeemAngelCoins = angelCoins >= minAngelCoinsRequired && !angelCoinsLoading;

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
    if (user) {
      const userId = user.id || user.email || 'default';
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
    if (user && angelCoinsToRedeem[0] !== undefined) {
      const userId = user.id || user.email || 'default';
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

  const handleCheckout = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    console.log("Navigating to address page...");
    navigate("/address");
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    navigate("/address");
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
          .limit(8);

        if (!relatedError && relatedData) {
          setRelatedProducts(relatedData);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
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

  // Navigation functions for related products - Fixed for proper scrolling
  const nextRelatedProducts = () => {
    const visibleProducts = showAsCard ? 3 : 4; // Show 3 in card mode, 4 in full width
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
            <h1 className="font-playfair text-3xl text-angelic-deep">Checkout</h1>
          </div>

          {/* Profile Icon */}
          {user && (
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-angelic-deep hover:text-primary"
            >
              <UserCircle className="w-6 h-6" />
              <span className="hidden sm:inline">{userName}</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
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

            {/* Mobile/Tablet Customers Also Bought - Only show when cart-based logic applies */}
            {relatedProducts.length > 0 && showAsCard && (() => {
              const cartItemsCount = items.length;
              const maxProducts = cartItemsCount === 1 ? 3 : cartItemsCount === 2 ? 2 : cartItemsCount === 3 ? 1 : 0;

              // Only show if we have products to display (i.e., ≤3 cart items)
              if (maxProducts === 0) return null;

              return (
                <div className="space-y-6 lg:hidden">
                  <h3 className="font-playfair font-bold text-xl text-angelic-deep text-center">
                    Customers Also Bought
                  </h3>
                   <div className="space-y-3">
                     {relatedProducts.slice(0, maxProducts).map((relatedProduct) => {
                     const relatedProductId = relatedProduct.product_id;
                     const relatedProductSlug = createProductSlug(relatedProduct.name, relatedProduct.sku);
                     // Fix image URL with fallback
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
                       <div key={relatedProductId} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                         {/* Product Image */}
                         <Link to={`/product/${relatedProductSlug}`} className="flex-shrink-0">
                           <img
                             src={relatedImageUrl}
                             alt={relatedProduct.name}
                             className="w-16 h-16 object-cover rounded-md"
                             onError={(e) => {
                               console.error('Image failed to load:', e.currentTarget.src);
                               e.currentTarget.src = '/placeholder.svg';
                             }}
                           />
                         </Link>
                         
                         {/* Product Details */}
                         <div className="flex-1 min-w-0">
                           <Link to={`/product/${relatedProductSlug}`}>
                             <h4 className="font-playfair font-semibold text-sm text-angelic-deep hover:text-primary transition-colors truncate">
                               {relatedProduct.name}
                             </h4>
                           </Link>
                           <p className="text-xs text-gray-600 truncate mt-0.5">
                             {relatedProduct.description || 'Divine Protection & Peace - Enhance...'}
                           </p>
                           
                           {/* Star Rating */}
                           <div className="flex items-center gap-1 mt-1 mb-1">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                             ))}
                           </div>
                           
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-sm text-angelic-purple">
                               ₹{relatedProduct.price}
                             </span>
                             {relatedProduct.original_price && (
                               <span className="text-xs text-gray-400 line-through">
                                 ₹{relatedProduct.original_price}
                               </span>
                             )}
                           </div>
                         </div>
                         
                          {/* Add Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Add button clicked for:', relatedProduct.name);
                              addItem({
                                id: relatedProductId,
                                name: relatedProduct.name,
                                price: relatedProduct.price,
                                image: relatedImageUrl
                              }, 1);
                            }}
                            className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex-shrink-0 flex items-center gap-1 min-w-[60px] shadow-sm"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            Add
                          </button>
                       </div>
                     );
                   })}
                 </div>
              </div>
              );
            })()}

            {/* Desktop Vertical Customers Also Bought Section - For 1-3 order items */}
            {relatedProducts.length > 0 && items.length <= 3 && (
              <div className="hidden lg:block mt-6">
                <Card className="p-6 bg-white shadow-sm border border-gray-100">
                  <h3 className="font-playfair font-bold text-xl text-angelic-deep mb-6">
                    Customers Also Bought
                  </h3>
                  <div className="space-y-5">
                    {(() => {
                      // Dynamic product count based on order items
                      const orderItemsCount = items.length;
                      let productsToShow = 1; // Default for 3+ items
                      
                      if (orderItemsCount === 1) productsToShow = 3;
                      else if (orderItemsCount === 2) productsToShow = 2;
                      else if (orderItemsCount === 3) productsToShow = 1;
                      
                      return relatedProducts.slice(0, productsToShow).map((relatedProduct) => {
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
                          <div key={relatedProductId} className="flex items-start gap-4 p-4 bg-angelic-cream/10 rounded-lg hover:bg-angelic-cream/20 hover:shadow-md transition-all duration-300 border border-transparent hover:border-angelic-cream/30">
                            <Link to={`/product/${relatedProductSlug}`} className="flex-shrink-0">
                              <img
                                src={relatedImageUrl}
                                alt={relatedProduct.name}
                                className="w-24 h-24 object-cover rounded-lg hover:scale-105 transition-transform duration-300 shadow-sm"
                                onError={(e) => {
                                  console.error('Image failed to load:', e.currentTarget.src);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-angelic-gold text-angelic-gold" />
                                ))}
                              </div>
                              <Link to={`/product/${relatedProductSlug}`}>
                                <h4 className="font-playfair font-semibold text-base text-angelic-deep hover:text-primary transition-colors line-clamp-1 mb-2">
                                  {relatedProduct.name}
                                </h4>
                              </Link>
                              <p className="text-sm text-angelic-deep/70 mb-3 line-clamp-2 leading-relaxed">
                                {relatedProduct.description?.slice(0, 100) || 'No description available'}...
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-primary text-lg">₹{relatedProduct.price}</span>
                                  {relatedProduct.original_price && (
                                    <span className="text-sm text-muted-foreground line-through">
                                      ₹{relatedProduct.original_price}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="px-6 py-2 font-medium hover:shadow-md transition-all duration-200"
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
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Order Summary */}
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
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Minimum {minAngelCoinsRequired.toLocaleString()} Angel Coins required for redemption.</strong>
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          You currently have {angelCoinsLoading ? '...' : angelCoins.toLocaleString()} Angel Coins.
                          Keep shopping to earn more Angel Coins!
                        </p>
                        <p className="text-xs text-yellow-700 mt-2">
                          <strong>Note:</strong> Angel Coins can be redeemed up to 5% of base amount (before GST).
                        </p>
                      </div>
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
                        <p>Max 5% of base amount (₹{baseAmount.toFixed(2)}) = ₹{maxRedemptionValue.toFixed(2)}</p>
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
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {angelCoinsDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Angel Coins ({angelCoinsToRedeem[0]} redeemed)</span>
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
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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

        {/* Swipeable Customers Also Bought Section - Show all non-cart products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-playfair font-bold text-2xl text-angelic-deep mb-8 text-center">
              Customers Also Bought
            </h2>
            <div className="w-full">
              <Carousel
                opts={{
                  align: "start",
                  slidesToScroll: "auto",
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {relatedProducts.map((relatedProduct) => {
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
                      <CarouselItem key={relatedProductId} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                        <Card className="related-product-card overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                          <Link to={`/product/${relatedProductSlug}`}>
                            <div className="relative group/image">
                              <img
                                src={relatedImageUrl}
                                alt={relatedProduct.name}
                                className="w-full aspect-video object-cover transition-transform duration-300 group-hover/image:scale-105"
                                onError={(e) => {
                                  console.error('Image failed to load:', e.currentTarget.src);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          </Link>
                          <div className="related-product-content p-4">
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-angelic-gold text-angelic-gold" />
                              ))}
                            </div>
                            <h3 className="font-playfair font-semibold text-lg text-angelic-deep mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {relatedProduct.name}
                            </h3>
                            <div className="related-product-description">
                              <p className="text-sm text-angelic-deep/70 mb-1 line-clamp-2">
                                {relatedProduct.description?.slice(0, 80) || 'No description available'}...
                              </p>
                              <div className="related-product-read-more">
                                <Link to={`/product/${relatedProductSlug}`} className="inline">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-primary hover:text-white hover:bg-primary hover:px-2 hover:py-0.5 hover:rounded-full text-xs transition-all duration-300 ease-in-out transform hover:scale-105"
                                  >
                                    Read More→
                                  </Button>
                                </Link>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="font-bold text-primary">₹{relatedProduct.price}</span>
                              {relatedProduct.original_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{relatedProduct.original_price}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
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
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2">
                                      <label className="text-xs font-medium text-angelic-deep whitespace-nowrap">Qty:</label>
                                      <Select
                                        value={(currentQuantity || selectedQuantity).toString()}
                                        onValueChange={(value) => setRelatedProductQuantities(prev => ({
                                          ...prev,
                                          [relatedProductId]: parseInt(value)
                                        }))}
                                      >
                                        <SelectTrigger className="w-16 h-8 text-xs">
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
                                      size="sm"
                                      className="w-full text-xs"
                                      onClick={handleAddToCart}
                                    >
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      Add to Cart {currentQuantity > 0 && `(${currentQuantity})`}
                                    </Button>

                                    <div className="text-center">
                                      <span className="text-xs text-angelic-deep/70">
                                        Available: <span className="font-semibold text-green-600">{availableQuantity}</span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        )}
      </div>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Checkout;