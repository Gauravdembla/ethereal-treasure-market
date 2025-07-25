import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, Gift, Coins, ArrowLeft, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useAngelCoins } from "@/hooks/useAngelCoins";
import { useNavigate } from "react-router-dom";
import LoginDialog from "@/components/LoginDialog";

const Checkout = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { user, getUserRole } = useAuth();
  const { angelCoins, exchangeRateINR, getMaxRedeemableCoins, getMaxRedemptionValue, calculateGSTBreakdown, calculateRedemptionValue, loading: angelCoinsLoading } = useAngelCoins();
  const navigate = useNavigate();

  // Get user information
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userMobile = user?.user_metadata?.mobile || '';
  const userRole = getUserRole();
  const [couponCode, setCouponCode] = useState("");
  const [angelCoinsToRedeem, setAngelCoinsToRedeem] = useState([0]);
  const [discount, setDiscount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Admin settings - in real app, these would come from API/context
  const [showAngelCoinsSection, setShowAngelCoinsSection] = useState(true);
  const [showCouponSection, setShowCouponSection] = useState(true);

  // Minimum Angel Coins required to redeem
  const minAngelCoinsRequired = 10000;

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price.replace(/,/g, '')) * item.quantity), 0);

  // Calculate GST breakdown
  const gstBreakdown = calculateGSTBreakdown(subtotal);
  const { baseAmount, gstAmount } = gstBreakdown;

  // Calculate max redeemable coins (5% of base amount)
  const maxRedeemableCoins = getMaxRedeemableCoins(subtotal);
  const maxRedemptionValue = getMaxRedemptionValue(subtotal);

  // Check if user has enough coins and meets minimum requirement
  const canRedeemAngelCoins = angelCoins >= minAngelCoinsRequired && !angelCoinsLoading;
  const actualMaxRedeemableCoins = canRedeemAngelCoins ? maxRedeemableCoins : 0;

  // Calculate Angel Coins discount (applied to base amount)
  const angelCoinsDiscount = calculateRedemptionValue(angelCoinsToRedeem[0]);

  // Calculate final amounts
  const discountedBaseAmount = Math.max(0, baseAmount - discount - angelCoinsDiscount);
  const finalGstAmount = discountedBaseAmount * 0.18;
  const total = discountedBaseAmount + finalGstAmount;

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
        <div className="flex items-center gap-4 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="space-y-6">
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
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0"
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
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
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
                        <p>Max redeemable: {maxRedeemableCoins.toLocaleString()} coins</p>
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
                <div className="flex justify-between">
                  <span>Discounted Base</span>
                  <span>₹{discountedBaseAmount.toFixed(2)}</span>
                </div>
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