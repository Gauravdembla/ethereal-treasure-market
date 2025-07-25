import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { User, Package, MapPin, Coins, Truck, LogOut, ArrowLeft } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

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
      },
      {
        id: 'ORD-003',
        date: '2024-01-05',
        total: 125.75,
        status: 'Delivered',
        items: ['Chakra Kit', 'Meditation Candle', 'Crystal Journal']
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gray-800">
                My Profile
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Welcome back, {userProfile.name}!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Account Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg font-semibold text-gray-800">{userProfile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg text-gray-800">{userProfile.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 rounded-2xl border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <Coins className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Angel Coins</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {userProfile.angelCoins.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Package className="w-6 h-6" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProfile.orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          <Badge 
                            variant={order.status === 'Delivered' ? 'default' : 'secondary'}
                            className="flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{order.date}</p>
                        <p className="text-sm text-gray-700">
                          <strong>Items:</strong> {order.items.join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">${order.total}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Addresses */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Saved Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {userProfile.addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{address.type}</h3>
                      {address.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700">{address.address}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center pt-8">
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 px-8 py-3 text-lg"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>

        </div>
      </div>

      <AngelicFooter />
    </div>
  );
};

export default Profile;
