import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddressForm from "@/components/AddressForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { useAngelCoins } from "@/hooks/useAngelCoins";

import { useMembershipPricing } from "@/hooks/useMembershipPricing";
import MembershipBadge from "@/components/MembershipBadge";
import { User, Package, MapPin, Coins, Truck, LogOut, ArrowLeft, Edit, Plus, Trash2, Phone, Mail, UserCircle, Globe, Search, Building2 as BuildingIcon } from "lucide-react";

import CompanyDetailsForm, { type CompanyDetails } from '@/components/CompanyDetailsForm';
import { addressService, type UserAddress } from "@/services/addressService";

type ProfileData = {
  fullName: string;
  email: string;
  mobile: string;
  alternativeMobile: string;
  membershipType: string;
  addresses: UserAddress[];
  orders: any[];
};

const Profile = () => {
  const { user, externalUser, logout, isAuthenticated, loading, getUserRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();



  const { angelCoins, loading: angelCoinsLoading, updateBalance, clearAngelCoinsData } = useAngelCoins();
  const { membershipTier } = useMembershipPricing();
  const [searchParams] = useSearchParams();
  const userRole = getUserRole();

  // Get user ID from URL params for unique URLs - prioritize external user
  const userId = searchParams.get('user') || externalUser?.userId || user?.id || 'default';
  const apiUserId = userId && userId !== 'default' ? userId : null;

  // Company details component (scoped inside Profile to access userId)
  const CompanyDetailsSection: React.FC = () => {
    const compKey = `AOE_companyDetails_${userId}`;
    const [data, setData] = useState<CompanyDetails | null>(() => {
      try { const raw = localStorage.getItem(compKey); return raw ? JSON.parse(raw) : null; } catch { return null; }
    });
    const [open, setOpen] = useState(false);
    return (
      <div className="space-y-4">
        {data ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{data.companyName}</p>
                <p className="text-sm text-gray-600">{data.address}</p>
                {data.gstNo && <p className="text-sm text-gray-600">GST No.: {data.gstNo}</p>}
              </div>
              <Button variant="outline" onClick={() => setOpen(true)}>Edit</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-700">No company details saved.</p>
            <Button onClick={() => setOpen(true)}>Add Company Details</Button>
          </div>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{data ? 'Edit Company Details' : 'Add Company Details'}</DialogTitle>
            </DialogHeader>
            <CompanyDetailsForm
              initial={data}
              onConfirm={(d) => {
                try { localStorage.setItem(compKey, JSON.stringify(d)); } catch {}
                setData(d); setOpen(false);
              }}
              onCancel={() => setOpen(false)}
              confirmText={data ? 'Save' : 'Confirm'}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Active section state
  const [activeSection, setActiveSection] = useState('profile');

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Angel Coins editing (admin only)
  const [isEditingAngelCoins, setIsEditingAngelCoins] = useState(false);
  const [angelCoinsEditValue, setAngelCoinsEditValue] = useState('');

  // Wait for auth to finish initializing; only redirect if explicitly unauthenticated and no external user
  useEffect(() => {
    if (loading) return;
    if (!user && !externalUser) {
      navigate('/');
    }
  }, [user, externalUser, loading, navigate]);

  // User data - prioritize external user data from localStorage
  const getProfileDataFromStorage = (): ProfileData => {
    try {
      const name = localStorage.getItem('AOE_name') || '';
      const profileFullStr = localStorage.getItem('AOE_profile_full');
      const membershipTier = localStorage.getItem('AOE_membership_tier') || 'none';

      let email = '';
      let mobile = '';

      if (profileFullStr) {
        const profileFull = JSON.parse(profileFullStr);
        email = profileFull.email || '';
        mobile = (profileFull.countryCode || '') + (profileFull.phone || '');
      }

      return {
        fullName: name || 'User',
        email: email || user?.email || '',
        mobile: mobile || '',
        alternativeMobile: '', // Optional field
        membershipType: membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1),
        addresses: [], // Empty - will show empty state
        orders: [] // Empty - will show empty state
      };
    } catch (error) {
      console.error('Error reading profile data from storage:', error);
      return {
        fullName: 'User',
        email: user?.email || '',
        mobile: '',
        alternativeMobile: '',
        membershipType: 'None',
        addresses: [],
        orders: []
      };
    }
  };

  const [userProfile, setUserProfile] = useState<ProfileData>(getProfileDataFromStorage());

  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  // Edit form states
  const [editForm, setEditForm] = useState({
    fullName: userProfile.fullName,
    email: userProfile.email,
    mobile: userProfile.mobile,
    alternativeMobile: userProfile.alternativeMobile,
    membershipType: userProfile.membershipType
  });
  const [newAddress, setNewAddress] = useState({
    type: '',
    customType: '',
    name: '',
    address1: '',
    address2: '',
    nearby: '',
    city: '',
    state: '',
    customState: '',
    country: '',
    zipCode: '',
    isDefault: false
  });

  const loadAddresses = useCallback(async () => {
    if (!apiUserId) {
      return;
    }

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const data = await addressService.list(apiUserId);
      setUserProfile((prev) => ({
        ...prev,
        addresses: data,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load addresses';
      console.error('Failed to load addresses', error);
      setAddressesError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setAddressesLoading(false);
    }
  }, [apiUserId, setUserProfile, toast]);

  useEffect(() => {
    if (apiUserId) {
      loadAddresses();
    }
  }, [apiUserId, loadAddresses]);

  // Country/State management temporarily disabled on Profile to avoid geo calls

  // Handler functions
  const handleSaveProfile = () => {
    // Persist membership selection into localStorage for use across the app
    try {
      const raw = (editForm.membershipType || '').toString().toLowerCase();
      let tierKey: 'diamond' | 'platinum' | 'gold' | 'none' = 'none';
      if (raw.includes('diamond')) tierKey = 'diamond';
      else if (raw.includes('platinum')) tierKey = 'platinum';
      else if (raw.includes('gold')) tierKey = 'gold';
      else tierKey = 'none'; // Treat Bronze/None/others as none
      localStorage.setItem('AOE_membership_tier', tierKey);
      // If admin is editing, lock the membership tier to prevent auto-overwrite by external auth refresh
      if (userRole === 'admin') {
        localStorage.setItem('AOE_membership_manual', 'true');
      }
    } catch (e) {
      console.error('Failed to save membership to localStorage', e);
    }

    setUserProfile(prev => ({
      ...prev,
      fullName: editForm.fullName,
      email: editForm.email,
      mobile: editForm.mobile,
      alternativeMobile: editForm.alternativeMobile,
      membershipType: editForm.membershipType
    }));
    setIsEditingProfile(false);
    toast({
      title: "Success",
      description: "Profile updated successfully"
    });
  };

  const handleAddAddress = async () => {
    if (!apiUserId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to determine user. Please sign in again.",
      });
      return;
    }

    // Validation
    const addressType = newAddress.type === 'Others' ? newAddress.customType : newAddress.type;
    const stateName = newAddress.state === 'Others' ? newAddress.customState : newAddress.state;

    if (!addressType || !newAddress.name || !newAddress.address1 || !newAddress.city || !stateName || !newAddress.country || !newAddress.zipCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    const payload = {
      userId: apiUserId,
      type: addressType,
      name: newAddress.name,
      address1: newAddress.address1,
      address2: newAddress.address2,
      nearby: newAddress.nearby,
      city: newAddress.city,
      state: stateName,
      country: newAddress.country,
      zipCode: newAddress.zipCode,
      isDefault: userProfile.addresses.length === 0 ? true : newAddress.isDefault,
    };

    try {
      await addressService.create(payload);
      await loadAddresses();

      setNewAddress({
        type: '',
        customType: '',
        name: '',
        address1: '',
        address2: '',
        nearby: '',
        city: '',
        state: '',
        customState: '',
        country: '',
        zipCode: '',
        isDefault: false
      });
      setIsAddingAddress(false);

      toast({
        title: "Success",
        description: "Address added successfully"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add address';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!apiUserId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to determine user. Please sign in again.",
      });
      return;
    }

    try {
      await addressService.remove(addressId, apiUserId);
      await loadAddresses();
      toast({
        title: "Success",
        description: "Address deleted successfully"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete address';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveAngelCoins = async () => {
    const newBalance = parseInt(angelCoinsEditValue);
    if (isNaN(newBalance) || newBalance < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid number"
      });
      return;
    }

    const success = await updateBalance(newBalance);
    if (success) {
      setIsEditingAngelCoins(false);
      setAngelCoinsEditValue('');
      toast({
        title: "Success",
        description: "Angel Coins balance updated successfully"
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update Angel Coins balance"
      });
    }
  };

  // Render nothing only while loading, or when both auth sources are absent
  if (loading) {
    return null;
  }
  if (!user && !externalUser) {
    return null; // Will redirect via useEffect
  }

  // Sidebar menu items
  const sidebarItems = [
    { id: 'profile', label: 'Profile Information', icon: UserCircle },
    { id: 'company', label: 'Company Details', icon: BuildingIcon as any },
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
            {activeSection === 'company' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <BuildingIcon className="w-6 h-6" />
                      Company Details
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CompanyDetailsSection />
                </CardContent>
              </Card>
            )}

            {activeSection === 'profile' && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <UserCircle className="w-6 h-6" />
                        Profile Information
                      </CardTitle>
                      {/* Show membership badge for external users */}
                      {externalUser && (
                        <MembershipBadge size="sm" showBenefits={false} />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditForm({
                          fullName: userProfile.fullName,
                          email: userProfile.email,
                          mobile: userProfile.mobile,
                          alternativeMobile: userProfile.alternativeMobile || '',
                          membershipType: userProfile.membershipType || ''
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
                      <div>
                        <Label htmlFor="alternativeMobile">Alternative Mobile Number (Optional)</Label>
                        <Input
                          id="alternativeMobile"
                          placeholder="Enter alternative mobile number"
                          value={editForm.alternativeMobile}
                          onChange={(e) => setEditForm(prev => ({ ...prev, alternativeMobile: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="membershipType">Membership Type</Label>
                        <Select value={editForm.membershipType} onValueChange={(value) => setEditForm(prev => ({ ...prev, membershipType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select membership type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Diamond">Diamond</SelectItem>
                            <SelectItem value="Platinum">Platinum</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="Bronze">Bronze</SelectItem>
                          </SelectContent>
                        </Select>
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
                      {userProfile.alternativeMobile && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-600">Alternative Mobile Number</label>
                            <p className="text-lg text-gray-800">{userProfile.alternativeMobile}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-5 h-5 p-0 flex items-center justify-center">
                          <span className="text-xs">★</span>
                        </Badge>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Membership Type</label>
                          <p className="text-lg text-gray-800 font-semibold text-primary">{userProfile.membershipType}</p>
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
                      <span>Currency: INR</span>
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
                          {isEditingAngelCoins ? (
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                type="number"
                                value={angelCoinsEditValue}
                                onChange={(e) => setAngelCoinsEditValue(e.target.value)}
                                placeholder="Enter new balance"
                                className="w-32 text-center"
                              />
                              <Button size="sm" onClick={handleSaveAngelCoins}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingAngelCoins(false);
                                  setAngelCoinsEditValue('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-4xl font-bold text-yellow-600">
                                {angelCoinsLoading ? '...' : angelCoins.toLocaleString()}
                              </p>
                              {/* Edit only visible to admin */}
                              {userRole === 'admin' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setIsEditingAngelCoins(true);
                                    setAngelCoinsEditValue(angelCoins.toString());
                                  }}
                                  className="ml-2 text-yellow-600 hover:text-yellow-700"
                                  title="Edit Angel Coins (Admin)"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-yellow-600">Angel Coins</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-gray-700 mb-2">
                        <strong>Exchange Rate:</strong> 1 Angel Coin = ₹0.05
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        Earn Angel Coins with every purchase and redeem them for exclusive rewards!
                      </p>
                      {userRole === 'admin' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={clearAngelCoinsData}
                            className="text-xs"
                          >
                            Reset to Default (Testing)
                          </Button>
                        </div>
                      )}
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
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <AddressForm
                          address={newAddress}
                          onAddressChange={setNewAddress}
                          onSave={handleAddAddress}
                          onCancel={() => setIsAddingAddress(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addressesLoading ? (
                      <p className="text-gray-600">Loading addresses...</p>
                    ) : addressesError ? (
                      <p className="text-red-600">{addressesError}</p>
                    ) : userProfile.addresses.length === 0 ? (
                      <p className="text-gray-600">No addresses saved yet. Add one to get started.</p>
                    ) : (
                      userProfile.addresses.map((address) => (
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
                      ))
                    )}
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
                      {/* Currency selector removed for now to avoid geo calls */}
                    </div>
                  </div>

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
                              ₹{order.total}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">INR</p>
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
