import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Package, LogOut, MapPin, Coins, Truck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import LoginDialog from "./LoginDialog";

const Navigation = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Demo user data (in real app, this would come from user profile API)
  const userProfile = {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    angelCoins: 1250,
    orders: [
      {
        id: 'ORD-001',
        date: '2024-01-15',
        total: 89.99,
        status: 'Delivered',
        items: ['Amethyst Crystal', 'Angel Cards']
      },
      {
        id: 'ORD-002',
        date: '2024-01-10',
        total: 45.50,
        status: 'In Transit',
        items: ['Rose Quartz']
      }
    ],
    addresses: [
      {
        id: 1,
        type: 'Home',
        address: '123 Angel Street, Divine City, DC 12345',
        isDefault: true
      },
      {
        id: 2,
        type: 'Work',
        address: '456 Spiritual Ave, Blessed Town, BT 67890',
        isDefault: false
      }
    ]
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
                  {userProfile.name}
                </span>
                <Dialog open={showProfile} onOpenChange={setShowProfile}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-angelic-deep hover:text-primary"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        My Profile
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* User Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Account Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p><strong>Name:</strong> {userProfile.name}</p>
                            <p><strong>Email:</strong> {userProfile.email}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-yellow-600">
                                {userProfile.angelCoins.toLocaleString()} Angel Coins
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Order History */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order History
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {userProfile.orders.map((order) => (
                              <div key={order.id} className="border rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-semibold">{order.id}</p>
                                    <p className="text-sm text-gray-600">{order.date}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">${order.total}</p>
                                    <Badge
                                      variant={order.status === 'Delivered' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      <Truck className="w-3 h-3 mr-1" />
                                      {order.status}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Items: {order.items.join(', ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Saved Addresses */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Saved Addresses
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {userProfile.addresses.map((address) => (
                              <div key={address.id} className="border rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-semibold">{address.type}</p>
                                      {address.isDefault && (
                                        <Badge variant="outline" className="text-xs">
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{address.address}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Logout Button */}
                      <div className="flex justify-end pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => {
                            logout();
                            setShowProfile(false);
                          }}
                          className="flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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