import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Gift, Coins } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDialog = ({ open, onOpenChange }: CartDialogProps) => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [angelPoints, setAngelPoints] = useState(0);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const angelPointsDiscount = Math.min(angelPoints * 0.1, subtotal * 0.2); // 1 point = 0.1 rupee, max 20% of subtotal
  const total = subtotal - discount - angelPointsDiscount;

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
    // Checkout logic will be implemented later
    alert("Checkout functionality will be implemented with payment gateway");
  };

  if (items.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-angelic-deep">Your Sacred Cart</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-angelic-deep/70 mb-4">Your cart is empty</p>
            <Button onClick={() => onOpenChange(false)} variant="angelic">
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-angelic-deep">Your Sacred Cart</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Cart Items */}
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

          <Separator />

          {/* Coupon Code */}
          <div className="space-y-2">
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

          {/* Angel Points */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-angelic-deep">
              <Coins className="w-4 h-4" />
              Redeem Angel Points
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter points to redeem"
                value={angelPoints || ""}
                onChange={(e) => setAngelPoints(parseInt(e.target.value) || 0)}
                className="flex-1"
                max={Math.floor(subtotal * 2)} // Max 20% of subtotal
              />
              <span className="text-xs text-angelic-deep/60 self-center">
                Available: 500 points
              </span>
            </div>
            <p className="text-xs text-angelic-deep/60">1 point = ₹0.1 (Max 20% of order value)</p>
          </div>

          <Separator />

          {/* Order Summary */}
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
            {angelPointsDiscount > 0 && (
              <div className="flex justify-between text-purple-600">
                <span>Angel Points</span>
                <span>-₹{angelPointsDiscount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="space-y-2 pt-4">
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
              Proceed to Checkout
            </Button>
            <Button 
              onClick={clearCart} 
              variant="outline" 
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartDialog;