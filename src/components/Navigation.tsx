import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Package } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const { totalItems } = useCart();
  const { user, login, logout } = useAuth();
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-white/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="font-playfair text-xl font-semibold text-angelic-deep">
              Angels On Earth
            </h1>
          </div>

          {/* Right side - Cart, Login/User */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5 text-angelic-deep" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>

            {/* Login/User */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-angelic-deep" />
                  <span className="text-sm font-medium text-angelic-deep">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviousOrders(!showPreviousOrders)}
                  className="text-xs"
                >
                  <Package className="w-4 h-4 mr-1" />
                  Orders
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-xs"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="angelic"
                size="sm"
                onClick={login}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;