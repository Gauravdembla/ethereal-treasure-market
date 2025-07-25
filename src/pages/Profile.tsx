import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { User, Package, MapPin, Coins, Truck, LogOut, ArrowLeft, Edit, Plus, Trash2, Phone, Mail, UserCircle, Globe } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency, loading: currencyLoading, formatPrice, formatAngelCoinValue, changeCurrency, supportedCurrencies } = useCurrency();

  // Active section state
  const [activeSection, setActiveSection] = useState('profile');

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Demo user data (in real app, this would come from user profile API)
  const [userProfile, setUserProfile] = useState({
    fullName: 'Sarah Angel',
    email: user?.email || 'sarah.angel@example.com',
    mobile: '+1 (555) 123-4567',
    angelCoins: 1250,
    orders: [
      {
        id: 'ORD-001',
        date: '2024-01-15',
        total: 89.99,
        status: 'Delivered',
        items: ['Amethyst Crystal', 'Angel Cards'],
        trackingNumber: 'TRK123456789'
      },
      {
        id: 'ORD-002',
        date: '2024-01-10',
        total: 45.50,
        status: 'In Transit',
        items: ['Rose Quartz'],
        trackingNumber: 'TRK987654321'
      },
      {
        id: 'ORD-003',
        date: '2024-01-05',
        total: 125.75,
        status: 'Processing',
        items: ['Chakra Kit', 'Meditation Candle', 'Crystal Journal'],
        trackingNumber: null
      },
      {
        id: 'ORD-004',
        date: '2024-01-02',
        total: 67.25,
        status: 'Shipped',
        items: ['Healing Stones Set'],
        trackingNumber: 'TRK789123456'
      }
    ],
    addresses: [
      {
        id: 1,
        type: 'Home',
        fullAddress: '123 Angel Street',
        city: 'Divine City',
        state: 'DC',
        zipCode: '12345',
        isDefault: true
      },
      {
        id: 2,
        type: 'Work',
        fullAddress: '456 Spiritual Ave',
        city: 'Blessed Town',
        state: 'BT',
        zipCode: '67890',
        isDefault: false
      }
    ]
  });

  // Edit form states
  const [editForm, setEditForm] = useState({
    fullName: userProfile.fullName,
    email: userProfile.email,
    mobile: userProfile.mobile
  });

  const [newAddress, setNewAddress] = useState({
    type: '',
    fullAddress: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Handler functions
  const handleSaveProfile = () => {
    setUserProfile(prev => ({
      ...prev,
      fullName: editForm.fullName,
      email: editForm.email,
      mobile: editForm.mobile
    }));
    setIsEditingProfile(false);
    toast({
      title: "Success",
      description: "Profile updated successfully"
    });
  };

  const handleAddAddress = () => {
    if (!newAddress.type || !newAddress.fullAddress || !newAddress.city) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    const addressToAdd = {
      ...newAddress,
      id: Date.now(),
      isDefault: userProfile.addresses.length === 0 ? true : newAddress.isDefault
    };

    setUserProfile(prev => ({
      ...prev,
      addresses: newAddress.isDefault
        ? [addressToAdd, ...prev.addresses.map(addr => ({ ...addr, isDefault: false }))]
        : [...prev.addresses, addressToAdd]
    }));

    setNewAddress({
      type: '',
      fullAddress: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
    setIsAddingAddress(false);
    toast({
      title: "Success",
      description: "Address added successfully"
    });
  };

  const handleDeleteAddress = (addressId: number) => {
    setUserProfile(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== addressId)
    }));
    toast({
      title: "Success",
      description: "Address deleted successfully"
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Sidebar menu items
  const sidebarItems = [
    { id: 'profile', label: 'Profile Information', icon: UserCircle },
    { id: 'coins', label: 'Angel Coins', icon: Coins },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'orders', label: 'Order History', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Smaller Header */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-playfair font-bold text-gray-800">
                My Profile
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 max-w-7xl mx-auto">

          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-purple-100 text-purple-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'profile' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <UserCircle className="w-6 h-6" />
                      Profile Information
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditForm({
                          fullName: userProfile.fullName,
                          email: userProfile.email,
                          mobile: userProfile.mobile
                        });
                        setIsEditingProfile(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                          id="mobile"
                          value={editForm.mobile}
                          onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-5 h-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Full Name</label>
                          <p className="text-lg font-semibold text-gray-800">{userProfile.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email Address</label>
                          <p className="text-lg text-gray-800">{userProfile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                          <p className="text-lg text-gray-800">{userProfile.mobile}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'coins' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Coins className="w-6 h-6" />
                      Angel Coins
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <span>Currency: {currency.name}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-8 rounded-2xl border border-yellow-200 inline-block">
                      <div className="flex items-center gap-4">
                        <Coins className="w-12 h-12 text-yellow-500" />
                        <div>
                          <p className="text-lg font-medium text-yellow-700">Current Balance</p>
                          <p className="text-4xl font-bold text-yellow-600">
                            {userProfile.angelCoins.toLocaleString()}
                          </p>
                          <p className="text-sm text-yellow-600">Angel Coins</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-700 mb-2">
                        <strong>Exchange Rate:</strong> 1 Angel Coin = {formatAngelCoinValue()}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Earn Angel Coins with every purchase and redeem them for exclusive rewards!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'addresses' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <MapPin className="w-6 h-6" />
                      Saved Addresses
                    </CardTitle>
                    <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="addressType">Address Type</Label>
                            <Input
                              id="addressType"
                              placeholder="e.g., Home, Work, Other"
                              value={newAddress.type}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="fullAddress">Street Address</Label>
                            <Input
                              id="fullAddress"
                              placeholder="123 Main Street"
                              value={newAddress.fullAddress}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, fullAddress: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                placeholder="City"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                placeholder="State"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              placeholder="12345"
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isDefault"
                              checked={newAddress.isDefault}
                              onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                            />
                            <Label htmlFor="isDefault">Set as default address</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddAddress}>Add Address</Button>
                            <Button variant="outline" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userProfile.addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{address.type}</h3>
                              {address.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700">
                              {address.fullAddress}<br />
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAddress(address)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'orders' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Package className="w-6 h-6" />
                      Order History
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <select
                        value={currency.code}
                        onChange={(e) => changeCurrency(e.target.value)}
                        className="px-3 py-1 border rounded-md text-sm"
                        disabled={currencyLoading}
                      >
                        {Object.values(supportedCurrencies).map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {currencyLoading && (
                    <p className="text-sm text-gray-500">Detecting your location for currency...</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userProfile.orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>Date:</strong> {order.date}</p>
                              <p><strong>Items:</strong> {order.items.join(', ')}</p>
                              <p><strong>Tracking:</strong> {order.trackingNumber || 'Not Available'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">
                              {formatPrice(order.total)}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {currency.name}
                            </p>
                            {order.status !== 'Delivered' && order.trackingNumber && (
                              <Button size="sm" variant="outline">
                                Track Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AngelicFooter />
    </div>
  );
};

export default Profile;
