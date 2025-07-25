import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2, Gift, Coins, ArrowLeft, User, UserCircle, ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
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

  // Helper function to create product slug
  const createProductSlug = (name: string, sku: string) => {
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${nameSlug}-${sku}`;
  };

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  const applyCoupon = () => {
    if (couponCode === "WELCOME10") {
      setDiscount(subtotal * 0.1);
    } else if (couponCode === "ANGEL20") {
      setDiscount(subtotal * 0.2);
    } else {
      setDiscount(0);
    }
  };

  const angelPointsDiscount = calculateRedemptionValue(angelCoinsToRedeem[0]);
  const gstBreakdown = calculateGSTBreakdown(subtotal - discount - angelPointsDiscount);
  const total = gstBreakdown.baseAmount + gstBreakdown.gstAmount;

  const prevRelatedProducts = () => {
    setRelatedProductsStartIndex(prev => Math.max(0, prev - 1));
  };

  const nextRelatedProducts = () => {
    const maxStartIndex = Math.max(0, relatedProducts.length - 4);
    setRelatedProductsStartIndex(prev => Math.min(maxStartIndex, prev + 1));
  };

  const handleCheckout = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    
    navigate("/address");
  };

  const updateRelatedProductQuantity = (productId: string, quantity: number) => {
    setRelatedProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  // Fetch related products from Supabase
  useEffect(() => {
    if (items.length === 0) return;

    const fetchRelatedProducts = async () => {
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              slug
            ),
            subcategories (
              id,
              name,
              slug
            ),
            brands (
              id,
              name,
              slug
            )
          `)
          .neq('id', items[0].id)
          .limit(10);

        if (error) {
          console.error('Error fetching related products:', error);
          return;
        }

        setRelatedProducts(products || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    fetchRelatedProducts();
  }, [items]);

  // Layout detection
  useEffect(() => {
    const detectLayout = () => {
      const orderItemsSection = document.querySelector('[data-order-items]');
      const orderSummarySection = document.querySelector('[data-order-summary]');
      
      if (orderItemsSection && orderSummarySection) {
        const orderItemsHeight = orderItemsSection.clientHeight;
        const orderSummaryHeight = orderSummarySection.clientHeight;
        
        // Show as card if order items height is less than order summary
        setShowAsCard(orderItemsHeight < orderSummaryHeight);
      }
    };

    const timer = setTimeout(detectLayout, 100);
    window.addEventListener('resize', detectLayout);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', detectLayout);
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-25 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">Your cart is empty</h1>
            <Button onClick={() => navigate('/')} className="mt-4">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-25 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Shop
              </Button>
            </div>
            <h1 className="text-2xl font-playfair font-bold text-angelic-deep">Checkout</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <UserCircle className="w-5 h-5" />
              <span className="text-sm">{userName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order Items Section */}
          <div className="lg:col-span-8 space-y-6" data-order-items>
            <Card className="p-6">
              <h2 className="text-xl font-playfair font-bold text-angelic-deep mb-6">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all duration-300">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-playfair font-semibold text-angelic-deep text-lg mb-2">{item.name}</h3>
                      <p className="text-primary font-bold text-xl mb-3">{item.price}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Dynamic Customers Also Bought - Vertical Layout for Mobile/Tablet */}
            {relatedProducts.length > 0 && showAsCard && (() => {
              const cartItemsCount = items.length;
              const maxProducts = cartItemsCount === 1 ? 3 : cartItemsCount === 2 ? 2 : cartItemsCount === 3 ? 1 : 0;
              
              // Only show this section on mobile/tablet AND when cart items <= 3
              if (maxProducts === 0) return null;
              
              return (
                <div className="space-y-6 lg:hidden">
                  <h3 className="font-playfair font-bold text-xl text-angelic-deep text-center">
                    Customers Also Bought
                  </h3>
                  <div className="space-y-4">
                    {relatedProducts.slice(0, maxProducts).map((relatedProduct) => {
                      const relatedProductId = relatedProduct.product_id;
                      const relatedProductSlug = createProductSlug(relatedProduct.name, relatedProduct.sku);
                      const relatedImageUrl = productHelpers.getPrimaryImageUrl(relatedProduct.images);
                      
                      return (
                        <Card key={relatedProductId} className="flex gap-4 p-4 hover:shadow-lg transition-all duration-300">
                          <Link to={`/product/${relatedProductSlug}`} className="flex-shrink-0">
                            <img
                              src={relatedImageUrl}
                              alt={relatedProduct.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-angelic-gold text-angelic-gold" />
                              ))}
                            </div>
                            <Link to={`/product/${relatedProductSlug}`}>
                              <h4 className="font-playfair font-semibold text-sm text-angelic-deep hover:text-primary transition-colors line-clamp-2">
                                {relatedProduct.name}
                              </h4>
                            </Link>
                            <p className="text-xs text-angelic-deep/70 mb-2 line-clamp-1">
                              {relatedProduct.description.slice(0, 50)}...
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-primary text-sm">₹{relatedProduct.price}</span>
                                {relatedProduct.original_price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    ₹{relatedProduct.original_price}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 px-3 text-xs"
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
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 space-y-6" data-order-summary>
            {/* Customer Information */}
            {user && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-playfair font-bold text-lg text-angelic-deep">Customer Information</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-angelic-deep">{userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-angelic-deep">{userEmail}</span>
                  </div>
                  {userMobile && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium text-angelic-deep">{userMobile}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membership Type:</span>
                    <span className="font-medium text-primary">{userMembershipType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium text-angelic-deep">{userRole === 'admin' ? 'Admin' : 'Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Angel Coins:</span>
                    <span className="font-medium text-angelic-gold flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      {angelCoins.toLocaleString()} coins
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="p-6">
              <h3 className="font-playfair font-bold text-lg text-angelic-deep mb-4">Order Summary</h3>
              
              {/* Coupon Section */}
              {showCouponSection && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-primary" />
                    <Label htmlFor="coupon" className="font-medium text-angelic-deep">Coupon Code</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={applyCoupon} variant="outline">Apply</Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Try: WELCOME10 or ANGEL20</p>
                </div>
              )}

              {/* Angel Coins Redemption */}
              {showAngelCoinsSection && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="w-4 h-4 text-angelic-gold" />
                    <Label className="font-medium text-angelic-deep">Angel Coins Redemption</Label>
                  </div>
                  
                  {angelCoins < minAngelCoinsRequired ? (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-800 font-medium">
                        Minimum {minAngelCoinsRequired.toLocaleString()} Angel Coins required for redemption.
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        You currently have {angelCoins.toLocaleString()} Angel Coins. Keep shopping to earn more Angel Coins!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Angel Coins to use:</span>
                          <span className="font-medium">{angelCoinsToRedeem[0].toLocaleString()}</span>
                        </div>
                        <Slider
                          value={angelCoinsToRedeem}
                          onValueChange={setAngelCoinsToRedeem}
                          max={getMaxRedeemableCoins(subtotal - discount)}
                          step={100}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>{getMaxRedeemableCoins(subtotal - discount).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-gray-600">
                          <strong>Note:</strong> Angel Coins can be redeemed up to 5% of base amount (before GST).
                        </p>
                        <div className="flex justify-between text-xs">
                          <span>Exchange Rate:</span>
                          <span>{exchangeRateINR} coins = ₹1</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-green-600">
                          <span>Discount Value:</span>
                          <span>₹{angelPointsDiscount.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Separator className="my-4" />
              
              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {angelPointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Angel Coins Discount:</span>
                    <span>-₹{angelPointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{gstBreakdown.gstAmount.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
              >
                Place Order
              </Button>
              
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full mt-3 text-gray-600 hover:text-red-600 hover:border-red-300"
              >
                Clear Cart
              </Button>
            </Card>
          </div>
        </div>

        {/* Related Products Section - Desktop Horizontal Layout */}
        {relatedProducts.length > 0 && (() => {
          const cartItemsCount = items.length;
          // Show this section:
          // - Always on desktop (lg:block)
          // - On mobile/tablet only when cart items > 3 (since mobile vertical section won't show)
          const showBottomSection = cartItemsCount > 3;
          
          return (
            <div className={`mt-16 ${showBottomSection ? 'block' : 'hidden lg:block'}`}>
              <h2 className="font-playfair font-bold text-2xl text-angelic-deep mb-8 text-center">
                Customers Also Bought
              </h2>

              {/* Desktop Horizontal Layout */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Navigation for Desktop Layout */}
                  {relatedProducts.length > 4 && (
                    <>
                      <button
                        onClick={prevRelatedProducts}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg z-30 opacity-80 hover:opacity-100 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl"
                        aria-label="Previous products"
                        disabled={relatedProductsStartIndex === 0}
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>

                      <button
                        onClick={nextRelatedProducts}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg z-30 opacity-80 hover:opacity-100 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl"
                        aria-label="Next products"
                        disabled={relatedProductsStartIndex >= Math.max(0, relatedProducts.length - 4)}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}

                  <div className="px-16">
                    <div className="relative group">
                      <div className="overflow-hidden">
                        <div className={`grid transition-all duration-300 ${
                          relatedProducts.length === 1
                            ? 'grid-cols-1 justify-items-center'
                            : relatedProducts.length === 2
                            ? 'grid-cols-2 gap-6'
                            : relatedProducts.length === 3
                            ? 'grid-cols-3 gap-4'
                            : 'grid-cols-4 gap-6'
                        }`}>
                          {relatedProducts.slice(relatedProductsStartIndex, relatedProductsStartIndex + 4).map((relatedProduct) => {
                            const relatedProductId = relatedProduct.product_id;
                            const relatedProductSlug = createProductSlug(relatedProduct.name, relatedProduct.sku);
                            const relatedImageUrl = productHelpers.getPrimaryImageUrl(relatedProduct.images);
                            const relatedQuantity = relatedProductQuantities[relatedProductId] || 1;

                            return (
                              <Card key={relatedProductId} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="relative">
                                  <Link to={`/product/${relatedProductSlug}`}>
                                    <div className="aspect-square overflow-hidden">
                                      <img
                                        src={relatedImageUrl}
                                        alt={relatedProduct.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  </Link>
                                </div>
                                <div className="p-4 space-y-3">
                                  <div className="flex items-center gap-1">
                                    {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 fill-angelic-gold text-angelic-gold" />
                                    ))}
                                  </div>
                                  <Link to={`/product/${relatedProductSlug}`}>
                                    <h3 className="font-playfair font-semibold text-angelic-deep hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                                      {relatedProduct.name}
                                    </h3>
                                  </Link>
                                  <p className="text-sm text-angelic-deep/70 line-clamp-2 min-h-[2.5rem]">
                                    {relatedProduct.description}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-primary">₹{relatedProduct.price}</span>
                                    {relatedProduct.original_price && (
                                      <span className="text-sm text-muted-foreground line-through">
                                        ₹{relatedProduct.original_price}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => updateRelatedProductQuantity(relatedProductId, relatedQuantity - 1)}
                                        className="h-6 w-6 p-0 hover:bg-gray-200"
                                        disabled={relatedQuantity <= 1}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="font-semibold text-sm w-6 text-center">{relatedQuantity}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => updateRelatedProductQuantity(relatedProductId, relatedQuantity + 1)}
                                        className="h-6 w-6 p-0 hover:bg-gray-200"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 px-3 text-xs"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addItem({
                                          id: relatedProductId,
                                          name: relatedProduct.name,
                                          price: relatedProduct.price,
                                          image: relatedImageUrl
                                        }, relatedQuantity);
                                      }}
                                    >
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      Add Cart
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Layout - Only when >3 cart items */}
              {showBottomSection && (
                <div className="lg:hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedProducts.slice(0, 2).map((relatedProduct) => {
                      const relatedProductId = relatedProduct.product_id;
                      const relatedProductSlug = createProductSlug(relatedProduct.name, relatedProduct.sku);
                      const relatedImageUrl = productHelpers.getPrimaryImageUrl(relatedProduct.images);

                      return (
                        <Card key={relatedProductId} className="flex gap-4 p-4 hover:shadow-lg transition-all duration-300">
                          <Link to={`/product/${relatedProductSlug}`} className="flex-shrink-0">
                            <img
                              src={relatedImageUrl}
                              alt={relatedProduct.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              {[...Array(relatedProduct.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-angelic-gold text-angelic-gold" />
                              ))}
                            </div>
                            <Link to={`/product/${relatedProductSlug}`}>
                              <h4 className="font-playfair font-semibold text-sm text-angelic-deep hover:text-primary transition-colors line-clamp-2">
                                {relatedProduct.name}
                              </h4>
                            </Link>
                            <p className="text-xs text-angelic-deep/70 mb-2 line-clamp-1">
                              {relatedProduct.description.slice(0, 50)}...
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-primary text-sm">₹{relatedProduct.price}</span>
                                {relatedProduct.original_price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    ₹{relatedProduct.original_price}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                className="h-7 px-3 text-xs"
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
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
};

export default Checkout;
