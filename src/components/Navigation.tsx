import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import MembershipBadge from "./MembershipBadge";

import LoginDialog from "./LoginDialog";
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { totalItems } = useCart();
  const { user, externalUser, getUserRole, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Get user name - prioritize external user data
  const userName = externalUser?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userRole = getUserRole();
  const isUserAuthenticated = isAuthenticated;

  const navigate = useNavigate();

  const handleProfileClick = () => {
    const userId = externalUser?.userId || user?.id || 'user';
    navigate(`/profile?user=${userId}`);
  };

  const handleAdminClick = () => {
    navigate('/admin');
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

            {/* Admin Access (admin only) */}
            {userRole === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                className="text-angelic-deep hover:text-primary"
                onClick={handleAdminClick}
              >
                Admin Access
              </Button>
            )}

            {/* User Info - Show if authenticated via external system or regular auth */}
            {isUserAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Membership Badge for external users */}
                {externalUser && (
                  <MembershipBadge size="sm" />
                )}

                {/* User Profile Picture (if available) */}
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

                {/* User Name */}
                <span className="text-sm text-angelic-deep font-medium">
                  {userName}
                </span>

                {/* Profile Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-angelic-deep hover:text-primary"
                  onClick={handleProfileClick}
                  title="My Profile"
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              /* Only show login button if not authenticated via external system */
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