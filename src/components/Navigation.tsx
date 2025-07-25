import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

import LoginDialog from "./LoginDialog";

const Navigation = () => {
  const { totalItems } = useCart();
  const { user, getUserRole } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Get user name from email or metadata
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userRole = getUserRole();

  const handleProfileClick = () => {
    if (userRole === 'admin' || userRole === 'team') {
      window.location.href = '/admin';
    } else {
      const userId = user?.id || 'user';
      window.location.href = `/profile?user=${userId}`;
    }
  };

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
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => window.location.href = '/checkout'}
              >
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
                <span className="text-sm text-angelic-deep font-medium">
                  {userName}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-angelic-deep hover:text-primary"
                  onClick={handleProfileClick}
                  title={userRole === 'admin' || userRole === 'team' ? 'Admin Dashboard' : 'My Profile'}
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="angelic"
                size="sm"
                onClick={() => setShowLogin(true)}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </nav>
  );
};

export default Navigation;