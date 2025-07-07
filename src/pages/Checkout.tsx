import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, Gift, Coins, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [angelCoinsToRedeem, setAngelCoinsToRedeem] = useState([0]);
  const [discount, setDiscount] = useState(0);

  // Mock user angel coins - 10000 available
  const userAngelCoins = 10000;
  const minAngelCoinsRequired = 7500;
  const angelCoinValue = 0.05; // Rs.0.05 per coin

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  
  // Calculate max redeemable amount (10% of order)
  const maxRedeemableAmount = subtotal * 0.1;
  const maxRedeemableCoins = Math.floor(maxRedeemableAmount / angelCoinValue);
  
  // Check if user has enough coins and meets minimum requirement
  const canRedeemAngelCoins = userAngelCoins >= minAngelCoinsRequired;
  const actualMaxRedeemableCoins = canRedeemAngelCoins ? Math.min(maxRedeemableCoins, userAngelCoins) : 0;
  
  const angelCoinsDiscount = angelCoinsToRedeem[0] * angelCoinValue;
  const total = Math.max(0, subtotal - discount - angelCoinsDiscount);

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "welcome10") {
      setDiscount(subtotal * 0.1);
    } else if (couponCode.toLowerCase() === "angel20") {
      setDiscount(subtotal * 0.2);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      alert("Please login to continue");
      return;
    }
    alert("Order placed successfully! Checkout functionality will be implemented with payment gateway");
    clearCart();
    navigate("/");
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
            <Card className="p-6">
              <h2 className="font-playfair text-xl text-angelic-deep mb-4">Order Summary</h2>
              
              {/* Coupon Code */}
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

              {/* Angel Points Redemption */}
              <div className="space-y-4 mb-4">
                <Label className="flex items-center gap-2 text-angelic-deep">
                  <Coins className="w-4 h-4" />
                  Redeem Angel Coins
                </Label>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Available Angel Coins:</span>
                    <span className="font-medium">{userAngelCoins.toLocaleString()}</span>
                  </div>
                  
                  {!canRedeemAngelCoins ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Minimum {minAngelCoinsRequired.toLocaleString()} Angel Coins required for redemption.
                      </p>
                    </div>
                  ) : (
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
                      <p className="text-xs text-angelic-deep/60">
                        1 Angel Coin = ₹{angelCoinValue} | Max 10% of order value
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
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
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Actions */}
              <div className="space-y-3 pt-6">
                {!user && (
                  <p className="text-center text-sm text-angelic-deep/70">
                    Please login to continue with checkout
                  </p>
                )}
                <Button 
                  onClick={handleCheckout} 
                  variant="divine" 
                  className="w-full"
                  disabled={!user}
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
    </div>
  );
};

export default Checkout;